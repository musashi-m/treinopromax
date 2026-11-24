import React, { useState } from 'react';
import { X, Check, Calendar, Clock, Dumbbell, Hash, Repeat } from 'lucide-react';
import type { CompletedWorkoutSummary } from '../types/workout';

interface ManualWorkoutModalProps {
  isOpen: boolean;
  initialDate?: string; // YYYY-MM-DD
  onClose: () => void;
  onSaveWorkout: (workout: CompletedWorkoutSummary) => void;
}

export const ManualWorkoutModal: React.FC<ManualWorkoutModalProps> = ({
  isOpen,
  initialDate,
  onClose,
  onSaveWorkout,
}) => {
  if (!isOpen) return null;

  const todayStr = initialDate || new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [muscleSplit, setMuscleSplit] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [totalVolumeKg, setTotalVolumeKg] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [notes, setNotes] = useState('');

  const quickSplits = [
    'Peito & Tríceps',
    'Costas & Bíceps',
    'Pernas & Quadríceps',
    'Ombros & Trapézio',
    'Posterior & Glúteos',
    'Braços Completo',
    'Push (Empurrar)',
    'Pull (Puxar)',
    'Legs (Pernas)',
    'Cardio & Abdômen',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muscleSplit.trim()) return;

    const [year, month, day] = date.split('-').map(Number);
    const workoutDate = new Date(year, month - 1, day, 12, 0, 0);

    const weekdays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const dayName = weekdays[workoutDate.getDay()] || 'Treino';

    const durationSeconds = (Number(durationMinutes) || 0) * 60;

    const newWorkout: CompletedWorkoutSummary = {
      id: `manual-workout-${Date.now()}`,
      dayName,
      muscleSplit: muscleSplit.trim(),
      startedAt: new Date(workoutDate.getTime() - durationSeconds * 1000).toISOString(),
      finishedAt: workoutDate.toISOString(),
      durationSeconds,
      totalVolumeKg: Number(totalVolumeKg) || 0,
      totalSetsCompleted: Number(totalSets) || 0,
      totalRepsCompleted: Number(totalReps) || 0,
      notes: notes.trim(),
      prsAchieved: [],
      exercises: [
        {
          name: muscleSplit.trim(),
          muscleGroup: 'geral',
          sets: Array.from({ length: Math.min(totalSets, 10) }, () => ({
            weight: Math.round((Number(totalVolumeKg) || 0) / Math.max(1, totalReps)),
            reps: Math.round((Number(totalReps) || 0) / Math.max(1, Math.min(totalSets, 10))),
            completed: true,
          })),
        },
      ],
    };

    onSaveWorkout(newWorkout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Registrar Treino Realizado</h3>
              <p className="text-xs text-slate-400">Insira as informações do treino para o calendário mensal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Data do Treino */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Data do Treino (Dia do Mês) *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Divisão Muscular / Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-400" /> Divisão Muscular / Nome do Treino *
            </label>
            <input
              type="text"
              required
              value={muscleSplit}
              onChange={(e) => setMuscleSplit(e.target.value)}
              placeholder="Ex: Peito e Tríceps"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />

            {/* Quick Pills */}
            <div className="flex gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
              {quickSplits.map((qs) => (
                <button
                  key={qs}
                  type="button"
                  onClick={() => setMuscleSplit(qs)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-colors ${
                    muscleSplit === qs
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {qs}
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes do Treino (Grid 2x2 com os 4 campos solicitados) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* 1. Tempo Decorrido */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Tempo Decorrido (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="360"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1 font-mono">
                {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
              </span>
            </div>

            {/* 2. Carga Total */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-sky-400" /> Carga Total (kg)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={totalVolumeKg}
                onChange={(e) => setTotalVolumeKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1 font-mono">
                {totalVolumeKg.toLocaleString()} kg levantados
              </span>
            </div>

            {/* 3. Total de Séries */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" /> Total de Séries
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={totalSets}
                onChange={(e) => setTotalSets(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1 font-mono">
                {totalSets} séries realizadas
              </span>
            </div>

            {/* 4. Total de Repetições */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-pink-400" /> Total de Repetições
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                required
                value={totalReps}
                onChange={(e) => setTotalReps(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white text-center"
              />
              <span className="text-[10px] text-slate-500 block text-center mt-1 font-mono">
                {totalReps} repetições feitas
              </span>
            </div>
          </div>

          {/* Observações / Anotações */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Observações / Sensações do Treino (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino muito intenso, foco na cadência e amplitude..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" /> Registrar no Calendário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
