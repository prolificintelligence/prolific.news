'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { authClient } from '../../lib/auth/client';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password });
      if (signInError) {
        setError('Invalid email or password.');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow p-8 space-y-5">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#002B49] flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-headline font-black text-xl uppercase tracking-wider text-[#002B49]">Newsroom Cockpit</h1>
          <p className="text-xs text-gray-600 mt-1">Authorized Prolific News staff only</p>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm font-normal normal-case focus:outline-none focus:border-[#002B49]"
          />
        </label>

        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm font-normal normal-case focus:outline-none focus:border-[#002B49]"
          />
        </label>

        {error && <p role="alert" className="text-xs font-semibold text-[#CC0000]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 text-white font-headline font-bold text-sm uppercase tracking-wider py-2.5 rounded transition"
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
