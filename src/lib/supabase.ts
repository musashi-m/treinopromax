import { createClient } from '@supabase/supabase-js';
import type {
  BaseExercise,
  CompletedWorkoutSummary,
  DayRoutine,
  PersonalRecord,
} from '../types/workout';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rezlvmhtoamgmznlcmiu.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlemx2bWh0b2FtZ216bmxjbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NDI5NTksImV4cCI6MjExMTExODk1OX0.yCAt4mJ-hw4bYjOtm-XvCJs8C_Fp7kWzUghTpzHBSqs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const MASTER_USER = {
  email: 'vini@gmail.com',
  password: '123456',
};

const MAX_CLOUD_PAYLOAD_CHARS = 7500;

export interface CloudSyncPayload {
  routines?: DayRoutine[];
  prs?: PersonalRecord[];
  history?: CompletedWorkoutSummary[];
  catalog?: BaseExercise[];
}

/**
 * Compress a JSON-serializable object into a compact base64 gzip string
 * so user_metadata stays tiny and never bloats Supabase JWT headers.
 */
async function compressToBase64(data: unknown): Promise<string> {
  const json = JSON.stringify(data);
  if (typeof CompressionStream === 'undefined') {
    return `raw:${json}`;
  }

  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `gz:${btoa(binary)}`;
}

async function decompressFromBase64<T>(encoded: string): Promise<T | null> {
  try {
    if (encoded.startsWith('raw:')) {
      return JSON.parse(encoded.slice(4)) as T;
    }
    if (encoded.startsWith('gz:')) {
      const b64 = encoded.slice(3);
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      const text = await new Response(stream).text();
      return JSON.parse(text) as T;
    }
    return JSON.parse(encoded) as T;
  } catch (err) {
    console.warn('Falha ao descompactar dados da nuvem:', err);
    return null;
  }
}

/**
 * Keep only catalog exercises that differ from the built-in library or are custom-added.
 */
function compactCatalog(catalog?: BaseExercise[]): BaseExercise[] | undefined {
  if (!catalog || catalog.length === 0) return undefined;
  const defaultMap = new Map(EXERCISE_LIBRARY.map((ex) => [ex.id, ex]));
  const overrides = catalog.filter((ex) => {
    const def = defaultMap.get(ex.id);
    if (!def) return true;
    return (
      ex.name !== def.name ||
      ex.muscleGroup !== def.muscleGroup ||
      ex.equipment !== def.equipment ||
      ex.gifUrl !== def.gifUrl ||
      ex.instructions !== def.instructions ||
      ex.defaultSets !== def.defaultSets ||
      ex.defaultReps !== def.defaultReps ||
      ex.defaultRestSeconds !== def.defaultRestSeconds
    );
  });
  return overrides.length > 0 ? overrides : undefined;
}

function hydrateCatalog(overrides?: BaseExercise[]): BaseExercise[] | undefined {
  if (!overrides || overrides.length === 0) return undefined;
  const overrideMap = new Map(overrides.map((ex) => [ex.id, ex]));
  const merged = EXERCISE_LIBRARY.map((ex) => overrideMap.get(ex.id) || ex);
  const customOnly = overrides.filter((ex) => !EXERCISE_LIBRARY.some((d) => d.id === ex.id));
  return [...merged, ...customOnly];
}

/**
 * Strip heavy repeated descriptions/gifUrls from routine exercises when they match the catalog.
 */
function compactRoutines(routines?: DayRoutine[], catalog?: BaseExercise[]): DayRoutine[] | undefined {
  if (!routines || routines.length === 0) return undefined;
  const catMap = new Map((catalog || EXERCISE_LIBRARY).map((ex) => [ex.id, ex]));
  return routines.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex) => {
      const cat = catMap.get(ex.exerciseId);
      return {
        ...ex,
        gifUrl: cat && ex.gifUrl === cat.gifUrl ? '' : ex.gifUrl,
        instructions: cat && ex.instructions === cat.instructions ? undefined : ex.instructions,
      };
    }),
  }));
}

function hydrateRoutines(routines?: DayRoutine[], catalog?: BaseExercise[]): DayRoutine[] | undefined {
  if (!routines || routines.length === 0) return undefined;
  const catMap = new Map((catalog || EXERCISE_LIBRARY).map((ex) => [ex.id, ex]));
  return routines.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex) => {
      const cat = catMap.get(ex.exerciseId);
      return {
        ...ex,
        gifUrl: ex.gifUrl || cat?.gifUrl || '',
        instructions: ex.instructions ?? cat?.instructions ?? '',
      };
    }),
  }));
}

/**
 * Ensure the active session JWT is valid and not oversized from legacy metadata.
 */
async function ensureHealthySession(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.user) return false;

  if (session.access_token.length > 8000) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (error || !refreshed.session) {
      return false;
    }
  }
  return true;
}

/**
 * Sync user's treinos data to Supabase safely with gzip compression.
 */
export async function syncUserDataToSupabase(
  cloudPayload: CloudSyncPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = await ensureHealthySession();
    if (!ok) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const catalogOverrides = compactCatalog(cloudPayload.catalog);
    const compactedRoutines = compactRoutines(cloudPayload.routines, cloudPayload.catalog);
    const historyList = cloudPayload.history || [];

    let encoded = await compressToBase64({
      r: compactedRoutines,
      p: cloudPayload.prs,
      h: historyList,
      c: catalogOverrides,
    });

    // Guard against ever exceeding safe JWT header size
    if (encoded.length > MAX_CLOUD_PAYLOAD_CHARS && historyList.length > 0) {
      let trimmedHistory = [...historyList];
      while (encoded.length > MAX_CLOUD_PAYLOAD_CHARS && trimmedHistory.length > 1) {
        trimmedHistory = trimmedHistory.slice(0, Math.max(1, Math.floor(trimmedHistory.length * 0.7)));
        encoded = await compressToBase64({
          r: compactedRoutines,
          p: cloudPayload.prs,
          h: trimmedHistory,
          c: catalogOverrides,
        });
      }
    }

    const updateBody = {
      data: {
        treinos_v2: encoded,
        last_synced_at: new Date().toISOString(),
        // Clear any legacy bloated keys if still present
        treinos_cloud: null,
        synced_workouts: null,
        last_sync: null,
      },
    };

    let { error } = await supabase.auth.updateUser(updateBody);

    // Retry once after refreshing session if JWT was stale/oversized
    if (error) {
      await supabase.auth.refreshSession();
      const retry = await supabase.auth.updateUser(updateBody);
      error = retry.error;
    }

    if (error) {
      console.warn('Erro ao sincronizar com Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Falha na sincronização Supabase:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Fetch user's treinos data from Supabase cloud
 */
export async function fetchUserDataFromSupabase(): Promise<CloudSyncPayload | null> {
  try {
    const ok = await ensureHealthySession();
    if (!ok) return null;

    let { data: userData, error } = await supabase.auth.getUser();
    if (error) {
      await supabase.auth.refreshSession();
      const retry = await supabase.auth.getUser();
      userData = retry.data;
    }

    if (!userData.user) return null;

    const metadata = userData.user.user_metadata || {};

    if (typeof metadata.treinos_v2 === 'string') {
      const compact = await decompressFromBase64<{
        r?: DayRoutine[];
        p?: PersonalRecord[];
        h?: CompletedWorkoutSummary[];
        c?: BaseExercise[];
      }>(metadata.treinos_v2);

      if (compact) {
        const hydratedCat = hydrateCatalog(compact.c);
        const hydratedRoutines = hydrateRoutines(compact.r, hydratedCat);
        return {
          routines: hydratedRoutines,
          prs: compact.p,
          history: compact.h,
          catalog: hydratedCat,
        };
      }
    }

    // Backwards compatibility with older treinos_cloud format
    if (metadata.treinos_cloud) {
      return metadata.treinos_cloud as CloudSyncPayload;
    }

    return null;
  } catch (err) {
    console.warn('Erro ao buscar dados do Supabase:', err);
    return null;
  }
}
