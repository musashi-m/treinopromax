import React, { useState } from 'react';
import { Search, Plus, Sparkles, PlusCircle, Edit3, RotateCcw } from 'lucide-react';
import type { BaseExercise, MuscleGroup, DayRoutine, WorkoutExercise } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary';
import { ExerciseMedia } from './ExerciseMedia';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { EditCatalogExerciseModal } from './EditCatalogExerciseModal';

interface ExerciseCatalogViewProps {
  catalog: BaseExercise[];
  routines: DayRoutine[];
  onAddExerciseToDay: (dayId: string, exercise: WorkoutExercise) => void;
  onUpdateCatalogExercise: (updated: BaseExercise) => void;
  onResetCatalog?: () => void;
}

export const ExerciseCatalogView: React.FC<ExerciseCatalogViewProps> = ({
  catalog,
  routines,
  onAddExerciseToDay,
  onUpdateCatalogExercise,
  onResetCatalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'todos'>('todos');
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<string>(routines[0]?.id || 'seg');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<BaseExercise | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = catalog.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.instructions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'todos' || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleAdd = (base: BaseExercise) => {
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
      notes: base.equipment,
      lastWeight: undefined,
      lastReps: undefined,
    };

    onAddExerciseToDay(selectedDayToAdd, workoutEx);

    const targetDay = routines.find((r) => r.id === selectedDayToAdd);
    setToastMessage(`Adicionado a ${targetDay?.dayName || 'sua rotina'}!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveCatalogEdit = (updated: BaseExercise) => {
    onUpdateCatalogExercise(updated);
    setToastMessage(`Exercício "${updated.name}" atualizado com sucesso!`);
    setTimeout(() => setToastMessage(null), 2500);
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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-500/20 via-slate-900 to-slate-900 border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Catálogo Geral com GIFs & Fotos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Biblioteca de Exercícios & Execuções
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Veja a execução, personalize o nome, descrição, foto/GIF, séries e repetições de qualquer exercício.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onResetCatalog && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar os exercícios do catálogo para os valores originais?')) {
                  onResetCatalog();
                  setToastMessage('Catálogo restaurado aos padrões originais!');
                  setTimeout(() => setToastMessage(null), 2500);
                }
              }}
              className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Restaurar exercícios padrão"
            >
              <RotateCcw className="w-4 h-4" /> Restaurar Padrões
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo
          </button>
        </div>
      </div>

      {/* Target Day selector & Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, equipamento ou músculo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
            Adicionar no dia:
          </span>
          <select
            value={selectedDayToAdd}
            onChange={(e) => setSelectedDayToAdd(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-sky-500"
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.dayName} ({r.muscleSplit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Muscle Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {muscleList.map((m) => {
          const isSelected = selectedMuscle === m;
          const label = m === 'todos' ? 'Todos os Músculos' : MUSCLE_GROUP_LABELS[m]?.label || m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of Exercises with EDIT Button */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((base) => {
          const muscleMeta = MUSCLE_GROUP_LABELS[base.muscleGroup] || MUSCLE_GROUP_LABELS.geral;

          return (
            <div
              key={base.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              <div>
                {/* Media Image / GIF with Lightbox */}
                <div className="h-52 w-full relative bg-slate-950 overflow-hidden">
                  <ExerciseMedia
                    gifUrl={base.gifUrl}
                    name={base.name}
                    muscleGroup={base.muscleGroup}
                    instructions={base.instructions}
                    className="w-full h-full"
                    showExpandButton={true}
                    onUpdateGifUrl={(newUrl) => {
                      onUpdateCatalogExercise({ ...base, gifUrl: newUrl });
                    }}
                  />
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${muscleMeta.badgeBg}`}>
                        {muscleMeta.label}
                      </span>
                      <span className="text-[11px] text-slate-500">{base.equipment}</span>
                    </div>

                    {/* EDIT BUTTON DIRECTLY ON CARD */}
                    <button
                      type="button"
                      onClick={() => setEditingExercise(base)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 transition-colors flex items-center gap-1 text-[11px] font-bold"
                      title="Editar nome, descrição, GIF, séries e reps deste exercício"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                    {base.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {base.instructions}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono font-semibold">
                  {base.defaultSets} séries × {base.defaultReps} • {base.defaultRestSeconds}s
                </span>

                <button
                  type="button"
                  onClick={() => handleAdd(base)}
                  className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500 active:scale-95 text-sky-400 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 border border-sky-500/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Adicionar à Rotina
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/40 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Edit Catalog Exercise Modal */}
      <EditCatalogExerciseModal
        exercise={editingExercise}
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={handleSaveCatalogEdit}
      />

      {/* Custom Exercise Creator Modal */}
      <ExerciseLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectExercise={(ex) => {
          onAddExerciseToDay(selectedDayToAdd, ex);
          setToastMessage(`Exercício personalizado adicionado à rotina!`);
          setTimeout(() => setToastMessage(null), 2500);
        }}
      />
    </div>
  );
};
