import * as THREE from 'three';
import { WarriorType, MatchStats } from './types.ts';
import { createCastleArena, ArenaScene } from './arena.ts';
import { Fighter } from './fighter.ts';
import { CombatAI } from './ai.ts';
import { soundEngine } from './audio.ts';

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private arena: ArenaScene;

  public player: Fighter;
  public ai: Fighter;
  private aiController: CombatAI;

  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public matchFinished: boolean = false;

  // Camera settings
  public cameraMode: '2d' | '3d' = '2d';
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();
  private cameraCurrentPos: THREE.Vector3 = new THREE.Vector3(0, 2.4, 8.5);
  private cameraShakeIntensity: number = 0;

  // Hitstop (micro-pause for impactful combat hits)
  private hitstopTimer: number = 0;

  // Combat Stats
  public stats: MatchStats = {
    winner: 'player',
    durationSeconds: 0,
    playerDamageDealt: 0,
    playerHitsLanded: 0,
    playerBlocks: 0,
    playerDodges: 0,
    playerComboStreak: 0,
  };

  private currentStreak: number = 0;

  // Callbacks for UI updates
  public onStateUpdate?: () => void;
  public onMatchEnd?: (winner: 'player' | 'ai', stats: MatchStats) => void;

  // Input states
  private keys: Record<string, boolean> = {};
  private mouseLeftDown: boolean = false;
  private mouseRightDown: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, playerType: WarriorType) {
    // 1. SCENE SETUP
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0e141e, 0.016); // Atmospheric castle fog

    // 2. CAMERA SETUP
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.2, 250);
    this.camera.position.set(0, 3.8, 7.5);

    // 3. RENDERER SETUP
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. LIGHTING
    // Ambient light (cool moonlit bounce)
    const ambientLight = new THREE.AmbientLight(0x384458, 1.2);
    this.scene.add(ambientLight);

    // Directional moonlight with shadows
    const moonLight = new THREE.DirectionalLight(0x99b4d8, 2.4);
    moonLight.position.set(15, 28, 18);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 1;
    moonLight.shadow.camera.far = 70;
    moonLight.shadow.camera.left = -22;
    moonLight.shadow.camera.right = 22;
    moonLight.shadow.camera.top = 22;
    moonLight.shadow.camera.bottom = -22;
    moonLight.shadow.bias = -0.0008;
    this.scene.add(moonLight);

    // Subtle blue rim light from behind castle battlements
    const rimLight = new THREE.DirectionalLight(0x406085, 1.4);
    rimLight.position.set(-20, 18, -25);
    this.scene.add(rimLight);

    // 5. CASTLE ARENA
    this.arena = createCastleArena();
    this.scene.add(this.arena.group);

    // 6. FIGHTERS SETUP
    // AI gets the other weapon
    const aiType: WarriorType = playerType === 'swordsman' ? 'axeman' : 'swordsman';

    this.player = new Fighter(playerType, true, 0, 4.5, Math.PI);
    this.ai = new Fighter(aiType, false, 0, -4.5, 0);

    this.scene.add(this.player.rig.root);
    this.scene.add(this.ai.rig.root);

    this.aiController = new CombatAI(this.ai, this.player);

    // Setup input listeners
    this.setupInputs();

    // Resize handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Single-press action triggers
      if (e.code === 'KeyE' || e.code === 'KeyL') {
        this.player.startHeavyAttack();
      } else if (e.code === 'KeyQ' || e.code === 'KeyU') {
        this.player.startSpecialAttack();
      } else if (e.code === 'KeyC' || e.code === 'KeyV') {
        this.toggleCameraMode();
      } else if (e.code === 'Space') {
        e.preventDefault();
        const moveDir = this.computePlayerMoveDirection();
        if (this.player.startDodge(moveDir)) {
          this.stats.playerDodges++;
          this.arena.groundDust(this.player.position);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyF' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.player.setBlocking(false);
      }
    });

    // Mouse combat controls
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        // Left click = Light Attack
        this.mouseLeftDown = true;
        this.player.startLightAttack();
      } else if (e.button === 2) {
        // Right click = Block
        e.preventDefault();
        this.mouseRightDown = true;
        this.player.setBlocking(true);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouseLeftDown = false;
      } else if (e.button === 2) {
        this.mouseRightDown = false;
        this.player.setBlocking(false);
      }
    });

    // Disable right click context menu on canvas
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // Mobile / UI button triggers
  public triggerLightAttack() {
    this.player.startLightAttack();
  }

  public triggerHeavyAttack() {
    this.player.startHeavyAttack();
  }

  public triggerSpecialAttack() {
    this.player.startSpecialAttack();
  }

  public triggerDodge() {
    const moveDir = this.computePlayerMoveDirection();
    if (this.player.startDodge(moveDir)) {
      this.stats.playerDodges++;
      this.arena.groundDust(this.player.position);
    }
  }

  public setBlock(active: boolean) {
    this.player.setBlocking(active);
  }

  public toggleCameraMode(): '2d' | '3d' {
    this.cameraMode = this.cameraMode === '2d' ? '3d' : '2d';
    return this.cameraMode;
  }

  public setCameraMode(mode: '2d' | '3d') {
    this.cameraMode = mode;
  }

  private computePlayerMoveDirection(): THREE.Vector3 {
    let fwd = 0;
    let strafe = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) fwd += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) fwd -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) strafe -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) strafe += 1;

    if (fwd === 0 && strafe === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Direction relative to camera view
    const camDir = new THREE.Vector3().subVectors(this.cameraTarget, this.cameraCurrentPos);
    camDir.y = 0;
    if (camDir.lengthSq() < 0.001) {
      return new THREE.Vector3(strafe, 0, -fwd).normalize();
    }
    camDir.normalize();

    // Perpendicular camera right vector (X on screen)
    const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x).normalize();

    const move = new THREE.Vector3()
      .addScaledVector(camRight, strafe)
      .addScaledVector(camDir, fwd);

    return move.normalize();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    soundEngine.startCombatMusic();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    soundEngine.stopCombatMusic();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop() {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(() => this.loop());

    const now = performance.now();
    const rawDelta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.isPaused) return;

    // Hitstop micro-pause for combat impact crunch
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= rawDelta;
      this.render();
      return;
    }

    const delta = rawDelta;
    this.stats.durationSeconds += delta;

    this.update(delta);
    this.render();

    if (this.onStateUpdate) {
      this.onStateUpdate();
    }
  }

  private update(delta: number) {
    // 1. Process Player Input Movement
    const playerMove = this.computePlayerMoveDirection();
    this.player.moveDir.copy(playerMove);

    // Keyboard block support (KeyF or Shift)
    if (this.keys['KeyF'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      this.player.setBlocking(true);
    }

    // 2. Update AI
    this.aiController.update(delta);

    // 3. Update Fighters
    this.player.update(delta, this.ai.position);
    this.ai.update(delta, this.player.position);

    // 4. Combat Hit Detection
    this.checkHitDetection(this.player, this.ai, true);
    this.checkHitDetection(this.ai, this.player, false);

    // 5. Arena Update (torches, sparks, dust)
    this.arena.update(delta);

    // 6. Smooth Camera Choreography
    this.updateCamera(delta);

    // 7. Check Victory / Defeat
    if (!this.matchFinished) {
      if (!this.player.isAlive) {
        this.matchFinished = true;
        this.stats.winner = 'ai';
        soundEngine.stopCombatMusic();
        soundEngine.playDefeat();
        if (this.onMatchEnd) {
          setTimeout(() => this.onMatchEnd?.('ai', this.stats), 1800);
        }
      } else if (!this.ai.isAlive) {
        this.matchFinished = true;
        this.stats.winner = 'player';
        soundEngine.stopCombatMusic();
        soundEngine.playVictory();
        if (this.onMatchEnd) {
          setTimeout(() => this.onMatchEnd?.('player', this.stats), 1800);
        }
      }
    }
  }

  private checkHitDetection(attacker: Fighter, defender: Fighter, attackerIsPlayer: boolean) {
    if (!attacker.isAttackActive() || !defender.isAlive) return;

    // Calculate distance between fighters
    const toDefender = new THREE.Vector3().subVectors(defender.position, attacker.position);
    const distance = toDefender.length();

    // Check weapon reach
    const maxReach = attacker.stats.weaponReach;
    if (distance <= maxReach) {
      // Check facing angle (attacker must be facing within ~110 degrees of defender)
      const facing = new THREE.Vector3(Math.sin(attacker.rotationY), 0, Math.cos(attacker.rotationY));
      const dot = facing.dot(toDefender.normalize());

      if (dot > -0.2) {
        // HIT CONNECTED!
        attacker.hasHitCurrentAttack = true;
        const { damage, isHeavy } = attacker.getAttackDamage();

        const hitResult = defender.receiveDamage(damage, isHeavy, attacker.position);

        // Impact spark or blood burst location
        const impactPos = defender.position.clone().add(new THREE.Vector3(0, 1.25, 0));

        if (hitResult.blocked) {
          this.arena.sparkBurst(impactPos, true);
          soundEngine.playWeaponClash();
          this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, isHeavy ? 0.35 : 0.18);
          if (attackerIsPlayer) {
            this.stats.playerHitsLanded++;
          } else {
            this.stats.playerBlocks++;
          }
        } else {
          // Unblocked hit
          this.arena.sparkBurst(impactPos, false);
          this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, isHeavy ? 0.55 : 0.28);

          // Hitstop freeze (60ms - 90ms)
          this.hitstopTimer = isHeavy ? 0.08 : 0.05;

          if (attackerIsPlayer) {
            this.stats.playerHitsLanded++;
            this.stats.playerDamageDealt += hitResult.damageDealt;
            this.currentStreak++;
            this.stats.playerComboStreak = Math.max(this.stats.playerComboStreak, this.currentStreak);
          } else {
            this.currentStreak = 0;
          }
        }
      }
    }
  }

  private updateCamera(delta: number) {
    if (this.cameraMode === '2d') {
      // 2D Classic Fighting Camera (Side Profile View like Street Fighter / Tekken)
      const fighterVec = new THREE.Vector3().subVectors(this.player.position, this.ai.position);
      const combatDist = Math.max(2.8, fighterVec.length());

      // Center point between both combatants
      const midPoint = new THREE.Vector3()
        .addVectors(this.player.position, this.ai.position)
        .multiplyScalar(0.5);
      midPoint.y = 1.35; // Chest level target

      this.cameraTarget.lerp(midPoint, delta * 6.5);

      // Perpendicular side normal vector on ground plane
      // fighterVec = (dx, 0, dz) -> side normal is (-dz, 0, dx)
      let sideDir = new THREE.Vector3(-fighterVec.z, 0, fighterVec.x);
      if (sideDir.lengthSq() > 0.001) {
        sideDir.normalize();
      } else {
        sideDir.set(0, 0, 1);
      }

      // Ensure camera stays consistently on the spectator side of arena
      if (sideDir.z < 0) {
        sideDir.negate();
      }

      // Dynamic framing distance: expands smoothly when fighters back away
      const camDistance = Math.max(5.6, combatDist * 1.35 + 2.2);
      const camHeight = 1.95 + Math.min(1.4, combatDist * 0.16);

      const desiredCamPos = midPoint.clone().add(sideDir.clone().multiplyScalar(camDistance));
      desiredCamPos.y = camHeight;

      this.cameraCurrentPos.lerp(desiredCamPos, delta * 5.2);
    } else {
      // 3D Over-the-shoulder Chase Camera
      const midPoint = new THREE.Vector3()
        .copy(this.player.position)
        .multiplyScalar(0.7)
        .add(this.ai.position.clone().multiplyScalar(0.3));
      midPoint.y = 1.35; // Chest level target

      this.cameraTarget.lerp(midPoint, delta * 6.5);

      // Third-person camera behind player
      const dirFromAI = new THREE.Vector3().subVectors(this.player.position, this.ai.position);
      dirFromAI.y = 0;
      const combatDist = Math.max(3.2, dirFromAI.length());
      dirFromAI.normalize();

      const camDistance = 3.6 + Math.min(3.0, combatDist * 0.45);
      const camHeight = 2.4 + Math.min(1.2, combatDist * 0.15);

      const desiredCamPos = this.player.position
        .clone()
        .add(dirFromAI.clone().multiplyScalar(camDistance));
      desiredCamPos.y = this.player.position.y + camHeight;

      this.cameraCurrentPos.lerp(desiredCamPos, delta * 5.5);
    }

    // Apply Screen Shake
    if (this.cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity;
      const shakeZ = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.set(
        this.cameraCurrentPos.x + shakeX,
        this.cameraCurrentPos.y + shakeY,
        this.cameraCurrentPos.z + shakeZ
      );
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.2);
    } else {
      this.camera.position.copy(this.cameraCurrentPos);
    }

    this.camera.lookAt(this.cameraTarget);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
