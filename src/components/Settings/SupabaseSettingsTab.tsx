import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Copy, Download, RefreshCw, Key, Server, ShieldCheck, Layers, HardDrive } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseCredentials, resetSupabaseClient, getSupabase } from '../../lib/supabase';

export const SupabaseSettingsTab: React.FC = () => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.anonKey);
  }, []);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      localStorage.setItem('glow_erp_supabase_url', url.trim());
    } else {
      localStorage.removeItem('glow_erp_supabase_url');
    }

    if (anonKey.trim()) {
      localStorage.setItem('glow_erp_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('glow_erp_supabase_anon_key');
    }

    resetSupabaseClient();
    setTestResult({
      success: true,
      message: 'Supabase credentials saved successfully to local storage!'
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setTestResult({
          success: false,
          message: 'Supabase is not configured. Please enter a valid Project URL and Anon API Key.',
        });
        setIsTesting(false);
        return;
      }

      // Perform ping test to public settings or profiles table
      const { data, error } = await supabase.from('settings').select('*').limit(1);

      if (error && error.code !== 'PGRST116') {
        setTestResult({
          success: false,
          message: `Connection test failed: ${error.message} (Code: ${error.code})`,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Connection successful! Connected to Supabase PostgreSQL Database.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message || 'Unable to connect to Supabase.'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySQL = () => {
    const sqlScript = `-- Supabase Schema DDL is located at /supabase/schema.sql in the project workspace.
-- Open /supabase/schema.sql in your code editor or run it directly in Supabase SQL Editor.`;
    navigator.clipboard.writeText(sqlScript);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white shadow-xl space-y-3 border border-emerald-800/40">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
              <Database className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white flex items-center gap-2">
                Supabase PostgreSQL Backend
                {isConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                    Credentials Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300">
                Full-stack PostgreSQL integration, Supabase Auth, Row Level Security, Storage Buckets, and real-time synchronization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Connection Credentials Form */}
      <form onSubmit={handleSaveCredentials} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" /> API Keys & Project Endpoint
        </h4>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <textarea
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            Keys entered here persist to your local workspace environment.
          </p>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition"
          >
            Save Credentials
          </button>
        </div>
      </form>

      {/* PostgreSQL Schema Overview & SQL Script Access */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" /> Complete Schema DDL Script (/supabase/schema.sql)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Includes 18 SQL Tables, 4 Storage Buckets, 8 SQL Views, Triggers, & RLS Policies.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopySQL}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {sqlCopied ? 'Copied Path!' : 'Copy Script Path'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] uppercase font-black text-slate-400">Tables</span>
            <span className="text-base font-black text-slate-900 dark:text-white">18 PostgreSQL Tables</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] uppercase font-black text-slate-400">Security</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">RLS Policies Enabled</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] uppercase font-black text-slate-400">Buckets</span>
            <span className="text-base font-black text-slate-900 dark:text-white">4 Storage Buckets</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] uppercase font-black text-slate-400">Reporting</span>
            <span className="text-base font-black text-slate-900 dark:text-white">8 SQL Analytics Views</span>
          </div>
        </div>
      </div>
    </div>
  );
};
