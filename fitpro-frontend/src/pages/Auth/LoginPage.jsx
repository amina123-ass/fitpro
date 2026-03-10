import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import { useTheme } from '../../context/ThemeContext';

const DF = "'Syne', sans-serif";

/* ─── Theme Toggle ───────────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggle, T } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme" style={{
      width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', position: 'relative',
      background: `linear-gradient(135deg,${T.primary},${T.accent})`,
      transition: 'all 0.3s',
      boxShadow: `0 2px 12px ${T.primary}60`,
    }}>
      <span style={{
        position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'all 0.3s ease',
        left: isDark ? 'calc(100% - 21px)' : 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

/* ─── Styles factory ─────────────────────────────────────────── */
function buildStyles(T) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;transition:background 0.3s,color 0.3s;}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse-ring{0%{transform:scale(0.9);opacity:1;}100%{transform:scale(1.8);opacity:0;}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.gt{background:linear-gradient(135deg,${T.primary} 0%,#B06FFF 50%,${T.accent} 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
.fadeUp{animation:fadeUp 0.7s ease forwards;}
.inp{width:100%;background:${T.bgInput};border:1px solid ${T.border};border-radius:14px;padding:14px 16px 14px 48px;font-family:'DM Sans',sans-serif;font-size:14px;color:${T.text};outline:none;transition:all 0.2s;}
.inp:focus{border-color:${T.borderFocus};background:${T.bgInputF};box-shadow:0 0 0 3px ${T.primary}14;}
.inp::placeholder{color:${T.gray3};}
.btn-p{width:100%;background:linear-gradient(135deg,${T.primary},${T.accent});color:#fff;border:none;border-radius:14px;padding:15px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 16px 40px ${T.primary}50;}
.btn-p:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
.btn-back{display:inline-flex;align-items:center;gap:8px;background:${T.bgInput};border:1px solid ${T.border};border-radius:100px;padding:8px 18px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:${T.gray2};cursor:pointer;transition:all 0.2s;text-decoration:none;}
.btn-back:hover{border-color:${T.primary}60;color:${T.text};background:${T.bgHover};}
.outline-btn{display:block;text-align:center;background:${T.bgInput};border:1px solid ${T.border};border-radius:14px;padding:14px;font-family:'Syne',sans-serif;font-size:14px;font-weight:600;color:${T.gray1};text-decoration:none;transition:all 0.2s;}
.outline-btn:hover{border-color:${T.primary}50;color:${T.text};}
`;
}

/* ─── Eye icon ───────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

export default function LoginPage() {
  const { T } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      enqueueSnackbar(`Welcome back, ${user.name}! 💪`, { variant: 'success' });
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'coach') navigate('/coach');
      else navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else enqueueSnackbar(data?.message || 'Login failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{buildStyles(T)}</style>
      <div style={{
        minHeight: '100vh', background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden', transition: 'background 0.3s',
      }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${T.radial1} 0%,transparent 65%)` }}/>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)' }}/>
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: T.blob1, filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }}/>
          <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 160, height: 160, borderRadius: '50%', background: T.blob2, filter: 'blur(50px)', animation: 'float 10s ease-in-out 2s infinite' }}/>
        </div>

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 28, left: 32, right: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <Link to="/" className="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="fadeUp" style={{
          width: '100%', maxWidth: 440, background: T.bgCard,
          border: `1px solid ${T.border}`, borderRadius: 28,
          padding: '44px 40px', position: 'relative', zIndex: 1,
          boxShadow: T.shadow, transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, background: `linear-gradient(90deg,transparent,${T.primary}90,transparent)`, borderRadius: 1 }}/>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, fontFamily: DF, color: '#fff', boxShadow: `0 12px 32px ${T.primary}50` }}>F</div>
              <div style={{ position: 'absolute', inset: -6, borderRadius: 26, border: `2px solid ${T.primary}30`, animation: 'pulse-ring 2.5s ease-out infinite' }}/>
            </div>
            <h1 style={{ fontFamily: DF, fontWeight: 800, fontSize: 26, color: T.text, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 14, color: T.gray2 }}>
              Sign in to your <span className="gt">FitPro</span> account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.gray2, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.gray3, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input className="inp" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              {errors.email && <p style={{ fontSize: 12, color: T.accent, marginTop: 6 }}>{errors.email[0]}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.gray2, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.gray3, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input className="inp" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  style={{ paddingRight: 48 }}
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray2, display: 'flex', padding: 0 }}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 12, color: T.accent, marginTop: 6 }}>{errors.password[0]}</p>}
            </div>

            <button className="btn-p" type="submit" disabled={loading}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Signing in...
                  </span>
                : 'Sign In →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: T.border }}/>
            <span style={{ fontSize: 12, color: T.gray3 }}>New to FitPro?</span>
            <div style={{ flex: 1, height: 1, background: T.border }}/>
          </div>

          <Link to="/register" className="outline-btn">
            Create Account
          </Link>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, background: T.demoBox, border: `1px solid ${T.demoBorder}`, borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Demo Credentials</p>
            {[['Admin', 'admin@fitpro.com'], ['Coach', 'coach@fitpro.com'], ['User', 'user@fitpro.com']].map(([r, e]) => (
              <p key={r} style={{ fontSize: 12, color: T.gray2, marginBottom: 3 }}>
                <span style={{ color: T.gray1, fontWeight: 600 }}>{r}:</span> {e} / password
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}