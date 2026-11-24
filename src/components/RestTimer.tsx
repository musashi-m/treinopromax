import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Plus, Minus, Volume2, VolumeX, Maximize2, Minimize2, BellRing, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/calc';
import { playClockTickTock, playRestFinishAlert, unlockAudio, vibrateDevice } from '../utils/sound';

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  isMuted?: boolean;
  exerciseName?: string;
  setNumber?: number;
  onAddSeconds: (seconds: number) => void;
  onTogglePause: () => void;
  onToggleMute?: () => void;
  onSkip: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused,
  isMuted: controlledMuted,
  exerciseName,
  setNumber,
  onAddSeconds,
  onTogglePause,
  onToggleMute,
  onSkip,
}) => {
  const [localMuted, setLocalMuted] = useState(false);
  const isMuted = controlledMuted !== undefined ? controlledMuted : localMuted;
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggleMute = () => {
    unlockAudio();
    if (onToggleMute) {
      onToggleMute();
    } else {
      setLocalMuted((prev) => !prev);
    }
  };

  // Loud clock tic-tac on the final 5 seconds (5, 4, 3, 2, 1)
  useEffect(() => {
    if (isPaused || isMuted) return;

    if (remainingSeconds <= 5 && remainingSeconds >= 1) {
      playClockTickTock(remainingSeconds);
    } else if (remainingSeconds === 0) {
      playRestFinishAlert();
      vibrateDevice([300, 150, 400]);
    }
  }, [remainingSeconds, isPaused, isMuted]);

  // Percentage calculation for progress ring
  const safeTotal = Math.max(totalSeconds, 1);
  const progressPercent = Math.min(100, Math.max(0, ((safeTotal - remainingSeconds) / safeTotal) * 100));

  // If minimized, display a sleek floating pill in the bottom corner
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-900/95 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/30 cursor-pointer backdrop-blur-md animate-bounce hover:animate-none transition-all"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90">
            <circle cx="16" cy="16" r="13" stroke="#1e293b" strokeWidth="3" fill="none" />
            <circle
              cx="16"
              cy="16"
              r="13"
              stroke="#10b981"
              strokeWidth="3"
              fill="none"
              strokeDasharray={81.6}
              strokeDashoffset={81.6 - (progressPercent / 100) * 81.6}
              strokeLinecap="round"
            />
          </svg>
          <BellRing className="w-4 h-4 text-emerald-400 absolute" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Descanso</span>
          <span className="text-sm font-black text-white font-mono">{formatTime(remainingSeconds)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddSeconds(15);
          }}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold"
        >
          +15s
        </button>
        <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white ml-1" />
      </div>
    );
  }

  // Full Rest Timer Dock / Modal Bar (Android thumb & safe-area friendly)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] sm:p-4 bg-gradient-to-t from-black via-slate-950/95 to-slate-900/95 border-t border-emerald-500/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/20 transition-all">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Exercise and Set context */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#1e293b" strokeWidth="4" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={remainingSeconds <= 5 ? '#ef4444' : '#10b981'}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={150.7}
                  strokeDashoffset={150.7 - (progressPercent / 100) * 150.7}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className={`text-sm font-black absolute font-mono ${remainingSeconds <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {remainingSeconds}s
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Descanso Ativo
                </span>
                {setNumber && (
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    Série {setNumber} concluída
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                {exerciseName || 'Recupere o fôlego'}
              </h4>
            </div>
          </div>

          {/* Minimize and Mute icons on mobile */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleMute}
              title={isMuted ? 'Ativar Som' : 'Silenciar'}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimizar Cronômetro"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Big Countdown and Quick Adjustments */}
        <div className="flex items-center justify-between sm:justify-center w-full md:w-auto gap-2 sm:gap-3">
          {/* -15s button */}
          <button
            onClick={() => onAddSeconds(-15)}
            disabled={remainingSeconds <= 5}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all min-h-[44px]"
            title="Reduzir 15 segundos"
          >
            <Minus className="w-3.5 h-3.5 text-amber-400" />
            15s
          </button>

          {/* Pause / Play */}
          <button
            onClick={onTogglePause}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-700 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isPaused ? 'Continuar' : 'Pausar Descanso'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-5 h-5 text-amber-400 fill-amber-400" />}
          </button>

          {/* Big Time Display */}
          <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xl sm:text-2xl font-black text-white text-center min-w-[84px] sm:min-w-[90px] shadow-inner">
            {formatTime(remainingSeconds)}
          </div>

          {/* +15s button (highlighted!) */}
          <button
            onClick={() => onAddSeconds(15)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-3 sm:py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/40 shadow-lg shadow-emerald-500/10 transition-all min-h-[44px]"
            title="Adicionar 15 segundos"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            15s
          </button>

          {/* +30s button for longer rest */}
          <button
            onClick={() => onAddSeconds(30)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
            title="Adicionar 30 segundos"
          >
            +30s
          </button>
        </div>

        {/* Right: Skip / Next Set Button */}
        <div className="w-full md:w-auto flex justify-end">
          <button
            onClick={onSkip}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 transition-all min-h-[46px]"
          >
            <FastForward className="w-4 h-4 fill-slate-950" />
            Próxima Série
          </button>
        </div>

      </div>
    </div>
  );
};
