import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    type: 'warning' // warning, danger, info
  });

  const confirm = useCallback(({ 
    title = 'Are you sure?', 
    message = '', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    type = 'warning' 
  }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setModal(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const close = () => setModal(prev => ({ ...prev, isOpen: false }));

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="modal-overlay" onClick={modal.onCancel} style={{ zIndex: 3000 }}>
            <motion.div 
              className="modal-box confirm-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              style={{ overflow: 'hidden', padding: 0, borderRadius: '24px' }}
            >
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                  <div className={`stat-icon-wrap ${modal.type === 'danger' ? 'stat-red' : 'stat-amber'}`} 
                       style={{ margin: 0, width: '48px', height: '48px', flexShrink: 0 }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>{modal.title}</h3>
                    <p className="text-dim" style={{ marginTop: '8px', fontSize: '0.92rem', lineHeight: 1.6 }}>{modal.message}</p>
                  </div>
                  <button onClick={modal.onCancel} className="btn-icon btn-sm" style={{ border: 'none', background: 'transparent' }}>
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-actions" style={{ marginTop: '32px' }}>
                  <button className="btn-outline" onClick={modal.onCancel} style={{ minWidth: '100px' }}>
                    {modal.cancelText}
                  </button>
                  <button 
                    className={modal.type === 'danger' ? 'btn-danger' : 'btn-plm'} 
                    onClick={modal.onConfirm}
                    style={{ minWidth: '120px' }}
                  >
                    {modal.confirmText}
                  </button>
                </div>
              </div>
              
              {/* Subtle bottom accent bar */}
              <div style={{ height: '4px', background: modal.type === 'danger' ? '#ef4444' : 'var(--brand)', width: '100%' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
