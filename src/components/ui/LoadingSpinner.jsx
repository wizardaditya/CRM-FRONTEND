import React from 'react';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-slate-700 border-t-primary-500 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
