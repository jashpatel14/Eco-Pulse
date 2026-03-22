import React from 'react';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '' }) {
  return (
    <div 
      className={`animate-shimmer ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius, 
        backgroundColor: 'var(--bg-input)',
        overflow: 'hidden'
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <Skeleton width="40px" height="40px" borderRadius="50%" className="mb-4" />
      <Skeleton width="60%" height="24px" className="mb-2" />
      <Skeleton width="40%" height="16px" />
    </div>
  );
}
