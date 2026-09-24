import React from 'react';
import { ArrowLeft, Swords, Shield, Zap, Target, Video } from 'lucide-react';

interface HowToPlayProps {
  onBack: () => void;
  onStartGame: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack, onStartGame }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 bg-slate-950 overflow-y-auto">
      {/* Верхняя шапка */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/70 border border-white/10 rounded text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>НАЗАД</span>
        </button>

        <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-amber-100 tracking-wider">
          ОБУЧЕНИЕ И УПРАВЛЕНИЕ В БОЮ
        </h1>

        <div className="w-16" />
      </div>

      {/* Основная сетка руководства */}
      <div className="w-full max-w-4xl mx-auto my-6 space-y-6">
        {/* Раскладка управления */}
        <div className="p-6 bg-slate-900/70 border border-white/10 rounded-lg">
          <h2 className="font-cinzel text-base font-bold text-amber-300 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            КЛАВИШИ УПРАВЛЕНИЯ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">W, A, S, D</div>
              <div className="text-slate-300 font-semibold mb-1">Перемещение</div>
              <div className="text-slate-400 text-[11px]">Бег и маневрирование вокруг противника на арене.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">Левая кнопка мыши (ЛКМ) / J</div>
              <div className="text-slate-300 font-semibold mb-1">Быстрый удар</div>
              <div className="text-slate-400 text-[11px]">Скоростная серия атак комбо с низким расходом выносливости.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">E / L</div>
              <div className="text-slate-300 font-semibold mb-1">Тяжелый удар</div>
              <div className="text-slate-400 text-[11px]">Сокрушительный рубящий удар с повышенным уроном.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">Q / U</div>
              <div className="text-slate-300 font-semibold mb-1">Особый прием</div>
              <div className="text-slate-400 text-[11px]">Круговой вихрь клинка или яростный прыжок с секирой.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">Правая кнопка мыши (ПКМ) / F / Shift</div>
              <div className="text-slate-300 font-semibold mb-1">Блок (Удержание)</div>
              <div className="text-slate-400 text-[11px]">Поглощает 85% урона, расходуя запас выносливости при ударе.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-white/5">
              <div className="text-amber-400 font-bold mb-0.5">Пробел (Space)</div>
              <div className="text-slate-300 font-semibold mb-1">Тактический перекат</div>
              <div className="text-slate-400 text-[11px]">Быстрый маневр с окном неуязвимости к вражеским выпадам.</div>
            </div>

            <div className="p-3 bg-black/40 rounded border border-amber-500/30 sm:col-span-2 lg:col-span-3 bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-300 font-bold mb-0.5">
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>Клавиша C или V / Кнопка в HUD</span>
              </div>
              <div className="text-slate-200 font-semibold mb-1">Режим камеры: 2D (Классический файтинг) / 3D (Погоня)</div>
              <div className="text-slate-300 text-[11px]">
                Переключает перспективу между классическим аркадным 2D-видом сбоку (как в Mortal Kombat и Street Fighter) и кинематографичной 3D-камерой из-за плеча. В 2D-режиме клавиши A и D двигают бойца строго по линии дуэли.
              </div>
            </div>
          </div>
        </div>

        {/* Руководство по боевым механикам */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-900/60 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-sky-300 font-cinzel font-bold">
              <Shield className="w-4 h-4 text-sky-400" />
              БЛОКИРОВАНИЕ И ПРОБИТИЕ СТОЙКИ
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Удержание блока отражает большинство ударов. Однако каждый контакт тратит выносливость. Если она упадет до нуля при блоке, ваша стойка будет сокрушена — боец будет оглушен на 1.3 секунды!
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-emerald-300 font-cinzel font-bold">
              <Zap className="w-4 h-4 text-emerald-400" />
              ПЕРЕКАТЫ И НЕУЯЗВИМОСТЬ
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Во время переката вы получаете короткое окно неуязвимости (i-frames), пропуская даже тяжелые выпады. Кувыркайтесь во фланг врага во время замаха, чтобы нанести удар в открытую спину.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-amber-300 font-cinzel font-bold">
              <Swords className="w-4 h-4 text-amber-400" />
              ОСОБЕННОСТИ ОРУЖИЯ
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Мечник выделяется стремительными комбинациями из 3 ударов и быстрым восстановлением. Дровосек сокрушает тяжелой секирой, ломая стойку и выбивая щит. Выбирайте свой стиль боя.
            </p>
          </div>
        </div>
      </div>

      {/* Нижняя кнопка */}
      <div className="w-full max-w-md mx-auto text-center">
        <button
          onClick={onStartGame}
          className="w-full py-3.5 px-8 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-cinzel font-bold text-sm sm:text-base tracking-widest rounded border border-amber-400/40 shadow-xl shadow-amber-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Swords className="w-4 h-4 text-amber-300" />
          <span>ВЫБРАТЬ ВОИНА И В БОЙ</span>
        </button>
      </div>
    </div>
  );
};
