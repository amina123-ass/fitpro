import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, CircularProgress, MenuItem, TextField, Button,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Download, Refresh, TrendingUp, TrendingDown, FitnessCenter } from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ── constants ───────────────────────────────────────────── */
const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const PALETTE     = ['#7C6FFF','#2EE89A','#FFB547','#FF5F7E','#5CE1E6','#A78BFA','#F472B6','#34D399'];
const GOAL_LABELS = {
  weight_loss:    'Perte de poids',
  muscle_gain:    'Prise de muscle',
  endurance:      'Endurance',
  flexibility:    'Flexibilité',
  general_fitness:'Forme générale',
  stress_relief:  'Anti-stress',
};

/* ── Custom Recharts Tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: isDark ? '#1A1A28' : '#fff',
      border: `1px solid ${isDark ? 'rgba(124,111,255,0.25)' : 'rgba(124,111,255,0.2)'}`,
      borderRadius: '14px', p: '10px 14px',
      boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.55)' : '0 8px 24px rgba(124,111,255,0.15)',
      minWidth: 120,
    }}>
      <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.45)' : '#8880C0', mb: 0.75, fontFamily: '"Syne",sans-serif' }}>
        {label}
      </Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: i < payload.length - 1 ? 0.5 : 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#0D0B1E', fontFamily: '"Syne",sans-serif' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString('fr-FR') : p.value}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.45)' : '#8880C0' }}>{p.name}</Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ── KPI card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, trend, emoji }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', p: '20px 22px',
      position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
      '&:hover': { transform: 'translateY(-3px)', borderColor: alpha(color, 0.45), boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : `0 12px 32px ${alpha(color, 0.18)}` },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 14, right: 14, height: '2px', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <Box sx={{ position: 'absolute', bottom: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: alpha(color, 0.07), filter: 'blur(20px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'text.secondary', fontFamily: '"Syne",sans-serif' }}>{label}</Typography>
          {emoji && <Typography sx={{ fontSize: '16px', lineHeight: 1 }}>{emoji}</Typography>}
        </Box>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '2rem', color, lineHeight: 1.1, letterSpacing: '-0.5px' }}>{value ?? '—'}</Typography>
        {sub && <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.75 }}>{sub}</Typography>}
        {trend !== undefined && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1.25, background: trend >= 0 ? alpha('#2EE89A', 0.12) : alpha('#FF5F7E', 0.12), border: `1px solid ${trend >= 0 ? alpha('#2EE89A', 0.25) : alpha('#FF5F7E', 0.25)}`, borderRadius: '100px', px: 1, py: 0.25 }}>
            {trend >= 0 ? <TrendingUp sx={{ fontSize: 11, color: '#2EE89A' }} /> : <TrendingDown sx={{ fontSize: 11, color: '#FF5F7E' }} />}
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: trend >= 0 ? '#2EE89A' : '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>{Math.abs(trend)}%</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Section wrapper ─────────────────────────────────────── */
function Section({ title, subtitle, action, children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  return (
    <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '100%', ...sx }}>
      <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
      <Box sx={{ p: '24px 28px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.3 }}>{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

/* ── Progress bar row ────────────────────────────────────── */
function ProgressRow({ label, count, max, color, rank, sub }) {
  const muiTheme = useMuiTheme();
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <Box sx={{ mb: 2.25, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {rank !== undefined && (
            <Box sx={{ width: 22, height: 22, borderRadius: '7px', background: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif', flexShrink: 0 }}>{rank}</Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>{label}</Typography>
            {sub && <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'capitalize' }}>{sub}</Typography>}
          </Box>
        </Box>
        <Typography sx={{ fontSize: '11px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif', flexShrink: 0, ml: 1 }}>
          {typeof count === 'number' ? count.toLocaleString('fr-FR') : count}{rank !== undefined ? 'x' : ''}
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: '100px', background: muiTheme.palette.divider, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', borderRadius: '100px', background: `linear-gradient(90deg,${alpha(color, 0.7)},${color})`, width: `${pct}%`, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }} />
      </Box>
    </Box>
  );
}

/* ── Stat row ────────────────────────────────────────────── */
function StatRow({ label, value, color }) {
  const muiTheme = useMuiTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '11px', borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '13px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif' }}>{value}</Typography>
    </Box>
  );
}

/* ── Retention SVG gauge ─────────────────────────────────── */
function RetentionGauge({ value }) {
  const color = value >= 70 ? '#2EE89A' : value >= 40 ? '#FFB547' : '#FF5F7E';
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke={alpha(color, 0.12)} strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '20px', color, lineHeight: 1 }}>{value}%</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600 }}>Rétention</Typography>
    </Box>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function ReportsPage() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';
  const gold    = '#FFB547';
  const cyan    = '#5CE1E6';

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,111,255,0.08)';
  const tickColor = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';

  const [dashStats, setDashStats] = useState(null);
  const [reports,   setReports]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [months,    setMonths]    = useState(6);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, rep] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/reports', { params: { months } }),
      ]);
      setDashStats(dash.data.stats);
      setReports(rep.data);
    } finally { setLoading(false); }
  }, [months]);

  useEffect(() => { load(); }, [load]);

  /* ── Export CSV ──────────────────────────────────────────── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/admin/reports/export');
      const rows = [
        ['ID','Utilisateur','Email','Exercice','Catégorie','Date','Durée (min)','Calories'],
        ...(data.data ?? []).map(w => [
          w.id, w.user?.name ?? '', w.user?.email ?? '',
          w.exercise?.name ?? '', w.exercise?.category ?? '',
          w.workout_date ?? '', w.duration ?? '', w.calories_burned ?? '',
        ]),
      ];
      const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `fitpro-${new Date().toISOString().slice(0,10)}.csv` });
      a.click(); URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  /* ── Derived chart data ──────────────────────────────────── */
  const workoutsChart = (reports?.workouts_by_month ?? []).map(r => ({
    name: MONTH_NAMES[(r.m ?? 1) - 1],
    Séances:          r.cnt ?? 0,
    'Calories (k)':   Math.round((r.calories ?? 0) / 1000),
  }));

  const usersChart = (reports?.users_by_month ?? []).map(r => ({
    name:          MONTH_NAMES[(r.m ?? 1) - 1],
    Inscriptions:  r.cnt ?? 0,
  }));

  const dauChart = (reports?.dau_trend ?? []).map(r => ({
    date: r.date?.slice(5) ?? '',
    DAU:  r.dau ?? 0,
  }));

  const catChart = (reports?.category_breakdown ?? []).map((c, i) => ({
    name:  c.category ?? '—',
    value: c.count    ?? 0,
    fill:  PALETTE[i % PALETTE.length],
  }));

  const diffChart = (reports?.difficulty_breakdown ?? []).map((d, i) => ({
    name:  d.difficulty ?? '—',
    value: d.count      ?? 0,
    fill:  [green, gold, '#FF5F7E'][i % 3],
  }));

  const goalChart = (reports?.goal_breakdown ?? []).map((g, i) => ({
    name:  GOAL_LABELS[g.fitness_goal] ?? g.fitness_goal ?? '—',
    value: g.count ?? 0,
    fill:  PALETTE[i % PALETTE.length],
  }));

  const topEx   = (reports?.top_exercises ?? []).slice(0, 7);
  const maxEx   = topEx[0]?.workouts_count ?? 1;
  const stats   = dashStats ?? {};

  const totalPeriodWorkouts  = workoutsChart.reduce((s, r) => s + r['Séances'], 0);
  const totalPeriodCalories  = workoutsChart.reduce((s, r) => s + r['Calories (k)'], 0);
  const totalPeriodNewUsers  = usersChart.reduce((s, r) => s + r['Inscriptions'], 0);

  const pieTooltipStyle = {
    contentStyle: { background: isDark ? '#1A1A28' : '#fff', border: `1px solid ${isDark ? 'rgba(124,111,255,0.25)' : 'rgba(124,111,255,0.15)'}`, borderRadius: '12px', fontSize: '12px', fontFamily: '"Syne",sans-serif' },
    formatter: (v, n) => [`${Number(v).toLocaleString('fr-FR')}`, n],
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return (
    <AppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg,#7C6FFF,#FF5F7E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        </Box>
        <Typography sx={{ color: 'text.secondary', fontFamily: '"Syne",sans-serif', fontWeight: 600 }}>Chargement des rapports…</Typography>
      </Box>
    </AppLayout>
  );

  return (
    <AppLayout>

      {/* ── Header ─────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: alpha(cyan, 0.1), border: `1px solid ${alpha(cyan, 0.25)}`, borderRadius: '100px', px: 1.5, py: 0.4, mb: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: cyan }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: cyan, fontFamily: '"Syne",sans-serif' }}>
              Analytics · {months} mois
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            📊 Rapports & Analytics
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            Vue analytique complète · {reports?.avg_workouts_per_user ?? 0} séances/utilisateur en moyenne
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select size="small" value={months} onChange={e => setMonths(Number(e.target.value))} sx={{ width: 145, ...inputSx }} label="Période">
            {[[1,'1 mois'],[3,'3 mois'],[6,'6 mois'],[12,'12 mois']].map(([v,l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <Button variant="outlined" startIcon={<Refresh />} onClick={load} sx={{ borderRadius: '11px', height: 40 }}>
            Actualiser
          </Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport} disabled={exporting}
            sx={{ borderRadius: '11px', height: 40, background: `linear-gradient(135deg,${primary},${accent})`, border: 'none', '&:hover': { opacity: 0.9 } }}>
            {exporting ? 'Export…' : 'Export CSV'}
          </Button>
        </Box>
      </Box>

      {/* ── KPI strip ──────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3.5}>
        {[
          { label: 'Total séances',       value: stats.total_workouts?.toLocaleString('fr-FR'),                   color: primary,   emoji: '🏋️', sub: `${stats.workouts_this_month ?? 0} ce mois` },
          { label: 'Séances ce mois',     value: stats.workouts_this_month?.toLocaleString('fr-FR'),               color: green,     emoji: '📅', sub: `vs ${stats.workouts_last_month ?? 0} le mois préc.` },
          { label: 'Utilisateurs actifs', value: stats.active_users?.toLocaleString('fr-FR'),                     color: accent,    emoji: '🔥', sub: 'actifs cette semaine' },
          { label: 'Nouveaux/semaine',    value: stats.new_users_week?.toLocaleString('fr-FR'),                    color: gold,      emoji: '📈', trend: stats.user_growth_rate },
          { label: 'Comptes suspendus',   value: stats.suspended_users?.toLocaleString('fr-FR'),                   color: '#FF5F7E', emoji: '🚫' },
          { label: 'Taux de rétention',   value: stats.retention_rate != null ? `${stats.retention_rate}%` : '—', color: cyan,      emoji: '🎯' },
        ].map(s => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={s.label}>
            <KpiCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ── Row 1 : Workouts bar + Inscriptions area ─────────── */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} md={8}>
          <Section title="📈 Séances & Calories par mois" subtitle={`Sur les ${months} derniers mois`}>
            <Box height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutsChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor, fontFamily: '"Syne",sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(124,111,255,0.05)' : 'rgba(124,111,255,0.04)' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: '"Syne",sans-serif', paddingTop: '12px' }} />
                  <Bar dataKey="Séances"      fill={primary} radius={[6,6,0,0]} maxBarSize={32} />
                  <Bar dataKey="Calories (k)" fill={green}   radius={[6,6,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Section>
        </Grid>
        <Grid item xs={12} md={4}>
          <Section title="👥 Nouvelles inscriptions" subtitle={`Sur les ${months} derniers mois`}>
            <Box height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usersChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={accent} stopOpacity={isDark ? 0.3 : 0.2} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tickColor, fontFamily: '"Syne",sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="Inscriptions" stroke={accent} strokeWidth={2.5} fill="url(#userGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Section>
        </Grid>
      </Grid>

      {/* ── Row 2 : DAU + Category pie ───────────────────────── */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} md={7}>
          <Section title="⚡ Utilisateurs actifs / jour" subtitle="DAU — 30 derniers jours">
            <Box height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dauChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={cyan} stopOpacity={isDark ? 0.3 : 0.2} />
                      <stop offset="95%" stopColor={cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor, fontFamily: '"Syne",sans-serif' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="DAU" stroke={cyan} strokeWidth={2.5} fill="url(#dauGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Section>
        </Grid>
        <Grid item xs={12} md={5}>
          <Section title="🥧 Catégories d'exercices" subtitle="Répartition des séances">
            {catChart.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune donnée disponible</Typography>
              </Box>
            ) : (
              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catChart} cx="50%" cy="44%" outerRadius={74} innerRadius={40}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {catChart.map((c, i) => <Cell key={i} fill={c.fill} stroke="none" />)}
                    </Pie>
                    <Tooltip {...pieTooltipStyle} />
                    <Legend iconType="circle" iconSize={7}
                      formatter={v => <span style={{ fontSize: '11px', color: isDark ? '#9090A8' : '#6862A0', fontFamily: '"Syne",sans-serif' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Section>
        </Grid>
      </Grid>

      {/* ── Row 3 : Top exercises + Difficulty + Goals ───────── */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} md={5}>
          <Section title="🏆 Top exercices" subtitle={`Les plus pratiqués (${months} mois)`}>
            {topEx.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1.5 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FitnessCenter sx={{ color: primary, fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Aucune donnée disponible</Typography>
              </Box>
            ) : topEx.map((ex, i) => (
              <ProgressRow key={ex.id} rank={i + 1} label={ex.name}
                count={ex.workouts_count ?? 0} max={maxEx}
                color={PALETTE[i % PALETTE.length]} sub={ex.category} />
            ))}
          </Section>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Section title="⚖️ Par difficulté" subtitle="Exercices actifs sur la plateforme">
            {diffChart.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune donnée</Typography>
              </Box>
            ) : (
              <>
                <Box height={160}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={diffChart} cx="50%" cy="50%" outerRadius={60} innerRadius={34}
                        dataKey="value" nameKey="name" paddingAngle={4}>
                        {diffChart.map((d, i) => <Cell key={i} fill={d.fill} stroke="none" />)}
                      </Pie>
                      <Tooltip {...pieTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '12px', px: '14px', py: '2px', mt: 1.5 }}>
                  {diffChart.map(d => {
                    const labels = { beginner: '🟢 Débutant', intermediate: '🟡 Intermédiaire', advanced: '🔴 Avancé' };
                    const total  = diffChart.reduce((s, x) => s + x.value, 0);
                    const pct    = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <StatRow key={d.name}
                        label={labels[d.name] ?? d.name}
                        value={`${d.value.toLocaleString('fr-FR')} (${pct}%)`}
                        color={d.fill}
                      />
                    );
                  })}
                </Box>
              </>
            )}
          </Section>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Section title="🎯 Objectifs utilisateurs" subtitle="Distribution des fitness goals">
            {goalChart.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune donnée</Typography>
              </Box>
            ) : goalChart.map(g => {
              const total = goalChart.reduce((s, x) => s + x.value, 0);
              const pct   = total > 0 ? Math.round((g.value / total) * 100) : 0;
              return (
                <Box key={g.name} sx={{ py: '10px', borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary', pr: 1 }} noWrap>{g.name}</Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, color: g.fill, fontFamily: '"Syne",sans-serif', flexShrink: 0 }}>{pct}%</Typography>
                  </Box>
                  <Box sx={{ height: 4, borderRadius: '100px', background: muiTheme.palette.divider, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', borderRadius: '100px', background: g.fill, width: `${pct}%`, transition: 'width 0.9s ease' }} />
                  </Box>
                </Box>
              );
            })}
          </Section>
        </Grid>
      </Grid>

      {/* ── Row 4 : Platform health + Avg metric + Export ────── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Section title="🏥 Santé de la plateforme">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <RetentionGauge value={stats.retention_rate ?? 0} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Total utilisateurs',  value: stats.total_users?.toLocaleString('fr-FR') ?? '—', color: primary },
                  { label: 'Coachs actifs',        value: stats.total_coaches ?? '—',                        color: green   },
                  { label: 'Exercices actifs',     value: stats.total_exercises ?? '—',                      color: gold    },
                  { label: 'Programmes actifs',    value: stats.total_programs ?? '—',                       color: accent  },
                ].map(({ label, value, color }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', minWidth: 140 }}>{label}</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif' }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '14px', px: '16px', py: '2px' }}>
              <StatRow label="Séances ce mois"          value={stats.workouts_this_month ?? 0}     color={primary} />
              <StatRow label="Séances mois précédent"   value={stats.workouts_last_month  ?? 0}     color={gold}    />
              <StatRow label="Utilisateurs actifs/sem." value={stats.active_users ?? 0}             color={green}   />
              <StatRow label="Comptes suspendus"        value={stats.suspended_users ?? 0}           color="#FF5F7E" />
            </Box>
          </Section>
        </Grid>

        <Grid item xs={12} md={4}>
          <Section title="📐 Récapitulatif de la période">
            <Box sx={{ textAlign: 'center', p: '18px 20px', mb: 2.5, background: isDark ? alpha(primary, 0.08) : alpha(primary, 0.05), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '16px' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'text.secondary', fontFamily: '"Syne",sans-serif', mb: 0.75 }}>
                Séances / utilisateur
              </Typography>
              <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '3rem', color: primary, lineHeight: 1, letterSpacing: '-1px' }}>
                {reports?.avg_workouts_per_user ?? '—'}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.75 }}>moyenne sur {months} mois</Typography>
            </Box>
            <Box sx={{ background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '14px', px: '16px', py: '2px' }}>
              <StatRow label="Total séances (période)"   value={totalPeriodWorkouts.toLocaleString('fr-FR')} color={primary} />
              <StatRow label="Calories totales (période)" value={`${totalPeriodCalories.toLocaleString('fr-FR')}k kcal`} color={accent} />
              <StatRow label="Nouveaux inscrits"          value={totalPeriodNewUsers.toLocaleString('fr-FR')}  color={green}  />
              <StatRow label="Catégories analysées"       value={catChart.length}                              color={gold}   />
              <StatRow label="Exercices suivis"           value={topEx.length}                                 color={cyan}   />
            </Box>
          </Section>
        </Grid>

        <Grid item xs={12} md={3}>
          <Section title="📤 Export des données">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary', lineHeight: 1.7 }}>
                Téléchargez un rapport complet des séances d'entraînement des 3 derniers mois au format CSV, compatible Excel & Google Sheets.
              </Typography>
              {[
                { label: 'Exercices catalogués',  value: stats.total_exercises ?? '—', color: primary },
                { label: 'Programmes disponibles', value: stats.total_programs  ?? '—', color: green   },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '12px 14px', background: alpha(color, isDark ? 0.08 : 0.05), border: `1px solid ${alpha(color, 0.2)}`, borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{label}</Typography>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '18px', color }}>{value}</Typography>
                </Box>
              ))}
              <Button variant="contained" fullWidth startIcon={<Download />} onClick={handleExport} disabled={exporting}
                sx={{ borderRadius: '12px', py: 1.5, mt: 0.5, fontFamily: '"Syne",sans-serif', fontWeight: 700, letterSpacing: '0.3px', background: `linear-gradient(135deg,${primary},${accent})`, border: 'none', transition: 'all 0.2s', '&:hover': { opacity: 0.9, transform: 'translateY(-1px)', boxShadow: `0 8px 20px ${alpha(primary, 0.35)}` } }}>
                {exporting ? 'Génération…' : 'Télécharger CSV'}
              </Button>
              <Typography sx={{ fontSize: '10px', color: 'text.disabled', textAlign: 'center', mt: -0.5 }}>
                Format UTF-8 · 3 derniers mois
              </Typography>
            </Box>
          </Section>
        </Grid>
      </Grid>

    </AppLayout>
  );
}