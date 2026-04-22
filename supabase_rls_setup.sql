-- ==============================================================================
-- VELOCE HEALTH: Supabase Realtime & RLS Production Setup Script
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create the health_metrics table
CREATE TABLE IF NOT EXISTS public.health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    bpm INTEGER NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Enable Realtime on the health_metrics table
-- This allows the front-end to subscribe to inserts/updates
alter publication supabase_realtime add table public.health_metrics;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Policy: Users can only INSERT their own data
CREATE POLICY "Users can insert own telemetry" 
ON public.health_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only READ their own data
CREATE POLICY "Users can view own telemetry" 
ON public.health_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own data (Optional based on ESP32 flow)
CREATE POLICY "Users can update own telemetry" 
ON public.health_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can only DELETE their own data (Optional)
CREATE POLICY "Users can delete own telemetry" 
ON public.health_metrics 
FOR DELETE 
USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. PRESENTATION MODE: Allow anon/public read access to ESP32 data
-- This is REQUIRED when the dashboard runs without authentication (e.g. demo).
-- Without this, the anon key cannot read any rows because auth.uid() is NULL.
-- ==============================================================================

-- Allow anyone to read health_metrics (for unauthenticated dashboard mode)
CREATE POLICY "Public read access for presentation"
ON public.health_metrics
FOR SELECT
USING (true);

-- Allow the ESP32 service role to insert without auth
-- (Only needed if ESP32 sends via service_role key or REST API directly)
CREATE POLICY "ESP32 service insert"
ON public.health_metrics
FOR INSERT
WITH CHECK (true);

-- NOTE: After your presentation, you should DROP these permissive policies:
-- DROP POLICY "Public read access for presentation" ON public.health_metrics;
-- DROP POLICY "ESP32 service insert" ON public.health_metrics;
