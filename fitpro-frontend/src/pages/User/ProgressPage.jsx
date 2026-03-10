// ─────────────────────────────────────────────────────────────────
// ProgressPage.jsx — Enhanced with body composition, achievements
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Button, TextField, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress,
  LinearProgress, Tooltip,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Add, Close, TrendingUp, Timer, FitnessCenter, EmojiEvents } from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

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
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#0D0B1E', fontFamily: '"Syne", sans-serif' }}>
            {p.value} <span style={{ fontWeight: 400, opacity: 0.6 }}>{p.name}</span>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function ChartCard({ title, children }) {
  const muiTheme = useMuiTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', p: '24px 28px',
      position: 'relative', overflow: 'hidden', transition: 'background 0.3s',
    }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 28, right: 28, height: '1px',
        background: `linear-gradient(90deg,transparent,${alpha(muiTheme.palette.primary.main, 0.4)},transparent)`,
      }} />
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary', mb: 2.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/* ─── Achievement card ───────────────────────────────────────── */
function AchievementCard({ a }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  const color    = a.earned ? '#FFB547' : 'text.disabled';
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${a.earned ? alpha('#FFB547', 0.3) : muiTheme.palette.divider}`,
      borderRadius: '16px', p: '16px',
      display: 'flex', alignItems: 'center', gap: 1.5,
      opacity: a.earned ? 1 : 0.5,
      transition: 'all 0.2s',
    }}>
      <Typography sx={{ fontSize: '26px', lineHeight: 1 }}>{a.icon}</Typography>
      <Box>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: a.earned ? '#FFB547' : 'text.secondary' }}>
          {a.title}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.disabled', mt: 0.25 }}>{a.desc}</Typography>
      </Box>
      {a.earned && (
        <Box sx={{ ml: 'auto', flexShrink: 0 }}>
          <EmojiEvents sx={{ fontSize: 18, color: '#FFB547' }} />
        </Box>
      )}
    </Box>
  );
}

/* ─── Mood radar ─────────────────────────────────────────────── */
const MOOD_SCORE = { great: 5, good: 4, okay: 3, tired: 2, bad: 1 };

export default function ProgressPage() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();

  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';
  const grid    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(108,95,232,0.08)';
  const tick    = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';

  const [workoutStats, setWorkoutStats]     = useState(null);
  const [weightLogs, setWeightLogs]         = useState([]);
  const [weightStats, setWeightStats]       = useState(null);
  const [bodyComp, setBodyComp]             = useState([]);
  const [achievements, setAchievements]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [addWeightOpen, setAddWeightOpen]   = useState(false);
  const [weightForm, setWeightForm]         = useState({
    weight: '', log_date: new Date().toISOString().slice(0,10), notes: '',
    body_fat_pct: '', muscle_mass_kg: '', waist_cm: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    Promise.all([
      api.get('/workouts/stats'),
      api.get('/weight-logs'),
      api.get('/weight-logs/body-composition'),
      api.get('/achievements'),
    ])
      .then(([s, w, bc, a]) => {
        setWorkoutStats(s.data);
        setWeightLogs(w.data.logs ?? w.data);
        setWeightStats(w.data.stats ?? null);
        setBodyComp(bc.data);
        setAchievements(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddWeight = async () => {
    try {
      const { data } = await api.post('/weight-logs', weightForm);
      setWeightLogs(prev => [data.log, ...prev]);
      setAddWeightOpen(false);
      enqueueSnackbar('Weight logged! ⚖️', { variant: 'success' });
    } catch {
      enqueueSnackbar('Error logging weight', { variant: 'error' });
    }
  };

  // Mood radar data
  const moodRadar = workoutStats?.mood_stats?.map(m => ({
    mood: m.mood, count: m.count, score: MOOD_SCORE[m.mood] ?? 3,
  })) ?? [];

  if (loading) return (
    <AppLayout>
      <Box display="flex" justifyContent="center" alignItems="center" py={10}>
        <CircularProgress sx={{ color: primary }} />
      </Box>
    </AppLayout>
  );

  const weightData = [...(weightLogs ?? [])].reverse().map(w => ({
    date: w.log_date, weight: parseFloat(w.weight),
  }));

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            My Progress 📈
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Track your fitness journey over time</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddWeightOpen(true)} sx={{ borderRadius: '12px' }}>
          Log Weight
        </Button>
      </Box>

      {/* Weight summary tiles */}
      {weightStats && (
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Lowest Weight',  value: `${weightStats.min} kg`,   color: green },
            { label: 'Highest Weight', value: `${weightStats.max} kg`,   color: '#FF5F7E' },
            { label: 'Average Weight', value: `${weightStats.avg} kg`,   color: primary },
            { label: 'Total Change',   value: `${weightStats.total_change > 0 ? '+' : ''}${weightStats.total_change} kg`, color: weightStats.total_change <= 0 ? green : '#FF5F7E' },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{
                background: muiTheme.palette.background.paper,
                border: `1px solid ${alpha(s.color, 0.25)}`,
                borderRadius: '16px', p: '16px', textAlign: 'center',
              }}>
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '20px', color: s.color }}>{s.value}</Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>{s.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2.5}>
        {/* Weight chart */}
        <Grid item xs={12} lg={6}>
          <ChartCard title="⚖️ Weight Progress">
            <Box height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto','auto']} tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} unit="kg" />
                  <RechartTooltip content={<ChartTooltip isDark={isDark} />} />
                  <Line type="monotone" dataKey="weight" stroke={primary} strokeWidth={2.5}
                    dot={{ fill: primary, r: 4, strokeWidth: 2, stroke: isDark ? '#111' : '#fff' }}
                    activeDot={{ r: 6 }} name="kg" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Weekly calories */}
        <Grid item xs={12} lg={6}>
          <ChartCard title="🔥 Weekly Calories Burned">
            <Box height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutStats?.weekly_activity ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                  <RechartTooltip content={<ChartTooltip isDark={isDark} />} />
                  <Bar dataKey="calories" fill={accent} radius={[6,6,0,0]} name="Calories" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Body composition */}
        {bodyComp.length > 0 && (
          <Grid item xs={12} lg={8}>
            <ChartCard title="💪 Body Composition">
              <Box height={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bodyComp} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FF5F7E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#FF5F7E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <RechartTooltip content={<ChartTooltip isDark={isDark} />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Area type="monotone" dataKey="lean_mass_kg" stroke={green}     fill="url(#leanGrad)" strokeWidth={2.5} dot={false} name="Lean Mass (kg)" />
                    <Area type="monotone" dataKey="fat_mass_kg"  stroke="#FF5F7E"   fill="url(#fatGrad)"  strokeWidth={2.5} dot={false} name="Fat Mass (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        )}

        {/* Mood radar */}
        {moodRadar.length > 0 && (
          <Grid item xs={12} lg={4}>
            <ChartCard title="😊 Workout Moods">
              <Box height={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={moodRadar}>
                    <PolarGrid stroke={grid} />
                    <PolarAngleAxis dataKey="mood" tick={{ fontSize: 11, fill: tick }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar dataKey="count" stroke={primary} fill={alpha(primary, 0.2)} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        )}

        {/* Category breakdown */}
        {workoutStats?.by_category?.length > 0 && (
          <Grid item xs={12} lg={6}>
            <ChartCard title="🏷️ Workouts by Category">
              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutStats.by_category} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                    <RechartTooltip content={<ChartTooltip isDark={isDark} />} />
                    <Bar dataKey="count" fill={primary} radius={[0,6,6,0]} name="Workouts" maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        )}

        {/* Achievements */}
        <Grid item xs={12} lg={6}>
          <Box sx={{
            background: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: '20px', p: '24px 28px', height: '100%',
            position: 'relative',
          }}>
            <Box sx={{
              position: 'absolute', top: 0, left: 28, right: 28, height: '1px',
              background: `linear-gradient(90deg,transparent,${alpha('#FFB547', 0.5)},transparent)`,
            }} />
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary', mb: 2.5 }}>
              🏆 Achievements
            </Typography>
            <Grid container spacing={1.5}>
              {achievements.map(a => (
                <Grid item xs={12} sm={6} key={a.id}>
                  <AchievementCard a={a} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Summary tiles */}
        {[
          { label: 'Total Workouts', value: workoutStats?.total_workouts  ?? 0,                  icon: <FitnessCenter />, color: primary },
          { label: 'Total Calories', value: `${workoutStats?.total_calories ?? 0} kcal`,         icon: <WhatshotIcon />,  color: accent  },
          { label: 'Total Duration', value: `${workoutStats?.total_duration ?? 0} min`,          icon: <Timer />,         color: green   },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Box sx={{
              background: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.divider}`,
              borderRadius: '20px', p: '24px', textAlign: 'center',
              '&:hover': { transform: 'translateY(-3px)', borderColor: alpha(s.color, 0.35) },
              transition: 'all 0.3s',
            }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '14px',
                background: alpha(s.color, 0.12), border: `1px solid ${alpha(s.color, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', color: s.color, '& svg': { fontSize: 22 },
              }}>
                {s.icon}
              </Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '26px', color: 'text.primary', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.75 }}>{s.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Add Weight Dialog */}
      <Dialog open={addWeightOpen} onClose={() => setAddWeightOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>
            Log Weight ⚖️
          </Typography>
          <IconButton onClick={() => setAddWeightOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {[
              { label: 'Weight (kg)',       key: 'weight',          type: 'number', step: '0.1', min: 20 },
              { label: 'Date',              key: 'log_date',        type: 'date' },
              { label: 'Body Fat %',        key: 'body_fat_pct',    type: 'number', step: '0.1', min: 1 },
              { label: 'Muscle Mass (kg)',  key: 'muscle_mass_kg',  type: 'number', step: '0.1', min: 10 },
              { label: 'Waist (cm)',        key: 'waist_cm',        type: 'number', step: '0.1', min: 40 },
            ].map(f => (
              <TextField key={f.key} label={f.label} type={f.type} fullWidth
                value={weightForm[f.key]}
                onChange={e => setWeightForm(p => ({ ...p, [f.key]: e.target.value }))}
                InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                inputProps={{ step: f.step, min: f.min }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            ))}
            <TextField label="Notes" multiline rows={2} fullWidth value={weightForm.notes}
              onChange={e => setWeightForm(p => ({ ...p, notes: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAddWeightOpen(false)} variant="outlined" sx={{ borderRadius: '11px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddWeight} sx={{ borderRadius: '11px' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}