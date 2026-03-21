import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitMerge, Layers, ShieldCheck, ArrowRight, GitBranch, BarChart3, Zap } from 'lucide-react';

const FEATURES_GRID = [
  {
    icon: <GitMerge size={26} />,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Git-Like ECO Workflows',
    desc: 'Propose draft changes to BOMs and Products without affecting master data until fully approved through every stage.',
  },
  {
    icon: <Layers size={26} />,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    title: 'BOM Version Control',
    desc: 'Maintain precise Bills of Materials. Automatically trace versions, components, operations, and suppliers across every revision.',
  },
  {
    icon: <ShieldCheck size={26} />,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    title: 'Strict Governance',
    desc: 'Customizable multi-stage approval workflows, granular Role-Based Access Control, and immutable audit logs.',
  },
];

const STATS = [
  { value: '100%', label: 'Audit trail coverage' },
  { value: '4', label: 'Role-based access levels' },
  { value: '∞', label: 'Version history depth' },
];

const fadeIn = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0f0a1a', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      
      {/* Global background glow orbs */}
      <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-200px', right: '-200px', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── Navigation ─── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 6%', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,10,26,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: 'white', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' }}>EP</div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</span>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>Product Lifecycle Management</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '9px 20px', borderRadius: '9px', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
            Log in
          </button>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', padding: '9px 22px', borderRadius: '9px', boxShadow: '0 4px 16px rgba(139,92,246,0.4)', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ padding: '100px 6% 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          <motion.div variants={fadeIn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '7px 16px', borderRadius: '100px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
            NEXT-GENERATION PLM PLATFORM
          </motion.div>

          <motion.h1 variants={fadeIn} style={{ fontSize: '4.2rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.04em', color: 'white' }}>
            Hardware Engineering,{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Version Controlled.</span>
          </motion.h1>

          <motion.p variants={fadeIn} style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '48px', maxWidth: '580px', margin: '0 auto 48px' }}>
            EcoPulse brings Git-like workflows to hardware teams. Track BOM changes, enforce multi-stage approvals, and ship with full audit confidence.
          </motion.p>

          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', padding: '15px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 28px rgba(139,92,246,0.45)', transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(139,92,246,0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.45)'; }}>
              Start for Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', padding: '15px 28px', borderRadius: '12px', transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: 'flex', gap: '0', justifyContent: 'center', marginTop: '72px', maxWidth: '520px', margin: '72px auto 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '24px 16px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features Grid ─── */}
      <section style={{ padding: '60px 6% 100px', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {FEATURES_GRID.map((f, i) => (
            <motion.div key={i} variants={fadeIn}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px', cursor: 'default', transition: 'all 0.3s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: f.bg, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '24px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'white', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section style={{ padding: '0 6% 100px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ maxWidth: '900px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', marginBottom: '16px' }}>
            Ready to take control of your<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>engineering changes?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', marginBottom: '36px' }}>
            Join your team on EcoPulse — the PLM platform built for precision.
          </p>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', padding: '15px 36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 28px rgba(139,92,246,0.4)', transition: 'all 0.25s', fontFamily: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Create Your Account <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '28px 6%', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '11px', color: 'white' }}>EP</div>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>EcoPulse PLM</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem', margin: 0 }}>© {new Date().getFullYear()} EcoPulse PLM. Engineered for hardware teams.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', fontWeight: 600 }}>All systems operational</span>
        </div>
      </footer>
    </div>
  );
}
