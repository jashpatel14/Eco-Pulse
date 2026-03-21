// DiffTable — shows BOM or Product diff between versions
import { ArrowRight } from 'lucide-react';

// BOM Diff Table
export function BOMDiffTable({ components = [], operations = [] }) {
  return (
    <div className="diff-section">
      <h4 className="diff-heading">Components</h4>
      <table className="diff-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Version 1 Qty</th>
            <th>Version 2 Qty</th>
            <th>Make/Buy</th>
            <th>Unit Cost</th>
            <th>Cost Impact</th>
          </tr>
        </thead>
        <tbody>
          {components.map((row, i) => {
            const impact = row.unitCost
              ? ((parseFloat(row.newQty || 0) - parseFloat(row.oldQty || 0)) * parseFloat(row.unitCost)).toFixed(2)
              : null;
            const rowClass = row.change === 'added'   ? 'diff-row-added'
                           : row.change === 'removed' ? 'diff-row-removed'
                           : 'diff-row-neutral';
            return (
              <tr key={i} className={rowClass}>
                <td>{row.componentName}</td>
                <td>{row.oldQty ?? '—'}</td>
                <td>{row.newQty ?? '—'}</td>
                <td>
                  <span className={`make-buy-badge ${(row.makeOrBuy || row.newMakeOrBuy) === 'MAKE' ? 'badge-make' : 'badge-buy'}`}>
                    {row.makeOrBuy || row.newMakeOrBuy || '—'}
                  </span>
                </td>
                <td>{row.unitCost ? `₹${parseFloat(row.unitCost).toFixed(2)}` : '—'}</td>
                <td className={impact > 0 ? 'impact-pos' : impact < 0 ? 'impact-neg' : ''}>
                  {impact !== null ? `₹${impact}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        {components.length > 0 && (
          <tfoot>
            <tr className="diff-total-row">
              <td colSpan={5}><strong>Total Cost Impact</strong></td>
              <td>
                <strong>
                  ₹{components
                    .filter(r => r.unitCost)
                    .reduce((acc, r) => {
                      const impact = ((parseFloat(r.newQty || 0) - parseFloat(r.oldQty || 0)) * parseFloat(r.unitCost));
                      return acc + impact;
                    }, 0)
                    .toFixed(2)}
                </strong>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {operations.length > 0 && (
        <>
          <h4 className="diff-heading mt-4">Operations</h4>
          <table className="diff-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Old Duration (min)</th>
                <th>New Duration (min)</th>
                <th>Work Center</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op, i) => {
                const changed = op.oldDurationMins !== op.newDurationMins;
                return (
                  <tr key={i} className={changed ? 'diff-row-changed' : 'diff-row-neutral'}>
                    <td>{op.operationName}</td>
                    <td>{op.oldDurationMins ?? '—'}</td>
                    <td>{op.newDurationMins ?? '—'}</td>
                    <td>{op.workCenter}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// Product Diff Table
export function ProductDiffTable({ rows = [] }) {
  return (
    <table className="diff-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Version 1</th>
          <th></th>
          <th>Version 2</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const changed = row.oldValue !== row.newValue;
          const isAttachment = row.field === 'Attachments';
          return (
            <tr key={i} className={changed ? 'diff-row-changed' : 'diff-row-neutral'}>
              <td><strong>{row.field}</strong></td>
              <td className={isAttachment ? 'att-old' : ''}>{row.oldValue ?? '—'}</td>
              <td><ArrowRight size={14} /></td>
              <td className={isAttachment ? 'att-new' : ''}>{row.newValue ?? '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
