import React from 'react';
import { User, GitCommit } from 'lucide-react';

const BlameRow = ({ data }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '240px 100px 1fr',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border-light)',
      background: 'white',
      transition: 'background 0.2s',
      fontSize: '0.9rem'
    }} className="blame-row-hover">
      
      {/* WHO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: 'var(--brand-soft)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={16} color="var(--brand)" />
        </div>
        <span style={{ fontWeight: 500 }}>{data.lastChangedBy}</span>
      </div>

      {/* VERSION */}
      <div>
        <span className="plm-version-badge">{data.lastChangedVersion}</span>
      </div>

      {/* WHAT / ECO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{data.componentName || data.field}: {data.currentValue}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>via {data.lastChangedECO}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {new Date(data.lastChangedAt).toLocaleDateString()}
        </span>
      </div>

    </div>
  );
};

export default BlameRow;
