import { createClient } from '@supabase/supabase-js';

// Extract URL from existing default images or use env variable
// Default URL from schema: https://hcibiyuuxvbsxzywbccl.supabase.co
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcibiyuuxvbsxzywbccl.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

if (!supabaseAnonKey) {
  console.warn('SUPABASE_PUBLISHABLE_KEY is not set');
}

// Client-side Supabase client (only if key is provided)
export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client with service role key
export const supabaseAdmin = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

