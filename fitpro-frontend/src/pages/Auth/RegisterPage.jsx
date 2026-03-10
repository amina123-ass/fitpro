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
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.gt{background:linear-gradient(135deg,${T.primary} 0%,#B06FFF 50%,${T.accent} 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
.fadeUp{animation:fadeUp 0.7s ease forwards;}
.inp{width:100%;background:${T.bgInput};border:1px solid ${T.border};border-radius:14px;padding:14px 16px 14px 48px;font-family:'DM Sans',sans-serif;font-size:14px;color:${T.text};outline:none;transition:all 0.2s;}
.inp:focus{border-color:${T.borderFocus};background:${T.bgInputF};box-shadow:0 0 0 3px ${T.primary}14;}
.inp::placeholder{color:${T.gray3};}
.inp-plain{width:100%;background:${T.bgInput};border:1px solid ${T.border};border-radius:14px;padding:14px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:${T.text};outline:none;transition:all 0.2s;appearance:none;}
.inp-plain:focus{border-color:${T.borderFocus};background:${T.bgInputF};box-shadow:0 0 0 3px ${T.primary}14;}
.inp-plain::placeholder{color:${T.gray3};}
.inp-plain option{background:${T.bgCard};color:${T.text};}
.btn-p{width:100%;background:linear-gradient(135deg,${T.primary},${T.accent});color:#fff;border:none;border-radius:14px;padding:15px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 16px 40px ${T.primary}50;}
.btn-p:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
.btn-back{display:inline-flex;align-items:center;gap:8px;background:${T.bgInput};border:1px solid ${T.border};border-radius:100px;padding:8px 18px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:${T.gray2};cursor:pointer;transition:all 0.2s;text-decoration:none;}
.btn-back:hover{border-color:${T.primary}60;color:${T.text};background:${T.bgHover};}
.btn-outline{background:${T.bgInput};border:1px solid ${T.border};border-radius:14px;padding:14px;font-family:'Syne',sans-serif;font-size:14px;font-weight:600;color:${T.gray1};cursor:pointer;transition:all 0.2s;}
.btn-outline:hover{border-color:${T.primary}50;color:${T.text};}
`;
}

/* ─── SVG icons ──────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const icons = {
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

const GOALS = [
  { value: 'weight_loss',     label: '🔥 Weight Loss',     short: '🔥', name: 'Weight Loss' },
  { value: 'muscle_gain',     label: '💪 Muscle Gain',     short: '💪', name: 'Muscle Gain' },
  { value: 'endurance',       label: '🏃 Endurance',       short: '🏃', name: 'Endurance' },
  { value: 'flexibility',     label: '🧘 Flexibility',     short: '🧘', name: 'Flexibility' },
  { value: 'general_fitness', label: '⚡ General Fitness', short: '⚡', name: 'General' },
];

/* ─── Field wrapper ──────────────────────────────────────────── */
function Field({ T, label, icon, error, children }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.gray2, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.gray3, zIndex: 1, display: 'flex' }}>
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && <p style={{ fontSize: 12, color: T.accent, marginTop: 6 }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const { T } = useTheme();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
    age: '', weight: '', height: '', fitness_goal: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleNext = e => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      enqueueSnackbar(`Welcome to FitPro, ${user.name}! 🎉`, { variant: 'success' });
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) { setErrors(data.errors); setStep(0); }
      else enqueueSnackbar(data?.message || 'Registration failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const stepIndicatorActive = `linear-gradient(135deg,${T.primary},${T.accent})`;
  const stepIndicatorDone   = T.mode === 'dark' ? 'rgba(124,111,255,0.3)' : 'rgba(108,95,232,0.2)';

  return (
    <>
      <style>{buildStyles(T)}</style>
      <div style={{
        minHeight: '100vh', background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 40px', position: 'relative', overflow: 'hidden', transition: 'background 0.3s',
      }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle,${T.radial1} 0%,transparent 65%)` }}/>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)' }}/>
          <div style={{ position: 'absolute', top: '15%', left: '5%', width: 220, height: 220, borderRadius: '50%', background: T.blob1, filter: 'blur(60px)', animation: 'float 9s ease-in-out infinite' }}/>
          <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: 180, height: 180, borderRadius: '50%', background: T.blob2, filter: 'blur(50px)', animation: 'float 11s ease-in-out 3s infinite' }}/>
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
          width: '100%', maxWidth: 520, background: T.bgCard,
          border: `1px solid ${T.border}`, borderRadius: 28,
          padding: '44px 40px', position: 'relative', zIndex: 1,
          boxShadow: T.shadow, transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, background: `linear-gradient(90deg,transparent,${T.primary}90,transparent)`, borderRadius: 1 }}/>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, fontFamily: DF, color: '#fff', margin: '0 auto 14px', boxShadow: `0 10px 28px ${T.primary}50` }}>F</div>
            <h1 style={{ fontFamily: DF, fontWeight: 800, fontSize: 26, color: T.text, letterSpacing: '-0.5px', marginBottom: 6 }}>Create Account</h1>
            <p style={{ fontSize: 14, color: T.gray2 }}>Join <span className="gt">FitPro</span> and start your journey</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            {['Account', 'Profile'].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: i < step ? 'pointer' : 'default' }}
                  onClick={() => i < step && setStep(i)}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, fontFamily: DF,
                    background: i < step ? stepIndicatorDone : i === step ? stepIndicatorActive : T.bgInput,
                    border: i === step ? 'none' : `1px solid ${T.border}`,
                    color: i === step ? '#fff' : i < step ? T.primary : T.gray3,
                    boxShadow: i === step ? `0 4px 16px ${T.primary}50` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: i <= step ? T.gray1 : T.gray3, letterSpacing: '0.5px', fontFamily: DF, transition: 'color 0.3s' }}>{s}</span>
                </div>
                {i === 0 && (
                  <div style={{ flex: 1, maxWidth: 48, height: 1, background: step > 0 ? `${T.primary}60` : T.border, transition: 'background 0.3s' }}/>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 0: Account info ── */}
          {step === 0 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field T={T} label="Full Name" icon={icons.user} error={errors.name?.[0]}>
                <input className="inp" type="text" placeholder="Amine Rachidi" required
                  value={form.name} onChange={set('name')} />
              </Field>

              <Field T={T} label="Email" icon={icons.mail} error={errors.email?.[0]}>
                <input className="inp" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={set('email')} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field T={T} label="Password" icon={icons.lock} error={errors.password?.[0]}>
                  <input className="inp" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                    style={{ paddingRight: 44 }}
                    value={form.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray2, display: 'flex', padding: 0 }}>
                    <EyeIcon open={showPass} />
                  </button>
                </Field>
                <Field T={T} label="Confirm">
                  <input className="inp-plain" type="password" placeholder="••••••••" required
                    value={form.password_confirmation} onChange={set('password_confirmation')} />
                </Field>
              </div>

              <button className="btn-p" type="submit" style={{ marginTop: 8 }}>
                Continue →
              </button>
            </form>
          )}

          {/* ── Step 1: Body & goal ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Body stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  ['Age',    'age',    'yrs', errors.age?.[0]],
                  ['Weight', 'weight', 'kg',  errors.weight?.[0]],
                  ['Height', 'height', 'cm',  errors.height?.[0]],
                ].map(([lbl, key, unit, err]) => (
                  <Field T={T} key={key} label={lbl} error={err}>
                    <input className="inp-plain" type="number" placeholder={unit}
                      style={{ paddingRight: 40 }}
                      value={form[key]} onChange={set(key)} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: T.gray3 }}>{unit}</span>
                  </Field>
                ))}
              </div>

              {/* Goal select */}
              <Field T={T} label="Fitness Goal" icon={icons.target}>
                <select className="inp" value={form.fitness_goal} onChange={set('fitness_goal')}
                  style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: T.bgCard, color: T.gray3 }}>Choose your goal…</option>
                  {GOALS.map(g => (
                    <option key={g.value} value={g.value} style={{ background: T.bgCard }}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: T.gray3, pointerEvents: 'none', display: 'flex' }}>
                  {icons.chevron}
                </span>
              </Field>

              {/* Goal tiles */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.gray2, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>Or select visually</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {GOALS.map(g => {
                    const active = form.fitness_goal === g.value;
                    return (
                      <div key={g.value}
                        onClick={() => setForm(p => ({ ...p, fitness_goal: g.value }))}
                        style={{
                          textAlign: 'center', padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                          background: active ? T.goalTileAct : T.tileBg,
                          border: `1px solid ${active ? T.goalTileActBorder : T.border}`,
                          transition: 'all 0.2s',
                          boxShadow: active ? `0 4px 16px ${T.primary}25` : 'none',
                        }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{g.short}</div>
                        <div style={{ fontSize: 9, color: active ? T.primary : T.gray3, fontWeight: 700, lineHeight: 1.2 }}>{g.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn-outline" onClick={() => setStep(0)}>
                  ← Back
                </button>
                <button className="btn-p" type="submit" disabled={loading}>
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        Creating…
                      </span>
                    : 'Create My Account 🎉'
                  }
                </button>
              </div>
            </form>
          )}

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: T.gray2 }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: T.primary, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}