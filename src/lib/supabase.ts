import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rezlvmhtoamgmznlcmiu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlemx2bWh0b2FtZ216bmxjbWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NDI5NTksImV4cCI6MjExMTExODk1OX0.yCAt4mJ-hw4bYjOtm-XvCJs8C_Fp7kWzUghTpzHBSqs';

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

/**
 * Sync user's treinos data to Supabase
 */
export async function syncUserDataToSupabase(cloudPayload: {
  routines?: unknown;
  prs?: unknown;
  history?: unknown;
  catalog?: unknown;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        treinos_cloud: cloudPayload,
        last_synced_at: new Date().toISOString(),
      },
    });

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
export async function fetchUserDataFromSupabase(): Promise<{
  routines?: unknown;
  prs?: unknown;
  history?: unknown;
  catalog?: unknown;
} | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const metadata = userData.user.user_metadata;
    if (metadata && metadata.treinos_cloud) {
      return metadata.treinos_cloud;
    }
    return null;
  } catch (err) {
    console.warn('Erro ao buscar dados do Supabase:', err);
    return null;
  }
}
