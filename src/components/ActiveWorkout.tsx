import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, CheckCircle2, Flame, Trophy, Clock, 
  Plus, Minus, Dumbbell, Repeat, Hash,
  Eye, EyeOff, Check, X, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { 
  DayRoutine, 
  ActiveExerciseProgress, 
  WorkoutSetLog, 
  CompletedWorkoutSummary, 
  PersonalRecord 
} from '../types/workout';
import { ExerciseMedia } from './ExerciseMedia';
import { RestTimer } from './RestTimer';
import { formatTime, calculate1RM } from '../utils/calc';
import { playPRFanfare, playBeep, vibrateDevice } from '../utils/sound';

interface ActiveWorkoutProps {
  routine: DayRoutine;
  onFinishWorkout: (summary: CompletedWorkoutSummary) => void;
  onCancelWorkout: () => void;
  onUpdatePR: (pr: PersonalRecord) => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  routine,
  onFinishWorkout,
  onCancelWorkout,
  onUpdatePR,
}) => {
  // Workout elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);

  // Active exercises progress state
  const [exercisesProgress, setExercisesProgress] = useState<ActiveExerciseProgress[]>(() => {
    return routine.exercises.map((ex) => {
      const sets: WorkoutSetLog[] = [];
      const numSets = Math.max(1, ex.targetSets || 3);
      for (let i = 1; i <= numSets; i++) {
        sets.push({
          id: `set-${ex.id}-${i}`,
          setNumber: i,
          targetReps: ex.targetReps || '10',
          weight: ex.lastWeight || (ex.currentPR?.weight ? ex.currentPR.weight : 20),
          reps: ex.lastReps || 10,
          completed: false,
          previousWeight: ex.lastWeight,
          previousReps: ex.lastReps,
        });
      }

      return {
        workoutExerciseId: ex.id,
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        gifUrl: ex.gifUrl,
        instructions: ex.instructions,
        notes: ex.notes,
        restSeconds: ex.restSeconds || 60,
        currentPR: ex.currentPR,
        sets,
      };
    });
  });

  // Toggle GIF visibility per exercise
  const [visibleGifs, setVisibleGifs] = useState<Record<string, boolean>>({});

  // Rest Timer State
  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [restTotal, setRestTotal] = useState<number>(60);
  const [isRestPaused, setIsRestPaused] = useState<boolean>(false);
  const [activeRestContext, setActiveRestContext] = useState<{ exerciseName: string; setNumber: number } | null>(null);

  // New PRs achieved in this active workout
  const [sessionPRs, setSessionPRs] = useState<Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    previousWeight?: number;
  }>>([]);

  // Confirm cancel dialog
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Workout timer interval
  useEffect(() => {
    if (isWorkoutPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutPaused]);

  // Rest countdown interval
  useEffect(() => {
    if (restRemaining <= 0 || isRestPaused) return;

    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restRemaining, isRestPaused]);

  // Handle adding/subtracting rest time (+15s / -15s)
  const handleAddRestSeconds = (seconds: number) => {
    setRestRemaining((prev) => {
      const next = Math.max(0, prev + seconds);
      return next;
    });
    setRestTotal((prev) => Math.max(1, prev + seconds));
  };

  // Trigger confetti when a PR is achieved
  const triggerPRConfetti = () => {
    playPRFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
    });
  };

  // Toggle set completion and PR detection
  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    setExercisesProgress((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const targetSets = [...targetEx.sets];
      const targetSet = { ...targetSets[setIndex] };

      const wasCompleted = targetSet.completed;
      const isNowCompleted = !wasCompleted;
      targetSet.completed = isNowCompleted;

      if (isNowCompleted) {
        targetSet.completedAt = new Date().toISOString();
        playBeep(880, 0.1, 'sine', 0.2);
        vibrateDevice([80]);

        // Check for Personal Record (PR)
        const curPRWeight = targetEx.currentPR?.weight || 0;
        const curPRReps = targetEx.currentPR?.reps || 0;
        const enteredWeight = Number(targetSet.weight) || 0;
        const enteredReps = Number(targetSet.reps) || 0;

        let isNewPR = false;
        if (enteredWeight > curPRWeight && enteredReps >= 1) {
          isNewPR = true;
        } else if (enteredWeight === curPRWeight && enteredReps > curPRReps && enteredWeight > 0) {
          isNewPR = true;
        }

        if (isNewPR) {
          targetSet.isPR = true;
          triggerPRConfetti();

          const newPR: PersonalRecord = {
            exerciseId: targetEx.exerciseId,
            exerciseName: targetEx.name,
            weight: enteredWeight,
            reps: enteredReps,
            date: new Date().toISOString(),
            estimated1RM: calculate1RM(enteredWeight, enteredReps),
          };

          targetEx.currentPR = newPR;
          onUpdatePR(newPR);

          setSessionPRs((prs) => {
            const filtered = prs.filter((p) => p.exerciseName !== targetEx.name);
            return [
              ...filtered,
              {
                exerciseName: targetEx.name,
                weight: enteredWeight,
                reps: enteredReps,
                previousWeight: curPRWeight,
              },
            ];
          });
        }

        // Start rest timer automatically!
        const restDuration = targetEx.restSeconds || 60;
        setRestTotal(restDuration);
        setRestRemaining(restDuration);
        setIsRestPaused(false);
        setActiveRestContext({
          exerciseName: targetEx.name,
          setNumber: targetSet.setNumber,
        });
      } else {
        targetSet.isPR = false;
      }

      targetSets[setIndex] = targetSet;
      targetEx.sets = targetSets;
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  // Quick weight step adjustment (+1kg, +2.5kg, +5kg, -1kg)
  const handleAdjustWeight = (exIndex: number, setIndex: number, delta: number) => {
    setExercisesProgress((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const targetSets = [...targetEx.sets];
      const currentW = Number(targetSets[setIndex].weight) || 0;
      targetSets[setIndex] = {
        ...targetSets[setIndex],
        weight: Math.max(0, Math.round((currentW + delta) * 10) / 10),
      };
      targetEx.sets = targetSets;
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  // Quick reps step adjustment
  const handleAdjustReps = (exIndex: number, setIndex: number, delta: number) => {
    setExercisesProgress((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const targetSets = [...targetEx.sets];
      const currentR = Number(targetSets[setIndex].reps) || 0;
      targetSets[setIndex] = {
        ...targetSets[setIndex],
        reps: Math.max(0, currentR + delta),
      };
      targetEx.sets = targetSets;
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  // Add extra set
  const handleAddSet = (exIndex: number) => {
    setExercisesProgress((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSetNumber = targetEx.sets.length + 1;

      targetEx.sets = [
        ...targetEx.sets,
        {
          id: `set-${targetEx.workoutExerciseId}-${newSetNumber}-${Date.now()}`,
          setNumber: newSetNumber,
          targetReps: lastSet ? lastSet.targetReps : '10',
          weight: lastSet ? lastSet.weight : 20,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          previousWeight: lastSet?.previousWeight,
          previousReps: lastSet?.previousReps,
        },
      ];
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  // Remove set
  const handleRemoveSet = (exIndex: number) => {
    setExercisesProgress((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIndex] };
      if (targetEx.sets.length > 1) {
        targetEx.sets = targetEx.sets.slice(0, -1);
      }
      updated[exIndex] = targetEx;
      return updated;
    });
  };

  // Stats calculation
  const totalSets = exercisesProgress.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercisesProgress.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolumeKg = exercisesProgress.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0)
    );
  }, 0);
  const totalRepsCompleted = exercisesProgress.reduce((acc, ex) => {
    return (
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((sAcc, s) => sAcc + (Number(s.reps) || 0), 0)
    );
  }, 0);

  // Finish Workout
  const handleConfirmFinish = () => {
    const summary: CompletedWorkoutSummary = {
      id: `workout-${Date.now()}`,
      dayId: routine.id,
      dayName: routine.dayName,
      muscleSplit: routine.muscleSplit,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      totalVolumeKg,
      totalSetsCompleted: completedSets,
      totalRepsCompleted,
      prsAchieved: sessionPRs,
      exercises: exercisesProgress.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
          isPR: s.isPR,
        })),
      })),
    };

    onFinishWorkout(summary);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] pb-32 text-slate-100">
      {/* Sticky Workout Top HUD */}
      <header className="sticky top-0 z-40 bg-[#0f1420]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Day & Split */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Treino em Andamento
            </span>
            <h1 className="text-base sm:text-lg font-black text-white truncate max-w-[200px] sm:max-w-xs">
              {routine.muscleSplit}
            </h1>
            <span className="text-xs text-slate-400 font-medium">{routine.dayName}</span>
          </div>

          {/* Center: Live Timer */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-inner">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-base sm:text-xl font-black text-white tracking-wider">
              {formatTime(elapsedSeconds)}
            </span>
            <button
              onClick={() => setIsWorkoutPaused(!isWorkoutPaused)}
              title={isWorkoutPaused ? 'Retomar Treino' : 'Pausar Treino'}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              {isWorkoutPaused ? (
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              ) : (
                <Pause className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cancelar treino"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" /> Finalizar
            </button>
          </div>
        </div>

        {/* Real-time metrics bar with all 4 metrics */}
        <div className="max-w-4xl mx-auto px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5" title="Séries Concluídas">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Séries: <strong className="text-white font-mono">{completedSets}/{totalSets}</strong>
            </span>
            <span className="flex items-center gap-1.5" title="Carga Total (Volume)">
              <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
              Carga Total: <strong className="text-white font-mono">{totalVolumeKg.toLocaleString()} kg</strong>
            </span>
            <span className="flex items-center gap-1.5" title="Total de Repetições">
              <Repeat className="w-3.5 h-3.5 text-pink-400" />
              Reps: <strong className="text-white font-mono">{totalRepsCompleted}</strong>
            </span>
          </div>

          {sessionPRs.length > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <Trophy className="w-3.5 h-3.5" />
              <span>{sessionPRs.length} Novo(s) PR!</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workout Exercises List */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {exercisesProgress.map((ex, exIndex) => {
          const isGifOpen = !!visibleGifs[ex.workoutExerciseId];

          return (
            <div
              key={ex.workoutExerciseId}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              {/* Exercise Card Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-850/60">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                      {ex.muscleGroup.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Descanso alvo: <strong className="text-slate-200">{ex.restSeconds}s</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{ex.name}</h3>

                  {/* PR indicator */}
                  {ex.currentPR && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                      <Trophy className="w-3.5 h-3.5 fill-amber-400" />
                      <span>PR Atual: {ex.currentPR.weight} kg × {ex.currentPR.reps} reps</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        (1RM est. ~{ex.currentPR.estimated1RM} kg)
                      </span>
                    </div>
                  )}
                </div>

                {/* Right controls: GIF toggle & Manual rest button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRestTotal(ex.restSeconds || 60);
                      setRestRemaining(ex.restSeconds || 60);
                      setIsRestPaused(false);
                      setActiveRestContext({ exerciseName: ex.name, setNumber: 0 });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Descansar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setVisibleGifs((prev) => ({
                        ...prev,
                        [ex.workoutExerciseId]: !prev[ex.workoutExerciseId],
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isGifOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isGifOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isGifOpen ? 'Ocultar GIF' : 'Ver Execução (GIF)'}</span>
                  </button>
                </div>
              </div>

              {/* Collapsible GIF Execution Media */}
              {isGifOpen && (
                <div className="p-4 bg-slate-950 border-b border-slate-800 animate-fadeIn">
                  <div className="max-w-md mx-auto">
                    <ExerciseMedia
                      gifUrl={ex.gifUrl}
                      name={ex.name}
                      muscleGroup={ex.muscleGroup}
                      instructions={ex.instructions}
                      className="h-64 sm:h-72 w-full"
                    />
                  </div>
                  {ex.instructions && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-emerald-400 uppercase tracking-wider block mb-1">
                        Dica de Execução:
                      </strong>
                      {ex.instructions}
                    </div>
                  )}
                </div>
              )}

              {/* Set-by-Set Logging Table */}
              <div className="p-4 sm:p-5">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 text-center">
                  <div className="col-span-2 text-left">Série</div>
                  <div className="col-span-2 hidden sm:block">Anterior</div>
                  <div className="col-span-4 sm:col-span-3">Carga (kg)</div>
                  <div className="col-span-4 sm:col-span-3">Reps</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>

                {/* Set Rows */}
                <div className="divide-y divide-slate-800/50">
                  {ex.sets.map((set, setIndex) => {
                    const isNewPR = !!set.isPR;

                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-2 py-3 items-center text-center transition-colors rounded-xl px-1 ${
                          set.completed ? 'bg-emerald-500/5' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Set Number */}
                        <div className="col-span-2 text-left flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                              set.completed
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {set.setNumber}
                          </span>
                          {isNewPR && (
                            <span className="hidden md:inline-flex text-[10px] font-black text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                              PR! 🔥
                            </span>
                          )}
                        </div>

                        {/* Previous Load */}
                        <div className="col-span-2 hidden sm:block text-xs text-slate-500 font-mono">
                          {set.previousWeight !== undefined ? `${set.previousWeight}kg × ${set.previousReps || '-'}` : '-'}
                        </div>

                        {/* Weight (Carga) Input with quick steppers */}
                        <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(exIndex, setIndex, -1)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs hidden sm:block"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setExercisesProgress((prev) => {
                                const up = [...prev];
                                const tEx = { ...up[exIndex] };
                                const tSets = [...tEx.sets];
                                tSets[setIndex] = { ...tSets[setIndex], weight: val };
                                tEx.sets = tSets;
                                up[exIndex] = tEx;
                                return up;
                              });
                            }}
                            className={`w-16 sm:w-20 text-center font-mono font-black text-sm sm:text-base py-1.5 rounded-xl border transition-all ${
                              set.completed
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(exIndex, setIndex, +2.5)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold hidden sm:block"
                            title="+2.5 kg"
                          >
                            +2.5
                          </button>
                        </div>

                        {/* Repetitions (Contagem de Repetição) with +/- buttons */}
                        <div className="col-span-4 sm:col-span-3 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustReps(exIndex, setIndex, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setExercisesProgress((prev) => {
                                const up = [...prev];
                                const tEx = { ...up[exIndex] };
                                const tSets = [...tEx.sets];
                                tSets[setIndex] = { ...tSets[setIndex], reps: val };
                                tEx.sets = tSets;
                                up[exIndex] = tEx;
                                return up;
                              });
                            }}
                            className={`w-12 sm:w-16 text-center font-mono font-black text-sm sm:text-base py-1.5 rounded-xl border transition-all ${
                              set.completed
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAdjustReps(exIndex, setIndex, +1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Complete Checkbox Button */}
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                            className={`p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                              set.completed
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                            title={set.completed ? 'Desmarcar série' : 'Concluir série e iniciar descanso'}
                          >
                            <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3]' : 'text-slate-400'}`} />
                            <span className="hidden sm:inline">
                              {set.completed ? 'Pronto' : 'Concluir'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add/Remove set buttons */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIndex)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Adicionar Série
                    </button>
                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIndex)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Alvo: {ex.sets.length} séries × {ex.sets[0]?.targetReps || '10'} reps
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating / Docked Rest Timer */}
      {restRemaining > 0 && (
        <RestTimer
          remainingSeconds={restRemaining}
          totalSeconds={restTotal}
          isPaused={isRestPaused}
          exerciseName={activeRestContext?.exerciseName}
          setNumber={activeRestContext?.setNumber}
          onAddSeconds={handleAddRestSeconds}
          onTogglePause={() => setIsRestPaused(!isRestPaused)}
          onSkip={() => {
            setRestRemaining(0);
            setActiveRestContext(null);
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white text-center mb-1">
              Desistir deste Treino?
            </h4>
            <p className="text-xs text-slate-400 text-center mb-5">
              Seu progresso atual não será registrado no histórico de treinos.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Continuar Treinando
              </button>
              <button
                type="button"
                onClick={onCancelWorkout}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-xs font-bold text-white shadow-lg shadow-red-500/20"
              >
                Sair do Treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish & Summary Modal showcasing the 4 requested metrics */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-scaleUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Treino Concluído!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Excelente sessão de <strong>{routine.muscleSplit}</strong>. Parabéns pela disciplina!
              </p>
            </div>

            {/* Performance Stats Grid: 4 required stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {/* 1. Tempo Decorrido */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Tempo
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* 2. Carga Total */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <Dumbbell className="w-3 h-3 text-sky-400" /> Carga Total
                </span>
                <span className="text-base sm:text-lg font-black text-sky-400 font-mono">
                  {totalVolumeKg.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">kg</span>
                </span>
              </div>

              {/* 3. Total de Séries */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <Hash className="w-3 h-3 text-amber-400" /> Séries
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {completedSets}
                </span>
              </div>

              {/* 4. Total de Repetições */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <Repeat className="w-3 h-3 text-pink-400" /> Repetições
                </span>
                <span className="text-base sm:text-lg font-black text-pink-400 font-mono">
                  {totalRepsCompleted}
                </span>
              </div>
            </div>

            {/* Session PRs list */}
            {sessionPRs.length > 0 ? (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  Novos Recordes Pessoais Superados Hoje:
                </h4>
                <div className="space-y-1.5">
                  {sessionPRs.map((pr, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-200">
                      <span className="font-semibold">{pr.exerciseName}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {pr.weight} kg × {pr.reps} reps
                        {pr.previousWeight ? ` (antes: ${pr.previousWeight}kg)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                Continue mantendo a consistência para quebrar seus PRs nos próximos treinos!
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                Voltar e Ajustar
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all"
              >
                Salvar no Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
