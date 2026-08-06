import { createClient } from '@supabase/supabase-js';

// Replace the placeholder values below with your Supabase Project URL and Public Anon Key:
const SUPABASE_URL = "{{SUPABASE_URL}}";
const SUPABASE_PUBLIC_KEY = "{{SUPABASE_KEY}}";

// Helper to ensure a valid HTTP/HTTPS URL format for Supabase client initialization
const getValidSupabaseUrl = (url) => {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('{{')) {
    return url;
  }
  return 'https://placeholder.supabase.co';
};

const getValidSupabaseKey = (key) => {
  if (typeof key === 'string' && key.trim() !== '' && !key.includes('{{')) {
    return key;
  }
  return 'placeholder-anon-key';
};

const validUrl = getValidSupabaseUrl(SUPABASE_URL);
const validKey = getValidSupabaseKey(SUPABASE_PUBLIC_KEY);

// Initialize and export the Supabase client instance
export const supabase = createClient(validUrl, validKey);

