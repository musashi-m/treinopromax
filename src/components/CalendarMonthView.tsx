import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, 
  Dumbbell, Hash, Repeat, Plus, Trash2, Flame 
} from 'lucide-react';
import type { CompletedWorkoutSummary } from '../types/workout';
import { formatTime } from '../utils/calc';
import { ManualWorkoutModal } from './ManualWorkoutModal';

interface CalendarMonthViewProps {
  history: CompletedWorkoutSummary[];
  onAddWorkout: (workout: CompletedWorkoutSummary) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  history,
  onAddWorkout,
  onDeleteWorkout,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed (0 = Jan, 10 = Nov)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Helper to change month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Month metadata
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNames[currentMonth];

  // Days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week for 1st of month: 0=Sun, 1=Mon, ..., 6=Sat
  // Brazilian week starts on Segunda (Monday) = 0, Domingo (Sunday) = 6
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6; // Sunday moved to end

  // Map workouts by date string: 'YYYY-MM-DD' -> CompletedWorkoutSummary[]
  const workoutsByDate: Record<string, CompletedWorkoutSummary[]> = {};
  history.forEach((session) => {
    const rawDate = session.finishedAt || session.startedAt;
    if (rawDate) {
      const dateKey = rawDate.split('T')[0];
      if (!workoutsByDate[dateKey]) {
        workoutsByDate[dateKey] = [];
      }
      workoutsByDate[dateKey].push(session);
    }
  });

  // Monthly stats calculations for the selected month
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const workoutsThisMonth = history.filter((h) => {
    const rawDate = h.finishedAt || h.startedAt;
    return rawDate && rawDate.startsWith(monthPrefix);
  });

  // Unique days trained this month
  const uniqueDaysTrained = new Set(
    workoutsThisMonth.map((h) => (h.finishedAt || h.startedAt).split('T')[0])
  ).size;

  const totalVolumeThisMonth = workoutsThisMonth.reduce(
    (acc, h) => acc + (h.totalVolumeKg || 0),
    0
  );
  const totalSecondsThisMonth = workoutsThisMonth.reduce(
    (acc, h) => acc + (h.durationSeconds || 0),
    0
  );
  const totalSetsThisMonth = workoutsThisMonth.reduce(
    (acc, h) => acc + (h.totalSetsCompleted || 0),
    0
  );
  const totalRepsThisMonth = workoutsThisMonth.reduce(
    (acc, h) => acc + (h.totalRepsCompleted || 0),
    0
  );

  const hoursThisMonth = Math.floor(totalSecondsThisMonth / 3600);
  const minutesThisMonth = Math.floor((totalSecondsThisMonth % 3600) / 60);

  // Selected date workouts
  const selectedDateWorkouts = workoutsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Month Navigation & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
              {monthName} de {currentYear}
            </h2>
            <span className="text-xs text-slate-400">
              {uniqueDaysTrained} dia(s) com treino registrado neste mês
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGoToCurrentMonth}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
          >
            Mês Atual
          </button>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Treino
          </button>
        </div>
      </div>

      {/* Monthly Accumulator Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Dias Treinados */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Dias Treinados
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {uniqueDaysTrained} <span className="text-xs font-normal text-slate-400">dias</span>
          </span>
        </div>

        {/* Tempo Decorrido no Mês */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Tempo Decorrido
          </span>
          <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
            {hoursThisMonth}h {minutesThisMonth}m
          </span>
        </div>

        {/* Carga Total Acumulada */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Carga Total
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {(totalVolumeThisMonth / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
          </span>
        </div>

        {/* Total de Séries */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Total de Séries
          </span>
          <span className="text-xl sm:text-2xl font-black text-violet-400 font-mono">
            {totalSetsThisMonth}
          </span>
        </div>

        {/* Total de Repetições */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Total Repetições
          </span>
          <span className="text-xl sm:text-2xl font-black text-pink-400 font-mono">
            {totalRepsThisMonth.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Monthly Interactive Calendar Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div className="text-slate-500">Sáb</div>
          <div className="text-slate-500">Dom</div>
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
          {/* Empty padding slots before 1st of month */}
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-2xl bg-slate-950/20 opacity-30" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === today.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDateStr;
            const dayWorkouts = workoutsByDate[dateStr] || [];
            const hasWorkout = dayWorkouts.length > 0;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-16 sm:h-24 p-1 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative group ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-500/30 bg-slate-850 shadow-lg'
                    : hasWorkout
                    ? 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/15'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850/50'
                }`}
              >
                {/* Day Number and Today Marker */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : hasWorkout
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasWorkout && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:block" />
                  )}
                </div>

                {/* Workout tags / indicator */}
                {hasWorkout ? (
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] sm:text-[11px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/30 truncate block text-left">
                      {dayWorkouts[0].muscleSplit}
                    </span>
                    {dayWorkouts.length > 1 && (
                      <span className="text-[9px] text-emerald-400 font-extrabold block text-left pl-1">
                        +{dayWorkouts.length - 1} treino(s)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-600 hidden sm:block text-right pr-1 group-hover:text-slate-400">
                    +
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Workouts Breakdown */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> Detalhes do Dia Selecionado
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Registrar Treino Neste Dia
          </button>
        </div>

        {/* Selected Day Workouts Cards */}
        {selectedDateWorkouts.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm text-slate-400">
              Nenhum treino registrado para este dia.
            </p>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
            >
              Clique aqui para registrar o treino realizado nesta data
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateWorkouts.map((session) => (
              <div
                key={session.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                {/* Header with Title and Delete */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      {session.dayName}
                    </span>
                    <h4 className="text-lg font-black text-white">{session.muscleSplit}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Deseja excluir este treino do histórico?')) {
                        onDeleteWorkout(session.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Excluir treino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* THE 4 REQUIRED DETAILED STATS IN HIGH CONTRAST */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 1. Tempo Decorrido */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Tempo Decorrido
                    </span>
                    <span className="text-lg sm:text-xl font-black text-white font-mono">
                      {formatTime(session.durationSeconds)}
                    </span>
                  </div>

                  {/* 2. Carga Total */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1 mb-1">
                      <Dumbbell className="w-3.5 h-3.5 text-sky-400" /> Carga Total
                    </span>
                    <span className="text-lg sm:text-xl font-black text-sky-400 font-mono">
                      {session.totalVolumeKg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
                    </span>
                  </div>

                  {/* 3. Total de Séries */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1 mb-1">
                      <Hash className="w-3.5 h-3.5 text-amber-400" /> Total de Séries
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                      {session.totalSetsCompleted} <span className="text-xs font-normal text-slate-400">séries</span>
                    </span>
                  </div>

                  {/* 4. Total de Repetições */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1 mb-1">
                      <Repeat className="w-3.5 h-3.5 text-pink-400" /> Total de Repetições
                    </span>
                    <span className="text-lg sm:text-xl font-black text-pink-400 font-mono">
                      {session.totalRepsCompleted ? session.totalRepsCompleted.toLocaleString() : (session.totalSetsCompleted * 10)} <span className="text-xs font-normal text-slate-400">reps</span>
                    </span>
                  </div>
                </div>

                {/* Notes if available */}
                {session.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-400 uppercase tracking-wider block mb-0.5">Observações:</strong>
                    {session.notes}
                  </div>
                )}

                {/* PRs achieved */}
                {session.prsAchieved && session.prsAchieved.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4 fill-amber-400" /> Recordes (PR) Batidos nesta sessão:
                    </span>
                    <div className="space-y-1">
                      {session.prsAchieved.map((pr, pIdx) => (
                        <div key={pIdx} className="flex justify-between text-slate-200">
                          <span>{pr.exerciseName}</span>
                          <strong className="font-mono text-amber-300">
                            {pr.weight} kg × {pr.reps} reps
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises list breakdown */}
                {session.exercises && session.exercises.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Exercícios e Séries:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {session.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
                          <span className="font-bold text-white block mb-1">{ex.name}</span>
                          <div className="flex flex-wrap gap-1">
                            {ex.sets.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300"
                              >
                                {s.weight}kg × {s.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Workout Registration Modal */}
      <ManualWorkoutModal
        isOpen={isManualModalOpen}
        initialDate={selectedDateStr}
        onClose={() => setIsManualModalOpen(false)}
        onSaveWorkout={onAddWorkout}
      />
    </div>
  );
};
