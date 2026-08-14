import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const metaEnv = (import.meta as any).env || {};
const ENV_SUPABASE_URL = metaEnv.VITE_SUPABASE_URL as string | undefined;
const ENV_SUPABASE_KEY = metaEnv.VITE_SUPABASE_ANON_KEY as string | undefined;
const ENV_USE_SUPABASE = metaEnv.VITE_USE_SUPABASE === 'true';

// Local storage key for dynamic runtime toggle (allows switching in UI)
const RUNTIME_SUPABASE_TOGGLE_KEY = 'civictax_use_supabase_flag';

let cachedClient: SupabaseClient | null = null;

/**
 * Check whether Supabase mode is active.
 * First checks localStorage override if user changed it in UI, else defaults to VITE_USE_SUPABASE env flag.
 */
export function isSupabaseActive(): boolean {
  try {
    const override = localStorage.getItem(RUNTIME_SUPABASE_TOGGLE_KEY);
    if (override !== null) {
      return override === 'true';
    }
  } catch (e) {
    // Ignore localStorage access issues
  }
  return ENV_USE_SUPABASE;
}

/**
 * Toggle or set runtime Supabase flag.
 */
export function setSupabaseActiveFlag(enabled: boolean): void {
  try {
    localStorage.setItem(RUNTIME_SUPABASE_TOGGLE_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to set Supabase flag in storage', e);
  }
}

/**
 * Check if valid Supabase connection credentials exist.
 */
export function isSupabaseConfigured(): boolean {
  const url = ENV_SUPABASE_URL;
  const key = ENV_SUPABASE_KEY;
  return Boolean(
    url &&
    key &&
    url.trim().length > 0 &&
    key.trim().length > 0 &&
    !url.includes('your-project') &&
    url.startsWith('https://')
  );
}

/**
 * Safely get or create the Supabase client instance.
 * Returns null if credentials are not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const url = ENV_SUPABASE_URL;
  const key = ENV_SUPABASE_KEY;

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    cachedClient = createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Get the current Supabase integration metadata
 */
export function getSupabaseStatus() {
  const active = isSupabaseActive();
  const configured = isSupabaseConfigured();
  return {
    isActive: active,
    isConfigured: configured,
    mode: active && configured ? ('SUPABASE_CLOUD' as const) : ('LOCAL_LEDGER' as const),
    supabaseUrl: ENV_SUPABASE_URL || 'Not configured',
  };
}
