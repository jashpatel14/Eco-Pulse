import React from 'react';
import { Plus, Minus, RefreshCcw, Equal } from 'lucide-react';

const DiffTable = ({ data, title }) => {
  if (!data || data.length === 0) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'added': return { bg: '#ecfdf5', icon: <Plus size={14} color="#059669" />, prefix: '+', color: '#059669' };
      case 'removed': return { bg: '#fff1f2', icon: <Minus size={14} color="#e11d48" />, prefix: '-', color: '#e11d48' };
      case 'changed': return { bg: '#fffbeb', icon: <RefreshCcw size={14} color="#d97706" />, prefix: '~', color: '#d97706' };
      default: return { bg: 'transparent', icon: <Equal size={14} color="#94a3b8" />, prefix: '=', color: 'var(--text-muted)' };
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>{title}</h3>
      <div className="table-wrap" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <table className="plm-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Name / Field</th>
              <th>Status</th>
              <th>From</th>
              <th>To</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const style = getStatusStyle(item.status);
              return (
                <tr key={idx} style={{ backgroundColor: style.bg }}>
                  <td>{style.icon}</td>
                  <td><strong>{item.name || item.field}</strong></td>
                  <td style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: style.color }}>{item.status}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.fromValue}</td>
                  <td><strong>{item.toValue}</strong></td>
                  <td style={{ fontWeight: 600, color: style.color }}>
                    {style.prefix} {item.change || ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiffTable;
