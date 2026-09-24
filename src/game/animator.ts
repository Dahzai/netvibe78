import * as THREE from 'three';
import { WarriorRig } from './models.ts';
import { CombatState } from './types.ts';

export class WarriorAnimator {
  private rig: WarriorRig;
  private animTime: number = 0;
  private walkCycle: number = 0;
  private hitTimer: number = 0;
  private isHeavyHit: boolean = false;

  constructor(rig: WarriorRig) {
    this.rig = rig;
  }

  public triggerHit(isHeavy: boolean = false) {
    this.hitTimer = isHeavy ? 0.38 : 0.22;
    this.isHeavyHit = isHeavy;
  }

  public update(
    delta: number,
    state: CombatState,
    speed: number,
    stateProgress: number, // 0 to 1 during an action like attack/dodge
    comboStep: number = 0
  ) {
    this.animTime += delta;
    const r = this.rig;
    const isSword = r.type === 'swordsman';

    // Update trail
    const isAttacking = state.startsWith('attack_');
    const isMidSwing = stateProgress >= 0.22 && stateProgress <= 0.75;
    r.updateTrail(isAttacking && isMidSwing);

    // Reset base rotations to neutral
    r.body.position.y = 0.95;
    r.body.rotation.set(0, 0, 0);
    r.torso.rotation.set(0, 0, 0);
    r.head.rotation.set(0, 0, 0);

    r.leftShoulder.rotation.set(0, 0, 0);
    r.leftArm.rotation.set(0, 0, 0);
    r.leftForearm.rotation.set(0, 0, 0);

    r.rightShoulder.rotation.set(0, 0, 0);
    r.rightArm.rotation.set(0, 0, 0);
    r.rightForearm.rotation.set(0, 0, 0);

    r.leftThigh.rotation.set(0, 0, 0);
    r.leftShin.rotation.set(0, 0, 0);
    r.rightThigh.rotation.set(0, 0, 0);
    r.rightShin.rotation.set(0, 0, 0);

    // Weapon default resting grip
    r.weapon.position.set(0, 0, 0.06);
    r.weapon.rotation.set(Math.PI * 0.45, 0, 0);

    // --- HIT FLINCH OVERRIDE ---
    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      const hitRatio = this.hitTimer / (this.isHeavyHit ? 0.38 : 0.22);
      const flinchIntensity = Math.sin(hitRatio * Math.PI) * (this.isHeavyHit ? 0.65 : 0.35);

      r.torso.rotation.x = -flinchIntensity;
      r.head.rotation.x = -flinchIntensity * 1.3;
      r.body.position.y = 0.95 - flinchIntensity * 0.15;
      r.rightArm.rotation.z = -flinchIntensity * 0.6;
      r.leftArm.rotation.z = flinchIntensity * 0.6;
      return;
    }

    // --- GUARD BROKEN / STAGGER ---
    if (state === 'guard_broken') {
      const wobble = Math.sin(this.animTime * 6) * 0.12;
      r.body.position.y = 0.88;
      r.torso.rotation.x = 0.25;
      r.torso.rotation.z = wobble;
      r.head.rotation.x = 0.35;
      r.head.rotation.y = wobble * 1.5;
      r.rightArm.rotation.x = 0.3;
      r.rightArm.rotation.z = -0.3;
      r.leftArm.rotation.x = 0.3;
      r.leftArm.rotation.z = 0.3;
      r.weapon.rotation.x = 0.2;
      return;
    }

    // --- DEAD ---
    if (state === 'dead') {
      const p = Math.min(1, stateProgress);
      // Collapse forward onto knees and chest
      r.body.position.y = 0.95 - p * 0.72;
      r.body.position.z = -p * 0.4;
      r.body.rotation.x = p * 1.45;
      r.torso.rotation.x = p * 0.3;
      r.leftThigh.rotation.x = -p * 1.4;
      r.rightThigh.rotation.x = -p * 1.3;
      r.rightArm.rotation.z = -p * 0.9;
      r.weapon.rotation.x = p * 1.5;
      return;
    }

    // --- DODGE / ROLL ---
    if (state === 'dodging') {
      const p = stateProgress;
      // Complete roll / low agile dive
      r.body.position.y = 0.95 - Math.sin(p * Math.PI) * 0.45;
      r.body.rotation.x = p * Math.PI * 2; // Full tumble
      r.torso.rotation.x = 0.4;
      r.head.rotation.x = 0.5;
      r.leftThigh.rotation.x = -0.8;
      r.rightThigh.rotation.x = -0.8;
      r.leftArm.rotation.x = 1.0;
      r.rightArm.rotation.x = 1.0;
      return;
    }

    // --- BLOCKING ---
    if (state === 'blocking') {
      r.body.position.y = 0.9;
      r.torso.rotation.y = isSword ? -0.25 : -0.15;
      r.torso.rotation.x = 0.1;

      // Bring weapon up defensively across chest
      if (isSword) {
        // Angled sword guard
        r.rightShoulder.rotation.set(0.6, -0.4, 0.5);
        r.rightArm.rotation.set(-0.8, -0.6, 0.4);
        r.rightForearm.rotation.set(-0.9, 0, 0);
        r.weapon.rotation.set(1.1, -0.6, -0.8);

        // Off-hand supports near crossguard
        r.leftShoulder.rotation.set(0.5, 0.4, -0.4);
        r.leftArm.rotation.set(-0.7, 0.5, -0.3);
        r.leftForearm.rotation.set(-0.8, 0, 0);
      } else {
        // Two-handed battle axe parry grip across torso
        r.rightShoulder.rotation.set(0.7, -0.3, 0.4);
        r.rightArm.rotation.set(-0.9, -0.4, 0.3);
        r.weapon.rotation.set(1.2, -0.4, -0.5);

        r.leftShoulder.rotation.set(0.6, 0.5, -0.3);
        r.leftArm.rotation.set(-0.8, 0.6, -0.2);
        r.leftForearm.rotation.set(-0.7, 0, 0);
      }
      return;
    }

    // --- ATTACK: LIGHT ---
    if (state === 'attack_light') {
      const p = stateProgress;

      if (isSword) {
        // Swordsman 3-hit combo animations
        if (comboStep === 0) {
          // Slash 1: Diagonal slash from top-right to bottom-left
          if (p < 0.25) {
            // Windup
            const t = p / 0.25;
            r.torso.rotation.y = t * 0.45;
            r.rightShoulder.rotation.set(t * 0.8, 0, t * 0.8);
            r.rightArm.rotation.set(t * 0.4, 0, 0);
            r.weapon.rotation.set(0.8, 0.4, -0.5);
          } else if (p < 0.65) {
            // Active swing
            const t = (p - 0.25) / 0.4;
            const ease = Math.sin(t * Math.PI * 0.5);
            r.torso.rotation.y = 0.45 - ease * 1.1;
            r.rightShoulder.rotation.set(0.8 - ease * 1.6, 0, 0.8 - ease * 1.4);
            r.rightArm.rotation.set(0.4 - ease * 0.8, 0, 0);
            r.weapon.rotation.set(0.8 - ease * 1.2, 0.4 - ease * 0.8, -0.5 + ease * 1.2);
          } else {
            // Recovery
            const t = (p - 0.65) / 0.35;
            r.torso.rotation.y = -0.65 + t * 0.65;
            r.rightShoulder.rotation.set(-0.8 + t * 0.8, 0, -0.6 + t * 0.6);
          }
        } else if (comboStep === 1) {
          // Slash 2: Horizontal return backslash from left to right
          if (p < 0.25) {
            const t = p / 0.25;
            r.torso.rotation.y = -0.5 * t;
            r.rightShoulder.rotation.set(0, 0, -0.6 * t);
            r.weapon.rotation.set(0.6, -0.6, 0.6);
          } else if (p < 0.65) {
            const t = (p - 0.25) / 0.4;
            r.torso.rotation.y = -0.5 + t * 1.2;
            r.rightShoulder.rotation.set(0, 0, -0.6 + t * 1.5);
            r.weapon.rotation.set(0.6, 0.8 * t, -0.6 * t);
          } else {
            const t = (p - 0.65) / 0.35;
            r.torso.rotation.y = 0.7 - t * 0.7;
          }
        } else {
          // Slash 3: Forward lunging thrust
          if (p < 0.3) {
            const t = p / 0.3;
            r.body.position.z = t * 0.15;
            r.rightShoulder.rotation.set(t * 0.5, 0, -t * 0.2);
            r.rightArm.rotation.set(-t * 0.9, 0, 0);
          } else if (p < 0.7) {
            const t = (p - 0.3) / 0.4;
            r.body.position.z = 0.15 + t * 0.35;
            r.torso.rotation.x = 0.25;
            r.rightArm.rotation.set(-0.9 + t * 1.4, 0, 0);
            r.weapon.rotation.set(1.57, 0, 0); // Point straight forward
          } else {
            const t = (p - 0.7) / 0.3;
            r.body.position.z = 0.5 - t * 0.5;
          }
        }
      } else {
        // Axeman Light Strike: Wide sweeping horizontal chop
        if (p < 0.35) {
          // Windup back
          const t = p / 0.35;
          r.torso.rotation.y = t * 0.65;
          r.rightShoulder.rotation.set(t * 0.6, t * 0.4, t * 0.8);
          r.weapon.rotation.set(0.6, 0.4, -0.6);
        } else if (p < 0.72) {
          // Heavy momentum sweep
          const t = (p - 0.35) / 0.37;
          r.torso.rotation.y = 0.65 - t * 1.4;
          r.torso.rotation.x = 0.15;
          r.rightShoulder.rotation.set(0.6 - t * 0.9, 0, 0.8 - t * 1.5);
          r.weapon.rotation.set(0.6 - t * 0.8, -t * 0.8, 0.6);
        } else {
          // Recovery
          const t = (p - 0.72) / 0.28;
          r.torso.rotation.y = -0.75 + t * 0.75;
        }
      }
      return;
    }

    // --- ATTACK: HEAVY ---
    if (state === 'attack_heavy') {
      const p = stateProgress;
      if (isSword) {
        // Swordsman Heavy: Two-handed high overhead cleave
        if (p < 0.4) {
          const t = p / 0.4;
          r.body.position.y = 0.95 + t * 0.08;
          r.torso.rotation.x = -t * 0.35;
          r.rightShoulder.rotation.set(t * 1.8, 0, 0.2);
          r.leftShoulder.rotation.set(t * 1.6, 0, -0.2);
          r.weapon.rotation.set(2.4, 0, 0);
        } else if (p < 0.75) {
          const t = (p - 0.4) / 0.35;
          r.body.position.y = 0.95 - t * 0.15;
          r.torso.rotation.x = -0.35 + t * 0.85;
          r.rightShoulder.rotation.set(1.8 - t * 2.5, 0, 0);
          r.leftShoulder.rotation.set(1.6 - t * 2.3, 0, 0);
          r.weapon.rotation.set(2.4 - t * 2.6, 0, 0);
        } else {
          const t = (p - 0.75) / 0.25;
          r.torso.rotation.x = 0.5 - t * 0.5;
        }
      } else {
        // Axeman Heavy: Brutal ground-slam cleave
        if (p < 0.45) {
          // Long menacing overhead windup
          const t = p / 0.45;
          r.body.position.y = 0.95 + t * 0.12;
          r.torso.rotation.x = -t * 0.45;
          r.torso.rotation.y = t * 0.2;
          r.rightShoulder.rotation.set(t * 2.1, 0, 0.3);
          r.leftShoulder.rotation.set(t * 1.9, 0, -0.3);
          r.weapon.rotation.set(2.6, 0, 0);
        } else if (p < 0.75) {
          // Crushing down-slam
          const t = (p - 0.45) / 0.3;
          r.body.position.y = 0.95 - t * 0.25;
          r.torso.rotation.x = -0.45 + t * 1.1;
          r.rightShoulder.rotation.set(2.1 - t * 3.0, 0, 0);
          r.leftShoulder.rotation.set(1.9 - t * 2.8, 0, 0);
          r.weapon.rotation.set(2.6 - t * 3.2, 0, 0);
        } else {
          // Recovery from ground impact
          const t = (p - 0.75) / 0.25;
          r.body.position.y = 0.7 + t * 0.25;
          r.torso.rotation.x = 0.65 - t * 0.65;
        }
      }
      return;
    }

    // --- ATTACK: SPECIAL ---
    if (state === 'attack_special') {
      const p = stateProgress;
      if (isSword) {
        // 360-degree Whirlwind spinning twin slash
        r.body.rotation.y = p * Math.PI * 2;
        r.body.position.y = 0.95 + Math.sin(p * Math.PI) * 0.15;
        r.rightShoulder.rotation.set(0.2, 0, 1.4);
        r.leftShoulder.rotation.set(0.2, 0, -1.4);
        r.weapon.rotation.set(0.1, 0, 1.57);
      } else {
        // Leaping executioner overhead slam
        const leapHeight = Math.sin(p * Math.PI) * 0.85;
        r.body.position.y = 0.95 + leapHeight;
        r.body.position.z = p * 0.6;
        if (p < 0.5) {
          r.torso.rotation.x = -0.4;
          r.rightShoulder.rotation.set(2.2, 0, 0.2);
          r.leftShoulder.rotation.set(2.0, 0, -0.2);
          r.weapon.rotation.set(2.6, 0, 0);
        } else {
          r.torso.rotation.x = 0.7;
          r.rightShoulder.rotation.set(-0.8, 0, 0);
          r.leftShoulder.rotation.set(-0.7, 0, 0);
          r.weapon.rotation.set(-0.5, 0, 0);
        }
      }
      return;
    }

    // --- LOCOMOTION / MOVING ---
    if (speed > 0.1) {
      this.walkCycle += delta * speed * 4.2;
      const swing = Math.sin(this.walkCycle);
      const bob = Math.abs(Math.cos(this.walkCycle)) * 0.06;

      r.body.position.y = 0.95 + bob;
      r.torso.rotation.x = 0.12; // Forward lean
      r.torso.rotation.y = -swing * 0.12;

      // Legs alternating strides
      r.leftThigh.rotation.x = swing * 0.65;
      r.leftShin.rotation.x = Math.max(0, -swing * 0.6);
      r.rightThigh.rotation.x = -swing * 0.65;
      r.rightShin.rotation.x = Math.max(0, swing * 0.6);

      // Arms swinging
      r.leftShoulder.rotation.x = -swing * 0.45;
      r.rightShoulder.rotation.x = swing * 0.35;
      r.weapon.rotation.x = 0.9 + swing * 0.15;
      return;
    }

    // --- IDLE COMBAT STANCE ---
    const breath = Math.sin(this.animTime * 2.2) * 0.025;
    r.body.position.y = 0.95 + breath;

    // Slight combat stagger stance
    r.leftThigh.rotation.x = -0.15;
    r.rightThigh.rotation.x = 0.15;
    r.torso.rotation.y = -0.2; // Angled body profile
    r.head.rotation.y = 0.2;  // Head tracks forward

    // Right arm holding weapon poised
    r.rightShoulder.rotation.set(0.4 + breath * 2, -0.2, 0.3);
    r.rightArm.rotation.set(-0.4, 0, 0.2);
    r.weapon.rotation.set(0.95 + breath * 3, -0.2, -0.3);

    // Left arm counter-balancing
    r.leftShoulder.rotation.set(0.2, 0.3, -0.4);
    r.leftArm.rotation.set(-0.3, 0.2, -0.2);
  }
}
