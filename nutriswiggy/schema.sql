-- NutriSwiggy Production Database Schema (Supabase / PostgreSQL)
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create User Profiles Table (Daily Macros Targets)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_calories INTEGER DEFAULT 2000,
    target_protein INTEGER DEFAULT 120,
    target_carbohydrates INTEGER DEFAULT 200,
    target_fats INTEGER DEFAULT 70,
    target_fiber INTEGER DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Swiggy Encrypted Session Tokens Table
CREATE TABLE IF NOT EXISTS public.swiggy_sessions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Food Orders & Macro Tracker History Table
CREATE TABLE IF NOT EXISTS public.food_orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(100),
    total_calories REAL DEFAULT 0,
    total_protein REAL DEFAULT 0,
    total_carbohydrates REAL DEFAULT 0,
    total_fats REAL DEFAULT 0,
    total_fiber REAL DEFAULT 0,
    items JSONB NOT NULL,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) for Multi-Tenant Data Protection
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swiggy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;

-- 5. Row-Level Security Policies (Users can only read/modify their own records)
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

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'food_orders' AND policyname = 'Food orders self access'
    ) THEN
        CREATE POLICY "Food orders self access" ON public.food_orders
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
