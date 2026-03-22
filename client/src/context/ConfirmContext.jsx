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
          <div className="modal-overlay" onClick={modal.onCancel} style={{ zIndex: 3000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div 
              className="modal-box confirm-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{ overflow: 'hidden', padding: 0, borderRadius: '24px', background: 'white', boxShadow: 'var(--shadow-lg)', width: '90%', maxWidth: '400px' }}
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

                <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <AnimatedButton variant="outline" onClick={modal.onCancel} style={{ minWidth: '100px' }}>
                    {modal.cancelText}
                  </AnimatedButton>
                  <AnimatedButton 
                    variant={modal.type === 'danger' ? 'danger' : 'primary'} 
                    onClick={modal.onConfirm}
                    style={{ minWidth: '120px' }}
                  >
                    {modal.confirmText}
                  </AnimatedButton>
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
