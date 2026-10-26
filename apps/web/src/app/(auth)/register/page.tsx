'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../lib/auth-client.js';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      authClient.setSession(data.token, data.user);
      router.push('/onboarding');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-card p-8 rounded-xl border border-neutral-border shadow-focient-2">
        <div className="text-center mb-6">
          <div className="inline-block w-3 h-3 rounded-full bg-efficient mb-2"></div>
          <h2 className="text-2xl font-semibold text-neutral-text">Create Account</h2>
          <p className="text-sm text-neutral-text/70 mt-1">Start your guilt-free focus journey</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-warning-subtle border border-warning-border text-warning-text text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-text mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Doe"
              required
              className="w-full px-3 py-2 text-sm border border-neutral-border rounded-lg bg-neutral-canvas focus:outline-none focus:border-focus"
            />
          </div>

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
              minLength={6}
              className="w-full px-3 py-2 text-sm border border-neutral-border rounded-lg bg-neutral-canvas focus:outline-none focus:border-focus"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-focus hover:bg-focus-hover text-white text-sm font-semibold rounded-lg shadow-focient-1 transition-colors"
          >
            {loading ? 'Creating Account...' : 'Continue to Onboarding'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-text/70">
          Already have an account?{' '}
          <Link href="/login" className="text-focus font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
