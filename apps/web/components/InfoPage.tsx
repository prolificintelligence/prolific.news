import React from 'react';

export function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-headline font-black text-3xl md:text-4xl uppercase tracking-tight text-[#002B49] border-b-4 border-[#CC0000] pb-3">
        {title}
      </h1>
      {intro && <p className="mt-4 text-lg text-gray-700 font-serif leading-relaxed">{intro}</p>}
      <div className="mt-6 space-y-5 text-gray-800 leading-relaxed [&_h2]:font-headline [&_h2]:font-black [&_h2]:uppercase [&_h2]:text-lg [&_h2]:text-[#002B49] [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#CC0000] [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
