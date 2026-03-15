'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/admin');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      // Map username to email format used in Supabase
      const email = `${username}@usexpress.local`;
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        setError('Incorrect username or password.');
        setLoading(false);
        return;
      }

      router.replace('/admin');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="font-serif text-3xl text-[#F0EDE8]">
            UsExpress
          </span>
          <p className="text-[#F0EDE8]/40 text-sm font-sans mt-2 tracking-wide">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/50 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/70 transition-colors font-sans"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-sans font-600 uppercase tracking-[0.1em] text-[#F0EDE8]/50 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-[#F0EDE8] placeholder-[#F0EDE8]/25 focus:outline-none focus:border-[#1A6B4A]/70 transition-colors font-sans"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-sm font-sans">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1A6B4A] hover:bg-[#1A6B4A]/80 disabled:opacity-50 disabled:cursor-not-allowed text-[#F0EDE8] font-sans font-600 text-sm tracking-wide rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-center text-xs text-[#F0EDE8]/30 font-sans">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-[#F0EDE8]/60 hover:text-[#F0EDE8] transition-colors">
                Create account
              </a>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/home-page"
            className="text-xs text-[#F0EDE8]/30 hover:text-[#F0EDE8]/60 font-sans transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
