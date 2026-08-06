import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from Env or localStorage
export function getSupabaseCredentials() {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('glow_erp_supabase_url') || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('glow_erp_supabase_anon_key') || '';
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseCredentials();
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export interface SupabaseProfile {
  id: string;
  full_name: string;
  phone?: string;
  email: string;
  role: 'Super Admin' | 'Administrator' | 'Manager' | 'Sales Person';
  branch_id?: string;
  account_status: 'Pending' | 'Active' | 'Suspended' | 'Rejected';
  profile_photo?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Sign Up new user into Supabase Auth & create Profile
 */
export async function supabaseSignUp(data: {
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  requestedRole: string;
  branch?: string;
}): Promise<{ success: boolean; message: string; user?: any }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase is not configured yet. Credentials missing in environment or settings.'
    };
  }

  const defaultPassword = data.password || 'GlowERP#2026';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: defaultPassword,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone,
        requested_role: data.requestedRole,
        branch: data.branch || 'Main Store',
      },
    },
  });

  if (authError) {
    return { success: false, message: authError.message };
  }

  if (authData.user) {
    // Upsert into public.profiles
    const roleMapping: Record<string, 'Super Admin' | 'Administrator' | 'Manager' | 'Sales Person'> = {
      super_admin: 'Super Admin',
      administrator: 'Administrator',
      manager: 'Manager',
      salesperson: 'Sales Person',
    };

    const targetRole = roleMapping[data.requestedRole] || 'Sales Person';

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: targetRole,
      account_status: 'Pending',
    });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError);
    }

    // Insert user approval request
    await supabase.from('user_approval_requests').insert({
      user_id: authData.user.id,
      requested_role: targetRole,
      approval_status: 'Pending',
    });

    return {
      success: true,
      message: 'Account successfully registered with Supabase! Your account status is Pending Approval by an Administrator.',
      user: authData.user
    };
  }

  return { success: false, message: 'Failed to create user account.' };
}

/**
 * Sign In with Supabase Auth
 */
export async function supabaseSignIn(email: string, password?: string): Promise<{ success: boolean; message: string; session?: any; profile?: any }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'Supabase credentials missing.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || 'GlowERP#2026',
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Fetch profile status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profile && profile.account_status === 'Pending') {
    await supabase.auth.signOut();
    return {
      success: false,
      message: 'Your account is pending approval by an Administrator or Super Administrator.',
    };
  }

  if (profile && (profile.account_status === 'Suspended' || profile.account_status === 'Rejected')) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: `Your account status is currently ${profile.account_status}. Access denied.`,
    };
  }

  return {
    success: true,
    message: 'Signed in successfully with Supabase!',
    session: data.session,
    profile,
  };
}

/**
 * Fetch Profiles from Supabase
 */
export async function supabaseFetchProfiles(): Promise<SupabaseProfile[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch profiles from Supabase:', error);
    return [];
  }
  return data as SupabaseProfile[];
}

/**
 * Update Profile Status in Supabase
 */
export async function supabaseUpdateProfileStatus(
  userId: string,
  status: 'Pending' | 'Active' | 'Suspended' | 'Rejected',
  role?: 'Super Admin' | 'Administrator' | 'Manager' | 'Sales Person'
) {
  const supabase = getSupabase();
  if (!supabase) return false;

  const updates: any = { account_status: status, updated_at: new Date().toISOString() };
  if (role) updates.role = role;

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) {
    console.error('Failed to update profile:', error);
    return false;
  }
  return true;
}

/**
 * Sign Out user from Supabase Auth
 */
export async function supabaseSignOut(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: true, message: 'Signed out locally.' };
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase auth signOut error:', error);
    return { success: false, message: error.message };
  }
  return { success: true, message: 'Signed out from Supabase Auth.' };
}
