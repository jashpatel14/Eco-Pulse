import { motion } from 'framer-motion';
import { MinusCircle, PlusCircle, AlertCircle, Package, Settings, FileText, ChevronRight } from 'lucide-react';

export default function DiffView({ eco }) {
  if (!eco || !eco.draftChanges || eco.draftChanges.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <p className="text-dim">No draft changes to display for this ECO.</p>
      </div>
    );
  }

  const isProductECO = eco.ecoType === 'PRODUCT';
  const isBOMECO = eco.ecoType === 'BOM';

  // Safe JSON Parsing Helper
  const safeParse = (val) => {
    if (!val || val === '—' || val === 'REMOVE') return null;
    try {
      return JSON.parse(val);
    } catch (e) {
      return null;
    }
  };

  // ─── Render Product Diff ─────────────────────────────────────────
  const renderProductDiff = () => {
    const fields = [
      { key: 'salePrice', label: 'Sale Price', icon: '₹' },
      { key: 'costPrice', label: 'Cost Price', icon: '₹' },
      { key: 'attachments', label: 'Attachments', icon: <Package size={16} /> }
    ];

    return (
      <div className="diff-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="diff-pane">
          <h3 className="section-subtitle" style={{ color: 'var(--text-dim)', marginBottom: 16 }}>Current State</h3>
          {fields.map(f => {
            const change = eco.draftChanges.find(c => c.fieldName === f.key);
            if (!change) return null;
            let val = change.oldValue || '—';
            if (f.key === 'attachments') {
                const parsed = safeParse(val);
                if (parsed && Array.isArray(parsed)) val = parsed.join(', ');
            }
            return (
              <div key={`old-${f.key}`} className="diff-card old">
                <div className="diff-card-label">{f.label}</div>
                <div className="diff-card-value strike">{val}</div>
              </div>
            );
          })}
        </div>
        <div className="diff-pane">
          <h3 className="section-subtitle" style={{ color: 'var(--status-success)', marginBottom: 16 }}>Proposed Changes</h3>
          {fields.map(f => {
            const change = eco.draftChanges.find(c => c.fieldName === f.key);
            if (!change) return null;
            let val = change.newValue || '—';
            if (f.key === 'attachments') {
                const parsed = safeParse(val);
                if (parsed && Array.isArray(parsed)) val = parsed.join(', ');
            }
            return (
              <div key={`new-${f.key}`} className="diff-card new">
                <div className="diff-card-label">{f.label}</div>
                <div className="diff-card-value">{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Render BOM Diff ─────────────────────────────────────────────
  const renderBOMDiff = () => {
    const compChanges = eco.draftChanges.filter(c => c.recordType === 'BOM_COMPONENT');
    const opChanges = eco.draftChanges.filter(c => c.recordType === 'BOM_OPERATION');

    const getStatusInfo = (fieldName) => {
      if (fieldName === 'ADD') return { label: 'Added', icon: <PlusCircle size={14} color="#10b981" />, class: 'status-add' };
      if (fieldName === 'REMOVE') return { label: 'Removed', icon: <MinusCircle size={14} color="#ef4444" />, class: 'status-remove' };
      return { label: 'Updated', icon: <AlertCircle size={14} color="#f59e0b" />, class: 'status-update' };
    };

    return (
      <div className="bom-diff-container">
        {compChanges.length > 0 && (
          <div className="diff-section" style={{ marginBottom: 32 }}>
            <h3 className="section-title"><Settings size={18} style={{ marginRight: 8 }} /> BOM Components</h3>
            <div className="table-wrap">
              <table className="plm-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Component Name</th>
                    <th>Old State</th>
                    <th style={{ width: 40 }}><ChevronRight size={16} /></th>
                    <th>New State</th>
                  </tr>
                </thead>
                <tbody>
                  {compChanges.map(c => {
                    const status = getStatusInfo(c.fieldName);
                    const oldData = safeParse(c.oldValue);
                    const newData = safeParse(c.newValue);

                    return (
                      <tr key={c.id} className={status.class}>
                        <td className="status-cell">
                          <span className="chip" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td className="font-medium">{c.recordId}</td>
                        <td className="old-val">
                          {oldData ? `${oldData.quantity} ${oldData.makeOrBuy}` : '—'}
                        </td>
                        <td><ChevronRight size={14} className="text-dim" /></td>
                        <td className="new-val">
                          {newData ? `${newData.quantity} ${newData.makeOrBuy}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {opChanges.length > 0 && (
          <div className="diff-section">
            <h3 className="section-title"><FileText size={18} style={{ marginRight: 8 }} /> Manufacturing Operations</h3>
            <div className="table-wrap">
              <table className="plm-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Operation</th>
                    <th>Current (Mins)</th>
                    <th style={{ width: 40 }}><ChevronRight size={16} /></th>
                    <th>New (Mins)</th>
                  </tr>
                </thead>
                <tbody>
                  {opChanges.map(c => {
                    const status = getStatusInfo(c.fieldName);
                    const oldData = safeParse(c.oldValue);
                    const newData = safeParse(c.newValue);

                    return (
                      <tr key={c.id} className={status.class}>
                         <td className="status-cell">
                          <span className="chip" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td className="font-medium">{c.recordId}</td>
                        <td className="old-val">{oldData ? oldData.durationMins : '—'}</td>
                        <td><ChevronRight size={14} className="text-dim" /></td>
                        <td className="new-val">{newData ? newData.durationMins : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {compChanges.length === 0 && opChanges.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p className="text-dim italic">This ECO has draft data, but it doesn't match BOM component or operation formats.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="diff-container"
    >
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div className="icon-box" style={{ background: 'var(--primary-gradient)', color: 'white' }}>
            {isProductECO ? <Package size={20} /> : <FileText size={20} />}
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Reviewing Draft Changes</h2>
            <p className="text-dim" style={{ fontSize: '0.85rem' }}>Comparing current master record with ECO proposed updates.</p>
          </div>
        </div>

        {isProductECO && renderProductDiff()}
        {isBOMECO && renderBOMDiff()}
      </div>

      <style>{`
        .diff-pane { background: rgba(255,255,255,0.3); padding: 16px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
        .diff-card { background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .diff-card.old { border-left-color: var(--status-danger); }
        .diff-card.new { border-left-color: var(--status-success); }
        .diff-card-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 4px; }
        .diff-card-value { font-size: 1.1rem; font-weight: 600; color: var(--text-main); }
        .diff-card-value.strike { text-decoration: line-through; opacity: 0.6; }
        
        .status-add { background-color: rgba(16, 185, 129, 0.05) !important; }
        .status-remove { background-color: rgba(239, 68, 68, 0.05) !important; }
        .status-update { background-color: rgba(245, 158, 11, 0.05) !important; }
        
        .old-val { color: var(--status-danger); text-decoration: line-through; }
        .new-val { color: var(--status-success); font-weight: 600; }
        .font-medium { font-weight: 500; }
        
        .icon-box { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}
