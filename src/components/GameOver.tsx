import React from 'react';
import { MatchStats } from '../game/types.ts';
import { Trophy, Skull, RotateCcw, Home, Swords } from 'lucide-react';

interface GameOverProps {
  stats: MatchStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onChangeCharacter: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  stats,
  onPlayAgain,
  onMainMenu,
  onChangeCharacter,
}) => {
  const isVictory = stats.winner === 'player';

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900/95 border border-white/15 rounded-xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Фоновое свечение за модальным окном */}
        <div
          className={`absolute -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25 ${
            isVictory ? 'bg-amber-400' : 'bg-red-600'
          }`}
        />

        {/* Иконка статуса */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
            isVictory
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
              : 'bg-red-950/80 border-red-500/50 text-red-400'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Подзаголовок */}
        <div className="font-cinzel text-xs tracking-widest text-slate-400 uppercase mb-1">
          STEELBOUND · ДУЭЛЬ ТЕНЕЙ
        </div>

        <h1
          className={`font-cinzel text-4xl sm:text-5xl font-black tracking-wider mb-2 ${
            isVictory
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]'
              : 'text-transparent bg-clip-text bg-gradient-to-b from-red-200 via-red-500 to-rose-700 drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)]'
          }`}
        >
          {isVictory ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          {isVictory
            ? 'Ваша сталь не подвела. Противник повержен и пал на каменные плиты замкового двора.'
            : 'Ваша броня не выдержала натиска. Воспряньте духом, поднимите оружие и верните воинскую честь.'}
        </p>

        {/* Карточка статистики дуэли */}
        <div className="w-full bg-black/40 rounded-lg border border-white/10 p-4 mb-8 grid grid-cols-2 gap-3 text-left text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Нанесено урона</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {stats.playerDamageDealt}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Точных ударов</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {stats.playerHitsLanded}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Отражено атак</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {stats.playerBlocks}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Успешных перекатов</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {stats.playerDodges}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Макс. серия комбо</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {stats.playerComboStreak}
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-[11px]">Длительность боя</div>
            <div className="text-slate-100 font-mono text-base font-bold tabular-nums">
              {Math.round(stats.durationSeconds)} сек.
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-cinzel font-bold text-xs tracking-wider rounded border border-amber-400/40 shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>РЕВАНШ</span>
          </button>

          <button
            onClick={onChangeCharacter}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-semibold text-xs tracking-wider rounded border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>СМЕНИТЬ ВОИНА</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto py-3 px-4 bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white font-cinzel font-semibold text-xs tracking-wider rounded border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Главное меню"
          >
            <Home className="w-4 h-4" />
            <span className="sm:hidden">В МЕНЮ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
