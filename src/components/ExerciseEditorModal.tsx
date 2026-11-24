import React, { useState } from 'react';
import { X, Check, Dumbbell, Flame, Image as ImageIcon } from 'lucide-react';
import type { WorkoutExercise } from '../types/workout';
import { calculate1RM } from '../utils/calc';

interface ExerciseEditorModalProps {
  exercise: WorkoutExercise | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: WorkoutExercise) => void;
}

export const ExerciseEditorModal: React.FC<ExerciseEditorModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !exercise) return null;

  const [name, setName] = useState(exercise.name);
  const [targetSets, setTargetSets] = useState(exercise.targetSets);
  const [targetReps, setTargetReps] = useState(exercise.targetReps);
  const [restSeconds, setRestSeconds] = useState(exercise.restSeconds);
  const [gifUrl, setGifUrl] = useState(exercise.gifUrl || '');
  const [instructions, setInstructions] = useState(exercise.instructions || '');

  // PR settings
  const [prWeight, setPrWeight] = useState(exercise.currentPR?.weight || exercise.lastWeight || 0);
  const [prReps, setPrReps] = useState(exercise.currentPR?.reps || exercise.lastReps || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: WorkoutExercise = {
      ...exercise,
      name: name.trim(),
      targetSets: Number(targetSets) || 3,
      targetReps: targetReps.trim() || '10',
      restSeconds: Number(restSeconds) || 60,
      gifUrl: gifUrl.trim(),
      instructions: instructions.trim(),
      lastWeight: Number(prWeight) || exercise.lastWeight,
      lastReps: Number(prReps) || exercise.lastReps,
      currentPR: {
        exerciseId: exercise.exerciseId,
        exerciseName: name.trim(),
        weight: Number(prWeight) || 0,
        reps: Number(prReps) || 0,
        date: exercise.currentPR?.date || new Date().toISOString(),
        estimated1RM: calculate1RM(Number(prWeight) || 0, Number(prReps) || 0),
      },
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Editar Exercício</h3>
              <p className="text-xs text-slate-400">{exercise.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nome do Exercício
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Sets, Reps, Rest */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Séries
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value, 10) || 3)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Reps
              </label>
              <input
                type="text"
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                placeholder="8-12"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Descanso (s)
              </label>
              <input
                type="number"
                step="5"
                min="15"
                max="300"
                value={restSeconds}
                onChange={(e) => setRestSeconds(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
              />
            </div>
          </div>

          {/* Quick rest preset buttons */}
          <div className="flex gap-2">
            {[45, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setRestSeconds(sec)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  restSeconds === sec
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* PR / Recorde Atual */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4 fill-amber-400" /> Recorde Pessoal (PR) Atual
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Carga Máxima (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={prWeight}
                  onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-amber-300 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Repetições no PR</label>
                <input
                  type="number"
                  min="1"
                  value={prReps}
                  onChange={(e) => setPrReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-amber-300 font-bold"
                />
              </div>
            </div>
          </div>

          {/* GIF URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" /> URL do GIF de Execução
            </label>
            <input
              type="url"
              value={gifUrl}
              onChange={(e) => setGifUrl(e.target.value)}
              placeholder="https://.../execucao.gif"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Dicas de Postura e Execução
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

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
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
