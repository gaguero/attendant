import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/index.js';

// Create Supabase client for server-side operations
export const supabaseAdmin = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey || '', // Will be populated once you provide the key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client for client-side operations (using anon key)
export const supabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export default supabaseAdmin;