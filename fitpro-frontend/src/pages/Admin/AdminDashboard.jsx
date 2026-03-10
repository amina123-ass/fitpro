import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Divider } from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  People, SupervisorAccount, FitnessCenter, MenuBook, TrendingUp,
  TrendingDown, Refresh,
} from '@mui/icons-material';
import { LocalFireDepartment } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

const COLORS      = ['#7C6FFF', '#2EE89A', '#FFB547', '#FF5F7E', '#5CE1E6', '#A78BFA'];
const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

/* ─── Custom tooltip ─────────────────────────────────────────── */
function ChartTip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: isDark ? '#1A1A28' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,111,255,0.2)'}`,
      borderRadius: '12px', p: '10px 14px',
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(124,111,255,0.15)',
    }}>
      <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#8880C0', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#0D0B1E', fontFamily: '"Syne",sans-serif' }}>
            {p.value} <span style={{ fontWeight: 400, opacity: 0.6 }}>{p.name}</span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({ title, value, icon, color, sub, trend }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', p: '22px', height: '100%',
      position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
      '&:hover': { transform: 'translateY(-4px)', borderColor: alpha(color, 0.4), boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : `0 12px 32px ${alpha(color, 0.18)}` },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 16, right: 16, height: '2px', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
      <Box sx={{ position: 'absolute', bottom: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: alpha(color, 0.07), filter: 'blur(20px)', pointerEvents: 'none' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <Box>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'text.secondary', mb: 1, fontFamily: '"Syne",sans-serif' }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '2rem', color, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {value ?? '—'}
          </Typography>
          {sub && <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.75 }}>{sub}</Typography>}
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: '13px', background: alpha(color, isDark ? 0.12 : 0.1), border: `1px solid ${alpha(color, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, '& svg': { fontSize: 21 } }}>
          {icon}
        </Box>
      </Box>
      {trend !== undefined && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.75, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: trend >= 0 ? alpha('#2EE89A', 0.12) : alpha('#FF5F7E', 0.12), border: `1px solid ${trend >= 0 ? alpha('#2EE89A', 0.25) : alpha('#FF5F7E', 0.25)}`, borderRadius: '100px', px: 1, py: 0.25 }}>
            {trend >= 0 ? <TrendingUp sx={{ fontSize: 11, color: '#2EE89A' }} /> : <TrendingDown sx={{ fontSize: 11, color: '#FF5F7E' }} />}
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: trend >= 0 ? '#2EE89A' : '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>
              {Math.abs(trend)}% vs sem. dernière
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ─── Section card ───────────────────────────────────────────── */
function Section({ title, action, children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  return (
    <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '100%', ...sx }}>
      <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
      <Box sx={{ p: '24px 28px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>{title}</Typography>
          {action}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

/* ─── Tab pill ───────────────────────────────────────────────── */
function TabPill({ label, active, onClick, primary }) {
  return (
    <Box onClick={onClick} sx={{
      px: 2, py: 0.75, borderRadius: '100px', cursor: 'pointer', fontSize: '12px',
      fontWeight: active ? 700 : 500, fontFamily: '"Syne",sans-serif', transition: 'all 0.2s',
      background: active ? alpha(primary, 0.12) : 'transparent',
      border: `1px solid ${active ? alpha(primary, 0.35) : 'transparent'}`,
      color: active ? primary : 'text.secondary',
      '&:hover': { color: primary },
    }}>
      {label}
    </Box>
  );
}

/* ─── Retention gauge ────────────────────────────────────────── */
function RetentionGauge({ value }) {
  const color = value >= 70 ? '#2EE89A' : value >= 40 ? '#FFB547' : '#FF5F7E';
  const r = 44, circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '22px', color, lineHeight: 1 }}>{value}%</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.75, fontWeight: 600 }}>Taux de rétention</Typography>
    </Box>
  );
}

/* ─── Exercise bar ───────────────────────────────────────────── */
function ExBar({ ex, rank, maxVal, color }) {
  const muiTheme = useMuiTheme();
  const pct = (ex.workouts_count / (maxVal || 1)) * 100;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 22, height: 22, borderRadius: '7px', background: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif', flexShrink: 0 }}>{rank}</Box>
          <Box>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>{ex.name}</Typography>
            <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'capitalize' }}>{ex.category}</Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color, fontFamily: '"Syne",sans-serif', flexShrink: 0 }}>{ex.workouts_count}x</Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: '100px', background: muiTheme.palette.divider, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', borderRadius: '100px', background: `linear-gradient(90deg, ${color}CC, ${color})`, width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </Box>
    </Box>
  );
}

/* ─── User row ───────────────────────────────────────────────── */
function UserRow({ u }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  const accent   = muiTheme.palette.secondary.main;
  const roleColor = u.role === 'admin' ? '#FF5F7E' : u.role === 'coach' ? '#2EE89A' : primary;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '11px', background: alpha(roleColor, 0.15), border: `1px solid ${alpha(roleColor, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '13px', color: roleColor, flexShrink: 0 }}>
        {u.name?.charAt(0)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }} noWrap>{u.name}</Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }} noWrap>{u.email}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Box sx={{ background: alpha(roleColor, 0.1), border: `1px solid ${alpha(roleColor, 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.2 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: roleColor, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{u.role}</Typography>
        </Box>
        {!u.is_active && (
          <Box sx={{ background: alpha('#FF5F7E', 0.08), border: `1px solid ${alpha('#FF5F7E', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.2 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>Suspendu</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── Workout row ────────────────────────────────────────────── */
function WorkoutRow({ w }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  const accent   = muiTheme.palette.secondary.main;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '11px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FitnessCenter sx={{ fontSize: 16, color: primary }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }} noWrap>{w.exercise?.name ?? 'Exercice'}</Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
          {w.user?.name} · {new Date(w.workout_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: accent }}>🔥 {w.calories_burned} kcal</Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{w.duration} min</Typography>
      </Box>
    </Box>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';

  const grid = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(124,111,255,0.08)';
  const tick = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';

  const [data, setData]       = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState(0);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/reports?months=6')])
      .then(([d, r]) => { setData(d.data); setReports(r.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <AppLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg,#7C6FFF,#FF5F7E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        </Box>
        <Typography sx={{ color: 'text.secondary', fontFamily: '"Syne",sans-serif', fontWeight: 600 }}>Chargement…</Typography>
      </Box>
    </AppLayout>
  );

  const chartData = (reports?.workouts_by_month ?? []).map(r => ({ name: MONTH_NAMES[r.m - 1], workouts: r.cnt, calories: Math.round(r.calories / 1000) }));
  const userChartData = (reports?.users_by_month ?? []).map(r => ({ name: MONTH_NAMES[r.m - 1], users: r.cnt }));
  const dauData = (reports?.dau_trend ?? []).map(r => ({ date: r.date?.slice(5), dau: r.dau }));
  const stats = data?.stats ?? {};
  const topEx = reports?.top_exercises?.slice(0, 5) ?? [];

  const TABS = ['📈 Séances', '👥 Utilisateurs', '⚡ DAU (30j)'];

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: alpha('#FF5F7E', 0.1), border: `1px solid ${alpha('#FF5F7E', 0.25)}`, borderRadius: '100px', px: 1.5, py: 0.4, mb: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5F7E' }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>Admin</Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            🛡️ Admin Dashboard
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Vue globale de la plateforme FitPro</Typography>
        </Box>
        <Box onClick={load} sx={{ width: 44, height: 44, borderRadius: '14px', cursor: 'pointer', background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', '&:hover': { borderColor: alpha(primary, 0.4) } }}>
          <Refresh sx={{ fontSize: 20, color: 'text.secondary' }} />
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3.5}>
        {[
          { title: 'Utilisateurs',       value: stats.total_users,     icon: <People />,            color: primary,  trend: stats.user_growth_rate, sub: `${stats.new_users_week ?? 0} nouveaux/sem.` },
          { title: 'Coachs actifs',      value: stats.total_coaches,   icon: <SupervisorAccount />, color: green },
          { title: 'Utilisateurs actifs',value: stats.active_users,    icon: <LocalFireDepartment />, color: '#FF5F7E', sub: 'actifs cette semaine' },
          { title: 'Exercices',          value: stats.total_exercises, icon: <FitnessCenter />,     color: '#FFB547' },
          { title: 'Programmes',         value: stats.total_programs,  icon: <MenuBook />,          color: '#5CE1E6' },
          { title: 'Séances totales',    value: stats.total_workouts,  icon: <TrendingUp />,        color: accent,   sub: `${stats.workouts_this_month ?? 0} ce mois` },
        ].map(s => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative', mb: 3 }}>
        <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
        <Box sx={{ px: '24px', pt: '22px', pb: 0 }}>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {TABS.map((label, i) => (
              <TabPill key={label} label={label} active={tab === i} onClick={() => setTab(i)} primary={primary} />
            ))}
          </Box>
        </Box>
        <Divider sx={{ mt: 2 }} />
        <Box sx={{ p: '20px 28px' }}>
          <Box height={240}>
            <ResponsiveContainer width="100%" height="100%">
              {tab === 0 ? (
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip isDark={isDark} />} />
                  <Bar dataKey="workouts" fill={primary} radius={[6, 6, 0, 0]} name="Séances" />
                  <Bar dataKey="calories" fill={green} radius={[6, 6, 0, 0]} name="Calories (k)" />
                </BarChart>
              ) : tab === 1 ? (
                <AreaChart data={userChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminUserGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip isDark={isDark} />} />
                  <Area type="monotone" dataKey="users" stroke={accent} strokeWidth={2.5} fill="url(#adminUserGrad)" dot={false} name="Nouveaux utilisateurs" />
                </AreaChart>
              ) : (
                <LineChart data={dauData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip isDark={isDark} />} />
                  <Line type="monotone" dataKey="dau" stroke="#5CE1E6" strokeWidth={2.5} dot={false} name="Actifs/jour" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      {/* Bottom row */}
      <Grid container spacing={2.5}>
        {/* Top exercises */}
        <Grid item xs={12} md={4}>
          <Section title="🏆 Top 5 Exercices">
            {topEx.map((ex, i) => (
              <ExBar key={ex.id} ex={ex} rank={i + 1} maxVal={topEx[0]?.workouts_count || 1} color={COLORS[i % COLORS.length]} />
            ))}
            {!topEx.length && <Typography sx={{ color: 'text.secondary', fontSize: '13px', textAlign: 'center', py: 3 }}>Aucune donnée</Typography>}
          </Section>
        </Grid>

        {/* Category pie */}
        <Grid item xs={12} md={4}>
          <Section title="📊 Répartition par catégorie">
            <Box height={210}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reports?.category_breakdown ?? []} cx="50%" cy="45%" outerRadius={72} innerRadius={40} dataKey="count" nameKey="category" paddingAngle={3}>
                    {(reports?.category_breakdown ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Legend formatter={v => <span style={{ fontSize: '11px', color: isDark ? '#9090A8' : '#6862A0' }}>{v}</span>} />
                  <Tooltip
                    contentStyle={{ background: isDark ? '#1A1A28' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,111,255,0.15)'}`, borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Section>
        </Grid>

        {/* Platform health */}
        <Grid item xs={12} md={4}>
          <Section title="🎯 Santé de la plateforme">
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
              <RetentionGauge value={stats.retention_rate ?? 0} />
            </Box>
            <Box sx={{ background: isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.03), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '14px', px: '16px', py: '4px' }}>
              {[
                { label: 'Comptes actifs',    value: stats.total_users - (stats.suspended_users ?? 0), color: green },
                { label: 'Comptes suspendus', value: stats.suspended_users ?? 0, color: '#FF5F7E' },
                { label: 'Séances ce mois',   value: stats.workouts_this_month ?? 0, color: primary },
                { label: 'Séances mois préc.',value: stats.workouts_last_month ?? 0, color: '#FFB547' },
              ].map(({ label, value, color }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{label}</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 800, color, fontFamily: '"Syne",sans-serif' }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Section>
        </Grid>

        {/* Recent users */}
        <Grid item xs={12} md={6}>
          <Section title="👥 Derniers inscrits">
            {(data?.recent_users ?? []).map(u => <UserRow key={u.id} u={u} />)}
          </Section>
        </Grid>

        {/* Recent workouts */}
        <Grid item xs={12} md={6}>
          <Section title="⚡ Séances récentes">
            {(data?.recent_workouts ?? []).map(w => <WorkoutRow key={w.id} w={w} />)}
          </Section>
        </Grid>
      </Grid>
    </AppLayout>
  );
}