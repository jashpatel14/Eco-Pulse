import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitMerge, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Globe, 
  Zap, 
  Cpu
} from 'lucide-react';
import AnimatedButton from '../../components/AnimatedButton';

const brand = 'var(--brand)';
const brandGlow = 'hsla(160, 84%, 38%, 0.35)';

const FEATURES = [
  { 
    icon: <GitMerge size={24} />, 
    title: 'Version Controlled BOMs', 
    desc: 'Git-like workflows for hardware. Branch, merge, and track changes with immutable history.' 
  },
  { 
    icon: <ShieldCheck size={24} />, 
    title: 'Enterprise Governance', 
    desc: 'Multi-stage approval workflows and strict RBAC to ensure compliance and data integrity.' 
  },
  { 
    icon: <Layers size={24} />, 
    title: 'Unified Component Library', 
    desc: 'Manage parts, documents, and revisions in a single source of truth across all products.' 
  },
];

const LOGOS = ['NVIDIA', 'TESLA', 'SPACEX', 'APPLE', 'MICROSOFT']; // Mock logos

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      backgroundColor: '#fcfcfd', 
      minHeight: '100vh', 
      color: 'var(--text-main)', 
      fontFamily: "'Poppins', sans-serif", 
      position: 'relative', 
      overflowX: 'hidden' 
    }}>
      
      {/* ─── Fluid Background Elements ─── */}
      <div style={{ 
        position: 'absolute', top: '-10%', left: '10%', width: '80%', height: '60%', 
        background: 'radial-gradient(circle, hsla(160, 84%, 38%, 0.08) 0%, transparent 70%)', 
        filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' 
      }} />
      <div style={{ 
        position: 'absolute', top: '20%', right: '-5%', width: '40%', height: '50%', 
        background: 'radial-gradient(circle, hsla(210, 100%, 50%, 0.05) 0%, transparent 70%)', 
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' 
      }} />

      {/* ─── Navigation ─── */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '16px 8%', position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(252, 252, 253, 0.7)', backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(0,0,0,0.05)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/logo.png" alt="EcoPulse" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>EcoPulse</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['Products', 'Features', 'Pricing'].map(item => (
            <motion.span 
              key={item}
              whileHover={{ color: 'var(--brand)', y: -1 }}
              style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-dim)', cursor: 'pointer', transition: 'color 0.2s' }}
            >
              {item}
            </motion.span>
          ))}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px' }}>
            <AnimatedButton variant="outline" onClick={() => navigate('/login')} size="sm" style={{ padding: '8px 20px' }}>Log in</AnimatedButton>
            <AnimatedButton onClick={() => navigate('/register')} size="sm" style={{ padding: '8px 20px' }}>Get Started</AnimatedButton>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ 
        padding: '100px 5% 40px', textAlign: 'center', position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ 
            marginBottom: '28px', padding: '8px 18px', borderRadius: '100px', 
            background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.8px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)', animation: 'pulse 2s infinite' }} />
          NEXT-GEN HARDWARE CONTROL
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ 
            fontSize: 'max(4.5vw, 42px)', fontWeight: 800, lineHeight: 1.2, 
            marginBottom: '28px', letterSpacing: '-1.5px', maxWidth: '900px',
            padding: '10px 0'
          }}
        >
          Hardware Engineering.<br />
          <span style={{ 
            display: 'inline-block',
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            paddingRight: '10px'
          }}>
            Accelerated & Controlled.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ 
            fontSize: '1.25rem', color: 'var(--text-dim)', lineHeight: 1.6, 
            maxWidth: '640px', marginBottom: '48px', fontWeight: 400
          }}
        >
          The first PLM platform built for velocity. Manage revisions, track ECOs, and maintain a strict source of truth for your physical products.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ display: 'flex', gap: '20px' }}
        >
          <AnimatedButton onClick={() => navigate('/register')} style={{ padding: '18px 40px', fontSize: '1.1rem', borderRadius: '14px' }}>
            Get Started Free <ArrowRight size={22} style={{ marginLeft: 10 }} />
          </AnimatedButton>
          <AnimatedButton variant="outline" style={{ padding: '18px 40px', fontSize: '1.1rem', gap: 10, borderRadius: '14px' }}>
            <Play size={20} fill="currentColor" /> Watch the Flow
          </AnimatedButton>
        </motion.div>

        {/* ─── Product Mockup ─── */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
           style={{ 
             marginTop: '80px', width: '100%', maxWidth: '1000px', 
             position: 'relative'
           }}
        >
          {/* Browser-like frame */}
          <div style={{
            background: 'white', padding: '8px', borderRadius: '20px',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.18), 0 18px 36px -18px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}>
            <div style={{
              height: '32px', background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px',
              borderTopLeftRadius: '14px', borderTopRightRadius: '14px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
            </div>
            <img 
              src="/images/mockup.png" 
              alt="Dashboard Mockup" 
              style={{ width: '100%', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', display: 'block' }} 
            />
          </div>
          {/* Glow effect */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '80%', height: '80%', background: 'var(--brand)', opacity: 0.15,
            filter: 'blur(100px)', zIndex: -1
          }} />
        </motion.div>
      </section>

      {/* ─── Logo Cloud ─── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
         <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '32px' }}>
           POWERING THE NEXT WAVE OF INNOVATION
         </p>
         <div style={{ 
           display: 'flex', justifyContent: 'center', gap: '60px', opacity: 0.5, grayscale: 1, 
           flexWrap: 'wrap', padding: '0 5%'
         }}>
           {LOGOS.map(logo => (
             <span key={logo} style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-muted)' }}>{logo}</span>
           ))}
         </div>
      </section>

      {/* ─── Features grid ─── */}
      <section style={{ padding: '100px 8%', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>Built for fast-moving teams.</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Everything you need to manage complex hardware lifecycles.</p>
        </div>

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px', maxWidth: '1200px', margin: '0 auto' 
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              style={{ 
                padding: '40px', borderRadius: '32px', background: '#fcfcfd',
                border: '1px solid rgba(0,0,0,0.05)', transition: 'box-shadow 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '16px', background: 'var(--brand)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px', boxShadow: `0 8px 20px ${brandGlow}`
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section style={{ padding: '100px 8%' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          borderRadius: '48px', padding: '80px 40px', textAlign: 'center', color: 'white',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px' }}>
              Scale your hardware production today.
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              EcoPulse helps you ship faster with fewer errors. Join the future of PLM.
            </p>
            <AnimatedButton style={{ background: 'white', color: 'var(--brand)', padding: '18px 40px', fontSize: '1.1rem' }}>
              Get Started for Free
            </AnimatedButton>
          </div>
          {/* Background decoration */}
          <div style={{ 
            position: 'absolute', bottom: '-20%', right: '-10%', width: '40%', height: '80%', 
            background: 'white', opacity: 0.05, borderRadius: '50%', filter: 'blur(100px)'
          }} />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '60px 8%', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <img src="/logo.png" alt="EcoPulse" style={{ width: '28px', height: '28px' }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>EcoPulse</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '240px' }}>
              The modern hardware control plane for distributed engineering teams.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Product</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Features</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Pricing</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Changelog</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Company</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>About</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Careers</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Privacy</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <span>© 2026 EcoPulse PLM Inc. Hardware is hard. We make it easier.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Globe size={16} /> Twitter | LinkedIn | GitHub
          </div>
        </div>
      </footer>
    </div>
  );
}
