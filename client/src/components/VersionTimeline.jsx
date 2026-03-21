import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const VersionTimeline = ({ history }) => {
  return (
    <div className="version-timeline" style={{ position: 'relative', paddingLeft: '32px' }}>
      {/* The vertical line */}
      <div style={{
        position: 'absolute', left: '11px', top: '10px', bottom: '10px',
        width: '2px', background: 'var(--border-light)', zIndex: 0
      }} />

      {history.map((v, i) => {
        const isLatest = v.status === 'ACTIVE';
        const dotColor = v.ecoType === 'BOM' ? 'var(--brand)' : v.ecoType === 'PRODUCT' ? '#fbbf24' : '#94a3b8';

        return (
          <div key={v.versionNumber} className="timeline-item" style={{ 
            position: 'relative', marginBottom: '32px', zIndex: 1 
          }}>
            {/* The Dot */}
            <div style={{
              position: 'absolute', left: '-26px', top: '4px',
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: 'white', border: `3px solid ${dotColor}`,
              boxShadow: isLatest ? `0 0 0 4px var(--brand-glow)` : 'none'
            }} />

            <div className="timeline-content" style={{
              background: 'white', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)', padding: '16px',
              boxShadow: isLatest ? 'var(--shadow-md)' : 'var(--shadow-xs)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="plm-version-badge" style={{ fontSize: '0.8rem' }}>{v.label}</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{v.ecoTitle}</h4>
                </div>
                {isLatest && (
                  <span style={{ 
                    fontSize: '0.7rem', fontWeight: 700, background: 'var(--brand-soft)', 
                    color: 'var(--brand)', padding: '2px 8px', borderRadius: '99px'
                  }}>ACTIVE</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>By <strong>{v.createdBy}</strong></span>
                <span>•</span>
                <span>{new Date(v.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VersionTimeline;
