import React, { useState } from 'react';
import { Trophy, Search, Calculator, Plus, X } from 'lucide-react';
import type { PersonalRecord, MuscleGroup } from '../types/workout';
import { MUSCLE_GROUP_LABELS, EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { calculate1RM, formatDateBR } from '../utils/calc';

interface PRTrackerViewProps {
  prs: PersonalRecord[];
  onAddOrUpdatePR: (pr: PersonalRecord) => void;
}

export const PRTrackerView: React.FC<PRTrackerViewProps> = ({
  prs,
  onAddOrUpdatePR,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'todos'>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1RM interactive calculator state
  const [calcWeight, setCalcWeight] = useState(0);
  const [calcReps, setCalcReps] = useState(0);
  const calculated1RM = calculate1RM(calcWeight, calcReps);

  // Manual PR form state
  const [formExerciseName, setFormExerciseName] = useState('');
  const [formWeight, setFormWeight] = useState(0);
  const [formReps, setFormReps] = useState(0);

  // Enrich PRs with muscle group from library if possible
  const enrichedPRs = prs.map((pr) => {
    const base = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === pr.exerciseName.toLowerCase() || e.id === pr.exerciseId);
    return {
      ...pr,
      muscleGroup: base?.muscleGroup || ('geral' as MuscleGroup),
    };
  });

  const filteredPRs = enrichedPRs.filter((pr) => {
    const matchesSearch = pr.exerciseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'todos' || pr.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExerciseName.trim()) return;

    const base = EXERCISE_LIBRARY.find(
      (ex) => ex.name.toLowerCase() === formExerciseName.trim().toLowerCase()
    );

    const newPR: PersonalRecord = {
      exerciseId: base ? base.id : `custom-${Date.now()}`,
      exerciseName: formExerciseName.trim(),
      weight: Number(formWeight) || 0,
      reps: Number(formReps) || 0,
      date: new Date().toISOString(),
      estimated1RM: calculate1RM(Number(formWeight) || 0, Number(formReps) || 0),
    };

    onAddOrUpdatePR(newPR);
    setIsAddModalOpen(false);
    setFormExerciseName('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* PR Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 fill-amber-400" /> Central de Recordes Pessoais (PR)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Cargas Máximas & 1RM
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Acompanhe sua evolução de força em cada exercício e compare seu histórico.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Registrar Novo PR
          </button>
        </div>
      </div>

      {/* 1RM Interactive Calculator Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-emerald-400" />
          Calculadora de 1RM Estimado (Fórmula de Epley)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Carga Levantada (kg)</label>
            <input
              type="number"
              step="0.5"
              value={calcWeight}
              onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Repetições Executadas</label>
            <input
              type="number"
              min="1"
              max="30"
              value={calcReps}
              onChange={(e) => setCalcReps(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:border-emerald-500"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              1 Repetição Máxima (1RM):
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {calculated1RM} <span className="text-sm font-normal text-slate-400">kg</span>
            </span>
            <div className="flex justify-center gap-2 text-[10px] text-slate-400 mt-1">
              <span>85% (Força): <strong>{Math.round(calculated1RM * 0.85)}kg</strong></span>
              <span>•</span>
              <span>75% (Hipertrofia): <strong>{Math.round(calculated1RM * 0.75)}kg</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por exercício..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Muscle group selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['todos', 'peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMuscle === m
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m === 'todos' ? 'Todos' : MUSCLE_GROUP_LABELS[m]?.label || m}
            </button>
          ))}
        </div>
      </div>

      {/* PR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPRs.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Nenhum PR encontrado</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ao concluir séries no Modo Treino com cargas superiores, seus PRs serão atualizados aqui automaticamente!
            </p>
          </div>
        ) : (
          filteredPRs.map((pr) => {
            const muscleMeta = MUSCLE_GROUP_LABELS[pr.muscleGroup] || MUSCLE_GROUP_LABELS.geral;

            return (
              <div
                key={`${pr.exerciseId}-${pr.date}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${muscleMeta.badgeBg}`}>
                      {muscleMeta.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatDateBR(pr.date)}</span>
                  </div>

                  <h4 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    {pr.exerciseName}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Recorde Atual
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-400 font-mono">{pr.weight}</span>
                      <span className="text-xs font-bold text-slate-300">kg × {pr.reps} reps</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      1RM Estimado
                    </span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ~{pr.estimated1RM} kg
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual PR Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Registrar Recorde Pessoal (PR)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePR} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Exercício
                </label>
                <input
                  type="text"
                  required
                  list="exercise-suggestions"
                  value={formExerciseName}
                  onChange={(e) => setFormExerciseName(e.target.value)}
                  placeholder="Ex: Supino Reto com Barra"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <datalist id="exercise-suggestions">
                  {EXERCISE_LIBRARY.map((ex) => (
                    <option key={ex.id} value={ex.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Carga (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Repetições
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formReps}
                    onChange={(e) => setFormReps(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20"
                >
                  Salvar PR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
