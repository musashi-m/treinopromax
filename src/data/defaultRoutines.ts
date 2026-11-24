import type { DayRoutine, WorkoutExercise, PersonalRecord } from '../types/workout';
import { EXERCISE_LIBRARY } from './exerciseLibrary';

const getEx = (id: string) => EXERCISE_LIBRARY.find(e => e.id === id);

function createWorkoutExercise(
  exerciseId: string,
  targetSets: number,
  targetReps: string,
  restSeconds: number,
  initialPR?: { weight: number; reps: number; date?: string }
): WorkoutExercise {
  const base = getEx(exerciseId);
  const nowStr = new Date().toISOString();

  let pr: PersonalRecord | undefined = undefined;
  if (initialPR) {
    pr = {
      exerciseId,
      exerciseName: base ? base.name : exerciseId,
      weight: initialPR.weight,
      reps: initialPR.reps,
      date: initialPR.date || nowStr,
      estimated1RM: Math.round(initialPR.weight * (1 + initialPR.reps / 30) * 10) / 10
    };
  }

  return {
    id: `we-${exerciseId}-${Math.random().toString(36).substring(2, 7)}`,
    exerciseId,
    name: base ? base.name : exerciseId,
    muscleGroup: base ? base.muscleGroup : 'geral',
    gifUrl: base ? base.gifUrl : '',
    instructions: base ? base.instructions : '',
    targetSets,
    targetReps,
    restSeconds,
    notes: base && base.tips.length > 0 ? base.tips[0] : '',
    lastWeight: initialPR ? initialPR.weight : 20,
    lastReps: initialPR ? initialPR.reps : 10,
    currentPR: pr
  };
}

export const DEFAULT_WEEK_ROUTINE: DayRoutine[] = [
  {
    id: 'seg',
    dayName: 'Segunda-feira',
    shortName: 'SEG',
    muscleSplit: 'Peito & Tríceps',
    subtitle: 'Hipertrofia com foco em supino e empurrar',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('supino-reto-barra', 4, '8-10', 90, { weight: 80, reps: 8 }),
      createWorkoutExercise('supino-inclinado-halteres', 4, '10-12', 75, { weight: 28, reps: 10 }),
      createWorkoutExercise('crossover-polia-media', 3, '12-15', 60, { weight: 25, reps: 12 }),
      createWorkoutExercise('triceps-corda-polia', 4, '12-15', 60, { weight: 30, reps: 12 }),
      createWorkoutExercise('triceps-testa-barra-w', 3, '10-12', 75, { weight: 26, reps: 10 })
    ]
  },
  {
    id: 'ter',
    dayName: 'Terça-feira',
    shortName: 'TER',
    muscleSplit: 'Costas & Bíceps',
    subtitle: 'Foco em largura dorsal e puxadas',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('puxada-frontal-pulley', 4, '10-12', 90, { weight: 65, reps: 10 }),
      createWorkoutExercise('remada-curvada-barra', 4, '8-10', 90, { weight: 70, reps: 8 }),
      createWorkoutExercise('remada-baixa-triangulo', 3, '10-12', 75, { weight: 60, reps: 10 }),
      createWorkoutExercise('pulldown-corda', 3, '12-15', 60, { weight: 35, reps: 12 }),
      createWorkoutExercise('rosca-direta-barra-w', 4, '10-12', 75, { weight: 30, reps: 10 }),
      createWorkoutExercise('rosca-martelo-halteres', 3, '10-12', 60, { weight: 16, reps: 10 })
    ]
  },
  {
    id: 'qua',
    dayName: 'Quarta-feira',
    shortName: 'QUA',
    muscleSplit: 'Pernas & Quadríceps',
    subtitle: 'Dia pesado de membros inferiores',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('agachamento-livre', 4, '8-10', 120, { weight: 100, reps: 8 }),
      createWorkoutExercise('leg-press-45', 4, '10-12', 90, { weight: 240, reps: 10 }),
      createWorkoutExercise('cadeira-extensora', 4, '12-15', 60, { weight: 60, reps: 12 }),
      createWorkoutExercise('avanco-passada', 3, '10-12', 75, { weight: 18, reps: 10 }),
      createWorkoutExercise('panturrilha-em-pe', 4, '15-20', 60, { weight: 75, reps: 15 })
    ]
  },
  {
    id: 'qui',
    dayName: 'Quinta-feira',
    shortName: 'QUI',
    muscleSplit: 'Ombros & Trapézio',
    subtitle: 'Desenvolvimento e largura de deltóides',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('desenvolvimento-halteres', 4, '8-10', 90, { weight: 24, reps: 8 }),
      createWorkoutExercise('elevacao-lateral-halteres', 4, '12-15', 60, { weight: 12, reps: 12 }),
      createWorkoutExercise('crucifixo-invertido-polia', 3, '12-15', 60, { weight: 40, reps: 12 }),
      createWorkoutExercise('abdominal-infra-paralela', 3, '15-20', 60, { weight: 0, reps: 15 }),
      createWorkoutExercise('prancha-isometrica', 3, '60 seg', 60, { weight: 0, reps: 1 })
    ]
  },
  {
    id: 'sex',
    dayName: 'Sexta-feira',
    shortName: 'SEX',
    muscleSplit: 'Posterior & Glúteos',
    subtitle: 'Isquiotibiais, Stiff e cadeia posterior',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('levantamento-terra', 4, '6-8', 120, { weight: 120, reps: 6 }),
      createWorkoutExercise('stiff-barra', 4, '10-12', 90, { weight: 70, reps: 10 }),
      createWorkoutExercise('mesa-flexora', 4, '10-12', 75, { weight: 50, reps: 10 }),
      createWorkoutExercise('elevacao-pelvica', 4, '10-12', 90, { weight: 90, reps: 10 }),
      createWorkoutExercise('panturrilha-em-pe', 4, '15-20', 60, { weight: 80, reps: 15 })
    ]
  },
  {
    id: 'sab',
    dayName: 'Sábado',
    shortName: 'SÁB',
    muscleSplit: 'Braços & Abdômen (Opcional)',
    subtitle: 'Pump de bíceps, tríceps e core',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('rosca-scott-maquina', 3, '10-12', 60, { weight: 35, reps: 10 }),
      createWorkoutExercise('triceps-frances-halter', 3, '10-12', 60, { weight: 22, reps: 10 }),
      createWorkoutExercise('rosca-martelo-halteres', 3, '10-12', 60, { weight: 16, reps: 10 }),
      createWorkoutExercise('abdominal-infra-paralela', 3, '15-20', 60, { weight: 0, reps: 15 })
    ]
  },
  {
    id: 'dom',
    dayName: 'Domingo',
    shortName: 'DOM',
    muscleSplit: 'Descanso / Recuperação',
    subtitle: 'Descanso total ou cardio leve',
    isRestDay: true,
    exercises: []
  }
];

export const ROUTINE_TEMPLATES = [
  {
    id: 'abcde',
    title: 'ABCDE (Hipertrofia Clássica)',
    description: 'Segunda a Sexta com 1 a 2 grupos musculares por dia (Peito, Costas, Pernas, Ombros, Braços/Posterior).'
  },
  {
    id: 'ppl',
    title: 'PPL (Push / Pull / Legs)',
    description: 'Divisão moderna: Empurrar (Peito/Tríceps/Ombro), Puxar (Costas/Bíceps) e Pernas.'
  },
  {
    id: 'upper_lower',
    title: 'Upper / Lower (Superior / Inferior)',
    description: 'Divisão 4x na semana alternando membros superiores e membros inferiores.'
  }
];
