import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Dumbbell, Trophy, Flame, ChevronDown, ChevronUp, 
  Trash2, ListFilter, Plus, Repeat, Hash 
} from 'lucide-react';
import type { CompletedWorkoutSummary } from '../types/workout';
import { formatTime, formatDateTimeBR } from '../utils/calc';
import { CalendarMonthView } from './CalendarMonthView';
import { ManualWorkoutModal } from './ManualWorkoutModal';

interface HistoryViewProps {
  history: CompletedWorkoutSummary[];
  onAddWorkout: (workout: CompletedWorkoutSummary) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onAddWorkout,
  onDeleteSession,
  onClearHistory,
}) => {
  const [viewMode, setViewMode] = useState<'calendario' | 'lista'>('calendario');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const totalWorkouts = history.length;
  const totalVolumeAllTime = history.reduce((acc, h) => acc + (h.totalVolumeKg || 0), 0);
  const totalSecondsAllTime = history.reduce((acc, h) => acc + (h.durationSeconds || 0), 0);
  const totalPRsAllTime = history.reduce((acc, h) => acc + (h.prsAchieved?.length || 0), 0);

  const hoursAllTime = Math.floor(totalSecondsAllTime / 3600);
  const minutesAllTime = Math.floor((totalSecondsAllTime % 3600) / 60);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" /> Registro de Treinos & Calendário Mensal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Dias Treinados & Estatísticas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Visualize os dias do mês em que você treinou e consulte os dados detalhados de cada sessão.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Registrar Treino
            </button>

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar todo o histórico de treinos?')) {
                    onClearHistory();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold border border-slate-700 hover:border-red-500/30 transition-colors flex items-center gap-1.5"
                title="Limpar todos os registros"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* Lifetime Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Treinos Feitos</span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalWorkouts}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Volume Total</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {(totalVolumeAllTime / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">kg</span>
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Tempo Dedicado</span>
            <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
              {hoursAllTime}h {minutesAllTime}m
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">PRs Superados</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4 fill-amber-400" /> {totalPRsAllTime}
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Calendário Mensal vs Lista */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('calendario')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'calendario'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendário Mensal</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'lista'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Lista de Treinos ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content based on ViewMode */}
      {viewMode === 'calendario' ? (
        <CalendarMonthView
          history={history}
          onAddWorkout={onAddWorkout}
          onDeleteWorkout={onDeleteSession}
        />
      ) : (
        /* Chronological List of Workouts */
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
              <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white">Nenhum treino registrado ainda</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Ao clicar em <strong>"Iniciar Treino"</strong> ou <strong>"Registrar Treino"</strong>, o registro detalhado aparecerá aqui.
              </p>
            </div>
          ) : (
            history.map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Session Header Card */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {session.dayName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateTimeBR(session.finishedAt || session.startedAt)}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">{session.muscleSplit}</h3>

                      {/* 4 REQUIRED METRICS IN LIST ITEM */}
                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-300 font-mono pt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-400" title="Tempo Decorrido">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {formatTime(session.durationSeconds)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400" title="Carga Total">
                          <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                          {session.totalVolumeKg.toLocaleString()} kg
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400" title="Total de Séries">
                          <Hash className="w-3.5 h-3.5 text-amber-400" />
                          {session.totalSetsCompleted} séries
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400" title="Total de Repetições">
                          <Repeat className="w-3.5 h-3.5 text-pink-400" />
                          {session.totalRepsCompleted ? session.totalRepsCompleted.toLocaleString() : (session.totalSetsCompleted * 10)} reps
                        </span>
                      </div>
                    </div>

                    {/* Right side: PR badge & Toggle */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {session.prsAchieved && session.prsAchieved.length > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          {session.prsAchieved.length} PR(s)!
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Excluir este treino do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details: Exercises and Sets breakdown */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-950/70 border-t border-slate-800 space-y-4 animate-fadeIn">
                      {/* Notes if available */}
                      {session.notes && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <strong className="text-slate-400 uppercase tracking-wider block mb-0.5">Observações:</strong>
                          {session.notes}
                        </div>
                      )}

                      {/* PRs achieved in this session */}
                      {session.prsAchieved && session.prsAchieved.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                            <Trophy className="w-4 h-4 fill-amber-400" /> Recordes Batidos Nesta Sessão:
                          </span>
                          <div className="space-y-1">
                            {session.prsAchieved.map((pr, pIdx) => (
                              <div key={pIdx} className="text-xs text-slate-200 flex justify-between">
                                <span className="font-semibold">{pr.exerciseName}</span>
                                <span className="font-mono font-bold text-amber-300">
                                  {pr.weight} kg × {pr.reps} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exercises list */}
                      {session.exercises && session.exercises.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Exercícios e Séries Realizadas:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {session.exercises.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                              >
                                <h6 className="font-bold text-white mb-1.5">{ex.name}</h6>
                                <div className="flex flex-wrap gap-1.5">
                                  {ex.sets.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                                        s.isPR
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                          : s.completed
                                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                          : 'bg-slate-800 text-slate-500 border-slate-700'
                                      }`}
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
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Manual Workout Registration Modal */}
      <ManualWorkoutModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSaveWorkout={onAddWorkout}
      />
    </div>
  );
};
