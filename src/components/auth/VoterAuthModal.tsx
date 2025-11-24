'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface VoterAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VoterAuthModal({ isOpen, onClose, onSuccess }: VoterAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        // Register new user with email and password
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Registration failed';

          // Log detailed error in development
          if (data.details) {
            console.error('Registration error details:', data.details);
          }

          // If user already registered, auto-switch to login mode
          if (errorMsg.includes('already registered') || data.details?.includes('already registered')) {
            setError('This email is already registered. Switching to sign in...');
            setLoading(false);

            // Auto-switch to login mode after a short delay
            setTimeout(() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }, 1500);
            return;
          }

          setError(errorMsg);
          setLoading(false);
          return;
        }

        setSuccess('Account created successfully! You are now signed in.');
        setLoading(false);

        // Call onSuccess callback to refresh auth state
        if (onSuccess) {
          onSuccess();
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        // Sign in with email and password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);

          let errorMessage = signInError.message;

          if (signInError.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (signInError.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email address before signing in.';
          }

          setError(errorMessage);
          setLoading(false);
          return;
        }

        setSuccess('Successfully signed in!');
        setLoading(false);

        // Call onSuccess callback to refresh auth state
        if (onSuccess) {
          onSuccess();
        }

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === 'login' ? 'Sign In to Vote' : 'Create Account to Vote'}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          {mode === 'login'
            ? 'Enter your email and password to sign in'
            : 'Create an account with email and password'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-blue-400 hover:text-blue-300 font-medium"
              disabled={loading}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
