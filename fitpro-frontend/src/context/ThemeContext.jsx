import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

/* ─── Token sets ─────────────────────────────────────────────── */
export const DARK = {
  mode: 'dark',
  bg:        '#0A0A0F',
  bgCard:    '#111118',
  bgGlass:   'rgba(255,255,255,0.04)',
  bgInput:   'rgba(255,255,255,0.04)',
  bgInputF:  'rgba(124,111,255,0.06)',
  bgHover:   'rgba(255,255,255,0.06)',
  primary:   '#7C6FFF',
  accent:    '#FF5F7E',
  gold:      '#FFB547',
  green:     '#2EE89A',
  text:      '#FFFFFF',
  gray1:     '#E8E8F0',
  gray2:     '#9090A8',
  gray3:     '#3A3A50',
  border:    'rgba(255,255,255,0.07)',
  borderFocus:'rgba(124,111,255,0.5)',
  shadow:    '0 40px 80px rgba(0,0,0,0.55)',
  shadowCard:'0 24px 60px rgba(0,0,0,0.5)',
  navBg:     'rgba(10,10,15,0.95)',
  tickerItem:'#3A3A50',
  gridLine:  'rgba(255,255,255,0.04)',
  radial1:   'rgba(124,111,255,0.12)',
  radial2:   'rgba(124,111,255,0.1)',
  blob1:     'rgba(124,111,255,0.08)',
  blob2:     'rgba(255,95,126,0.07)',
  blob3:     'rgba(46,232,154,0.06)',
  statBg:    '#111118',
  ctaBg:     '#111118',
  footerBg:  'transparent',
  demoBox:   'rgba(124,111,255,0.08)',
  demoBorder:'rgba(124,111,255,0.15)',
  stepLine:  'rgba(255,255,255,0.07)',
  tileBg:    'rgba(255,255,255,0.03)',
  goalTileAct:'rgba(124,111,255,0.15)',
  goalTileActBorder:'rgba(124,111,255,0.4)',
  scrollThumb:'#7C6FFF',
};

export const LIGHT = {
  mode: 'light',
  bg:        '#F0EFFE',
  bgCard:    '#FFFFFF',
  bgGlass:   'rgba(255,255,255,0.7)',
  bgInput:   'rgba(124,111,255,0.05)',
  bgInputF:  'rgba(124,111,255,0.1)',
  bgHover:   'rgba(124,111,255,0.06)',
  primary:   '#6C5FE8',
  accent:    '#F0405E',
  gold:      '#E8A020',
  green:     '#18C97A',
  text:      '#0D0B1E',
  gray1:     '#2A2840',
  gray2:     '#6862A0',
  gray3:     '#B0AACC',
  border:    'rgba(108,95,232,0.12)',
  borderFocus:'rgba(108,95,232,0.5)',
  shadow:    '0 40px 80px rgba(108,95,232,0.15)',
  shadowCard:'0 24px 60px rgba(108,95,232,0.12)',
  navBg:     'rgba(240,239,254,0.95)',
  tickerItem:'#B0AACC',
  gridLine:  'rgba(108,95,232,0.06)',
  radial1:   'rgba(124,111,255,0.1)',
  radial2:   'rgba(124,111,255,0.08)',
  blob1:     'rgba(124,111,255,0.1)',
  blob2:     'rgba(240,64,94,0.08)',
  blob3:     'rgba(24,201,122,0.08)',
  statBg:    '#FFFFFF',
  ctaBg:     '#FFFFFF',
  footerBg:  'transparent',
  demoBox:   'rgba(108,95,232,0.07)',
  demoBorder:'rgba(108,95,232,0.18)',
  stepLine:  'rgba(108,95,232,0.12)',
  tileBg:    'rgba(108,95,232,0.05)',
  goalTileAct:'rgba(108,95,232,0.12)',
  goalTileActBorder:'rgba(108,95,232,0.4)',
  scrollThumb:'#6C5FE8',
};

/* ─── Provider ───────────────────────────────────────────────── */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('fitpro_theme') !== 'light'; }
    catch { return true; }
  });

  const T = isDark ? DARK : LIGHT;

  const toggle = () => {
    setIsDark(p => {
      const next = !p;
      try { localStorage.setItem('fitpro_theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  // Apply to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [isDark, T.bg, T.text]);

  return (
    <ThemeContext.Provider value={{ T, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}