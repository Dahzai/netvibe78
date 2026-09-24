import React, { useState } from 'react';
import { WarriorType, WARRIOR_CONFIGS } from '../game/types.ts';
import { Swords, Axe, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../game/audio.ts';

interface CharacterSelectProps {
  onSelectWarrior: (type: WarriorType) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelectWarrior, onBack }) => {
  const [selected, setSelected] = useState<WarriorType>('swordsman');

  const swordsman = WARRIOR_CONFIGS.swordsman;
  const axeman = WARRIOR_CONFIGS.axeman;

  const handleSelect = (type: WarriorType) => {
    setSelected(type);
    if (type === 'swordsman') {
      soundEngine.playSwordSwing();
    } else {
      soundEngine.playAxeSwing();
    }
  };

  const handleConfirm = () => {
    soundEngine.playWeaponClash();
    onSelectWarrior(selected);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-950 overflow-y-auto">
      {/* Фоновый арт */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/banner_lion_crest_1790230572159.jpg"
          alt="Рыцарский геральдический герб"
          className="w-full h-full object-cover opacity-15 filter brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/90" />
      </div>

      {/* Верхняя шапка */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/70 border border-white/10 rounded text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>НАЗАД</span>
        </button>

        <div className="text-center">
          <h2 className="font-cinzel text-xs sm:text-sm font-semibold text-amber-500 tracking-widest uppercase">
            STEELBOUND · ДУЭЛЬ ТЕНЕЙ
          </h2>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-wider">
            ВЫБЕРИТЕ СВОЕГО ВОИНА
          </h1>
        </div>

        <div className="w-16" />
      </div>

      {/* Карточки воинов */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-auto py-6">
        {/* КАРТОЧКА МЕЧНИКА */}
        <div
          onClick={() => handleSelect('swordsman')}
          className={`relative p-6 rounded-lg transition-all cursor-pointer border flex flex-col justify-between ${
            selected === 'swordsman'
              ? 'bg-slate-900/90 border-amber-500/80 shadow-2xl shadow-amber-900/30 ring-2 ring-amber-500/50 -translate-y-1'
              : 'bg-slate-900/50 border-white/10 hover:border-white/30 hover:bg-slate-900/70'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-cinzel">
                <Swords className="w-3.5 h-3.5 text-sky-400" />
                Ловкий Дуэлянт
              </div>
              <span className="font-mono text-xs text-slate-400">КЛАСС 01</span>
            </div>

            <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-0.5">
              {swordsman.name}
            </h3>
            <p className="text-xs text-amber-400/90 font-cinzel mb-3">
              {swordsman.title}
            </p>

            <div className="p-3 bg-black/40 rounded border border-white/5 mb-4 text-xs">
              <div className="text-slate-400 font-medium mb-1">
                Оружие: <span className="text-slate-200">{swordsman.weaponName}</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                {swordsman.weaponDescription}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {swordsman.description}
            </p>

            {/* Сильные стороны */}
            <div className="mb-6">
              <div className="text-[11px] font-cinzel uppercase text-slate-400 font-semibold mb-1.5">
                Боевые преимущества
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {swordsman.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Параметры */}
          <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Скорость и подвижность</span>
                <span className="text-sky-300">Высокая (5.6 м/с)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-sky-400 w-[88%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Скорость атаки и серий</span>
                <span className="text-sky-300">Очень высокая (1.25x)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-sky-400 w-[92%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Сила ударов</span>
                <span className="text-amber-300">Умеренная (14 / 32 / 48)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-amber-400 w-[60%]" />
              </div>
            </div>
          </div>
        </div>

        {/* КАРТОЧКА СЕКИРОНОСЦА */}
        <div
          onClick={() => handleSelect('axeman')}
          className={`relative p-6 rounded-lg transition-all cursor-pointer border flex flex-col justify-between ${
            selected === 'axeman'
              ? 'bg-slate-900/90 border-amber-500/80 shadow-2xl shadow-amber-900/30 ring-2 ring-amber-500/50 -translate-y-1'
              : 'bg-slate-900/50 border-white/10 hover:border-white/30 hover:bg-slate-900/70'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-cinzel">
                <Axe className="w-3.5 h-3.5 text-red-400" />
                Тяжелый Джаггернаут
              </div>
              <span className="font-mono text-xs text-slate-400">КЛАСС 02</span>
            </div>

            <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-0.5">
              {axeman.name}
            </h3>
            <p className="text-xs text-red-400/90 font-cinzel mb-3">
              {axeman.title}
            </p>

            <div className="p-3 bg-black/40 rounded border border-white/5 mb-4 text-xs">
              <div className="text-slate-400 font-medium mb-1">
                Оружие: <span className="text-slate-200">{axeman.weaponName}</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                {axeman.weaponDescription}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {axeman.description}
            </p>

            {/* Сильные стороны */}
            <div className="mb-6">
              <div className="text-[11px] font-cinzel uppercase text-slate-400 font-semibold mb-1.5">
                Боевые преимущества
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {axeman.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Параметры */}
          <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Скорость и подвижность</span>
                <span className="text-red-300">Тяжелая (4.8 м/с)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-red-400 w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Скорость атаки и серий</span>
                <span className="text-red-300">Умеренная (0.92x)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-red-400 w-[55%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                <span>Сила ударов</span>
                <span className="text-red-300">Сокрушительная (22 / 46 / 62)</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-xs overflow-hidden">
                <div className="h-full bg-red-500 w-[95%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя кнопка подтверждения выбора */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 px-8 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-cinzel font-bold text-base tracking-widest rounded border border-amber-400/40 shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>ВСТУПИТЬ В БОЙ: {selected === 'swordsman' ? 'МЕЧНИК' : 'СЕКИРОНОСЕЦ'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Искусственный интеллект автоматически возьмет под контроль противоположного воина.
        </p>
      </div>
    </div>
  );
};
