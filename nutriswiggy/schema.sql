-- NutriSwiggy Production Database Schema (Supabase / PostgreSQL)

CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_calories INTEGER DEFAULT 2000,
    target_protein INTEGER DEFAULT 120,
    target_carbohydrates INTEGER DEFAULT 200,
    target_fats INTEGER DEFAULT 70,
    target_fiber INTEGER DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.swiggy_sessions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.swiggy_oauth_states (
    state VARCHAR(128) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_verifier TEXT NOT NULL,
    client_id TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.food_orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(100),
    total_calories REAL DEFAULT 0,
    total_protein REAL DEFAULT 0,
    total_carbohydrates REAL DEFAULT 0,
    total_fats REAL DEFAULT 0,
    total_fiber REAL DEFAULT 0,
    items JSONB NOT NULL,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'redirected_to_swiggy'
);

-- Makes this safe to run against the previously-created table.
ALTER TABLE public.food_orders
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'redirected_to_swiggy';

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swiggy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swiggy_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Food orders self access" ON public.food_orders;
CREATE POLICY "Food orders self access" ON public.food_orders
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'User profiles self access'
    ) THEN
        CREATE POLICY "User profiles self access" ON public.user_profiles
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'swiggy_sessions' AND policyname = 'Swiggy sessions self access'
    ) THEN
        CREATE POLICY "Swiggy sessions self access" ON public.swiggy_sessions
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
