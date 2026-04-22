import { createClient } from '@supabase/supabase-js';

// ── Hardcoded credentials for production reliability ──
const supabaseUrl = 'https://moctxispvqdibegzxcot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY3R4aXNwdnFkaWJlZ3p4Y290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODMwMDgsImV4cCI6MjA5MjM1OTAwOH0.Yb6Uhtxr7OHWd-plmFvmyo5VqMc6OlI-POCZ3jwU3Xo';

console.log('[Veloce] Supabase URL:', supabaseUrl);
console.log('[Veloce] Supabase Key: eyJhbG...(JWT loaded)');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ── Hardcoded ESP32 user ID for presentation mode ──
export const ESP32_USER_ID = '72c219a2-a11e-48be-bb96-8b20614fe009';
