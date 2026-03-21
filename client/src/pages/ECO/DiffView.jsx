export default function DiffView({ eco }) {
  if (!eco || !eco.draftChanges || eco.draftChanges.length === 0) {
    return <div className="empty-state"><p>No draft changes to display.</p></div>;
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <h2 className="section-title">Changes (Diff)</h2>
      <div className="table-wrap">
        <table className="plm-table">
          <thead>
            <tr>
              <th>Record Type</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {eco.draftChanges.map(change => {
              let oldVal = change.oldValue || '—';
              let newVal = change.newValue || '—';
              
              if (change.fieldName === 'attachments') {
                try {
                  const oldParsed = JSON.parse(change.oldValue || '[]');
                  const newParsed = JSON.parse(change.newValue || '[]');
                  oldVal = Array.isArray(oldParsed) ? oldParsed.join(', ') : oldVal;
                  newVal = Array.isArray(newParsed) ? newParsed.join(', ') : newVal;
                } catch (e) {}
              }

              return (
                <tr key={change.id} style={{ cursor: 'default' }}>
                  <td><span className="chip">{change.recordType}</span></td>
                  <td>{change.fieldName}</td>
                  <td style={{ color: 'var(--status-danger)', textDecoration: 'line-through' }}>{oldVal}</td>
                  <td style={{ color: 'var(--status-success)' }}>{newVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
