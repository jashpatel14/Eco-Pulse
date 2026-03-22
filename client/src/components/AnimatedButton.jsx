import { motion } from 'framer-motion';

export default function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  variant = 'plm', 
  type = 'button',
  disabled = false,
  loading = false,
  ...props 
}) {
  const getVariantClass = () => {
    switch(variant) {
      case 'primary': return 'btn-primary';
      case 'ghost': return 'btn-ghost';
      case 'outline': return 'btn-outline';
      case 'success': return 'btn-success';
      case 'danger': return 'btn-danger';
      default: return 'btn-plm';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${getVariantClass()} ${className} ${loading ? 'animate-pulse-slow' : ''}`}
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="spinner-sm" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <span>Processing...</span>
        </div>
      ) : children}
    </motion.button>
  );
}
