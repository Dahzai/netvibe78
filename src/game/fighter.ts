import * as THREE from 'three';
import { WarriorType, CombatState, WARRIOR_CONFIGS, WarriorStats } from './types.ts';
import { createWarriorModel, WarriorRig } from './models.ts';
import { WarriorAnimator } from './animator.ts';
import { soundEngine } from './audio.ts';

export class Fighter {
  public isPlayer: boolean;
  public type: WarriorType;
  public stats: WarriorStats;
  public rig: WarriorRig;
  public animator: WarriorAnimator;

  public health: number;
  public stamina: number;
  public state: CombatState = 'idle';

  // Combat Timers
  public stateTime: number = 0;
  public stateDuration: number = 0;
  public comboStep: number = 0;
  public comboWindowTimer: number = 0;
  public dodgeCooldownTimer: number = 0;
  public hasHitCurrentAttack: boolean = false;
  public isInvulnerable: boolean = false;

  // Transform
  public position: THREE.Vector3 = new THREE.Vector3();
  public rotationY: number = 0;
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public moveDir: THREE.Vector3 = new THREE.Vector3();
  public dodgeDir: THREE.Vector3 = new THREE.Vector3();

  private footstepTimer: number = 0;

  constructor(type: WarriorType, isPlayer: boolean, startX: number, startZ: number, startRotY: number) {
    this.type = type;
    this.isPlayer = isPlayer;
    this.stats = WARRIOR_CONFIGS[type];
    this.health = this.stats.maxHealth;
    this.stamina = this.stats.maxStamina;

    this.position.set(startX, 0, startZ);
    this.rotationY = startRotY;

    this.rig = createWarriorModel(type);
    this.rig.root.position.copy(this.position);
    this.rig.root.rotation.y = this.rotationY;

    this.animator = new WarriorAnimator(this.rig);
  }

  public get isAlive(): boolean {
    return this.health > 0;
  }

  public get isBlocking(): boolean {
    return this.state === 'blocking';
  }

  // --- ACTIONS ---
  public startLightAttack(): boolean {
    if (this.state === 'dead' || this.state === 'guard_broken' || this.state === 'dodging') return false;
    if (this.stamina < this.stats.lightStaminaCost) return false;
    if (this.state.startsWith('attack_') && this.stateTime < this.stateDuration * 0.55) return false;

    // Advance combo step if within combo window
    if (this.comboWindowTimer > 0) {
      this.comboStep = (this.comboStep + 1) % (this.type === 'swordsman' ? 3 : 2);
    } else {
      this.comboStep = 0;
    }

    this.state = 'attack_light';
    this.stateTime = 0;
    // Fast attack duration
    this.stateDuration = (this.type === 'swordsman' ? 0.44 : 0.62) / this.stats.attackSpeedMultiplier;
    this.hasHitCurrentAttack = false;
    this.stamina = Math.max(0, this.stamina - this.stats.lightStaminaCost);
    this.comboWindowTimer = this.stateDuration + 0.35;

    if (this.type === 'swordsman') {
      soundEngine.playSwordSwing();
    } else {
      soundEngine.playAxeSwing();
    }

    return true;
  }

  public startHeavyAttack(): boolean {
    if (this.state === 'dead' || this.state === 'guard_broken' || this.state === 'dodging') return false;
    if (this.stamina < this.stats.heavyStaminaCost) return false;
    if (this.state.startsWith('attack_')) return false;

    this.state = 'attack_heavy';
    this.stateTime = 0;
    this.stateDuration = (this.type === 'swordsman' ? 0.78 : 0.98) / this.stats.attackSpeedMultiplier;
    this.hasHitCurrentAttack = false;
    this.stamina = Math.max(0, this.stamina - this.stats.heavyStaminaCost);

    if (this.type === 'swordsman') {
      soundEngine.playSwordSwing();
    } else {
      soundEngine.playAxeSwing();
    }

    return true;
  }

  public startSpecialAttack(): boolean {
    if (this.state === 'dead' || this.state === 'guard_broken' || this.state === 'dodging') return false;
    if (this.stamina < this.stats.specialStaminaCost) return false;
    if (this.state.startsWith('attack_')) return false;

    this.state = 'attack_special';
    this.stateTime = 0;
    this.stateDuration = (this.type === 'swordsman' ? 0.92 : 1.15) / this.stats.attackSpeedMultiplier;
    this.hasHitCurrentAttack = false;
    this.stamina = Math.max(0, this.stamina - this.stats.specialStaminaCost);

    if (this.type === 'swordsman') {
      soundEngine.playSwordSwing();
    } else {
      soundEngine.playAxeSwing();
    }

    return true;
  }

  public setBlocking(blocking: boolean) {
    if (this.state === 'dead' || this.state === 'guard_broken' || this.state === 'dodging') return;
    if (this.state.startsWith('attack_')) return;

    if (blocking && this.stamina > 10) {
      this.state = 'blocking';
    } else if (this.state === 'blocking' && !blocking) {
      this.state = 'idle';
    }
  }

  public startDodge(inputDir: THREE.Vector3): boolean {
    if (this.state === 'dead' || this.state === 'guard_broken' || this.state === 'dodging') return false;
    if (this.dodgeCooldownTimer > 0) return false;
    if (this.stamina < this.stats.dodgeStaminaCost) return false;

    this.state = 'dodging';
    this.stateTime = 0;
    this.stateDuration = this.type === 'swordsman' ? 0.42 : 0.52;
    this.stamina = Math.max(0, this.stamina - this.stats.dodgeStaminaCost);
    this.dodgeCooldownTimer = this.stateDuration + 0.35;
    this.isInvulnerable = true;

    // If no direction pressed, dodge backward
    if (inputDir.lengthSq() > 0.01) {
      this.dodgeDir.copy(inputDir).normalize();
    } else {
      this.dodgeDir.set(Math.sin(this.rotationY + Math.PI), 0, Math.cos(this.rotationY + Math.PI)).normalize();
    }

    soundEngine.playDodge();
    return true;
  }

  public receiveDamage(rawDamage: number, isHeavy: boolean, attackerPos: THREE.Vector3): { blocked: boolean; damageDealt: number; guardBroken: boolean } {
    if (this.isInvulnerable || this.state === 'dead') {
      return { blocked: false, damageDealt: 0, guardBroken: false };
    }

    // Check if blocking and facing attacker (within 120 degree frontal arc)
    const toAttacker = new THREE.Vector3().subVectors(attackerPos, this.position).normalize();
    const facing = new THREE.Vector3(Math.sin(this.rotationY), 0, Math.cos(this.rotationY));
    const dot = facing.dot(toAttacker);

    if (this.state === 'blocking' && dot > -0.2) {
      // Successful block!
      const staminaDrain = isHeavy ? 38 : 22;
      this.stamina -= staminaDrain;

      if (this.stamina <= 0) {
        // Guard Break!
        this.stamina = 0;
        this.state = 'guard_broken';
        this.stateTime = 0;
        this.stateDuration = 1.3;
        soundEngine.playGuardBreak();
        this.animator.triggerHit(true);
        const bleedDamage = Math.round(rawDamage * 0.35);
        this.health = Math.max(0, this.health - bleedDamage);
        return { blocked: true, damageDealt: bleedDamage, guardBroken: true };
      } else {
        // Absorbed by block (85% reduction)
        const absorbedDamage = Math.max(1, Math.round(rawDamage * 0.15));
        this.health = Math.max(0, this.health - absorbedDamage);
        soundEngine.playBlock();
        this.animator.triggerHit(false);
        return { blocked: true, damageDealt: absorbedDamage, guardBroken: false };
      }
    }

    // Direct Hit
    this.health = Math.max(0, this.health - rawDamage);
    soundEngine.playHit(isHeavy);
    this.animator.triggerHit(isHeavy);

    if (this.health <= 0) {
      this.state = 'dead';
      this.stateTime = 0;
      this.stateDuration = 2.0;
    } else {
      this.state = 'hit';
      this.stateTime = 0;
      this.stateDuration = isHeavy ? 0.38 : 0.22;
    }

    return { blocked: false, damageDealt: rawDamage, guardBroken: false };
  }

  public update(delta: number, opponentPos: THREE.Vector3) {
    if (this.comboWindowTimer > 0) {
      this.comboWindowTimer -= delta;
    }
    if (this.dodgeCooldownTimer > 0) {
      this.dodgeCooldownTimer -= delta;
    }

    // Stamina Regeneration (recovers when not in attack/dodge/block)
    const canRegen = this.state === 'idle' || this.state === 'moving';
    if (canRegen && this.stamina < this.stats.maxStamina) {
      this.stamina = Math.min(this.stats.maxStamina, this.stamina + this.stats.staminaRegenRate * delta);
    }

    // --- STATE MACHINE UPDATE ---
    let progress = 0;
    if (this.stateDuration > 0) {
      this.stateTime += delta;
      progress = Math.min(1, this.stateTime / this.stateDuration);
    }

    // Invulnerability window during dodge (frames 15% to 75%)
    if (this.state === 'dodging') {
      this.isInvulnerable = progress >= 0.15 && progress <= 0.75;
      // Propel along dodge direction
      const dodgeSpeed = (this.stats.moveSpeed * 1.85) * (1 - progress * 0.5);
      this.velocity.x = this.dodgeDir.x * dodgeSpeed;
      this.velocity.z = this.dodgeDir.z * dodgeSpeed;

      if (progress >= 1) {
        this.state = 'idle';
        this.isInvulnerable = false;
        this.velocity.set(0, 0, 0);
      }
    } else if (this.state.startsWith('attack_')) {
      // Attacks slow or root movement
      this.velocity.multiplyScalar(0.7);

      // Slight forward step during active attack swing
      if (progress >= 0.25 && progress <= 0.65) {
        const stepSpeed = this.stats.moveSpeed * 0.45;
        this.velocity.x = Math.sin(this.rotationY) * stepSpeed;
        this.velocity.z = Math.cos(this.rotationY) * stepSpeed;
      }

      if (progress >= 1) {
        this.state = 'idle';
        this.velocity.set(0, 0, 0);
      }
    } else if (this.state === 'hit') {
      this.velocity.multiplyScalar(0.8);
      if (progress >= 1) {
        this.state = 'idle';
      }
    } else if (this.state === 'guard_broken') {
      this.velocity.multiplyScalar(0.5);
      if (progress >= 1) {
        this.state = 'idle';
      }
    } else if (this.state === 'dead') {
      this.velocity.set(0, 0, 0);
    } else if (this.state === 'blocking') {
      // Slow walking while blocking
      this.velocity.copy(this.moveDir).multiplyScalar(this.stats.moveSpeed * 0.35);
    } else {
      // Idle or Moving
      if (this.moveDir.lengthSq() > 0.01) {
        this.state = 'moving';
        this.velocity.copy(this.moveDir).multiplyScalar(this.stats.moveSpeed);
      } else {
        this.state = 'idle';
        this.velocity.set(0, 0, 0);
      }
    }

    // Footstep audio
    const currentSpeed = this.velocity.length();
    if (currentSpeed > 0.6 && (this.state === 'moving' || this.state === 'blocking')) {
      this.footstepTimer += delta * currentSpeed * 1.4;
      if (this.footstepTimer > 1.8) {
        this.footstepTimer = 0;
        soundEngine.playFootstep();
      }
    }

    // Apply movement & arena boundaries
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // Arena boundary clamp (circular arena radius ~19m)
    const distSq = this.position.x * this.position.x + this.position.z * this.position.z;
    const maxR = 18.5;
    if (distSq > maxR * maxR) {
      const angle = Math.atan2(this.position.z, this.position.x);
      this.position.x = Math.cos(angle) * maxR;
      this.position.z = Math.sin(angle) * maxR;
    }

    // Auto-turn to face opponent when in combat range or attacking
    if (this.state !== 'dead' && this.state !== 'dodging') {
      const dx = opponentPos.x - this.position.x;
      const dz = opponentPos.z - this.position.z;
      const targetAngle = Math.atan2(dx, dz);

      // Smooth angle interpolation
      let angleDiff = targetAngle - this.rotationY;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const turnSpeed = this.state.startsWith('attack_') ? 4.5 : 8.5;
      this.rotationY += angleDiff * Math.min(1, turnSpeed * delta);
    }

    // Update Rig position and rotation
    this.rig.root.position.copy(this.position);
    this.rig.root.rotation.y = this.rotationY;

    // Update Animator
    this.animator.update(delta, this.state, currentSpeed, progress, this.comboStep);
  }

  // Check if current frame can inflict damage
  public isAttackActive(): boolean {
    if (!this.state.startsWith('attack_') || this.hasHitCurrentAttack) return false;
    const p = this.stateTime / this.stateDuration;
    // Active damage window during apex of swing
    return p >= 0.28 && p <= 0.68;
  }

  public getAttackDamage(): { damage: number; isHeavy: boolean } {
    if (this.state === 'attack_light') {
      const comboBonus = this.comboStep === 2 ? 1.35 : 1.0;
      return { damage: Math.round(this.stats.lightDamage * comboBonus), isHeavy: false };
    }
    if (this.state === 'attack_heavy') {
      return { damage: this.stats.heavyDamage, isHeavy: true };
    }
    if (this.state === 'attack_special') {
      return { damage: this.stats.specialDamage, isHeavy: true };
    }
    return { damage: 0, isHeavy: false };
  }
}
