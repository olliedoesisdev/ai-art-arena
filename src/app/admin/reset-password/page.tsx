'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Exchange the code from URL for a session
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // Supabase sends the token in the URL hash or as a query parameter
    if (hash || searchParams.has('code')) {
      // The Supabase client will automatically handle the token exchange
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setValidToken(true);
        } else {
          // Give it a moment for the session to be established
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
              if (retrySession) {
                setValidToken(true);
              } else {
                setError('Invalid or expired reset link. Please request a new one.');
              }
            });
          }, 1000);
        }
      });
    } else {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [supabase.auth]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Art Arena</h1>
          <p className="text-slate-400">Admin Portal</p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>

          {!validToken && !success ? (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 font-medium mb-2">Invalid Reset Link</p>
                <p className="text-slate-300 text-sm">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <Link
                href="/admin/forgot-password"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
              >
                Request New Reset Link
              </Link>

              <Link
                href="/admin/login"
                className="block text-center text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                ← Back to Sign In
              </Link>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-400 font-medium mb-2">Password reset successful!</p>
                <p className="text-slate-300 text-sm">
                  Your password has been updated. You will be redirected to the login page shortly.
                </p>
              </div>

              <Link
                href="/admin/login"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <p className="text-slate-500 text-xs mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>

              {/* Back Link */}
              <Link
                href="/admin/login"
                className="block text-center text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                ← Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
