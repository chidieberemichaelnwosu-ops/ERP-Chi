import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CONFIGURATION
// Replace the placeholder values below with your Supabase Project URL and Public Key:
// ============================================================================
const SUPABASE_URL = "{{https://vaftpibexvrxxmtipxdg.supabase.co/rest/v1/}}";
const SUPABASE_PUBLIC_KEY = "{{sb_publishable_nqnuirmQu2pphH2r3yXZTw_HZ4_Elrq}}";

// Helper guard to automatically clean up double braces {{ }} and /rest/v1 suffix if present
const parseUrl = (raw) => {
  if (!raw) return 'https://placeholder.supabase.co';
  let str = raw.replace(/^\{\{/, '').replace(/\}\}$/, '').trim();
  if (!str || str === 'SUPABASE_URL' || !str.startsWith('http')) return 'https://placeholder.supabase.co';
  return str.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

const parseKey = (raw) => {
  if (!raw) return 'placeholder-anon-key';
  let str = raw.replace(/^\{\{/, '').replace(/\}\}$/, '').trim();
  if (!str || str === 'SUPABASE_KEY') return 'placeholder-anon-key';
  return str;
};

// Initialize and export the Supabase client instance
export const supabase = createClient(
  parseUrl(SUPABASE_URL),
  parseKey(SUPABASE_PUBLIC_KEY)
);
