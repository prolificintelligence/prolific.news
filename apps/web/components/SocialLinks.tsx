import React from 'react';
import { SOCIAL_LINKS } from '../lib/site';

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.key}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer me"
          className={`${s.className} text-white hover:opacity-90 transition ${className}`}
        >
          {s.label}
        </a>
      ))}
    </>
  );
}
