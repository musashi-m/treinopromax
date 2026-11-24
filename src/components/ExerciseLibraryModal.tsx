import React, { useState } from 'react';
import { Search, Plus, X, Dumbbell, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { BaseExercise, MuscleGroup, WorkoutExercise } from '../types/workout';
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: WorkoutExercise) => void;
  catalog?: BaseExercise[];
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  catalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'todos'>('todos');
  const [activeTab, setActiveTab] = useState<'biblioteca' | 'criar'>('biblioteca');

  // Custom exercise form state
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('peito');
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customSets, setCustomSets] = useState(4);
  const [customReps, setCustomReps] = useState('10-12');
  const [customRest, setCustomRest] = useState(60);

  if (!isOpen) return null;

  const sourceCatalog = catalog && catalog.length > 0 ? catalog : EXERCISE_LIBRARY;

  const filteredExercises = sourceCatalog.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'todos' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleAddFromLibrary = (base: BaseExercise) => {
    const workoutEx: WorkoutExercise = {
      id: `we-${base.id}-${Date.now()}`,
      exerciseId: base.id,
      name: base.name,
      muscleGroup: base.muscleGroup,
      gifUrl: base.gifUrl,
      instructions: base.instructions,
      targetSets: base.defaultSets,
      targetReps: base.defaultReps,
      restSeconds: base.defaultRestSeconds,
      notes: base.tips.length > 0 ? base.tips[0] : '',
      lastWeight: undefined,
      lastReps: undefined,
    };
    onSelectExercise(workoutEx);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customId = `custom-${Date.now()}`;
    const workoutEx: WorkoutExercise = {
      id: `we-${customId}`,
      exerciseId: customId,
      name: customName.trim(),
      muscleGroup: customMuscle,
      gifUrl: customGifUrl.trim() || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
      instructions: customInstructions.trim(),
      targetSets: customSets,
      targetReps: customReps,
      restSeconds: customRest,
      notes: undefined,
      lastWeight: undefined,
      lastReps: undefined,
    };

    onSelectExercise(workoutEx);
    onClose();
  };

  const muscleList: Array<MuscleGroup | 'todos'> = [
    'todos',
    'peito',
    'costas',
    'pernas',
    'posterior',
    'gluteos',
    'ombros',
    'biceps',
    'triceps',
    'abdomen',
    'panturrilha',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Adicionar Exercício</h3>
              <p className="text-xs text-slate-400">
                Selecione do catálogo com GIFs de execução ou cadastre um customizado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('biblioteca')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'biblioteca'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Catálogo com GIFs ({EXERCISE_LIBRARY.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('criar')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'criar'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" /> Criar Exercício Personalizado
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'biblioteca' ? (
          <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, equipamento..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Muscle Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none">
              {muscleList.map((m) => {
                const label = m === 'todos' ? 'Todos' : MUSCLE_GROUP_LABELS[m]?.label || m;
                const isSelected = selectedMuscle === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscle(m)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Exercises Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhum exercício encontrado para esse filtro.
                </div>
              ) : (
                filteredExercises.map((base) => {
                  const muscleMeta = MUSCLE_GROUP_LABELS[base.muscleGroup] || MUSCLE_GROUP_LABELS.geral;

                  return (
                    <div
                      key={base.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 gap-3 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                          <img
                            src={base.gifUrl}
                            alt={base.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${muscleMeta.badgeBg}`}>
                              {muscleMeta.label}
                            </span>
                            <span className="text-[11px] text-slate-500">{base.equipment}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {base.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            Padrão: {base.defaultSets} séries × {base.defaultReps} • Descanso: {base.defaultRestSeconds}s
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddFromLibrary(base)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 active:scale-95 text-emerald-400 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-all self-end sm:self-center"
                      >
                        <Plus className="w-4 h-4" /> Adicionar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Custom Exercise Form */
          <form onSubmit={handleCreateCustom} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Supino Inclinado com Halteres"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Grupo Muscular *
                </label>
                <select
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.entries(MUSCLE_GROUP_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                URL do GIF de Execução (opcional)
              </label>
              <input
                type="url"
                value={customGifUrl}
                onChange={(e) => setCustomGifUrl(e.target.value)}
                placeholder="https://.../execucao.gif"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Cole o link de um GIF da internet. Se deixar em branco, usaremos uma ilustração padrão.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Séries Alvo
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={customSets}
                  onChange={(e) => setCustomSets(parseInt(e.target.value, 10) || 3)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Reps Alvo
                </label>
                <input
                  type="text"
                  value={customReps}
                  onChange={(e) => setCustomReps(e.target.value)}
                  placeholder="8-12"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descanso (seg)
                </label>
                <input
                  type="number"
                  step="5"
                  min="15"
                  max="300"
                  value={customRest}
                  onChange={(e) => setCustomRest(parseInt(e.target.value, 10) || 60)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Dicas de Execução & Postura (opcional)
              </label>
              <textarea
                rows={3}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ex: Escápulas travadas no banco, cotovelos a 45 graus, amplitude completa..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20"
              >
                Salvar e Adicionar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
