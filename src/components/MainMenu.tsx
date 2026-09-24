import React from 'react';
import { Swords, Volume2, VolumeX, Video } from 'lucide-react';
import { soundEngine } from '../game/audio.ts';

interface MainMenuProps {
  onStartGame: () => void;
  onHowToPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onHowToPlay }) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMute(next);
  };

  const handlePlayClick = () => {
    soundEngine.ensureContext();
    soundEngine.playSwordSwing();
    onStartGame();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-slate-950">
      {/* Фоновый арт замка */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/skybox_castle_moon_1790230553601.jpg"
          alt="Лунная ночь в замковом дворе"
          className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
      </div>

      {/* Верхняя информационная плашка */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-amber-500 font-semibold tracking-widest uppercase">
            Рыцарская дуэль 1 на 1
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Двор заброшенного замка</span>
        </div>

        <button
          onClick={toggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/70 border border-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? 'Звук выкл.' : 'Звук вкл.'}</span>
        </button>
      </div>

      {/* Центральный блок с заголовком и кнопками */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 text-xs font-cinzel text-amber-300/90 tracking-widest uppercase bg-amber-950/50 border border-amber-500/30 rounded">
          <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Кинематографичная битва на мечах и секирах
        </div>

        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-2xl">
          STEELBOUND
        </h1>
        <h2 className="font-cinzel text-lg sm:text-2xl font-bold tracking-widest text-slate-300 mt-1 mb-6 drop-shadow">
          ДУЭЛЬ ТЕНЕЙ
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mb-8 leading-relaxed drop-shadow">
          Ступите на камни древнего бастиона. Сразитесь с грозным противником лицом к лицу, используя блоки щитом, тактические перекаты, сокрушительные рубящие удары и классический 2D-вид файтинга.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md">
          <button
            onClick={handlePlayClick}
            className="w-full py-3.5 px-8 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-cinzel font-bold text-sm sm:text-base tracking-widest rounded border border-amber-400/40 shadow-xl shadow-amber-900/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>НАЧАТЬ ДУЭЛЬ</span>
          </button>

          <button
            onClick={onHowToPlay}
            className="w-full py-3.5 px-6 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-cinzel font-semibold text-xs sm:text-sm tracking-wider rounded border border-white/15 transition-all cursor-pointer"
          >
            КАК ИГРАТЬ
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-amber-300/80 font-cinzel">
          <Video className="w-3.5 h-3.5" />
          <span>Поддержка 2D (классический вид сбоку) и 3D режимов камеры</span>
        </div>
      </div>

      {/* Особенности боевой системы */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">01.</span>
          <span>Физика попаданий и траектория клинка</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">02.</span>
          <span>Перекаты с окном неуязвимости (i-frames)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">03.</span>
          <span>Поглощение урона блоком и пробитие стойки</span>
        </div>
      </div>
    </div>
  );
};
