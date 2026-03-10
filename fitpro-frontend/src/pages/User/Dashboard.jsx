import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, CircularProgress,
  Avatar, Chip, List, ListItem, IconButton, Tooltip, Alert,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  FitnessCenter, EmojiEvents, TrendingUp, CalendarToday,
  TrendingDown, Remove, Refresh,
} from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Section card ───────────────────────────────────────────── */
function SectionCard({ title, children, action, sx = {} }) {
  const muiTheme = useMuiTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      transition: 'background 0.3s, border-color 0.3s',
      position: 'relative', ...sx,
    }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 28, right: 28, height: '1px',
        background: `linear-gradient(90deg,transparent,${alpha(muiTheme.palette.primary.main, 0.4)},transparent)`,
      }} />
      <Box sx={{ p: '24px 28px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '16px', color: 'text.primary' }}>
            {title}
          </Typography>
          {action}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

/* ─── Streak badge ───────────────────────────────────────────── */
function StreakBadge({ days = 0 }) {
  const fire = days >= 7 ? '#FF5F7E' : days >= 3 ? '#FFB547' : '#7C6FFF';
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: alpha(fire, 0.1), border: `1px solid ${alpha(fire, 0.25)}`,
      borderRadius: '16px', p: '16px 20px',
    }}>
      <Typography sx={{ fontSize: '28px', lineHeight: 1 }}>🔥</Typography>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '28px', color: fire, lineHeight: 1.1, mt: 0.5 }}>
        {days}
      </Typography>
      <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>day streak</Typography>
    </Box>
  );
}

/* ─── BMI bar ────────────────────────────────────────────────── */
function BmiCard({ bmi }) {
  if (!bmi) return null;
  const { label, color } =
    bmi < 18.5 ? { label: 'Underweight', color: '#5CE1E6' } :
    bmi < 25   ? { label: 'Normal',      color: '#2EE89A' } :
    bmi < 30   ? { label: 'Overweight',  color: '#FFB547' } :
                 { label: 'Obese',       color: '#FF5F7E' };
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>BMI</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color }}>
            {bmi}
          </Typography>
          <Chip label={label} size="small" sx={{
            height: 18, fontSize: '10px', fontWeight: 700,
            background: alpha(color, 0.12), color,
            border: `1px solid ${alpha(color, 0.25)}`,
            borderRadius: '100px',
          }} />
        </Box>
      </Box>
      <Box sx={{ height: 6, borderRadius: '100px', background: alpha(color, 0.15), overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', width: `${pct}%`, borderRadius: '100px',
          background: `linear-gradient(90deg, #2EE89A, ${color})`,
          transition: 'width 1s ease',
        }} />
      </Box>
    </Box>
  );
}

/* ─── Chart tooltip ──────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: isDark ? '#1A1A28' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,95,232,0.15)'}`,
      borderRadius: '12px', p: '10px 14px',
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(108,95,232,0.15)',
    }}>
      <Typography sx={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.5)' : '#8880C0', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#0D0B1E', fontFamily: '"Syne", sans-serif' }}>
            {p.value}{' '}
            <span style={{ fontWeight: 400, opacity: 0.6 }}>{p.name}</span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ─── Notification banner ─────────────────────────────────────── */
function NotificationBanner({ notifications = [] }) {
  if (!notifications.length) return null;
  const n = notifications[0];
  const color = n.type === 'achievement' ? '#2EE89A' : '#FFB547';
  return (
    <Box sx={{
      background: alpha(color, 0.08),
      border: `1px solid ${alpha(color, 0.25)}`,
      borderRadius: '14px', p: '12px 20px', mb: 3,
      display: 'flex', alignItems: 'center', gap: 1.5,
    }}>
      <Typography sx={{ fontSize: '20px' }}>
        {n.type === 'achievement' ? '🏆' : '💡'}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color }}>
          {n.title}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
          {n.message}
        </Typography>
      </Box>
    </Box>
  );
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const moodEmoji = (mood) => {
  const map = { great: '😄', good: '🙂', okay: '😐', tired: '😴', bad: '😞' };
  return map[mood] ?? '';
};

/* ══════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════ */
export default function UserDashboard() {
  const { user }   = useAuth();
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();

  /* All state has safe initial values — no null dereferences */
  const [dashData, setDashData]             = useState({ stats: {}, recent_workouts: [] });
  const [workoutStats, setWorkoutStats]     = useState({ weekly_activity: [] });
  const [notifications, setNotifications]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';
  const grid    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(108,95,232,0.08)';
  const tick    = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /*
       * Use Promise.allSettled so a 500 on ONE endpoint
       * does NOT crash the whole page.
       */
      const [dashRes, statsRes, notifRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/workouts/stats'),
        api.get('/notifications'),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashData(dashRes.value.data ?? { stats: {}, recent_workouts: [] });
      } else {
        console.error('Dashboard endpoint error:', dashRes.reason?.response?.data ?? dashRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        setWorkoutStats(statsRes.value.data ?? { weekly_activity: [] });
      } else {
        console.error('Workout stats endpoint error:', statsRes.reason?.response?.data ?? statsRes.reason);
      }

      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data ?? []);
      }

      // Only show a blocking error if the main dashboard call failed
      if (dashRes.status === 'rejected') {
        setError('Could not load dashboard stats. Check your API connection.');
      }
    } catch (err) {
      setError('Unexpected error loading dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Safe accessors – always fall back to {} / [] */
  const stats          = dashData?.stats          ?? {};
  const recentWorkouts = dashData?.recent_workouts ?? [];
  const weeklyActivity = workoutStats?.weekly_activity ?? [];

  const weightTrend = stats.weight_change ?? null;
  const TrendIcon   = weightTrend > 0 ? TrendingUp : weightTrend < 0 ? TrendingDown : Remove;
  const trendColor  = weightTrend > 0 ? '#FF5F7E' : weightTrend < 0 ? green : 'text.secondary';

  /* ── Loading state ── */
  if (loading) return (
    <AppLayout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <Box sx={{
          width: 56, height: 56, borderRadius: '16px',
          background: 'linear-gradient(135deg, #7C6FFF, #FF5F7E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        </Box>
        <Typography sx={{ color: 'text.secondary', fontFamily: '"Syne", sans-serif', fontWeight: 600 }}>
          Loading your dashboard…
        </Typography>
      </Box>
    </AppLayout>
  );

  /* ══ Render ══════════════════════════════════════════════════ */
  return (
    <AppLayout>

      {/* Non-blocking error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Header ── */}
      <Box mb={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              background: isDark ? 'rgba(46,232,154,0.1)' : 'rgba(24,201,122,0.1)',
              border: `1px solid ${isDark ? 'rgba(46,232,154,0.25)' : 'rgba(24,201,122,0.25)'}`,
              borderRadius: '100px', px: 1.5, py: 0.4,
            }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', background: green,
                animation: 'blink 2s infinite',
                '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
              }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: green, fontFamily: '"Syne", sans-serif', letterSpacing: '0.5px' }}>
                Active today
              </Typography>
            </Box>
          </Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'}! 👋
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.5, fontSize: '14px' }}>
            Here's your fitness overview for today.
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={load} sx={{ color: 'text.secondary', mt: 1 }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Notification banner ── */}
      <NotificationBanner notifications={notifications} />

      {/* ── Stat cards ── */}
      <Grid container spacing={2.5} mb={3.5}>
        {[
          { title: 'Total Workouts',  value: stats.total_workouts  ?? 0,                icon: <FitnessCenter />, color: primary   },
          { title: 'Calories Burned', value: `${stats.total_calories ?? 0} kcal`,       icon: <WhatshotIcon />,  color: accent    },
          { title: 'This Week',       value: `${stats.week_workouts ?? 0} sessions`,    icon: <CalendarToday />, color: green     },
          { title: 'Active Programs', value: stats.active_programs  ?? 0,               icon: <EmojiEvents />,   color: '#FFB547' },
        ].map((s) => (
          <Grid item xs={12} sm={6} xl={3} key={s.title}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>

        {/* ── Weekly Activity chart ── */}
        <Grid item xs={12} lg={8}>
          <SectionCard title="📊 Weekly Activity">
            {weeklyActivity.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
                  No activity data yet — log your first workout! 💪
                </Typography>
              </Box>
            ) : (
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyActivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={primary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={primary} stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={accent}  stopOpacity={0.2}  />
                        <stop offset="95%" stopColor={accent}  stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <RechartTooltip content={<ChartTooltip isDark={isDark} />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Area type="monotone" dataKey="calories" stroke={primary} fill="url(#calGrad)" strokeWidth={2.5} dot={false} name="Calories" />
                    <Area type="monotone" dataKey="duration" stroke={accent}  fill="url(#durGrad)" strokeWidth={2.5} dot={false} strokeDasharray="5 5" name="Duration (min)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── Profile card ── */}
        <Grid item xs={12} lg={4}>
          <SectionCard title="👤 My Profile">
            <Box display="flex" flexDirection="column" alignItems="center" py={1}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar sx={{
                  width: 72, height: 72, borderRadius: '20px',
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '26px',
                  boxShadow: `0 8px 24px ${alpha(primary, 0.4)}`,
                }}>
                  {user?.name?.charAt(0) ?? '?'}
                </Avatar>
                <Box sx={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: green,
                  border: `2px solid ${muiTheme.palette.background.paper}`,
                }} />
              </Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>
                {user?.name ?? '—'}
              </Typography>
              {user?.fitness_goal && (
                <Chip
                  label={user.fitness_goal.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    mt: 1, textTransform: 'capitalize',
                    fontFamily: '"Syne", sans-serif', fontWeight: 700,
                    background: alpha(primary, 0.12),
                    border: `1px solid ${alpha(primary, 0.25)}`,
                    color: primary, borderRadius: '100px', fontSize: '11px',
                  }}
                />
              )}
            </Box>

            <Box sx={{ height: '1px', background: muiTheme.palette.divider, my: 2 }} />

            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={5}>
                <StreakBadge days={stats.streak_days ?? 0} />
              </Grid>
              <Grid item xs={7}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    ['Age',    `${user?.age    ?? '—'} years`],
                    ['Height', `${user?.height ?? '—'} cm`],
                  ].map(([label, val]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>{label}</Typography>
                      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
                        {val}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Weight</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
                        {stats.current_weight ?? user?.weight ?? '—'} kg
                      </Typography>
                      {weightTrend !== null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
                          <Typography sx={{ fontSize: '11px', color: trendColor, fontWeight: 700 }}>
                            {Math.abs(weightTrend)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <BmiCard bmi={stats.bmi} />
          </SectionCard>
        </Grid>

        {/* ── Monthly comparison ── */}
        {stats.month_comparison != null && (
          <Grid item xs={12}>
            <Box sx={{
              background: stats.month_comparison >= 0 ? alpha(green, 0.07) : alpha('#FF5F7E', 0.07),
              border: `1px solid ${stats.month_comparison >= 0 ? alpha(green, 0.2) : alpha('#FF5F7E', 0.2)}`,
              borderRadius: '16px', p: '14px 24px',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <Typography sx={{ fontSize: '22px' }}>
                {stats.month_comparison >= 0 ? '📈' : '📉'}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: 'text.primary' }}>
                You worked out{' '}
                <strong style={{ color: stats.month_comparison >= 0 ? green : '#FF5F7E' }}>
                  {Math.abs(stats.month_comparison)}%{' '}
                  {stats.month_comparison >= 0 ? 'more' : 'less'}
                </strong>{' '}
                this month compared to last month.
              </Typography>
            </Box>
          </Grid>
        )}

        {/* ── Recent Workouts ── */}
        <Grid item xs={12}>
          <SectionCard title="⚡ Recent Workouts">
            {recentWorkouts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '20px',
                  background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <FitnessCenter sx={{ color: primary, fontSize: 28 }} />
                </Box>
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  No workouts yet. Start your first workout! 💪
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {recentWorkouts.map((w, i) => (
                  <React.Fragment key={w.id}>
                    <ListItem disablePadding sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 44, height: 44, borderRadius: '13px', flexShrink: 0,
                        background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FitnessCenter sx={{ color: primary, fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary' }} noWrap>
                          {w.exercise?.name ?? 'Workout'}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
                          {w.workout_date} · {w.duration} min
                          {w.mood && ` · ${moodEmoji(w.mood)}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${w.calories_burned} kcal`}
                        size="small"
                        sx={{
                          fontFamily: '"Syne", sans-serif', fontWeight: 700, borderRadius: '100px',
                          background: alpha(accent, 0.12), border: `1px solid ${alpha(accent, 0.25)}`,
                          color: accent, fontSize: '11px',
                        }}
                      />
                    </ListItem>
                    {i < recentWorkouts.length - 1 && (
                      <Box sx={{ height: '1px', background: muiTheme.palette.divider }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>

      </Grid>
    </AppLayout>
  );
}