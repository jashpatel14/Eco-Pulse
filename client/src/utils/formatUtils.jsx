import React from 'react';

/**
 * Formats audit log newValue/oldValue strings into human-readable React elements.
 * Detects JSON and renders it as a series of styled chips.
 */
export const formatLogDetail = (val) => {
  if (!val) return <span className="text-dim">—</span>;
  
  let obj;
  try {
    // Attempt to parse if string, otherwise use as is if already object
    obj = typeof val === 'string' ? JSON.parse(val) : val;
  } catch (e) {
    // Fallback for non-JSON strings
    return <span style={{ fontSize: '0.85rem' }}>{val}</span>;
  }

  // If it's a valid object, render as key-value badges
  if (obj && typeof obj === 'object') {
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Object.entries(obj).map(([k, v]) => (
          <span key={k} className="chip" style={{ 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)',
            color: 'var(--text-main)',
            borderRadius: '6px'
          }}>
            <strong style={{ color: 'var(--brand)', textTransform: 'capitalize' }}>
              {k.replace(/([A-Z])/g, ' $1').toLowerCase()}:
            </strong> {String(v)}
          </span>
        ))}
      </div>
    );
  }

  // Fallback for primitives or nulls that passed JSON.parse (e.g. "123")
  return <span style={{ fontSize: '0.85rem' }}>{String(val)}</span>;
};
