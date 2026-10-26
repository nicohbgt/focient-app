'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../lib/auth-client.js';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      authClient.setSession(data.token, data.user);
      router.push('/today');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authClient.getGoogleOAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-card p-8 rounded-xl border border-neutral-border shadow-focient-2">
        <div className="text-center mb-6">
          <div className="inline-block w-3 h-3 rounded-full bg-focus mb-2"></div>
          <h2 className="text-2xl font-semibold text-neutral-text">Welcome to FoCient</h2>
          <p className="text-sm text-neutral-text/70 mt-1">Focus & Guilt-Free Productivity</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-warning-subtle border border-warning-border text-warning-text text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-text mb-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full px-3 py-2 text-sm border border-neutral-border rounded-lg bg-neutral-canvas focus:outline-none focus:border-focus"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-text mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-neutral-border rounded-lg bg-neutral-canvas focus:outline-none focus:border-focus"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-focus hover:bg-focus-hover text-white text-sm font-semibold rounded-lg shadow-focient-1 transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-neutral-border"></div>
          <span className="px-3 text-xs text-neutral-text/50 font-medium">or continue with</span>
          <div className="flex-1 border-t border-neutral-border"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 bg-neutral-card hover:bg-neutral-muted border border-neutral-border text-neutral-text text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-focient-1"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Sign-In
        </button>

        <p className="mt-6 text-center text-xs text-neutral-text/70">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-focus font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
