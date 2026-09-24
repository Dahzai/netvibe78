/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameScreen, WarriorType, MatchStats } from './game/types.ts';
import { GameEngine } from './game/engine.ts';
import { MainMenu } from './components/MainMenu.tsx';
import { CharacterSelect } from './components/CharacterSelect.tsx';
import { HowToPlay } from './components/HowToPlay.tsx';
import { HUD } from './components/HUD.tsx';
import { Countdown } from './components/Countdown.tsx';
import { GameOver } from './components/GameOver.tsx';
import { soundEngine } from './game/audio.ts';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [playerType, setPlayerType] = useState<WarriorType>('swordsman');
  const [cameraMode, setCameraMode] = useState<'2d' | '3d'>('2d');
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [, setTick] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Инициализация или перезапуск движка
  const initEngine = useCallback((warrior: WarriorType) => {
    if (!canvasRef.current) return;

    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    const engine = new GameEngine(canvasRef.current, warrior);
    engine.cameraMode = cameraMode;

    engine.onStateUpdate = () => {
      // Синхронизация состояния камеры при переключении с клавиатуры
      if (engine.cameraMode !== cameraMode) {
        setCameraMode(engine.cameraMode);
      }
      // Быстрый триггер рендера для синхронизации HUD полос
      setTick((t) => (t + 1) % 1000);
    };

    engine.onMatchEnd = (_winner, stats) => {
      setMatchStats({ ...stats });
    };

    engineRef.current = engine;

    // Старт с отсчетом перед боем
    setIsCountingDown(true);
    setMatchStats(null);
    setIsPaused(false);
  }, [cameraMode]);

  // При переходе на арену инициализируем боевой движок
  useEffect(() => {
    if (screen === 'arena') {
      initEngine(playerType);
    } else {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [screen, playerType, initEngine]);

  const handleStartDuel = (selectedWarrior: WarriorType) => {
    setPlayerType(selectedWarrior);
    setScreen('arena');
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handlePlayAgain = () => {
    setMatchStats(null);
    initEngine(playerType);
  };

  const handleChangeCharacter = () => {
    setMatchStats(null);
    setScreen('character_select');
  };

  const handleMainMenu = () => {
    setMatchStats(null);
    setScreen('menu');
  };

  const handleToggleCamera = () => {
    if (engineRef.current) {
      const newMode = engineRef.current.toggleCameraMode();
      setCameraMode(newMode);
    } else {
      setCameraMode((prev) => (prev === '2d' ? '3d' : '2d'));
    }
  };

  const handlePauseToggle = () => {
    if (!engineRef.current || matchStats) return;
    const next = !isPaused;
    setIsPaused(next);
    engineRef.current.isPaused = next;
    if (next) {
      soundEngine.stopCombatMusic();
    } else {
      soundEngine.startCombatMusic();
    }
  };

  // Горячие клавиши паузы
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'arena' && !matchStats) {
          handlePauseToggle();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, matchStats, isPaused]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 3D WebGL Canvas холст */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block ${screen === 'arena' ? 'visible' : 'hidden'}`}
      />

      {/* ЭКРАНЫ ПРИЛОЖЕНИЯ */}
      {screen === 'menu' && (
        <MainMenu
          onStartGame={() => setScreen('character_select')}
          onHowToPlay={() => setScreen('how_to_play')}
        />
      )}

      {screen === 'how_to_play' && (
        <HowToPlay
          onBack={() => setScreen('menu')}
          onStartGame={() => setScreen('character_select')}
        />
      )}

      {screen === 'character_select' && (
        <CharacterSelect
          onSelectWarrior={handleStartDuel}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* ИНТЕРФЕЙС АРЕНЫ */}
      {screen === 'arena' && engineRef.current && (
        <>
          {/* Боевой HUD */}
          <HUD
            player={engineRef.current.player}
            ai={engineRef.current.ai}
            cameraMode={cameraMode}
            onToggleCamera={handleToggleCamera}
            onLightAttack={() => engineRef.current?.triggerLightAttack()}
            onHeavyAttack={() => engineRef.current?.triggerHeavyAttack()}
            onSpecialAttack={() => engineRef.current?.triggerSpecialAttack()}
            onDodge={() => engineRef.current?.triggerDodge()}
            onBlockStart={() => engineRef.current?.setBlock(true)}
            onBlockEnd={() => engineRef.current?.setBlock(false)}
            onPauseToggle={handlePauseToggle}
            isPaused={isPaused}
          />

          {/* Отсчет перед боем */}
          {isCountingDown && (
            <Countdown onComplete={handleCountdownComplete} />
          )}

          {/* Экран победы / поражения */}
          {matchStats && (
            <GameOver
              stats={matchStats}
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleMainMenu}
              onChangeCharacter={handleChangeCharacter}
            />
          )}
        </>
      )}
    </div>
  );
}
