import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to, label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handlePress = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      onClick={handlePress}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.96 }}
      className={`btn-back-modern ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        color: 'var(--text-main)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s var(--ease)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px'
      }}
    >
      <motion.div
        initial={{ x: 0 }}
        whileHover={{ x: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <ArrowLeft size={16} color="var(--brand)" strokeWidth={2.5} />
      </motion.div>
      <span>{label}</span>
    </motion.button>
  );
}
