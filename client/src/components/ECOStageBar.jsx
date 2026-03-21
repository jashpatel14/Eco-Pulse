// ECOStageBar — horizontal stage pipeline with status dots (Screen 10/11)
import { motion } from 'framer-motion';

export default function ECOStageBar({ stages = [], currentStageId, ecoStatus }) {
  if (!stages.length) return null;

  const currentIdx = stages.findIndex(s => s.id === currentStageId);

  return (
    <div className="eco-stage-bar" style={{ 
      display: 'flex', gap: '0', alignItems: 'center', width: '100%',
      padding: '16px 0'
    }}>
      {stages.map((stage, idx) => {
        const isPast = idx < currentIdx || ecoStatus === 'APPLIED';
        const isCurrent = stage.id === currentStageId && ecoStatus !== 'APPLIED';
        
        return (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: idx < stages.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Dot Wrapper with Pulse */}
              <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isCurrent && (
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--brand)' }}
                  />
                )}
                <div style={{ 
                  width: '12px', height: '12px', borderRadius: '50%',
                  backgroundColor: isPast ? '#059669' : (isCurrent ? 'var(--brand)' : '#dee2e6'),
                  zIndex: 2, border: '2px solid white', boxSizing: 'content-box'
                }} />
              </div>
              
              <span style={{ 
                position: 'absolute', top: '28px', fontSize: '0.72rem', 
                fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}>
                {stage.name}
              </span>
            </div>

            {idx < stages.length - 1 && (
              <div style={{ 
                height: '2px', flex: 1, margin: '0 8px',
                backgroundColor: isPast ? '#059669' : '#dee2e6',
                borderRadius: '1px'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
