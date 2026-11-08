'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { authClient } from '../lib/auth/client';

export function SignOutButton() {
  const onClick = async () => {
    try {
      await authClient.signOut();
    } finally {
      window.location.href = '/sign-in';
    }
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11px] font-headline font-bold uppercase tracking-wider text-gray-300 hover:text-white transition"
    >
      <LogOut className="w-3.5 h-3.5" />
      Sign out
    </button>
  );
}
