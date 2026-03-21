import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import CustomSelect from '../../components/CustomSelect';

export default function ECODraftBOM() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [eco, setEco] = useState(null);
  const [bom, setBom] = useState(null);
  
  const [components, setComponents] = useState([]);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: ecoData } = await api.get(`/ecos/${id}`);
        if (ecoData.ecoType !== 'BOM') {
          addToast('Not a BOM ECO.', 'error');
          return navigate('/ecos');
        }
        setEco(ecoData);
        
        const { data: bomData } = await api.get(`/boms/${ecoData.bomId}`);
        setBom(bomData);

        // Compute current draft state
        let currentComps = [...bomData.components];
        let currentOps = [...bomData.operations];

        ecoData.draftChanges?.forEach(c => {
          if (c.recordType === 'BOM_COMPONENT') {
            if (c.fieldName === 'ADD') {
              currentComps.push(JSON.parse(c.newValue));
            } else if (c.fieldName === 'REMOVE') {
              currentComps = currentComps.filter(comp => comp.componentName !== c.recordId);
            } else if (c.fieldName === 'UPDATE') {
              const updatedData = JSON.parse(c.newValue);
              currentComps = currentComps.map(comp => 
                comp.componentName === c.recordId ? { ...comp, ...updatedData } : comp
              );
            }
          } else if (c.recordType === 'BOM_OPERATION') {
            if (c.fieldName === 'ADD') {
              currentOps.push(JSON.parse(c.newValue));
            } else if (c.fieldName === 'REMOVE') {
              currentOps = currentOps.filter(op => op.operationName !== c.recordId);
            } else if (c.fieldName === 'UPDATE') {
              const updatedData = JSON.parse(c.newValue);
              currentOps = currentOps.map(op => 
                op.operationName === c.recordId ? { ...op, ...updatedData } : op
              );
            }
          }
        });

        // Add a temporary local ID for mapping if missing
        setComponents(currentComps.map(c => ({ ...c, _id: c.id || Math.random().toString() })));
        setOperations(currentOps.map(o => ({ ...o, _id: o.id || Math.random().toString() })));
      } catch (err) {
        addToast('Failed to load data.', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, addToast]);

  const handleCompChange = (idx, field, val) => {
    const newC = [...components];
    newC[idx][field] = val;
    setComponents(newC);
  };

  const handleOpChange = (idx, field, val) => {
    const newO = [...operations];
    newO[idx][field] = val;
    setOperations(newO);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const changes = [];
      const origComps = bom.components || [];
      const origOps = bom.operations || [];

      // Diff Components
      const origCompMap = new Map(origComps.map(c => [c.componentName, c]));
      const newCompMap = new Map(components.filter(c => c.componentName).map(c => [c.componentName, c]));

      origComps.forEach(oc => {
        if (!newCompMap.has(oc.componentName)) {
          changes.push({ recordType: 'BOM_COMPONENT', fieldName: 'REMOVE', recordId: oc.componentName, oldValue: JSON.stringify(oc), newValue: '' });
        } else {
          const nc = newCompMap.get(oc.componentName);
          const needsUpdate = parseFloat(oc.quantity) !== parseFloat(nc.quantity) || oc.makeOrBuy !== nc.makeOrBuy || oc.supplier !== nc.supplier || oc.unitCost !== nc.unitCost;
          if (needsUpdate) {
            changes.push({ recordType: 'BOM_COMPONENT', fieldName: 'UPDATE', recordId: oc.componentName, oldValue: JSON.stringify(oc), newValue: JSON.stringify({ quantity: parseFloat(nc.quantity), makeOrBuy: nc.makeOrBuy, supplier: nc.supplier, unitCost: nc.unitCost ? parseFloat(nc.unitCost) : null }) });
          }
        }
      });
      components.forEach(nc => {
        if (nc.componentName && !origCompMap.has(nc.componentName)) {
          changes.push({ recordType: 'BOM_COMPONENT', fieldName: 'ADD', recordId: nc.componentName, oldValue: '', newValue: JSON.stringify({ componentName: nc.componentName, quantity: parseFloat(nc.quantity), makeOrBuy: nc.makeOrBuy, supplier: nc.supplier, unitCost: nc.unitCost ? parseFloat(nc.unitCost) : null }) });
        }
      });

      // Diff Operations
      const origOpMap = new Map(origOps.map(o => [o.operationName, o]));
      const newOpMap = new Map(operations.filter(o => o.operationName).map(o => [o.operationName, o]));

      origOps.forEach(oo => {
        if (!newOpMap.has(oo.operationName)) {
          changes.push({ recordType: 'BOM_OPERATION', fieldName: 'REMOVE', recordId: oo.operationName, oldValue: JSON.stringify(oo), newValue: '' });
        } else {
          const no = newOpMap.get(oo.operationName);
          const needsUpdate = parseInt(oo.durationMins) !== parseInt(no.durationMins) || oo.workCenter !== no.workCenter;
          if (needsUpdate) {
            changes.push({ recordType: 'BOM_OPERATION', fieldName: 'UPDATE', recordId: oo.operationName, oldValue: JSON.stringify(oo), newValue: JSON.stringify({ durationMins: parseInt(no.durationMins), workCenter: no.workCenter }) });
          }
        }
      });
      operations.forEach(no => {
        if (no.operationName && !origOpMap.has(no.operationName)) {
          changes.push({ recordType: 'BOM_OPERATION', fieldName: 'ADD', recordId: no.operationName, oldValue: '', newValue: JSON.stringify({ operationName: no.operationName, durationMins: parseInt(no.durationMins), workCenter: no.workCenter }) });
        }
      });

      await api.patch(`/ecos/${id}/changes`, { changes });
      addToast('Draft changes saved successfully.', 'success');
      navigate(`/ecos/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="plm-page"><div className="spinner"></div></div>;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton label="Back to ECO" />
          <h1 className="page-title"><FileText size={22} style={{ display:'inline', marginRight: 8 }} />Edit BOM Draft</h1>
          <p className="page-desc">Drafting changes for ECO: {eco?.title}</p>
        </div>
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="section-title">Components</div>
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table className="plm-table">
              <thead><tr><th>Name</th><th>Quantity</th><th>Make/Buy</th><th>Supplier</th><th>Unit Cost (₹)</th><th>Action</th></tr></thead>
              <tbody>
                {components.map((c, idx) => (
                  <tr key={c._id}>
                    <td><input className="plm-input" value={c.componentName || ''} onChange={e => handleCompChange(idx, 'componentName', e.target.value)} required placeholder="e.g. Screw" /></td>
                    <td><input className="plm-input" type="number" step="0.01" value={c.quantity || ''} onChange={e => handleCompChange(idx, 'quantity', e.target.value)} required /></td>
                    <td>
                      <CustomSelect 
                        value={c.makeOrBuy || 'BUY'} 
                        onChange={val => handleCompChange(idx, 'makeOrBuy', val)}
                        options={[
                          { value: 'BUY', label: 'Buy' },
                          { value: 'MAKE', label: 'Make' }
                        ]}
                      />
                    </td>
                    <td><input className="plm-input" placeholder="Supplier..." value={c.supplier || ''} onChange={e => handleCompChange(idx, 'supplier', e.target.value)} /></td>
                    <td><input className="plm-input" type="number" step="0.01" placeholder="₹0.00" value={c.unitCost || ''} onChange={e => handleCompChange(idx, 'unitCost', e.target.value)} /></td>
                    <td><button type="button" className="btn-icon" style={{ color: 'var(--status-danger)' }} onClick={() => setComponents(components.filter((_, i) => i !== idx))}><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setComponents([...components, { _id: Math.random().toString(), componentName: '', quantity: 1, makeOrBuy: 'BUY' }])}>
              <Plus size={14} /> Add Component
            </button>
          </div>

          <div className="section-title">Operations</div>
          <div className="table-wrap">
            <table className="plm-table">
              <thead><tr><th>Operation Name</th><th>Duration (Mins)</th><th>Work Center</th><th>Action</th></tr></thead>
              <tbody>
                {operations.map((o, idx) => (
                  <tr key={o._id}>
                    <td><input className="plm-input" value={o.operationName || ''} onChange={e => handleOpChange(idx, 'operationName', e.target.value)} required placeholder="e.g. Assembly" /></td>
                    <td><input className="plm-input" type="number" value={o.durationMins || ''} onChange={e => handleOpChange(idx, 'durationMins', e.target.value)} required /></td>
                    <td><input className="plm-input" value={o.workCenter || ''} onChange={e => handleOpChange(idx, 'workCenter', e.target.value)} required placeholder="e.g. WS-01" /></td>
                    <td><button type="button" className="btn-icon" style={{ color: 'var(--status-danger)' }} onClick={() => setOperations(operations.filter((_, i) => i !== idx))}><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setOperations([...operations, { _id: Math.random().toString(), operationName: '', durationMins: 10, workCenter: '' }])}>
              <Plus size={14} /> Add Operation
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingBottom: 24 }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-plm" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Draft'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
