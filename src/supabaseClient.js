import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://mpozrtqkobyaopqbnlrf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wb3pydHFrb2J5YW9wcWJubHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjkzNTUsImV4cCI6MjEwMzM0NTM1NX0.Vv1QP8hpVsNMYHGNx8X7lDyihA2XwTwoMvD5n5p3K20';

const env = (import.meta && import.meta.env) ? import.meta.env : {};

const supabaseUrl = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  console.info(
    'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env variable not set at build time. Using default Supabase configuration.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


