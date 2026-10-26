'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../../lib/auth-client.js';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (!accessToken) {
      setError('No authorization token received from Google.');
      return;
    }

    // Exchange token with backend server
    fetch('http://localhost:4000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          authClient.setSession(data.token, data.user);
          router.push('/today');
        } else {
          setError(data.message || 'Google authentication failed.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error during Google callback.');
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center p-6 bg-neutral-card rounded-xl border border-neutral-border shadow-focient-1 max-w-sm">
        {error ? (
          <div>
            <p className="text-sm font-semibold text-warning mb-2">Notice</p>
            <p className="text-xs text-neutral-text/80 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-semibold px-4 py-2 bg-focus text-white rounded-lg"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="w-6 h-6 border-2 border-focus border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-neutral-text">Connecting your Google Account...</p>
          </div>
        )}
      </div>
    </div>
  );
}
