import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}