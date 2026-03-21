import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitMerge, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const brandColor = '#ed8080';
  const textColor = '#1e293b';
  const textMuted = '#64748b';

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fdfbfb 0%, #f4f6f8 100%)', 
      minHeight: '100vh', 
      color: textColor, 
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration matching the soft aesthetic */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(237,128,128,0.08) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0, pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(237,128,128,0.05) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0, pointerEvents: 'none'
      }}></div>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '24px 5%', position: 'sticky', top: 0, zIndex: 50, 
        backdropFilter: 'blur(10px)', background: 'rgba(253, 251, 251, 0.7)',
        borderBottom: '1px solid rgba(0,0,0,0.03)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '10px', 
            background: brandColor, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px',
            boxShadow: '0 4px 10px rgba(237, 128, 128, 0.3)'
          }}>
            EP
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: textColor }}>
            EcoPulse
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'transparent', color: textMuted, border: 'none', 
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '10px 16px', borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.color = brandColor; e.target.style.background = 'rgba(237,128,128,0.05)'; }}
            onMouseOut={(e) => { e.target.style.color = textMuted; e.target.style.background = 'transparent'; }}
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/register')}
            style={{ 
              background: brandColor, color: '#fff', border: 'none', 
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', padding: '10px 24px', borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(237, 128, 128, 0.4)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '100px 5% 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <motion.div variants={fadeIn} style={{ 
            display: 'inline-block', marginBottom: '24px', padding: '8px 16px', borderRadius: '24px', 
            background: 'rgba(237,128,128,0.1)', border: '1px solid rgba(237,128,128,0.2)', 
            color: brandColor, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px' 
          }}>
            NEXT-GENERATION PLM
          </motion.div>
          
          <motion.h1 variants={fadeIn} style={{ 
            fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', 
            letterSpacing: '-1.5px', color: textColor 
          }}>
            Hardware Engineering, <br/>
            <span style={{ color: brandColor }}>Version Controlled.</span>
          </motion.h1>
          
          <motion.p variants={fadeIn} style={{ 
            fontSize: '1.2rem', color: textMuted, lineHeight: 1.6, marginBottom: '48px', 
            maxWidth: '600px', margin: '0 auto 48px', fontWeight: 400 
          }}>
            Access your PLM workspace. EcoPulse brings Git-like workflows to hardware teams. Track BOM changes and enforce strict approvals seamlessly.
          </motion.p>
          
          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/register')}
              style={{ 
                background: brandColor, color: '#fff', border: 'none', 
                fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', padding: '16px 32px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
                boxShadow: '0 8px 25px rgba(237, 128, 128, 0.4)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section style={{ padding: '60px 5% 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}
          >
            {/* Feature 1 */}
            <motion.div variants={fadeIn} style={{ 
              background: '#fff', padding: '40px', borderRadius: '20px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease', cursor: 'default'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(237,128,128,0.1)', 
                color: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' 
              }}>
                <GitMerge size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: textColor }}>Git-Like Workflows</h3>
              <p style={{ color: textMuted, lineHeight: 1.6, fontSize: '1.05rem' }}>Propose draft changes to BOMs and Products without affecting master data until fully approved.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} style={{ 
              background: '#fff', padding: '40px', borderRadius: '20px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease', cursor: 'default'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', 
                color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' 
              }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: textColor }}>BOM Management</h3>
              <p style={{ color: textMuted, lineHeight: 1.6, fontSize: '1.05rem' }}>Maintain precise Bills of Materials. Automatically trace versions, components, operations, and suppliers.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} style={{ 
              background: '#fff', padding: '40px', borderRadius: '20px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)',
              transition: 'transform 0.3s ease', cursor: 'default'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', 
                color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' 
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: textColor }}>Strict Governance</h3>
              <p style={{ color: textMuted, lineHeight: 1.6, fontSize: '1.05rem' }}>Customizable multi-stage approval workflows, granular Role-Based Access Control, and audit logs.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 5%', borderTop: '1px solid rgba(0,0,0,0.05)', 
        textAlign: 'center', color: textMuted, fontSize: '0.95rem',
        background: 'transparent'
      }}>
        <p>© {new Date().getFullYear()} EcoPulse PLM. Engineered for hardware teams.</p>
      </footer>
    </div>
  );
}
