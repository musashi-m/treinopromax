import type { DayRoutine, WorkoutExercise } from '../types/workout';
import { EXERCISE_LIBRARY } from './exerciseLibrary';

const getEx = (id: string) => EXERCISE_LIBRARY.find((e) => e.id === id);

function createWorkoutExercise(
  exerciseId: string,
  targetSets: number,
  targetReps: string,
  restSeconds: number
): WorkoutExercise {
  const base = getEx(exerciseId);

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
    lastWeight: undefined,
    lastReps: undefined,
    currentPR: undefined,
  };
}

/**
 * Clean empty weekly routine with no mock exercises, weights, or PRs.
 */
export const EMPTY_WEEK_ROUTINE: DayRoutine[] = [
  {
    id: 'seg',
    dayName: 'Segunda-feira',
    shortName: 'SEG',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'ter',
    dayName: 'Terça-feira',
    shortName: 'TER',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'qua',
    dayName: 'Quarta-feira',
    shortName: 'QUA',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'qui',
    dayName: 'Quinta-feira',
    shortName: 'QUI',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'sex',
    dayName: 'Sexta-feira',
    shortName: 'SEX',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'sab',
    dayName: 'Sábado',
    shortName: 'SÁB',
    muscleSplit: 'Definir divisão',
    subtitle: 'Adicione sua divisão muscular e exercícios',
    isRestDay: false,
    exercises: [],
  },
  {
    id: 'dom',
    dayName: 'Domingo',
    shortName: 'DOM',
    muscleSplit: 'Descanso / Recuperação',
    subtitle: 'Dia livre ou descanso ativo',
    isRestDay: true,
    exercises: [],
  },
];

/**
 * Optional template structure (only loaded if the user explicitly picks a template).
 * Contains zero mock weights or fake PRs.
 */
export const DEFAULT_WEEK_ROUTINE: DayRoutine[] = [
  {
    id: 'seg',
    dayName: 'Segunda-feira',
    shortName: 'SEG',
    muscleSplit: 'Peito & Tríceps',
    subtitle: 'Hipertrofia com foco em supino e empurrar',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('supino-reto-barra', 4, '8-10', 90),
      createWorkoutExercise('supino-inclinado-halteres', 4, '10-12', 75),
      createWorkoutExercise('crossover-polia-media', 3, '12-15', 60),
      createWorkoutExercise('triceps-corda-polia', 4, '12-15', 60),
      createWorkoutExercise('triceps-testa-barra-w', 3, '10-12', 75),
    ],
  },
  {
    id: 'ter',
    dayName: 'Terça-feira',
    shortName: 'TER',
    muscleSplit: 'Costas & Bíceps',
    subtitle: 'Foco em largura dorsal e puxadas',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('puxada-frontal-pulley', 4, '10-12', 90),
      createWorkoutExercise('remada-curvada-barra', 4, '8-10', 90),
      createWorkoutExercise('remada-baixa-triangulo', 3, '10-12', 75),
      createWorkoutExercise('pulldown-corda', 3, '12-15', 60),
      createWorkoutExercise('rosca-direta-barra-w', 4, '10-12', 75),
      createWorkoutExercise('rosca-martelo-halteres', 3, '10-12', 60),
    ],
  },
  {
    id: 'qua',
    dayName: 'Quarta-feira',
    shortName: 'QUA',
    muscleSplit: 'Pernas & Quadríceps',
    subtitle: 'Dia pesado de membros inferiores',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('agachamento-livre', 4, '8-10', 120),
      createWorkoutExercise('leg-press-45', 4, '10-12', 90),
      createWorkoutExercise('cadeira-extensora', 4, '12-15', 60),
      createWorkoutExercise('avanco-passada', 3, '10-12', 75),
      createWorkoutExercise('panturrilha-em-pe', 4, '15-20', 60),
    ],
  },
  {
    id: 'qui',
    dayName: 'Quinta-feira',
    shortName: 'QUI',
    muscleSplit: 'Ombros & Trapézio',
    subtitle: 'Desenvolvimento e largura de deltóides',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('desenvolvimento-halteres', 4, '8-10', 90),
      createWorkoutExercise('elevacao-lateral-halteres', 4, '12-15', 60),
      createWorkoutExercise('crucifixo-invertido-polia', 3, '12-15', 60),
      createWorkoutExercise('abdominal-infra-paralela', 3, '15-20', 60),
      createWorkoutExercise('prancha-isometrica', 3, '60 seg', 60),
    ],
  },
  {
    id: 'sex',
    dayName: 'Sexta-feira',
    shortName: 'SEX',
    muscleSplit: 'Posterior & Glúteos',
    subtitle: 'Isquiotibiais, Stiff e cadeia posterior',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('levantamento-terra', 4, '6-8', 120),
      createWorkoutExercise('stiff-barra', 4, '10-12', 90),
      createWorkoutExercise('mesa-flexora', 4, '10-12', 75),
      createWorkoutExercise('elevacao-pelvica', 4, '10-12', 90),
      createWorkoutExercise('panturrilha-em-pe', 4, '15-20', 60),
    ],
  },
  {
    id: 'sab',
    dayName: 'Sábado',
    shortName: 'SÁB',
    muscleSplit: 'Braços & Abdômen (Opcional)',
    subtitle: 'Pump de bíceps, tríceps e core',
    isRestDay: false,
    exercises: [
      createWorkoutExercise('rosca-scott-maquina', 3, '10-12', 60),
      createWorkoutExercise('triceps-frances-halter', 3, '10-12', 60),
      createWorkoutExercise('rosca-martelo-halteres', 3, '10-12', 60),
      createWorkoutExercise('abdominal-infra-paralela', 3, '15-20', 60),
    ],
  },
  {
    id: 'dom',
    dayName: 'Domingo',
    shortName: 'DOM',
    muscleSplit: 'Descanso / Recuperação',
    subtitle: 'Descanso total ou cardio leve',
    isRestDay: true,
    exercises: [],
  },
];

export const ROUTINE_TEMPLATES = [
  {
    id: 'abcde',
    title: 'ABCDE (Hipertrofia Clássica)',
    description:
      'Segunda a Sexta com 1 a 2 grupos musculares por dia (Peito, Costas, Pernas, Ombros, Braços/Posterior).',
  },
  {
    id: 'ppl',
    title: 'PPL (Push / Pull / Legs)',
    description:
      'Divisão moderna: Empurrar (Peito/Tríceps/Ombro), Puxar (Costas/Bíceps) e Pernas.',
  },
  {
    id: 'upper_lower',
    title: 'Upper / Lower (Superior / Inferior)',
    description: 'Divisão 4x na semana alternando membros superiores e membros inferiores.',
  },
];
