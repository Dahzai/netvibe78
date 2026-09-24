import * as THREE from 'three';
import { Fighter } from './fighter.ts';

export class CombatAI {
  private ai: Fighter;
  private player: Fighter;
  private decisionTimer: number = 0;
  private currentTactic: 'approach' | 'circle' | 'attack' | 'retreat' | 'block' = 'approach';
  private strafeDirection: number = 1;
  private attackCooldown: number = 0;
  private reactionDelayTimer: number = 0;
  private isReactingToPlayerAttack: boolean = false;

  constructor(aiFighter: Fighter, playerFighter: Fighter) {
    this.ai = aiFighter;
    this.player = playerFighter;
    this.strafeDirection = Math.random() > 0.5 ? 1 : -1;
  }

  public update(delta: number) {
    if (!this.ai.isAlive || !this.player.isAlive) {
      this.ai.moveDir.set(0, 0, 0);
      this.ai.setBlocking(false);
      return;
    }

    this.decisionTimer -= delta;
    this.attackCooldown -= delta;
    this.reactionDelayTimer -= delta;

    const toPlayer = new THREE.Vector3().subVectors(this.player.position, this.ai.position);
    const distance = toPlayer.length();
    const dirToPlayer = toPlayer.clone().normalize();
    const isSword = this.ai.type === 'swordsman';

    // 1. REACTION TO PLAYER INCOMING ATTACKS (Human-like reaction delay: 250ms-400ms)
    if (this.player.state.startsWith('attack_')) {
      if (!this.isReactingToPlayerAttack && this.reactionDelayTimer <= 0) {
        this.isReactingToPlayerAttack = true;
        // 280ms reaction delay for sword, 360ms for axe
        this.reactionDelayTimer = isSword ? 0.28 : 0.36;
      }

      if (this.isReactingToPlayerAttack && this.reactionDelayTimer <= 0) {
        // Player is swinging and AI has reacted!
        if (distance <= this.player.stats.weaponReach + 0.6) {
          const rand = Math.random();
          if (this.player.state === 'attack_heavy' && rand > 0.45 && this.ai.stamina >= this.ai.stats.dodgeStaminaCost) {
            // Dodge heavy attack!
            const dodgeSide = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).multiplyScalar(this.strafeDirection);
            this.ai.startDodge(dodgeSide);
          } else if (rand > 0.3 && this.ai.stamina > 15) {
            // Raise block
            this.ai.setBlocking(true);
            return;
          }
        }
      }
    } else {
      this.isReactingToPlayerAttack = false;
      if (this.ai.isBlocking && Math.random() > 0.7) {
        this.ai.setBlocking(false);
      }
    }

    // 2. PERIODIC TACTICAL RE-EVALUATION
    if (this.decisionTimer <= 0) {
      this.decisionTimer = isSword ? 0.22 + Math.random() * 0.2 : 0.35 + Math.random() * 0.25;

      // Low health (< 28%) or low stamina (< 20%) -> retreat or circle to recover
      const isCritical = this.ai.health < this.ai.stats.maxHealth * 0.28;
      const isExhausted = this.ai.stamina < 22;

      if (isExhausted || (isCritical && Math.random() > 0.35)) {
        this.currentTactic = 'retreat';
        if (Math.random() > 0.5) this.strafeDirection *= -1;
      } else if (distance > 5.5) {
        // Too far -> approach
        this.currentTactic = 'approach';
      } else if (distance <= this.ai.stats.weaponReach + 0.3) {
        // In strike zone -> chance to attack or circle
        const attackProb = isSword ? 0.68 : 0.52;
        if (this.attackCooldown <= 0 && Math.random() < attackProb && !this.player.isInvulnerable) {
          this.currentTactic = 'attack';
        } else {
          this.currentTactic = 'circle';
        }
      } else {
        // Mid-range -> approach or circle
        this.currentTactic = Math.random() > 0.4 ? 'circle' : 'approach';
      }
    }

    // 3. EXECUTE CURRENT TACTIC
    const move = new THREE.Vector3();
    const perp = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).normalize();

    switch (this.currentTactic) {
      case 'approach':
        this.ai.setBlocking(false);
        move.copy(dirToPlayer);
        break;

      case 'retreat':
        // Back pedal while occasionally guarding
        move.copy(dirToPlayer).negate().add(perp.clone().multiplyScalar(this.strafeDirection * 0.4)).normalize();
        if (distance < 2.5 && Math.random() > 0.6) {
          this.ai.setBlocking(true);
        }
        break;

      case 'circle':
        this.ai.setBlocking(false);
        // Circle around player while maintaining distance (~3.2m)
        const radialOffset = (distance - 3.2) * 0.35;
        move.copy(perp).multiplyScalar(this.strafeDirection).add(dirToPlayer.clone().multiplyScalar(radialOffset)).normalize();
        break;

      case 'attack':
        if (distance > this.ai.stats.weaponReach * 0.9) {
          move.copy(dirToPlayer);
        } else {
          move.set(0, 0, 0);
          this.ai.setBlocking(false);

          if (this.attackCooldown <= 0) {
            if (isSword) {
              // Sword AI: Fast light attacks, combos, occasional heavy
              const roll = Math.random();
              if (roll < 0.65) {
                this.ai.startLightAttack();
                this.attackCooldown = 0.35 + Math.random() * 0.35;
              } else if (roll < 0.88) {
                this.ai.startHeavyAttack();
                this.attackCooldown = 0.85 + Math.random() * 0.4;
              } else {
                this.ai.startSpecialAttack();
                this.attackCooldown = 1.2 + Math.random() * 0.5;
              }
            } else {
              // Axe AI: Patient, punishing heavy attacks & ground cleaves
              const roll = Math.random();
              if (roll < 0.42) {
                this.ai.startLightAttack();
                this.attackCooldown = 0.65 + Math.random() * 0.45;
              } else if (roll < 0.78) {
                this.ai.startHeavyAttack();
                this.attackCooldown = 1.1 + Math.random() * 0.5;
              } else {
                this.ai.startSpecialAttack();
                this.attackCooldown = 1.4 + Math.random() * 0.6;
              }
            }
          }
        }
        break;
    }

    this.ai.moveDir.copy(move);
  }
}
