import React, { useState } from 'react';
import { 
  Play, Plus, Dumbbell, ChevronUp, ChevronDown, Trash2, 
  Edit3, Coffee, Calendar, Trophy, Clock, LayoutTemplate
} from 'lucide-react';
import type { BaseExercise, DayRoutine, WorkoutExercise } from '../types/workout';
import { ExerciseMedia } from './ExerciseMedia';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { ExerciseEditorModal } from './ExerciseEditorModal';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary';
import { ROUTINE_TEMPLATES } from '../data/defaultRoutines';

interface WeeklyRoutineViewProps {
  routines: DayRoutine[];
  catalog?: BaseExercise[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  onUpdateDayRoutine: (updated: DayRoutine) => void;
  onStartWorkout: (routine: DayRoutine) => void;
  onLoadTemplate: (templateId: string) => void;
}

export const WeeklyRoutineView: React.FC<WeeklyRoutineViewProps> = ({
  routines,
  catalog,
  selectedDayId,
  onSelectDay,
  onUpdateDayRoutine,
  onStartWorkout,
  onLoadTemplate,
}) => {
  const currentDay = routines.find((r) => r.id === selectedDayId) || routines[0];

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<WorkoutExercise | null>(null);
  const [isEditingSplitName, setIsEditingSplitName] = useState(false);
  const [splitNameInput, setSplitNameInput] = useState(currentDay.muscleSplit);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Reorder exercises up/down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentDay.exercises.length) return;

    const updatedExercises = [...currentDay.exercises];
    const temp = updatedExercises[index];
    updatedExercises[index] = updatedExercises[newIndex];
    updatedExercises[newIndex] = temp;

    onUpdateDayRoutine({
      ...currentDay,
      exercises: updatedExercises,
    });
  };

  // Delete exercise
  const handleDeleteExercise = (exId: string) => {
    onUpdateDayRoutine({
      ...currentDay,
      exercises: currentDay.exercises.filter((e) => e.id !== exId),
    });
  };

  // Add exercise from library
  const handleAddExercise = (exercise: WorkoutExercise) => {
    onUpdateDayRoutine({
      ...currentDay,
      isRestDay: false,
      exercises: [...currentDay.exercises, exercise],
    });
  };

  // Save edited exercise
  const handleSaveEditedExercise = (updated: WorkoutExercise) => {
    onUpdateDayRoutine({
      ...currentDay,
      exercises: currentDay.exercises.map((e) => (e.id === updated.id ? updated : e)),
    });
  };

  // Toggle rest day
  const handleToggleRestDay = () => {
    onUpdateDayRoutine({
      ...currentDay,
      isRestDay: !currentDay.isRestDay,
    });
  };

  // Save updated muscle split name
  const handleSaveSplitName = () => {
    if (splitNameInput.trim()) {
      onUpdateDayRoutine({
        ...currentDay,
        muscleSplit: splitNameInput.trim(),
      });
      setIsEditingSplitName(false);
    }
  };

  // Get current weekday index to highlight today
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayIndexMap: Record<number, string> = {
    0: 'dom',
    1: 'seg',
    2: 'ter',
    3: 'qua',
    4: 'qui',
    5: 'sex',
    6: 'sab',
  };
  const todayId = dayIndexMap[todayIndex];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Weekday Selector Bar (Android compact 7-day strip) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {routines.map((day) => {
            const isSelected = day.id === selectedDayId;
            const isToday = day.id === todayId;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  onSelectDay(day.id);
                  setSplitNameInput(day.muscleSplit);
                }}
                className={`flex flex-col items-center justify-center py-2 sm:py-3.5 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl min-h-[54px] transition-all active:scale-95 relative ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 font-black'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Today tiny indicator */}
                {isToday && (
                  <span
                    className={`text-[8px] sm:text-[9px] font-black uppercase px-1 sm:px-1.5 py-0.2 rounded-full mb-0.5 leading-tight ${
                      isSelected ? 'bg-black text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    Hoje
                  </span>
                )}
                <span className="text-[11px] sm:text-sm font-black tracking-tight">{day.shortName}</span>
                <span className={`text-[9px] sm:text-[10px] truncate max-w-full px-0.5 ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {day.isRestDay ? 'Desc.' : `${day.exercises.length} ex`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Banner & Controls */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                <Calendar className="w-3.5 h-3.5" />
                {currentDay.dayName}
              </span>
              <button
                type="button"
                onClick={handleToggleRestDay}
                className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border transition-colors flex items-center gap-1 ${
                  currentDay.isRestDay
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                {currentDay.isRestDay ? 'Dia de Descanso Ativo' : 'Marcar como Descanso'}
              </button>
            </div>

            {/* Editable Muscle Split Title */}
            {isEditingSplitName ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={splitNameInput}
                  onChange={(e) => setSplitNameInput(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-emerald-500 rounded-xl text-lg font-black text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveSplitName}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSplitName(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentDay.muscleSplit}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSplitNameInput(currentDay.muscleSplit);
                    setIsEditingSplitName(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Editar nome da divisão muscular"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-400">
              {currentDay.isRestDay
                ? 'Dia reservado para regeneração muscular, sono de qualidade e alimentação balanceada.'
                : `${currentDay.exercises.length} exercícios programados para esta rotina.`}
            </p>
          </div>

          {/* Action Buttons: START WORKOUT & TEMPLATES */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="px-3.5 py-3.5 sm:py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-colors min-h-[46px]"
            >
              <LayoutTemplate className="w-4 h-4 text-sky-400" />
              Templates
            </button>

            <button
              type="button"
              disabled={currentDay.exercises.length === 0}
              onClick={() => onStartWorkout(currentDay)}
              className="flex-1 md:flex-none px-5 sm:px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all group min-h-[46px]"
            >
              <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>INICIAR TREINO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercises Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Exercícios da Rotina ({currentDay.exercises.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs sm:text-sm border border-emerald-500/30 transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Adicionar Exercício
          </button>
        </div>

        {/* Exercises Cards */}
        {currentDay.exercises.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/60 flex items-center justify-center text-slate-500 mx-auto">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Nenhum exercício programado</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Adicione exercícios com animações em GIF e metas de repetição para estruturar seu treino deste dia.
            </p>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Escolher do Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDay.exercises.map((ex, index) => {
              const muscleMeta = MUSCLE_GROUP_LABELS[ex.muscleGroup] || MUSCLE_GROUP_LABELS.geral;

              return (
                <div
                  key={ex.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg group"
                >
                  {/* Left: GIF / Visual and Details */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Media Thumbnail with GIF (clean unobstructed mobile thumbnail) */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 relative group/media">
                      <ExerciseMedia
                        gifUrl={ex.gifUrl}
                        name={ex.name}
                        muscleGroup={ex.muscleGroup}
                        instructions={ex.instructions}
                        className="w-full h-full"
                        showExpandButton={true}
                        compact={true}
                        onUpdateGifUrl={(newUrl) => {
                          const updated = { ...ex, gifUrl: newUrl };
                          handleSaveEditedExercise(updated);
                        }}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${muscleMeta.badgeBg}`}>
                          {muscleMeta.label}
                        </span>
                        {ex.currentPR && (
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Trophy className="w-3 h-3 fill-amber-400" /> PR: {ex.currentPR.weight} kg × {ex.currentPR.reps}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                        {ex.name}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {ex.targetSets} séries × {ex.targetReps} reps
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          Descanso: <strong className="text-slate-200">{ex.restSeconds}s</strong>
                        </span>
                        {ex.notes && ex.notes !== 'Halteres / Barra' && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 truncate max-w-xs">{ex.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Management Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveExercise(index, 'up')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === currentDay.exercises.length - 1}
                        onClick={() => handleMoveExercise(index, 'down')}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingExercise(ex)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                      title="Editar séries, descanso, carga e GIF"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-colors"
                      title="Remover exercício da rotina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Library Modal */}
      <ExerciseLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExercise={handleAddExercise}
        catalog={catalog}
      />

      {/* Edit Exercise Modal */}
      <ExerciseEditorModal
        exercise={editingExercise}
        isOpen={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={handleSaveEditedExercise}
      />

      {/* Templates Selector Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <LayoutTemplate className="w-5 h-5 text-emerald-400" />
              Templates de Treino Prontos
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Escolha uma divisão clássica estruturada por especialistas para preencher sua semana automaticamente:
            </p>

            <div className="space-y-3 mb-6">
              {ROUTINE_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    if (confirm(`Deseja carregar a divisão ${tpl.title}? Isso atualizará os dias da semana com a nova estrutura.`)) {
                      onLoadTemplate(tpl.id);
                      setShowTemplatesModal(false);
                    }
                  }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all group"
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
