export type WarriorType = 'swordsman' | 'axeman';

export type AttackKind = 'light' | 'heavy' | 'special';

export type CombatState = 
  | 'idle' 
  | 'moving' 
  | 'attack_light' 
  | 'attack_heavy' 
  | 'attack_special' 
  | 'blocking' 
  | 'dodging' 
  | 'hit' 
  | 'guard_broken' 
  | 'dead';

export interface WarriorStats {
  name: string;
  title: string;
  weaponName: string;
  weaponDescription: string;
  maxHealth: number;
  maxStamina: number;
  staminaRegenRate: number;
  moveSpeed: number;
  lightDamage: number;
  heavyDamage: number;
  specialDamage: number;
  lightStaminaCost: number;
  heavyStaminaCost: number;
  specialStaminaCost: number;
  dodgeStaminaCost: number;
  weaponReach: number;
  attackSpeedMultiplier: number;
  description: string;
  strengths: string[];
}

export const WARRIOR_CONFIGS: Record<WarriorType, WarriorStats> = {
  swordsman: {
    name: 'Мечник',
    title: 'Безмолвный Клинок Пепла',
    weaponName: 'Полуторный рыцарский меч',
    weaponDescription: 'Обоюдоострая закаленная сталь с крестовиной и балансировочным навершием',
    maxHealth: 110,
    maxStamina: 100,
    staminaRegenRate: 26,
    moveSpeed: 5.6,
    lightDamage: 14,
    heavyDamage: 32,
    specialDamage: 48,
    lightStaminaCost: 15,
    heavyStaminaCost: 28,
    specialStaminaCost: 45,
    dodgeStaminaCost: 22,
    weaponReach: 2.35,
    attackSpeedMultiplier: 1.25,
    description: 'Мастер фехтования со стремительными рубящими выпадами, плавными сериями комбо и быстрым восстановлением.',
    strengths: ['Быстрые цепочки комбо', 'Мгновенный выход из переката', 'Высокая подвижность и дистанция']
  },
  axeman: {
    name: 'Секироносец',
    title: 'Железный Разоритель',
    weaponName: 'Тяжелая боевая секира',
    weaponDescription: 'Усиленное топорище с широким бородатым лезвием и сокрушительной пробивной мощью',
    maxHealth: 135,
    maxStamina: 105,
    staminaRegenRate: 22,
    moveSpeed: 4.8,
    lightDamage: 22,
    heavyDamage: 46,
    specialDamage: 62,
    lightStaminaCost: 20,
    heavyStaminaCost: 36,
    specialStaminaCost: 52,
    dodgeStaminaCost: 26,
    weaponReach: 2.15,
    attackSpeedMultiplier: 0.92,
    description: 'Неукротимый джаггернаут, наносящий сокрушительные рубящие удары, выбивающие щит и пробивающие любую защиту.',
    strengths: ['Колоссальный урон тяжелых атак', 'Сокрушительный удар в прыжке', 'Повышенная живучесть и стойкость']
  }
};

export type GameScreen = 'menu' | 'character_select' | 'how_to_play' | 'countdown' | 'arena' | 'game_over';

export interface CombatEvent {
  type: 'hit' | 'block' | 'guard_break' | 'dodge' | 'whiff';
  attackerIsPlayer: boolean;
  damage: number;
  isHeavy: boolean;
  position: [number, number, number];
}

export interface MatchStats {
  winner: 'player' | 'ai';
  durationSeconds: number;
  playerDamageDealt: number;
  playerHitsLanded: number;
  playerBlocks: number;
  playerDodges: number;
  playerComboStreak: number;
}
