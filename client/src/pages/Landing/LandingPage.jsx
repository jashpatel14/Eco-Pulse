import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitMerge, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

const brand = 'var(--brand)';
const brandGlow = 'hsla(160, 84%, 38%, 0.35)';

const FEATURES = [
  { icon: <GitMerge size={26} />, color: brand, bg: 'hsla(160, 84%, 38%, 0.1)', title: 'Git-Like ECO Workflows', desc: 'Propose draft changes to BOMs and Products without affecting master data until fully approved through every stage.' },
  { icon: <Layers size={26} />, color: brand, bg: 'hsla(160, 84%, 38%, 0.1)', title: 'BOM Version Control', desc: 'Maintain precise Bills of Materials. Automatically trace versions, components, operations, and suppliers across every revision.' },
  { icon: <ShieldCheck size={26} />, color: brand, bg: 'hsla(160, 84%, 38%, 0.1)', title: 'Strict Governance', desc: 'Customizable multi-stage approval workflows, granular Role-Based Access Control, and immutable audit logs.' },
];

const STATS = [
  { value: '100%', label: 'Audit trail coverage' },
  { value: '4', label: 'Role-based access levels' },
  { value: '∞', label: 'Version history depth' },
];

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: 'var(--text-main)', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '-180px', left: '-180px', width: '550px', height: '550px', background: `radial-gradient(circle, ${brand}08 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-180px', right: '-180px', width: '600px', height: '600px', background: `radial-gradient(circle, ${brand}05 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* ─── Nav ─── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 6%', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Product Lifecycle Management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--border-light)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', padding: '9px 20px', borderRadius: '9px', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = brand; e.currentTarget.style.color = brand; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-dim)'; }}>
            Log in
          </button>
          <button onClick={() => navigate('/register')} style={{ background: brand, color: '#fff', border: 'none', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', padding: '9px 22px', borderRadius: '9px', boxShadow: `0 4px 16px ${brandGlow}`, transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ padding: '96px 6% 72px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <motion.div variants={fadeIn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px', padding: '7px 16px', borderRadius: '100px', background: `${brand}18`, border: `1px solid ${brand}40`, color: brand, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: brand }} />
            NEXT-GENERATION PLM PLATFORM
          </motion.div>

          <motion.h1 variants={fadeIn} style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.04em', color: 'var(--text-main)' }}>
            Hardware Engineering,{' '}
            <span style={{ color: brand }}>Version Controlled.</span>
          </motion.h1>

          <motion.p variants={fadeIn} style={{ fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 48px' }}>
            EcoPulse brings Git-like workflows to hardware teams. Track BOM changes, enforce multi-stage approvals, and ship with full audit confidence.
          </motion.p>

          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: brand, color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', padding: '15px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 8px 28px ${brandGlow}`, transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              Start for Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} style={{ background: 'var(--brand-soft)', color: brand, border: `1px solid ${brand}33`, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', padding: '15px 28px', borderRadius: '12px', transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.background = `${brand}15`; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--brand-soft)'; }}>
              Sign In
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.45 }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: '64px', maxWidth: '480px', margin: '64px auto 0', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '22px 12px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: brand }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '40px 6% 90px', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeIn}
              style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '34px', cursor: 'default', transition: 'all 0.3s', boxShadow: 'var(--shadow-sm)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = brand; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '22px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.7, fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '0 6% 90px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}
          style={{ maxWidth: '860px', margin: '0 auto', background: 'var(--brand-soft)', border: `1px solid ${brand}20`, borderRadius: '24px', padding: '56px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', marginBottom: '14px' }}>
            Ready to take control of your<br />
            <span style={{ color: brand }}>engineering changes?</span>
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginBottom: '32px' }}>Join your team on EcoPulse — the PLM platform built for precision.</p>
          <button onClick={() => navigate('/register')} style={{ background: brand, color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', padding: '15px 34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: `0 8px 26px ${brandGlow}`, transition: 'all 0.25s', fontFamily: 'inherit' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Create Your Account <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '24px 6%', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="EP" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>EcoPulse PLM</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>© {new Date().getFullYear()} EcoPulse PLM. Engineered for hardware teams.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>All systems operational</span>
        </div>
      </footer>
    </div>
  );
}
