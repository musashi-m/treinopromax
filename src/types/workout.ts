export type MuscleGroup =
  | 'peito'
  | 'costas'
  | 'pernas'
  | 'quadriceps'
  | 'posterior'
  | 'gluteos'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'abdomen'
  | 'panturrilha'
  | 'cardio'
  | 'geral';

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number; // in kg
  reps: number;
  date: string;
  estimated1RM: number; // Epley formula: weight * (1 + reps / 30)
}

export interface BaseExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: string;
  gifUrl: string;
  instructions: string;
  tips: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
}

export interface WorkoutExercise {
  id: string; // unique instance id in this day's routine
  exerciseId: string; // reference to base exercise id
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions?: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes?: string;
  lastWeight?: number;
  lastReps?: number;
  currentPR?: PersonalRecord;
}

export interface DayRoutine {
  id: string; // 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
  dayName: string; // 'Segunda-feira'
  shortName: string; // 'SEG'
  muscleSplit: string; // e.g. 'Peito & Tríceps'
  subtitle?: string;
  isRestDay: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutSetLog {
  id: string;
  setNumber: number;
  targetReps: string;
  weight: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
  previousWeight?: number;
  previousReps?: number;
  completedAt?: string;
}

export interface ActiveExerciseProgress {
  workoutExerciseId: string;
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  gifUrl: string;
  instructions?: string;
  notes?: string;
  restSeconds: number;
  currentPR?: PersonalRecord;
  sets: WorkoutSetLog[];
}

export interface CompletedWorkoutSummary {
  id: string;
  dayId?: string;
  dayName: string;
  muscleSplit: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number; // Tempo decorrido
  totalVolumeKg: number; // Carga Total
  totalSetsCompleted: number; // Total de Séries
  totalRepsCompleted: number; // Total de repetições
  notes?: string;
  prsAchieved?: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    previousWeight?: number;
  }>;
  exercises: Array<{
    name: string;
    muscleGroup: MuscleGroup;
    sets: Array<{ weight: number; reps: number; completed: boolean; isPR?: boolean }>;
  }>;
}

export type ViewTab = 'semana' | 'treino_ativo' | 'exercicios' | 'prs' | 'historico';
