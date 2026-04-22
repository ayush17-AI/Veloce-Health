import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Debug: Print credentials on startup so you can verify in DevTools ──
console.log('[Veloce] Supabase URL:', supabaseUrl || '⚠️ MISSING');
console.log('[Veloce] Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '⚠️ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Veloce] ❌ CRITICAL: Supabase URL or Anon Key is missing!\n' +
    'Expected env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    'Make sure your .env file is at the project root and you restarted the dev server.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ── Hardcoded ESP32 user ID for presentation mode ──
export const ESP32_USER_ID = '72c219a2-a11e-48be-bb96-8b20614fe009';
