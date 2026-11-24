import React, { useState, useEffect, useRef } from 'react';
import type { 
  DayRoutine, 
  PersonalRecord, 
  CompletedWorkoutSummary, 
  ViewTab, 
  WorkoutExercise,
  BaseExercise 
} from './types/workout';
import { DEFAULT_WEEK_ROUTINE } from './data/defaultRoutines';
import { EXERCISE_LIBRARY } from './data/exerciseLibrary';
import { Navbar } from './components/Navbar';
import { WeeklyRoutineView } from './components/WeeklyRoutineView';
import { ActiveWorkout } from './components/ActiveWorkout';
import { PRTrackerView } from './components/PRTrackerView';
import { HistoryView } from './components/HistoryView';
import { ExerciseCatalogView } from './components/ExerciseCatalogView';
import { LoginScreen } from './components/LoginScreen';
import { BiometricsEnrollModal } from './components/BiometricsEnrollModal';
import { supabase, syncUserDataToSupabase, fetchUserDataFromSupabase } from './lib/supabase';

const STORAGE_KEYS = {
  USER: 'iron_routine_auth_user_v1',
  ROUTINES: 'iron_routine_days_v1',
  PRS: 'iron_routine_prs_v1',
  HISTORY: 'iron_routine_history_v1',
  CATALOG: 'iron_routine_catalog_v1',
};

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; id?: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) return JSON.parse(savedUser);
    } catch {
      // ignore
    }
    return null;
  });

  const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Determine current day of the week
  const getInitialDayId = (): string => {
    const dayNum = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const map: Record<number, string> = {
      0: 'dom',
      1: 'seg',
      2: 'ter',
      3: 'qua',
      4: 'qui',
      5: 'sex',
      6: 'sab',
    };
    return map[dayNum] || 'seg';
  };

  // State: Catalog Exercises (Editable by user)
  const [catalogExercises, setCatalogExercises] = useState<BaseExercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading catalog from localStorage', e);
    }
    return EXERCISE_LIBRARY;
  });

  // State: Routines (Weekly Days)
  const [routines, setRoutines] = useState<DayRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading routines from localStorage', e);
    }
    return DEFAULT_WEEK_ROUTINE;
  });

  // State: PRs
  const [prs, setPRs] = useState<PersonalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading PRs from localStorage', e);
    }
    // Extract initial PRs from default routine
    const initialList: PersonalRecord[] = [];
    DEFAULT_WEEK_ROUTINE.forEach((day) => {
      day.exercises.forEach((ex) => {
        if (ex.currentPR) {
          const exists = initialList.some((p) => p.exerciseName === ex.name);
          if (!exists) initialList.push(ex.currentPR);
        }
      });
    });
    return initialList;
  });

  // State: History (CLEAN, NO MOCK DATA)
  const [history, setHistory] = useState<CompletedWorkoutSummary[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any mock/seed items if previously present
          return parsed.filter((w: CompletedWorkoutSummary) => !w.id.startsWith('seed-workout'));
        }
      }
    } catch (e) {
      console.error('Error loading history from localStorage', e);
    }
    return []; // Clean empty start
  });

  // Navigation and active states
  const [currentTab, setCurrentTab] = useState<ViewTab>('semana');
  const [selectedDayId, setSelectedDayId] = useState<string>(getInitialDayId());
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<DayRoutine | null>(null);

  // Sync session with Supabase on mount
  useEffect(() => {
    async function checkSupabaseSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const email = data.session.user.email || 'vini@gmail.com';
          const userObj = { email, id: data.session.user.id };
          setCurrentUser(userObj);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));

          // Fetch cloud data
          const cloudData = await fetchUserDataFromSupabase();
          if (cloudData) {
            if (Array.isArray(cloudData.routines) && cloudData.routines.length > 0) {
              setRoutines(cloudData.routines as DayRoutine[]);
            }
            if (Array.isArray(cloudData.prs)) {
              setPRs(cloudData.prs as PersonalRecord[]);
            }
            if (Array.isArray(cloudData.history)) {
              setHistory((cloudData.history as CompletedWorkoutSummary[]).filter(
                (w) => !w.id.startsWith('seed-workout')
              ));
            }
            if (Array.isArray(cloudData.catalog) && cloudData.catalog.length > 0) {
              setCatalogExercises(cloudData.catalog as BaseExercise[]);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão Supabase:', err);
      }
    }
    checkSupabaseSession();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(prs));
    } catch (e) {
      console.error('Failed to save PRs', e);
    }
  }, [prs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalogExercises));
    } catch (e) {
      console.error('Failed to save catalog', e);
    }
  }, [catalogExercises]);

  // Debounced cloud synchronization with Supabase
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!currentUser) return;

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      const res = await syncUserDataToSupabase({
        routines,
        prs,
        history,
        catalog: catalogExercises,
      });

      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [routines, prs, history, catalogExercises, currentUser]);

  // Login handler
  const handleLoginSuccess = async (user: { email: string; id?: string }) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Restore cloud data if available in Supabase
    const cloudData = await fetchUserDataFromSupabase();
    if (cloudData) {
      if (Array.isArray(cloudData.routines) && cloudData.routines.length > 0) {
        setRoutines(cloudData.routines as DayRoutine[]);
      }
      if (Array.isArray(cloudData.prs)) {
        setPRs(cloudData.prs as PersonalRecord[]);
      }
      if (Array.isArray(cloudData.history)) {
        setHistory((cloudData.history as CompletedWorkoutSummary[]).filter(
          (w) => !w.id.startsWith('seed-workout')
        ));
      }
      if (Array.isArray(cloudData.catalog) && cloudData.catalog.length > 0) {
        setCatalogExercises(cloudData.catalog as BaseExercise[]);
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    setCurrentUser(null);
  };

  // Update Catalog Exercise Handler (user edits name, description, gif, sets, reps)
  const handleUpdateCatalogExercise = (updated: BaseExercise) => {
    setCatalogExercises((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );

    // Also update existing exercises in weekly routines that match this exerciseId
    setRoutines((prev) => {
      return prev.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          if (ex.exerciseId === updated.id) {
            return {
              ...ex,
              name: updated.name,
              muscleGroup: updated.muscleGroup,
              gifUrl: updated.gifUrl,
              instructions: updated.instructions,
              targetSets: updated.defaultSets,
              targetReps: updated.defaultReps,
              restSeconds: updated.defaultRestSeconds,
            };
          }
          return ex;
        }),
      }));
    });
  };

  // Reset Catalog to original built-in defaults
  const handleResetCatalog = () => {
    setCatalogExercises(EXERCISE_LIBRARY);
    localStorage.removeItem(STORAGE_KEYS.CATALOG);
  };

  // Start workout session
  const handleStartWorkout = (routineToStart: DayRoutine) => {
    setActiveWorkoutRoutine(routineToStart);
    setCurrentTab('treino_ativo');
  };

  // Finish workout session
  const handleFinishWorkout = (summary: CompletedWorkoutSummary) => {
    // Add to history / calendar
    setHistory((prev) => [summary, ...prev]);

    // Update previous loads on routine exercises so next time user remembers
    if (summary.dayId) {
      setRoutines((prev) => {
        return prev.map((day) => {
          if (day.id !== summary.dayId) return day;

          const updatedExercises = day.exercises.map((ex) => {
            const finishedEx = summary.exercises.find((se) => se.name === ex.name);
            if (finishedEx && finishedEx.sets.length > 0) {
              const completedSets = finishedEx.sets.filter((s) => s.completed);
              const lastSet = completedSets[completedSets.length - 1] || finishedEx.sets[finishedEx.sets.length - 1];
              return {
                ...ex,
                lastWeight: lastSet ? lastSet.weight : ex.lastWeight,
                lastReps: lastSet ? lastSet.reps : ex.lastReps,
              };
            }
            return ex;
          });

          return { ...day, exercises: updatedExercises };
        });
      });
    }

    setActiveWorkoutRoutine(null);
    setCurrentTab('historico');
  };

  // Add workout manually into calendar
  const handleAddManualWorkout = (newWorkout: CompletedWorkoutSummary) => {
    setHistory((prev) => [newWorkout, ...prev]);
  };

  // Cancel workout session
  const handleCancelWorkout = () => {
    setActiveWorkoutRoutine(null);
    setCurrentTab('semana');
  };

  // Update PR handler
  const handleUpdatePR = (newPR: PersonalRecord) => {
    setPRs((prev) => {
      const filtered = prev.filter(
        (p) => p.exerciseName.toLowerCase() !== newPR.exerciseName.toLowerCase()
      );
      return [newPR, ...filtered];
    });

    // Also update routine exercises currentPR
    setRoutines((prev) => {
      return prev.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          if (ex.name.toLowerCase() === newPR.exerciseName.toLowerCase()) {
            return { ...ex, currentPR: newPR };
          }
          return ex;
        }),
      }));
    });
  };

  // Update a specific day's routine
  const handleUpdateDayRoutine = (updatedDay: DayRoutine) => {
    setRoutines((prev) => prev.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
  };

  // Add exercise to a specific day from catalog
  const handleAddExerciseToDay = (dayId: string, exercise: WorkoutExercise) => {
    setRoutines((prev) => {
      return prev.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            isRestDay: false,
            exercises: [...day.exercises, exercise],
          };
        }
        return day;
      });
    });
  };

  // Load predefined template
  const handleLoadTemplate = (templateId: string) => {
    if (templateId === 'ppl') {
      // Push Pull Legs template
      setRoutines([
        {
          id: 'seg',
          dayName: 'Segunda-feira',
          shortName: 'SEG',
          muscleSplit: 'Push 1 (Peito, Ombro, Tríceps)',
          subtitle: 'Foco em supinos e desenvolvimento',
          isRestDay: false,
          exercises: DEFAULT_WEEK_ROUTINE[0].exercises,
        },
        {
          id: 'ter',
          dayName: 'Terça-feira',
          shortName: 'TER',
          muscleSplit: 'Pull 1 (Costas, Bíceps, Posterior de Ombro)',
          subtitle: 'Foco em puxadas e remadas',
          isRestDay: false,
          exercises: DEFAULT_WEEK_ROUTINE[1].exercises,
        },
        {
          id: 'qua',
          dayName: 'Quarta-feira',
          shortName: 'QUA',
          muscleSplit: 'Legs 1 (Quadríceps, Glúteos, Panturrilha)',
          subtitle: 'Agachamento pesado e membros inferiores',
          isRestDay: false,
          exercises: DEFAULT_WEEK_ROUTINE[2].exercises,
        },
        {
          id: 'qui',
          dayName: 'Quinta-feira',
          shortName: 'QUI',
          muscleSplit: 'Descanso Ativo / Cardio',
          subtitle: 'Recuperação e mobilidade',
          isRestDay: true,
          exercises: [],
        },
        {
          id: 'sex',
          dayName: 'Sexta-feira',
          shortName: 'SEX',
          muscleSplit: 'Push 2 / Pull 2 (Superior Completo)',
          subtitle: 'Volume complementar de membros superiores',
          isRestDay: false,
          exercises: DEFAULT_WEEK_ROUTINE[3].exercises,
        },
        {
          id: 'sab',
          dayName: 'Sábado',
          shortName: 'SÁB',
          muscleSplit: 'Legs 2 (Posteriores de Coxa & Glúteos)',
          subtitle: 'Foco em Stiff e mesa flexora',
          isRestDay: false,
          exercises: DEFAULT_WEEK_ROUTINE[4].exercises,
        },
        {
          id: 'dom',
          dayName: 'Domingo',
          shortName: 'DOM',
          muscleSplit: 'Descanso Total',
          subtitle: 'Recarga para a nova semana',
          isRestDay: true,
          exercises: [],
        },
      ]);
    } else {
      setRoutines(DEFAULT_WEEK_ROUTINE);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const data = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      user: currentUser?.email,
      catalog: catalogExercises,
      routines,
      prs,
      history,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironroutine-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.routines)) {
        setRoutines(data.routines);
        if (Array.isArray(data.catalog)) setCatalogExercises(data.catalog);
        if (Array.isArray(data.prs)) setPRs(data.prs);
        if (Array.isArray(data.history)) {
          setHistory(data.history.filter((w: CompletedWorkoutSummary) => !w.id.startsWith('seed-workout')));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Reset to initial defaults
  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.PRS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.CATALOG);
    setRoutines(DEFAULT_WEEK_ROUTINE);
    setCatalogExercises(EXERCISE_LIBRARY);
    setHistory([]);
    setSelectedDayId('seg');
  };

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'treino_ativo' && !activeWorkoutRoutine) {
            // If user clicked active workout but none is running, start current selected day
            const day = routines.find((r) => r.id === selectedDayId) || routines[0];
            handleStartWorkout(day);
          } else {
            setCurrentTab(tab);
          }
        }}
        isWorkoutActive={!!activeWorkoutRoutine}
        user={currentUser}
        onLogout={handleLogout}
        onRegisterBiometrics={() => setIsBiometricsModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Cloud Sync Status Indicator Bar */}
      {syncStatus !== 'idle' && (
        <div className="bg-slate-900 border-b border-slate-800 py-1 px-4 text-center text-[11px] font-bold">
          {syncStatus === 'syncing' && (
            <span className="text-sky-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              Sincronizando com o Supabase...
            </span>
          )}
          {syncStatus === 'synced' && (
            <span className="text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ☁️ Dados salvos e sincronizados com a nuvem Supabase!
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="text-amber-400">
              ⚠️ Armazenado localmente (sincronizará com a nuvem quando reconectar)
            </span>
          )}
        </div>
      )}

      {/* Main View Switcher */}
      <div className="flex-1">
        {currentTab === 'treino_ativo' && activeWorkoutRoutine ? (
          <ActiveWorkout
            routine={activeWorkoutRoutine}
            onFinishWorkout={handleFinishWorkout}
            onCancelWorkout={handleCancelWorkout}
            onUpdatePR={handleUpdatePR}
          />
        ) : currentTab === 'semana' ? (
          <WeeklyRoutineView
            routines={routines}
            selectedDayId={selectedDayId}
            onSelectDay={setSelectedDayId}
            onUpdateDayRoutine={handleUpdateDayRoutine}
            onStartWorkout={handleStartWorkout}
            onLoadTemplate={handleLoadTemplate}
          />
        ) : currentTab === 'exercicios' ? (
          <ExerciseCatalogView
            catalog={catalogExercises}
            routines={routines}
            onAddExerciseToDay={handleAddExerciseToDay}
            onUpdateCatalogExercise={handleUpdateCatalogExercise}
            onResetCatalog={handleResetCatalog}
          />
        ) : currentTab === 'prs' ? (
          <PRTrackerView
            prs={prs}
            onAddOrUpdatePR={handleUpdatePR}
          />
        ) : currentTab === 'historico' ? (
          <HistoryView
            history={history}
            onAddWorkout={handleAddManualWorkout}
            onDeleteSession={(sessionId) => {
              setHistory((prev) => prev.filter((h) => h.id !== sessionId));
            }}
            onClearHistory={() => setHistory([])}
          />
        ) : null}
      </div>

      {/* Biometrics Enrollment Modal */}
      <BiometricsEnrollModal
        isOpen={isBiometricsModalOpen}
        email={currentUser.email}
        onClose={() => setIsBiometricsModalOpen(false)}
        onEnrolledSuccess={() => {
          // enrolled
        }}
      />
    </div>
  );
};

export default App;
