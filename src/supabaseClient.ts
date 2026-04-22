import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ── Hardcoded ESP32 user ID for presentation mode ──
// This bypasses auth-based filtering so the dashboard always shows ESP32 data
export const ESP32_USER_ID = '72c219a2-a11e-48be-bb96-8b20614fe009';
