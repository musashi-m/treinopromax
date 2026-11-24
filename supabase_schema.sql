-- ====================================================================
-- SCHEMA DE BANCO DE DADOS SUPABASE - IRON ROUTINE PRO
-- Projeto Supabase: rezlvmhtoamgmznlcmiu
-- ====================================================================

-- 1. Tabela de Treinos Realizados (Histórico)
CREATE TABLE IF NOT EXISTS public.workout_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    routine_name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    total_volume_kg NUMERIC NOT NULL DEFAULT 0,
    total_sets_completed INTEGER NOT NULL DEFAULT 0,
    total_reps_completed INTEGER NOT NULL DEFAULT 0,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para workout_history
CREATE POLICY "Usuários podem gerenciar seu próprio histórico"
ON public.workout_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Tabela de Recordes Pessoais (PRs)
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id TEXT NOT NULL,
    weight_kg NUMERIC NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    estimated_one_rep_max NUMERIC NOT NULL DEFAULT 0,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, exercise_id)
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios PRs"
ON public.personal_records
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Tabela de Exercícios Customizados / Editados
CREATE TABLE IF NOT EXISTS public.custom_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_muscle_group TEXT NOT NULL,
    description TEXT,
    gif_url TEXT,
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_rest_seconds INTEGER DEFAULT 60,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, exercise_id)
);

ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus exercícios"
ON public.custom_exercises
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Tabela de Passkeys (WebAuthn / Biometria)
CREATE TABLE IF NOT EXISTS public.user_passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    credential_id TEXT NOT NULL,
    device_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, credential_id)
);

ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas chaves de acesso"
ON public.user_passkeys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
