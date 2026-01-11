import React from 'react';

export function Chip({ label }: { label: string }) {
  return (
    <span className="bg-slate-100 px-2 py-1 rounded text-xs">
      {label}
    </span>
  );
}