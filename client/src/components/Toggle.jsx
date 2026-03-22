import { motion } from 'framer-motion';

export default function Toggle({ enabled, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onChange(!enabled)}>
      <div 
        style={{ 
          width: '44px', 
          height: '24px', 
          backgroundColor: enabled ? 'var(--brand)' : 'var(--border-medium)', 
          borderRadius: '99px', 
          padding: '2px',
          transition: 'background-color 0.3s var(--ease)',
          position: 'relative'
        }}
      >
        <motion.div 
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: 'white', 
            borderRadius: '50%',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>
      {label && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>}
    </div>
  );
}
