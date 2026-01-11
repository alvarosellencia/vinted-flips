import React from 'react';

export function PageShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      </header>
      {children}
    </main>
  );
}