import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, CircularProgress,
  Avatar, Chip, List, ListItem, Pagination,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  People, FitnessCenter, MenuBook, TrendingUp,
  ArrowUpward, ArrowDownward, Notifications,
} from '@mui/icons-material';
import { LocalFireDepartment } from '@mui/icons-material';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Palette constants ─────────────────────────────────────── */
const CHART_COLORS = ['#7C6FFF', '#2EE89A', '#FFB547', '#FF5F7E', '#5CE1E6'];

/* ─── Custom tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: isDark ? '#1A1A28' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,95,232,0.15)'}`,
      borderRadius: '12px', p: '10px 14px',
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(108,95,232,0.15)',
    }}>
      <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#8880C0', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#0D0B1E', fontFamily: '"Syne", sans-serif' }}>
            {p.value} <span style={{ fontWeight: 400, opacity: 0.6 }}>{p.name}</span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({ title, value, icon, color, trend, sub }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', p: '22px', height: '100%',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: alpha(color, 0.4),
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.4)' : `0 12px 32px ${alpha(color, 0.18)}`,
      },
    }}>
      {/* top accent */}
      <Box sx={{
        position: 'absolute', top: 0, left: 20, right: 20, height: '2px',
        background: `linear-gradient(90deg,transparent,${color},transparent)`,
      }} />
      {/* glow */}
      <Box sx={{
        position: 'absolute', bottom: -24, right: -24, width: 100, height: 100,
        borderRadius: '50%', background: alpha(color, 0.08), filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <Box>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'text.secondary', mb: 1, fontFamily: '"Syne", sans-serif' }}>
            {title}
          </Typography>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '2rem', color, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {value ?? '—'}
          </Typography>
          {sub && (
            <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.75 }}>{sub}</Typography>
          )}
        </Box>
        <Box sx={{
          width: 46, height: 46, borderRadius: '14px', flexShrink: 0,
          background: alpha(color, isDark ? 0.12 : 0.1),
          border: `1px solid ${alpha(color, 0.25)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, '& svg': { fontSize: 22 },
        }}>
          {icon}
        </Box>
      </Box>

      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, position: 'relative' }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            background: trend >= 0 ? alpha('#2EE89A', 0.12) : alpha('#FF5F7E', 0.12),
            border: `1px solid ${trend >= 0 ? alpha('#2EE89A', 0.25) : alpha('#FF5F7E', 0.25)}`,
            borderRadius: '100px', px: 1, py: 0.25,
          }}>
            {trend >= 0
              ? <ArrowUpward sx={{ fontSize: 11, color: '#2EE89A' }} />
              : <ArrowDownward sx={{ fontSize: 11, color: '#FF5F7E' }} />
            }
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: trend >= 0 ? '#2EE89A' : '#FF5F7E', fontFamily: '"Syne", sans-serif' }}>
              {Math.abs(trend)}% vs last week
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ─── Section card ──────────────────────────────────────────── */
function SectionCard({ title, action, children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      position: 'relative', transition: 'background 0.3s',
      ...sx,
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
      <Box sx={{ p: '24px 28px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
            {title}
          </Typography>
          {action}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

/* ─── Activity item ─────────────────────────────────────────── */
function ActivityItem({ item, isDark, primary }) {
  const muiTheme = useMuiTheme();
  const label = new Date(item.workout_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
      borderBottom: `1px solid ${muiTheme.palette.divider}`,
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '11px', flexShrink: 0,
        background: alpha(primary, 0.12), border: `1px solid ${alpha(primary, 0.2)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '13px', color: primary,
      }}>
        {item.user?.name?.charAt(0)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }} noWrap>
          {item.user?.name}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
          {label} · {item.calories_burned} kcal · {item.duration} min
        </Typography>
      </Box>
      <Box sx={{
        background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`,
        borderRadius: '100px', px: 1.25, py: 0.25, flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, fontFamily: '"Syne", sans-serif' }}>
          Workout
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Top exercise bar ──────────────────────────────────────── */
function ExerciseBar({ ex, rank, maxCount, color }) {
  const muiTheme = useMuiTheme();
  const pct = (ex.count / (maxCount || 1)) * 100;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 20, height: 20, borderRadius: '6px', flexShrink: 0,
            background: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.3)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 800, color, fontFamily: '"Syne", sans-serif',
          }}>
            {rank}
          </Box>
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }} noWrap>
            {ex.name}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color, fontFamily: '"Syne", sans-serif', flexShrink: 0 }}>
          {ex.count}x
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: '100px', background: muiTheme.palette.divider, overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: '100px',
          background: `linear-gradient(90deg, ${color}CC, ${color})`,
          width: `${pct}%`, transition: 'width 0.8s ease',
        }} />
      </Box>
    </Box>
  );
}

export default function CoachDashboard() {
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';

  const grid = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(108,95,232,0.08)';
  const tick = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';

  const [data, setData]           = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.get('/coach/dashboard'), api.get('/coach/analytics?period=30')])
      .then(([dash, an]) => { setData(dash.data); setAnalytics(an.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AppLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #7C6FFF, #FF5F7E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        </Box>
        <Typography sx={{ color: 'text.secondary', fontFamily: '"Syne", sans-serif', fontWeight: 600 }}>
          Chargement du dashboard…
        </Typography>
      </Box>
    </AppLayout>
  );

  const goalDist   = analytics?.users_goal_dist ?? [];
  const topEx      = analytics?.top_exercises ?? [];
  const maxCount   = topEx[0]?.count || 1;

  return (
    <AppLayout>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: isDark ? 'rgba(46,232,154,0.1)' : 'rgba(24,201,122,0.1)', border: `1px solid ${isDark ? 'rgba(46,232,154,0.25)' : 'rgba(24,201,122,0.25)'}`, borderRadius: '100px', px: 1.5, py: 0.4, mb: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: green, animation: 'blink 2s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } } }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: green, fontFamily: '"Syne", sans-serif' }}>En ligne</Typography>
          </Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            Coach Dashboard 💪
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            Bonjour, Coach {user?.name?.split(' ')[0]} — voici votre résumé du jour
          </Typography>
        </Box>
        <Box sx={{
          width: 44, height: 44, borderRadius: '14px', cursor: 'pointer',
          background: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'all 0.2s',
          '&:hover': { borderColor: alpha(primary, 0.4) },
        }}>
          <Notifications sx={{ fontSize: 20, color: 'text.secondary' }} />
          {data?.stats?.unread_messages > 0 && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#FF5F7E' }} />
          )}
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} mb={3.5}>
        {[
          { title: 'Utilisateurs assignés', value: data?.stats?.assigned_users,     icon: <People />,            color: primary, sub: `${data?.stats?.week_workouts ?? 0} séances cette semaine` },
          { title: 'Programmes actifs',     value: data?.stats?.created_programs,   icon: <MenuBook />,          color: green   },
          { title: 'Exercices créés',       value: data?.stats?.created_exercises,  icon: <FitnessCenter />,     color: '#FFB547' },
          { title: 'Séances (30j)',         value: analytics?.total_workouts,        icon: <TrendingUp />,        color: '#5CE1E6', sub: `${analytics?.total_calories?.toLocaleString() ?? 0} kcal brûlées` },
          { title: 'Utilisateurs actifs',   value: analytics?.active_users,          icon: <LocalFireDepartment />, color: accent, sub: 'actifs cette semaine' },
        ].map(s => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* ── Charts row ── */}
      <Grid container spacing={2.5} mb={2.5}>
        {/* Workouts over time */}
        <Grid item xs={12} md={8}>
          <SectionCard title="📈 Séances par jour (30 derniers jours)">
            <Box height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.workouts_by_day ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coachAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={primary} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} tickFormatter={v => v?.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="count" stroke={primary} strokeWidth={2.5} fill="url(#coachAreaGrad)" dot={false} name="Séances" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        {/* Goal distribution */}
        <Grid item xs={12} md={4}>
          <SectionCard title="🎯 Objectifs utilisateurs">
            {goalDist.length > 0 ? (
              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={goalDist} cx="50%" cy="45%" outerRadius={75} innerRadius={42} dataKey="count" nameKey="fitness_goal" paddingAngle={3}>
                      {goalDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Legend
                      formatter={v => <span style={{ fontSize: '11px', color: isDark ? '#9090A8' : '#6862A0' }}>{v?.replace('_', ' ')}</span>}
                    />
                    <Tooltip
                      formatter={(v, n) => [v, n?.replace('_', ' ')]}
                      contentStyle={{ background: isDark ? '#1A1A28' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,95,232,0.15)'}`, borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune donnée</Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Bottom row ── */}
      <Grid container spacing={2.5}>
        {/* Recent users */}
        <Grid item xs={12} md={5}>
          <SectionCard
            title="👥 Mes utilisateurs récents"
            action={
              <Box sx={{ background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '100px', px: 1.5, py: 0.4 }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: primary, fontFamily: '"Syne", sans-serif' }}>
                  {data?.stats?.assigned_users ?? 0} total
                </Typography>
              </Box>
            }
          >
            {!data?.recent_users?.length ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <People sx={{ color: primary, fontSize: 26 }} />
                </Box>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucun utilisateur assigné</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {data.recent_users.map(u => (
                  <Box key={u.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5,
                    borderBottom: `1px solid ${muiTheme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}>
                    <Box sx={{
                      width: 38, height: 38, borderRadius: '12px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${alpha(primary, 0.3)}, ${alpha(accent, 0.2)})`,
                      border: `1px solid ${alpha(primary, 0.2)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '14px', color: primary,
                    }}>
                      {u.name?.charAt(0)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }} noWrap>{u.name}</Typography>
                      <Typography sx={{ fontSize: '11px', color: 'text.secondary', textTransform: 'capitalize' }}>
                        {u.fitness_goal?.replace('_', ' ') || 'Objectif non défini'}
                      </Typography>
                    </Box>
                    <Box sx={{
                      background: alpha(green, 0.1), border: `1px solid ${alpha(green, 0.2)}`,
                      borderRadius: '100px', px: 1.25, py: 0.25, flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: green, fontFamily: '"Syne", sans-serif' }}>
                        {u.workouts?.length ?? 0} séances
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>

        {/* Recent activity */}
        <Grid item xs={12} md={4}>
          <SectionCard title="⚡ Activité récente">
            {!data?.recent_activity?.length ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune activité récente</Typography>
              </Box>
            ) : (
              data.recent_activity.map(item => (
                <ActivityItem key={item.id} item={item} isDark={isDark} primary={primary} />
              ))
            )}
          </SectionCard>
        </Grid>

        {/* Top exercises */}
        <Grid item xs={12} md={3}>
          <SectionCard title="🏆 Top exercices">
            {topEx.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucune donnée</Typography>
              </Box>
            ) : (
              topEx.map((ex, i) => (
                <ExerciseBar key={ex.name} ex={ex} rank={i + 1} maxCount={maxCount} color={CHART_COLORS[i % CHART_COLORS.length]} />
              ))
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </AppLayout>
  );
}