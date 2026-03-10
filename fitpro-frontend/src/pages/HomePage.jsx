import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const DF = "'Syne', sans-serif";

/* ─── Theme toggle button ────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggle, T } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme" style={{
      width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', position: 'relative',
      background: isDark
        ? 'linear-gradient(135deg,#7C6FFF,#FF5F7E)'
        : 'linear-gradient(135deg,#6C5FE8,#F0405E)',
      transition: 'all 0.3s',
      boxShadow: isDark ? '0 2px 12px rgba(124,111,255,0.45)' : '0 2px 12px rgba(108,95,232,0.35)',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'all 0.3s ease',
        left: isDark ? 'calc(100% - 21px)' : 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

/* ─── Global styles factory ──────────────────────────────────── */
function buildStyles(T) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:background 0.3s,color 0.3s;}
::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-track{background:${T.bg};}
::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:3px;}
@keyframes float{0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-18px) rotate(1deg);}66%{transform:translateY(-8px) rotate(-1deg);}}
@keyframes pulse-ring{0%{transform:scale(0.8);opacity:1;}100%{transform:scale(2.2);opacity:0;}}
@keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideLeft{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
@keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
.fadeUp{animation:fadeUp 0.8s ease forwards;}
.slideLeft{animation:slideLeft 0.9s 0.2s ease both;}
.btn-p{background:linear-gradient(135deg,${T.primary},${T.accent});color:#fff;border:none;border-radius:14px;padding:16px 36px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;position:relative;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s;letter-spacing:0.3px;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 20px 40px ${T.mode==='dark'?'rgba(124,111,255,0.35)':'rgba(108,95,232,0.3)'};}
.btn-g{background:${T.bgGlass};color:${T.gray1};border:1px solid ${T.border};border-radius:14px;padding:15px 36px;font-family:'Syne',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;backdrop-filter:blur(10px);}
.btn-g:hover{border-color:${T.primary};color:${T.text};background:${T.bgHover};}
.gt{background:linear-gradient(135deg,${T.primary} 0%,#B06FFF 50%,${T.accent} 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
.fcard{background:${T.bgCard};border:1px solid ${T.border};border-radius:24px;padding:36px 32px;position:relative;overflow:hidden;transition:all 0.3s ease;cursor:default;}
.fcard:hover{border-color:${T.mode==='dark'?'rgba(124,111,255,0.25)':'rgba(108,95,232,0.3)'};background:${T.mode==='dark'?'#14141E':'#F7F6FF'};transform:translateY(-4px);box-shadow:${T.shadowCard};}
.pcard{background:${T.bgCard};border:1px solid ${T.border};border-radius:24px;overflow:hidden;transition:all 0.3s ease;}
.pcard:hover{transform:translateY(-6px);box-shadow:${T.shadowCard};}
.tcard{background:${T.bgCard};border:1px solid ${T.border};border-radius:24px;padding:36px;transition:all 0.3s ease;}
.tcard:hover{border-color:${T.mode==='dark'?'rgba(124,111,255,0.2)':'rgba(108,95,232,0.25)'};transform:translateY(-4px);}
.slabel{display:inline-flex;align-items:center;gap:8px;background:${T.mode==='dark'?'rgba(124,111,255,0.1)':'rgba(108,95,232,0.08)'};border:1px solid ${T.mode==='dark'?'rgba(124,111,255,0.2)':'rgba(108,95,232,0.2)'};border-radius:100px;padding:6px 16px;font-size:12px;font-weight:600;color:${T.primary};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px;}
.navlink{color:${T.gray2};font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;text-decoration:none;padding:6px 12px;border-radius:8px;transition:all 0.2s;cursor:pointer;}
.navlink:hover{color:${T.text};background:${T.bgHover};}
.ticker-wrap{overflow:hidden;white-space:nowrap;padding:20px 0;border-top:1px solid ${T.border};border-bottom:1px solid ${T.border};}
.ticker-inner{display:inline-flex;animation:ticker 22s linear infinite;}
.ticker-item{display:inline-flex;align-items:center;gap:12px;padding:0 40px;font-size:13px;font-weight:600;color:${T.tickerItem};letter-spacing:1px;text-transform:uppercase;}
@media(max-width:768px){.hero-title{font-size:40px!important;}.hero-grid{grid-template-columns:1fr!important;}.feat-grid{grid-template-columns:1fr!important;}.prog-grid{grid-template-columns:1fr!important;}.testi-grid{grid-template-columns:1fr!important;}.stats-grid{grid-template-columns:1fr 1fr!important;}.navlinks{display:none!important;}.hero-right{display:none!important;}.footer-grid{grid-template-columns:1fr!important;}}
`;
}

const TICKS = ['10,000+ Members','Expert Coaches','500+ Workouts','Real-time Progress','Nutrition Tracking','Custom Programs','Live Support','Mobile Friendly','10,000+ Members','Expert Coaches','500+ Workouts','Real-time Progress','Nutrition Tracking','Custom Programs','Live Support','Mobile Friendly'];
const STATS = [{v:'10K+',l:'Active Members',ic:'👥',col:'#7C6FFF'},{v:'500+',l:'Workout Programs',ic:'🏋️',col:'#FF5F7E'},{v:'50+',l:'Expert Coaches',ic:'🎯',col:'#FFB547'},{v:'98%',l:'Satisfaction Rate',ic:'⭐',col:'#2EE89A'}];
const FEATS = [
  {ic:'⚡',t:'AI-Powered Workouts',d:'Smart exercise recommendations that adapt to your performance, recovery, and goals in real time.',col:'#7C6FFF',tag:'Smart'},
  {ic:'📊',t:'Advanced Analytics',d:'Beautiful progress charts tracking weight, calories, strength gains, and performance trends over time.',col:'#2EE89A',tag:'Insights'},
  {ic:'🥗',t:'Nutrition Intelligence',d:'Log every meal with automatic macro calculation. Stay in your calorie targets effortlessly.',col:'#FFB547',tag:'Nutrition'},
  {ic:'🏆',t:'Expert Programs',d:'Structured week-by-week programs designed by certified coaches to maximize your results.',col:'#FF5F7E',tag:'Coaching'},
  {ic:'💬',t:'Direct Coach Access',d:'Get personalized feedback and motivation from professional coaches assigned to guide you.',col:'#FF9A5C',tag:'Support'},
  {ic:'🔒',t:'Secure & Private',d:'Enterprise-grade security protects your health data with role-based access control throughout.',col:'#5CE1E6',tag:'Security'},
];
const PROGS = [
  {name:'Fat Destroyer',sub:'4-Week Intensive',goal:'Weight Loss',diff:'Beginner',weeks:4,sess:20,cal:'400-600',c1:'#7C6FFF',c2:'#FF5F7E',em:'🔥',badge:'Most Popular'},
  {name:'Muscle Architect',sub:'8-Week Builder',goal:'Muscle Gain',diff:'Intermediate',weeks:8,sess:40,cal:'300-500',c1:'#2EE89A',c2:'#00B4D8',em:'💪',badge:'Best Results'},
  {name:'Endurance Elite',sub:'6-Week Cardio',goal:'Stamina',diff:'Advanced',weeks:6,sess:30,cal:'500-800',c1:'#FFB547',c2:'#FF5F7E',em:'🏃',badge:'Challenging'},
];
const TESTIS = [
  {name:'Karim Benali',role:'Software Engineer',city:'Casablanca',text:'FitPro completely transformed my lifestyle. Lost 15kg in 4 months with the structured programs. The nutrition tracker alone is worth every second.',stars:5,res:'-15kg in 4 months',init:'KB',col:'#7C6FFF'},
  {name:'Sara Moussaoui',role:'Marketing Manager',city:'Rabat',text:'Having a coach directly in the app is a game changer. The personalized feedback keeps me accountable and motivated every single day.',stars:5,res:'+8kg muscle',init:'SM',col:'#FF5F7E'},
  {name:'Amine Rachidi',role:'Student',city:'Fès',text:'The progress charts are incredibly motivating. I can visually see my transformation week by week. Absolutely love FitPro.',stars:5,res:'10km daily runner',init:'AR',col:'#2EE89A'},
];
const STEPS = [
  {num:'01',t:'Create Your Profile',d:'Set your goals, fitness level, and physical stats to get a fully personalized experience from day one.',ic:'👤'},
  {num:'02',t:'Choose Your Program',d:'Browse expert-designed programs or get matched automatically to your specific goals and level.',ic:'📋'},
  {num:'03',t:'Track & Transform',d:'Log workouts, meals, and weight. Watch your progress charts grow more impressive every week.',ic:'📈'},
];

function Navbar({ onLogin, onRegister }) {
  const { T } = useTheme();
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const f = () => setSc(window.scrollY > 40);
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: sc ? '12px 0' : '20px 0',
      background: sc ? T.navBg : 'transparent',
      backdropFilter: sc ? 'blur(20px)' : 'none',
      borderBottom: sc ? `1px solid ${T.border}` : 'none',
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, fontFamily: DF, color: '#fff' }}>F</div>
          <span style={{ fontFamily: DF, fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: '-0.3px' }}>Fit<span style={{ color: T.primary }}>Pro</span></span>
        </div>
        {/* Nav links */}
        <div className="navlinks" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Features', 'Programs', 'How it Works', 'Testimonials'].map(l => (
            <span key={l} className="navlink"
              onClick={() => document.getElementById(l.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}>
              {l}
            </span>
          ))}
        </div>
        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <button className="btn-g" onClick={onLogin} style={{ padding: '10px 24px', fontSize: 14 }}>Sign In</button>
          <button className="btn-p" onClick={onRegister} style={{ padding: '10px 24px', fontSize: 14 }}>Get Started →</button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onRegister, onLogin }) {
  const { T } = useTheme();
  const [cnt, setCnt] = useState({ m: 0, w: 0, c: 0 });
  useEffect(() => {
    let step = 0; const steps = 60;
    const id = setInterval(() => {
      step++;
      const p = step / steps;
      const e = 1 - Math.pow(1 - p, 3);
      setCnt({ m: Math.floor(10000 * e), w: Math.floor(500 * e), c: Math.floor(50 * e) });
      if (step >= steps) clearInterval(id);
    }, 33);
    return () => clearInterval(id);
  }, []);

  const mockupBg = T.mode === 'dark' ? '#111118' : '#FFFFFF';
  const barInactive = T.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(108,95,232,0.1)';

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}>
      {/* BG */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle,${T.radial1} 0%,transparent 70%)` }}/>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)' }}/>
        {[[300, '10%', '5%', T.blob1, '0s'], [200, '60%', null, T.blob2, '2s'], [160, 'auto', '20%', T.blob3, '4s']].map(([sz, top, left, col, del], i) => (
          <div key={i} style={{ position: 'absolute', width: sz, height: sz, borderRadius: '50%', background: col, filter: 'blur(60px)', top, left, bottom: i === 2 ? '15%' : undefined, right: i === 1 ? '8%' : undefined, animation: `float 8s ease-in-out infinite`, animationDelay: del }}/>
        ))}
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px', position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* LEFT */}
          <div className="fadeUp">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.mode === 'dark' ? 'rgba(124,111,255,0.1)' : 'rgba(108,95,232,0.08)', border: `1px solid ${T.mode === 'dark' ? 'rgba(124,111,255,0.25)' : 'rgba(108,95,232,0.2)'}`, borderRadius: 100, padding: '8px 18px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'blink 2s infinite' }}/>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.primary, letterSpacing: 1, textTransform: 'uppercase', fontFamily: DF }}>#1 Fitness Platform in Morocco</span>
            </div>
            <h1 className="hero-title" style={{ fontFamily: DF, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: T.text, letterSpacing: '-1.5px', marginBottom: 24 }}>
              Train Smarter,<br/><span className="gt">Transform</span><br/>Faster.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: T.gray2, maxWidth: 480, marginBottom: 40 }}>
              Join thousands of members achieving extraordinary results with personalized workouts, expert coaching, and intelligent nutrition tracking — all in one platform.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 56 }}>
              <button className="btn-p" onClick={onRegister} style={{ fontSize: 15, padding: '16px 36px' }}>Start Free Today →</button>
              <button className="btn-g" onClick={onLogin} style={{ fontSize: 15 }}>Sign In</button>
            </div>
            <div style={{ display: 'flex', gap: 40 }}>
              {[{ v: `${(cnt.m / 1000).toFixed(1)}K+`, l: 'Members' }, { v: `${cnt.w}+`, l: 'Workouts' }, { v: `${cnt.c}+`, l: 'Coaches' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: DF, fontWeight: 800, fontSize: 28, color: T.text, letterSpacing: '-0.5px' }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: T.gray2, fontWeight: 500, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero-right slideLeft" style={{ position: 'relative' }}>
            <div style={{ background: mockupBg, border: `1px solid ${T.border}`, borderRadius: 28, padding: 28, boxShadow: T.shadow, animation: 'float 7s ease-in-out infinite' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: T.gray2, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Weekly Progress</div>
                <div style={{ fontSize: 28, fontFamily: DF, fontWeight: 800, color: T.text }}>2,840 <span style={{ fontSize: 14, color: T.gray2, fontWeight: 500 }}>kcal burned</span></div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${h}%`, borderRadius: 6, background: i === 5 ? `linear-gradient(180deg,${T.primary},${T.accent})` : barInactive, transition: 'height 1s ease' }}/>
                    <span style={{ fontSize: 9, color: T.gray2 }}>{'MTWTFSS'[i]}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
                {[{ l: 'Protein', v: '142g', c: T.primary }, { l: 'Carbs', v: '280g', c: T.green }, { l: 'Fat', v: '68g', c: T.gold }].map(m => (
                  <div key={m.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: DF, fontWeight: 700, fontSize: 14, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: T.gray2, marginTop: 2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Badge 1 */}
            <div style={{ position: 'absolute', top: -24, right: -20, background: T.mode === 'dark' ? 'linear-gradient(135deg,rgba(46,232,154,0.15),rgba(46,232,154,0.05))' : 'rgba(24,201,122,0.1)', border: `1px solid ${T.mode === 'dark' ? 'rgba(46,232,154,0.25)' : 'rgba(24,201,122,0.3)'}`, borderRadius: 16, padding: '14px 18px', backdropFilter: 'blur(16px)', animation: 'float 6s ease-in-out 1s infinite', boxShadow: T.shadowCard }}>
              <div style={{ fontSize: 10, color: T.green, fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>STREAK</div>
              <div style={{ fontSize: 22, fontFamily: DF, fontWeight: 800, color: T.text }}>🔥 14 Days</div>
            </div>
            {/* Badge 2 */}
            <div style={{ position: 'absolute', bottom: -20, left: -24, background: mockupBg, border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px 18px', backdropFilter: 'blur(16px)', animation: 'float 5s ease-in-out 2.5s infinite', boxShadow: T.shadowCard, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💪</div>
              <div>
                <div style={{ fontSize: 10, color: T.gray2, fontWeight: 600, letterSpacing: 0.5 }}>TODAY</div>
                <div style={{ fontSize: 14, fontFamily: DF, fontWeight: 700, color: T.text }}>Upper Body</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green }}/>
            </div>
            {/* Badge 3 */}
            <div style={{ position: 'absolute', top: '45%', right: -44, background: T.mode === 'dark' ? 'linear-gradient(135deg,rgba(124,111,255,0.15),rgba(124,111,255,0.05))' : 'rgba(108,95,232,0.1)', border: `1px solid ${T.mode === 'dark' ? 'rgba(124,111,255,0.25)' : 'rgba(108,95,232,0.25)'}`, borderRadius: 16, padding: '14px 18px', animation: 'float 9s ease-in-out 1.5s infinite', boxShadow: T.shadowCard }}>
              <div style={{ fontSize: 10, color: T.primary, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>GOAL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 20, fontFamily: DF, fontWeight: 800, color: T.text }}>78%</div>
                <div style={{ fontSize: 11, color: T.gray2 }}>Done</div>
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, width: 80 }}>
                <div style={{ height: '100%', width: '78%', background: `linear-gradient(90deg,${T.primary},${T.accent})`, borderRadius: 2 }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const { T } = useTheme();
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {TICKS.map((t, i) => (
          <span key={i} className="ticker-item">
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.primary, display: 'inline-block' }}/>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const { T } = useTheme();
  return (
    <section style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {STATS.map(s => (
          <div key={s.l} style={{ background: T.statBg, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden', transition: 'all 0.3s', boxShadow: T.mode === 'light' ? '0 2px 16px rgba(108,95,232,0.08)' : 'none' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = T.mode === 'dark' ? 'rgba(124,111,255,0.3)' : 'rgba(108,95,232,0.35)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = T.border; }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${s.col}60,transparent)` }}/>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{s.ic}</div>
            <div style={{ fontFamily: DF, fontWeight: 800, fontSize: 36, color: s.col, letterSpacing: '-1px', marginBottom: 6 }}>{s.v}</div>
            <div style={{ fontSize: 14, color: T.gray2, fontWeight: 500 }}>{s.l}</div>
            <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${s.col}15`, filter: 'blur(30px)', pointerEvents: 'none' }}/>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const { T } = useTheme();
  return (
    <section id="features" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="slabel" style={{ margin: '0 auto 20px' }}>✦ Platform Features</div>
        <h2 style={{ fontFamily: DF, fontWeight: 800, fontSize: 48, color: T.text, letterSpacing: '-1px', marginBottom: 16 }}>
          Everything you need to<br/><span className="gt">reach your peak.</span>
        </h2>
        <p style={{ fontSize: 16, color: T.gray2, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>A complete ecosystem built for serious athletes and beginners alike. No shortcuts — just the tools that work.</p>
      </div>
      <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {FEATS.map(f => (
          <div key={f.t} className="fcard">
            <div style={{ position: 'absolute', top: 24, right: 24, fontSize: 10, fontWeight: 700, color: f.col, background: `${f.col}15`, border: `1px solid ${f.col}25`, borderRadius: 100, padding: '4px 10px', letterSpacing: 1, textTransform: 'uppercase' }}>{f.tag}</div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.col}12`, border: `1px solid ${f.col}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>{f.ic}</div>
            <h3 style={{ fontFamily: DF, fontWeight: 700, fontSize: 18, color: T.text, marginBottom: 10 }}>{f.t}</h3>
            <p style={{ fontSize: 14, color: T.gray2, lineHeight: 1.75 }}>{f.d}</p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${f.col}40,transparent)`, borderRadius: '0 0 24px 24px' }}/>
          </div>
        ))}
      </div>
    </section>
  );
}

function Programs({ onRegister }) {
  const { T } = useTheme();
  return (
    <section id="programs" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="slabel" style={{ margin: '0 auto 20px' }}>✦ Training Programs</div>
        <h2 style={{ fontFamily: DF, fontWeight: 800, fontSize: 48, color: T.text, letterSpacing: '-1px', marginBottom: 16 }}>
          Expert programs for<br/><span className="gt">every level.</span>
        </h2>
        <p style={{ fontSize: 16, color: T.gray2, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Structured, science-backed programs designed by certified coaches to deliver real, measurable results.</p>
      </div>
      <div className="prog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {PROGS.map(p => (
          <div key={p.name} className="pcard">
            <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg,${p.c1}33,${p.c2}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: `1px solid ${p.c1}20`, top: -50, right: -50 }}/>
              <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: `1px solid ${p.c2}20`, bottom: -30, left: -30 }}/>
              <div style={{ fontSize: 64 }}>{p.em}</div>
              <div style={{ position: 'absolute', top: 16, right: 16, background: `linear-gradient(135deg,${p.c1},${p.c2})`, borderRadius: 100, padding: '5px 14px', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' }}>{p.badge}</div>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 11, color: T.gray2, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{p.sub}</div>
              <h3 style={{ fontFamily: DF, fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 6 }}>{p.name}</h3>
              <div style={{ fontSize: 13, color: T.gray2, marginBottom: 20 }}>Goal: {p.goal}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[{ l: 'Weeks', v: p.weeks }, { l: 'Sessions', v: p.sess }, { l: 'Kcal', v: p.cal }].map(s => (
                  <div key={s.l} style={{ textAlign: 'center', background: T.bgInput, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 8px' }}>
                    <div style={{ fontFamily: DF, fontWeight: 800, fontSize: 16, color: T.text }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: T.gray2, marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: T.gray2 }}>Difficulty</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.c1, background: `${p.c1}15`, border: `1px solid ${p.c1}25`, borderRadius: 100, padding: '4px 12px' }}>{p.diff}</span>
              </div>
              <button className="btn-p" onClick={onRegister} style={{ width: '100%', padding: '14px', fontSize: 14, background: `linear-gradient(135deg,${p.c1},${p.c2})` }}>
                Start Program →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { T } = useTheme();
  return (
    <section id="how-it-works" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="slabel" style={{ margin: '0 auto 20px' }}>✦ How It Works</div>
        <h2 style={{ fontFamily: DF, fontWeight: 800, fontSize: 48, color: T.text, letterSpacing: '-1px' }}>Three steps to your<br/><span className="gt">best shape.</span></h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 60, left: '17%', right: '17%', height: 1, background: `linear-gradient(90deg,transparent,${T.stepLine},${T.stepLine},transparent)`, zIndex: 0 }}/>
        {STEPS.map((s, i) => (
          <div key={s.num} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px', background: i === 1 ? `linear-gradient(135deg,${T.primary},${T.accent})` : T.bgCard, border: i === 1 ? 'none' : `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: i === 1 ? `0 20px 40px ${T.mode === 'dark' ? 'rgba(124,111,255,0.3)' : 'rgba(108,95,232,0.25)'}` : T.mode === 'light' ? '0 4px 20px rgba(108,95,232,0.1)' : 'none', position: 'relative' }}>
              {s.ic}
              {i === 1 && <div style={{ position: 'absolute', inset: -4, borderRadius: 28, border: `2px solid ${T.mode === 'dark' ? 'rgba(124,111,255,0.4)' : 'rgba(108,95,232,0.4)'}`, animation: 'pulse-ring 2s ease-out infinite' }}/>}
            </div>
            <div style={{ fontFamily: DF, fontWeight: 800, fontSize: 13, color: T.primary, letterSpacing: 2, marginBottom: 12 }}>STEP {s.num}</div>
            <h3 style={{ fontFamily: DF, fontWeight: 700, fontSize: 20, color: T.text, marginBottom: 12 }}>{s.t}</h3>
            <p style={{ fontSize: 14, color: T.gray2, lineHeight: 1.75 }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const { T } = useTheme();
  return (
    <section id="testimonials" style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="slabel" style={{ margin: '0 auto 20px' }}>✦ Success Stories</div>
        <h2 style={{ fontFamily: DF, fontWeight: 800, fontSize: 48, color: T.text, letterSpacing: '-1px', marginBottom: 16 }}>
          Real people,<br/><span className="gt">real transformations.</span>
        </h2>
      </div>
      <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {TESTIS.map(t => (
          <div key={t.name} className="tcard">
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>{[...Array(t.stars)].map((_, i) => <span key={i} style={{ color: T.gold, fontSize: 16 }}>★</span>)}</div>
            <div style={{ display: 'inline-block', background: `${t.col}12`, border: `1px solid ${t.col}25`, borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: t.col, marginBottom: 16 }}>🏆 {t.res}</div>
            <p style={{ fontSize: 15, color: T.gray1, lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic' }}>"{t.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${t.col}60,${t.col}30)`, border: `1px solid ${t.col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DF, fontWeight: 800, fontSize: 16, color: '#fff' }}>{t.init}</div>
              <div>
                <div style={{ fontFamily: DF, fontWeight: 700, fontSize: 15, color: T.text }}>{t.name}</div>
                <div style={{ fontSize: 12, color: T.gray2 }}>{t.role} · {t.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA({ onRegister }) {
  const { T } = useTheme();
  return (
    <section style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: T.ctaBg, border: `1px solid ${T.border}`, borderRadius: 32, padding: '80px 60px', textAlign: 'center', boxShadow: T.mode === 'light' ? '0 8px 40px rgba(108,95,232,0.12)' : 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: `radial-gradient(ellipse,${T.radial2} 0%,transparent 70%)`, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 32, backgroundImage: `linear-gradient(${T.gridLine} 1px,transparent 1px),linear-gradient(90deg,${T.gridLine} 1px,transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 80%)', opacity: 0.5 }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="slabel" style={{ margin: '0 auto 24px' }}>✦ Join FitPro Today</div>
          <h2 style={{ fontFamily: DF, fontWeight: 800, fontSize: 52, color: T.text, letterSpacing: '-1.5px', marginBottom: 20 }}>Your transformation<br/><span className="gt">starts right now.</span></h2>
          <p style={{ fontSize: 17, color: T.gray2, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.7 }}>Thousands of members have already changed their lives. Your moment is now — create your free account in 60 seconds.</p>
          <button className="btn-p" onClick={onRegister} style={{ fontSize: 16, padding: '18px 44px' }}>Create Free Account →</button>
          <p style={{ fontSize: 13, color: T.gray2, marginTop: 20 }}>No credit card required · Free forever plan available</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { T } = useTheme();
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: '60px 40px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, fontFamily: DF, color: '#fff' }}>F</div>
            <span style={{ fontFamily: DF, fontWeight: 800, fontSize: 18, color: T.text }}>Fit<span style={{ color: T.primary }}>Pro</span></span>
          </div>
          <p style={{ fontSize: 14, color: T.gray2, lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>Your complete fitness partner. Workouts, nutrition, coaching — everything in one professional platform.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['𝕏', 'in', 'f', '▶'].map((s, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: T.gray2, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.gray2; }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        {[{ title: 'Product', links: ['Features', 'Programs', 'Coaches', 'Pricing'] }, { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] }, { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] }].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: DF, fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 20 }}>{col.title}</div>
            {col.links.map(l => (
              <div key={l} style={{ fontSize: 14, color: T.gray2, marginBottom: 12, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color = T.text}
                onMouseOut={e => e.target.style.color = T.gray2}>{l}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${T.border},transparent)`, marginBottom: 28 }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 13, color: T.gray2 }}>© 2026 FitPro. All rights reserved.</span>
        <span style={{ fontSize: 13, color: T.gray2 }}>Built with ❤️ for your health journey.</span>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { T, isDark } = useTheme();
  const go = r => () => navigate(r);

  const styles = buildStyles(T);
  const howItWorksBg = T.mode === 'dark' ? '#0D0D14' : '#EAE8FD';

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: T.bg, minHeight: '100vh', transition: 'background 0.3s' }}>
        <Navbar onLogin={go('/login')} onRegister={go('/register')} />
        <Hero onRegister={go('/register')} onLogin={go('/login')} />
        <Ticker />
        <Stats />
        <Features />
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${T.border},transparent)`, maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}/>
        <Programs onRegister={go('/register')} />
        <div style={{ background: howItWorksBg, transition: 'background 0.3s' }}><HowItWorks /></div>
        <Testimonials />
        <CTA onRegister={go('/register')} />
        <Footer />
      </div>
    </>
  );
}