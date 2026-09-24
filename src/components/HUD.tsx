import React, { useEffect, useState } from 'react';
import { Fighter } from '../game/fighter.ts';
import { Shield, Zap, Volume2, VolumeX, Swords, Video } from 'lucide-react';
import { soundEngine } from '../game/audio.ts';

interface HUDProps {
  player: Fighter;
  ai: Fighter;
  cameraMode: '2d' | '3d';
  onToggleCamera: () => void;
  onLightAttack: () => void;
  onHeavyAttack: () => void;
  onSpecialAttack: () => void;
  onDodge: () => void;
  onBlockStart: () => void;
  onBlockEnd: () => void;
  onPauseToggle: () => void;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  ai,
  cameraMode,
  onToggleCamera,
  onLightAttack,
  onHeavyAttack,
  onSpecialAttack,
  onDodge,
  onBlockStart,
  onBlockEnd,
  onPauseToggle,
  isPaused,
}) => {
  const [playerGhostHp, setPlayerGhostHp] = useState(player.health);
  const [aiGhostHp, setAiGhostHp] = useState(ai.health);
  const [isMuted, setIsMuted] = useState(false);

  // Плавное отставание дополнительной полосы здоровья (эффект файтингов)
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayerGhostHp((prev) => {
        if (prev > player.health) {
          return Math.max(player.health, prev - 1.2);
        }
        return player.health;
      });

      setAiGhostHp((prev) => {
        if (prev > ai.health) {
          return Math.max(ai.health, prev - 1.2);
        }
        return ai.health;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [player.health, ai.health]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
  };

  const playerHpPct = Math.max(0, Math.min(100, (player.health / player.stats.maxHealth) * 100));
  const playerGhostPct = Math.max(0, Math.min(100, (playerGhostHp / player.stats.maxHealth) * 100));
  const playerStaminaPct = Math.max(0, Math.min(100, (player.stamina / player.stats.maxStamina) * 100));

  const aiHpPct = Math.max(0, Math.min(100, (ai.health / ai.stats.maxHealth) * 100));
  const aiGhostPct = Math.max(0, Math.min(100, (aiGhostHp / ai.stats.maxHealth) * 100));
  const aiStaminaPct = Math.max(0, Math.min(100, (ai.stamina / ai.stats.maxStamina) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 md:p-6">
      {/* ВЕРХНЯЯ БОЕВАЯ ПАНЕЛЬ */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4 md:gap-8 items-start">
          {/* ИГРОК (СЛЕВА) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-bold text-sm md:text-base tracking-wider text-amber-100 uppercase">
                  {player.stats.name}
                </span>
                <span className="text-[11px] text-amber-400/90 font-medium hidden sm:inline">
                  (Вы)
                </span>
              </div>
              <span className="font-mono text-xs text-amber-200/80 font-medium tabular-nums">
                {Math.ceil(player.health)} / {player.stats.maxHealth}
              </span>
            </div>

            {/* Полоса здоровья игрока */}
            <div className="relative h-4 md:h-5 bg-black/60 rounded-xs overflow-hidden border border-white/20 shadow-inner">
              <div
                className="absolute top-0 bottom-0 left-0 bg-amber-400/60 transition-all duration-75"
                style={{ width: `${playerGhostPct}%` }}
              />
              <div
                className={`absolute top-0 bottom-0 left-0 transition-all duration-100 ${
                  playerHpPct > 30 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-red-600 to-rose-500'
                }`}
                style={{ width: `${playerHpPct}%` }}
              />
            </div>

            {/* Выносливость игрока */}
            <div className="relative h-2 md:h-2.5 bg-black/60 rounded-xs overflow-hidden border border-white/10 mt-1">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-75"
                style={{ width: `${playerStaminaPct}%` }}
              />
            </div>

            {/* Статус игрока */}
            <div className="h-5 mt-1 flex items-center gap-2">
              {player.state === 'guard_broken' && (
                <span className="text-[11px] font-bold tracking-wider text-red-400 uppercase animate-pulse">
                  СТОЙКА ПРОБИТА
                </span>
              )}
              {player.state === 'blocking' && (
                <span className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> В БЛОКЕ
                </span>
              )}
              {player.isInvulnerable && (
                <span className="text-[11px] font-semibold tracking-wider text-sky-300 uppercase">
                  ПЕРЕКАТ
                </span>
              )}
            </div>
          </div>

          {/* ПРОТИВНИК AI (СПРАВА) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5 flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <span className="font-cinzel font-bold text-sm md:text-base tracking-wider text-red-200 uppercase">
                  {ai.stats.name}
                </span>
                <span className="text-[11px] text-red-400/90 font-medium hidden sm:inline">
                  (Враг)
                </span>
              </div>
              <span className="font-mono text-xs text-red-200/80 font-medium tabular-nums">
                {Math.ceil(ai.health)} / {ai.stats.maxHealth}
              </span>
            </div>

            {/* Полоса здоровья противника */}
            <div className="relative h-4 md:h-5 bg-black/60 rounded-xs overflow-hidden border border-white/20 shadow-inner flex justify-end">
              <div
                className="absolute top-0 bottom-0 right-0 bg-amber-400/60 transition-all duration-75"
                style={{ width: `${aiGhostPct}%` }}
              />
              <div
                className={`absolute top-0 bottom-0 right-0 transition-all duration-100 ${
                  aiHpPct > 30 ? 'bg-gradient-to-l from-red-600 to-rose-500' : 'bg-gradient-to-l from-red-700 to-red-950'
                }`}
                style={{ width: `${aiHpPct}%` }}
              />
            </div>

            {/* Выносливость противника */}
            <div className="relative h-2 md:h-2.5 bg-black/60 rounded-xs overflow-hidden border border-white/10 mt-1 flex justify-end">
              <div
                className="h-full bg-gradient-to-l from-amber-600 to-amber-400 transition-all duration-75"
                style={{ width: `${aiStaminaPct}%` }}
              />
            </div>

            {/* Статус противника */}
            <div className="h-5 mt-1 flex items-center justify-end gap-2">
              {ai.state === 'guard_broken' && (
                <span className="text-[11px] font-bold tracking-wider text-yellow-300 uppercase animate-pulse">
                  СТОЙКА ПРОБИТА
                </span>
              )}
              {ai.state === 'blocking' && (
                <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" /> В БЛОКЕ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ВЕРХНИЕ ИНСТРУМЕНТЫ И ПОДСКАЗКИ */}
        <div className="flex items-center justify-between pointer-events-auto mt-1 flex-wrap gap-2">
          <div className="text-[11px] text-slate-300 bg-black/50 px-3 py-1 rounded backdrop-blur-xs border border-white/10 flex items-center gap-1.5 flex-wrap">
            <span>WASD: движение</span>
            <span className="text-slate-600">·</span>
            <span>ЛКМ: легкий</span>
            <span className="text-slate-600">·</span>
            <span>ПКМ: блок</span>
            <span className="text-slate-600">·</span>
            <span>Пробел: перекат</span>
            <span className="text-slate-600">·</span>
            <span>E: тяжелый</span>
            <span className="text-slate-600">·</span>
            <span>Q: особый</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-medium">C: 2D/3D вид</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка переключения 2D / 3D камеры */}
            <button
              onClick={onToggleCamera}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-cinzel font-semibold transition-all cursor-pointer ${
                cameraMode === '2d'
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-md shadow-amber-900/30 ring-1 ring-amber-500/50'
                  : 'bg-black/50 hover:bg-black/80 border-white/15 text-slate-300 hover:text-white'
              }`}
              title="Переключить режим камеры: 2D (Классический вид сбоку) или 3D (Вид от третьего лица)"
            >
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>{cameraMode === '2d' ? 'КАМЕРА: 2D' : 'КАМЕРА: 3D'}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">[C]</span>
            </button>

            {/* Звук */}
            <button
              onClick={toggleMute}
              className="p-1.5 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center"
              title={isMuted ? 'Включить звук' : 'Выключить звук'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Пауза */}
            <button
              onClick={onPauseToggle}
              className="px-2.5 py-1 bg-black/50 hover:bg-black/80 rounded border border-white/10 text-xs font-cinzel text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
            </button>
          </div>
        </div>
      </div>

      {/* ОКНО ПАУЗЫ */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-40">
          <div className="bg-slate-900/95 border border-amber-600/40 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="font-cinzel text-2xl font-bold text-amber-200 mb-2">ДУЭЛЬ НА ПАУЗЕ</h2>
            <p className="text-sm text-slate-400 mb-6">Переведите дух, рыцарь. Сталь ждет своего часа.</p>
            
            <div className="mb-4 p-3 bg-black/40 rounded border border-white/10 text-xs text-left space-y-1.5 text-slate-300">
              <div className="flex justify-between items-center">
                <span>Режим камеры:</span>
                <button
                  onClick={onToggleCamera}
                  className="px-2 py-0.5 bg-amber-950/70 border border-amber-500/50 text-amber-300 rounded text-[11px] font-cinzel"
                >
                  {cameraMode === '2d' ? '2D (Вид сбоку)' : '3D (От третьего лица)'}
                </button>
              </div>
            </div>

            <button
              onClick={onPauseToggle}
              className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-cinzel font-semibold rounded tracking-wider transition-colors cursor-pointer"
            >
              ВЕРНУТЬСЯ К БИТВЕ
            </button>
          </div>
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ БОЕВЫХ ДЕЙСТВИЙ */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto mb-2 flex items-center justify-center gap-1.5 sm:gap-2.5">
        {/* ЛЕГКИЙ УДАР */}
        <button
          onClick={onLightAttack}
          className="flex-1 py-2 sm:py-2.5 px-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-white/20 rounded shadow-lg text-center cursor-pointer transition-all"
        >
          <div className="font-cinzel text-xs sm:text-sm font-bold text-amber-100 flex items-center justify-center gap-1">
            <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>БЫСТРЫЙ</span>
          </div>
          <div className="text-[10px] text-slate-400">ЛКМ / J</div>
        </button>

        {/* ТЯЖЕЛЫЙ УДАР */}
        <button
          onClick={onHeavyAttack}
          className="flex-1 py-2 sm:py-2.5 px-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-amber-500/40 rounded shadow-lg text-center cursor-pointer transition-all"
        >
          <div className="font-cinzel text-xs sm:text-sm font-bold text-amber-300">
            ТЯЖЕЛЫЙ
          </div>
          <div className="text-[10px] text-slate-400">E / L</div>
        </button>

        {/* ОСОБЫЙ УДАР */}
        <button
          onClick={onSpecialAttack}
          className="flex-1 py-2 sm:py-2.5 px-2 bg-gradient-to-t from-red-950/85 to-slate-900/85 hover:from-red-900/85 active:scale-95 border border-red-500/50 rounded shadow-lg text-center cursor-pointer transition-all"
        >
          <div className="font-cinzel text-xs sm:text-sm font-bold text-red-200">
            ОСОБЫЙ
          </div>
          <div className="text-[10px] text-slate-400">Q / U</div>
        </button>

        {/* БЛОК */}
        <button
          onMouseDown={onBlockStart}
          onMouseUp={onBlockEnd}
          onTouchStart={onBlockStart}
          onTouchEnd={onBlockEnd}
          className="flex-1 py-2 sm:py-2.5 px-2 bg-slate-900/85 hover:bg-slate-800 active:bg-amber-900/60 border border-white/20 rounded shadow-lg text-center cursor-pointer transition-all"
        >
          <div className="font-cinzel text-xs sm:text-sm font-bold text-sky-200 flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>БЛОК</span>
          </div>
          <div className="text-[10px] text-slate-400">ПКМ / F</div>
        </button>

        {/* ПЕРЕКАТ */}
        <button
          onClick={onDodge}
          className="flex-1 py-2 sm:py-2.5 px-2 bg-slate-900/85 hover:bg-slate-800 active:scale-95 border border-white/20 rounded shadow-lg text-center cursor-pointer transition-all"
        >
          <div className="font-cinzel text-xs sm:text-sm font-bold text-emerald-200 flex items-center justify-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>ПЕРЕКАТ</span>
          </div>
          <div className="text-[10px] text-slate-400">ПРОБЕЛ</div>
        </button>
      </div>
    </div>
  );
};
