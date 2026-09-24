import React, { useEffect, useState } from 'react';
import { soundEngine } from '../game/audio.ts';

interface CountdownProps {
  onComplete: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    soundEngine.playFootstep();

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          soundEngine.playWeaponClash();
          return 0; // "FIGHT!"
        }
        if (prev === 0) {
          clearInterval(interval);
          onComplete();
          return -1;
        }
        soundEngine.playFootstep();
        return prev - 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (count === -1) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-2xs">
      <div className="text-center animate-bounce">
        {count > 0 ? (
          <div className="font-cinzel text-7xl sm:text-9xl font-black text-amber-300 drop-shadow-[0_10px_35px_rgba(217,119,6,0.8)] tracking-wider">
            {count}
          </div>
        ) : (
          <div className="font-cinzel text-6xl sm:text-8xl font-black text-red-500 drop-shadow-[0_10px_45px_rgba(239,68,68,0.9)] tracking-widest scale-125">
            В БОЙ!
          </div>
        )}
      </div>
    </div>
  );
};
