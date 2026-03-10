// ─────────────────────────────────────────────────────────────────
// NutritionPage.jsx — Enhanced with water tracking, favorites & weekly chart
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Button, TextField, MenuItem,
  Stack, IconButton, CircularProgress, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab,
  LinearProgress,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Add, Delete, Close, Restaurant, WaterDrop, BarChart } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_META  = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: '#FFB547' },
  lunch:     { label: 'Lunch',     emoji: '☀️',  color: '#7C6FFF' },
  dinner:    { label: 'Dinner',    emoji: '🌙',  color: '#5CE1E6' },
  snack:     { label: 'Snack',     emoji: '🍎',  color: '#2EE89A' },
};
const DAILY_GOALS  = { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 25 };
const MACRO_COLORS = ['#FF5F7E', '#7C6FFF', '#2EE89A'];
const WATER_GOAL   = 2500; // ml

/* ─── Macro bar ──────────────────────────────────────────────── */
function MacroBar({ label, value, goal, unit, color }) {
  const muiTheme = useMuiTheme();
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '16px', p: '18px 20px',
      transition: 'background 0.3s', position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', bottom: -12, right: -12, width: 80, height: 80,
        borderRadius: '50%', background: alpha(color, 0.08), filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: '"Syne", sans-serif' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>/ {goal}{unit}</Typography>
      </Box>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '22px', color, letterSpacing: '-0.5px', lineHeight: 1, mb: 1.5 }}>
        {value}<span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.7, marginLeft: 3 }}>{unit}</span>
      </Typography>
      <Box sx={{ height: 6, borderRadius: '100px', background: alpha(color, 0.12), overflow: 'hidden' }}>
        <Box sx={{
          height: '100%', borderRadius: '100px',
          background: pct >= 100
            ? `linear-gradient(90deg, ${color}, #FF5F7E)`
            : `linear-gradient(90deg, ${color}CC, ${color})`,
          width: `${pct}%`, transition: 'width 0.8s ease',
        }} />
      </Box>
      <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 1 }}>
        {Math.round(pct)}% of daily goal
      </Typography>
    </Box>
  );
}

/* ─── Water tracker ─────────────────────────────────────────── */
function WaterTracker({ waterMl, onAdd }) {
  const muiTheme = useMuiTheme();
  const pct = Math.min((waterMl / WATER_GOAL) * 100, 100);
  const glasses = Math.floor(waterMl / 250);

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${alpha('#5CE1E6', 0.3)}`,
      borderRadius: '16px', p: '18px 20px',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WaterDrop sx={{ color: '#5CE1E6', fontSize: 18 }} />
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.secondary', fontFamily: '"Syne", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Water
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>/ {WATER_GOAL}ml</Typography>
      </Box>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '22px', color: '#5CE1E6', letterSpacing: '-0.5px', lineHeight: 1, mb: 1.5 }}>
        {waterMl}<span style={{ fontSize: '12px', fontWeight: 500, opacity: 0.7, marginLeft: 3 }}>ml</span>
      </Typography>
      <Box sx={{ height: 6, borderRadius: '100px', background: alpha('#5CE1E6', 0.12), overflow: 'hidden', mb: 1 }}>
        <Box sx={{
          height: '100%', borderRadius: '100px',
          background: `linear-gradient(90deg, #5CE1E6CC, #5CE1E6)`,
          width: `${pct}%`, transition: 'width 0.8s ease',
        }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{glasses} glasses</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[250, 500].map(ml => (
            <Button key={ml} size="small" variant="outlined" onClick={() => onAdd(ml)}
              sx={{ borderRadius: '8px', minWidth: 'auto', px: 1.5, py: 0.25, fontSize: '11px', height: 28, borderColor: alpha('#5CE1E6', 0.4), color: '#5CE1E6', '&:hover': { background: alpha('#5CE1E6', 0.08) } }}>
              +{ml}ml
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/* ─── Meal section ───────────────────────────────────────────── */
function MealSection({ mealType, logs, onDelete }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const meta  = MEAL_META[mealType];
  const total = Math.round(logs.reduce((a, l) => a + +l.calories, 0));

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: '10px',
            background: alpha(meta.color, 0.15), border: `1px solid ${alpha(meta.color, 0.25)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>
            {meta.emoji}
          </Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
            {meta.label}
          </Typography>
        </Box>
        <Box sx={{
          background: alpha(meta.color, 0.1), border: `1px solid ${alpha(meta.color, 0.2)}`,
          borderRadius: '100px', px: 1.5, py: 0.25,
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: meta.color, fontFamily: '"Syne", sans-serif' }}>
            {total} kcal
          </Typography>
        </Box>
      </Box>

      {logs.length === 0 ? (
        <Box sx={{ pl: '50px' }}>
          <Typography sx={{ fontSize: '13px', color: 'text.disabled', fontStyle: 'italic' }}>No meals logged</Typography>
        </Box>
      ) : (
        <Box sx={{ pl: '50px', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {logs.map(item => (
            <Box key={item.id} sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              py: 1, px: 1.5, borderRadius: '10px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(108,95,232,0.04)',
              border: `1px solid ${muiTheme.palette.divider}`,
              transition: 'all 0.2s',
              '&:hover': { borderColor: alpha(meta.color, 0.2), background: alpha(meta.color, 0.04) },
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary' }} noWrap>
                  {item.food_name}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.25 }}>
                  {item.quantity}{item.unit} · P:<strong>{item.protein}g</strong> C:<strong>{item.carbs}g</strong> F:<strong>{item.fat}g</strong>
                  {item.fiber ? ` Fiber:<strong>${item.fiber}g</strong>` : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <Box sx={{ background: alpha('#FF5F7E', 0.1), border: `1px solid ${alpha('#FF5F7E', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.25 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#FF5F7E', fontFamily: '"Syne", sans-serif' }}>
                    {Math.round(item.calories)} kcal
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => onDelete(item.id)}
                  sx={{ color: 'text.disabled', '&:hover': { color: '#FF5F7E', background: alpha('#FF5F7E', 0.08) }, p: 0.5 }}>
                  <Delete sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function NutritionPage() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const tick    = isDark ? 'rgba(255,255,255,0.35)' : '#8880C0';
  const grid    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(108,95,232,0.08)';

  const [tab, setTab]           = useState(0);
  const [date, setDate]         = useState(new Date().toISOString().slice(0,10));
  const [logs, setLogs]         = useState([]);
  const [daily, setDaily]       = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water_ml: 0 });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [favorites, setFavorites]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [addOpen, setAddOpen]   = useState(false);
  const [form, setForm]         = useState({
    meal_type: 'breakfast', food_name: '', quantity: '', unit: 'g',
    calories: '', protein: '', carbs: '', fat: '', fiber: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/nutrition', { params: { date } });
      setLogs(data.logs || []);
      setDaily(data.daily || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water_ml: 0 });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [date]);

  useEffect(() => {
    if (tab === 1) {
      api.get('/nutrition/weekly-stats').then(r => setWeeklyStats(r.data));
    } else if (tab === 2) {
      api.get('/nutrition/favorites').then(r => setFavorites(r.data));
    }
  }, [tab]);

  const handleAdd = async () => {
    try {
      await api.post('/nutrition', { ...form, log_date: date });
      enqueueSnackbar('Meal added! 🍽️', { variant: 'success' });
      setAddOpen(false);
      setForm(p => ({ ...p, food_name: '', quantity: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' }));
      fetchLogs();
    } catch { enqueueSnackbar('Error adding meal', { variant: 'error' }); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/nutrition/${id}`); fetchLogs(); } catch {}
  };

  const handleWaterAdd = async (ml) => {
    try {
      await api.post('/nutrition/water', { amount_ml: ml, log_date: date });
      fetchLogs();
    } catch { enqueueSnackbar('Error logging water', { variant: 'error' }); }
  };

  const macroData = [
    { name: 'Protein', value: Math.round(daily.protein || 0) },
    { name: 'Carbs',   value: Math.round(daily.carbs   || 0) },
    { name: 'Fat',     value: Math.round(daily.fat     || 0) },
  ];

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            Nutrition Tracker 🥗
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Track your daily food intake and macros</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField type="date" size="small" value={date} onChange={e => setDate(e.target.value)} sx={inputSx} />
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)} sx={{ borderRadius: '12px', whiteSpace: 'nowrap' }}>
            Add Meal
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', mb: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'none', minHeight: 48 } }}>
          <Tab label="Today" />
          <Tab icon={<BarChart sx={{ fontSize: 16 }} />} iconPosition="start" label="Weekly" />
          <Tab label="Favorites" />
        </Tabs>
      </Box>

      {/* Tab: Today */}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          {/* Macro bars + water */}
          {[
            { label: 'Calories', value: Math.round(daily.calories || 0), goal: DAILY_GOALS.calories, unit: 'kcal', color: '#FF5F7E' },
            { label: 'Protein',  value: Math.round(daily.protein  || 0), goal: DAILY_GOALS.protein,  unit: 'g',    color: primary  },
            { label: 'Carbs',    value: Math.round(daily.carbs    || 0), goal: DAILY_GOALS.carbs,    unit: 'g',    color: '#2EE89A' },
            { label: 'Fat',      value: Math.round(daily.fat      || 0), goal: DAILY_GOALS.fat,      unit: 'g',    color: '#FFB547' },
          ].map(s => (
            <Grid item xs={6} lg={3} key={s.label}><MacroBar {...s} /></Grid>
          ))}
          <Grid item xs={12} sm={6} lg={4}>
            <WaterTracker waterMl={Math.round(daily.water_ml || 0)} onAdd={handleWaterAdd} />
          </Grid>

          {/* Pie chart */}
          <Grid item xs={12} sm={6} lg={4}>
            <Box sx={{
              background: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.divider}`,
              borderRadius: '20px', p: '24px 28px', height: '100%', position: 'relative',
            }}>
              <Box sx={{ position: 'absolute', top: 0, left: 28, right: 28, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.4)},transparent)` }} />
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary', mb: 2 }}>
                Macros Breakdown
              </Typography>
              <Box height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macroData} cx="50%" cy="50%" innerRadius={50} outerRadius={76} dataKey="value" paddingAngle={3}>
                      {macroData.map((_, i) => <Cell key={i} fill={MACRO_COLORS[i]} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}g`, n]} contentStyle={{ background: isDark ? '#1A1A28' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,95,232,0.15)'}`, borderRadius: '12px' }} />
                    <Legend formatter={(v) => <span style={{ fontSize: '12px', color: isDark ? '#9090A8' : '#6862A0' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Meal logs */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', p: '24px 28px', position: 'relative', transition: 'background 0.3s' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 28, right: 28, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.4)},transparent)` }} />
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary', mb: 2.5 }}>
                Today's Meals
              </Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={28} sx={{ color: primary }} /></Box>
              ) : (
                MEAL_TYPES.map(mt => (
                  <MealSection key={mt} mealType={mt} logs={logs.filter(l => l.meal_type === mt)} onDelete={handleDelete} />
                ))
              )}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab: Weekly */}
      {tab === 1 && (
        <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', p: '24px 28px' }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary', mb: 2.5 }}>
            📅 Last 7 Days — Calories & Macros
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1A1A28' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,95,232,0.15)'}`, borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="#FF5F7E" strokeWidth={2.5} dot={{ r: 4 }} name="Calories" />
                <Line type="monotone" dataKey="protein"  stroke={primary}  strokeWidth={2}   dot={false} name="Protein (g)" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="carbs"    stroke="#2EE89A"  strokeWidth={2}   dot={false} name="Carbs (g)" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      {/* Tab: Favorites */}
      {tab === 2 && (
        <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden' }}>
          {favorites.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: 'text.secondary' }}>Log more meals to see your top foods!</Typography>
            </Box>
          ) : (
            <Box>
              {favorites.map((f, i) => (
                <Box key={i} sx={{
                  display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
                  borderBottom: i < favorites.length - 1 ? `1px solid ${muiTheme.palette.divider}` : 'none',
                  '&:hover': { background: alpha(primary, 0.03) },
                }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: alpha('#FFB547', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    🍽️
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary' }}>
                      {f.food_name}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      Logged {f.times_logged}× · avg {Math.round(f.avg_calories)} kcal
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => { setForm(p => ({ ...p, food_name: f.food_name, calories: Math.round(f.avg_calories) })); setAddOpen(true); }}
                    sx={{ borderRadius: '9px', fontSize: '12px' }}>
                    Add
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Add Meal Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>
            Add Meal 🍽️
          </Typography>
          <IconButton onClick={() => setAddOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Meal Type" fullWidth value={form.meal_type} onChange={e => setForm(p => ({ ...p, meal_type: e.target.value }))} sx={inputSx}>
                {MEAL_TYPES.map(t => <MenuItem key={t} value={t}>{MEAL_META[t].emoji} {MEAL_META[t].label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Food Name" fullWidth value={form.food_name} onChange={e => setForm(p => ({ ...p, food_name: e.target.value }))} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Quantity" type="number" fullWidth value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Unit" fullWidth value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} sx={inputSx}>
                {['g','ml','cup','tbsp','piece'].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
            {[
              { label: 'Calories (kcal)', key: 'calories' },
              { label: 'Protein (g)',     key: 'protein'  },
              { label: 'Carbs (g)',       key: 'carbs'    },
              { label: 'Fat (g)',         key: 'fat'      },
              { label: 'Fiber (g)',       key: 'fiber'    },
            ].map(f => (
              <Grid item xs={6} key={f.key}>
                <TextField label={f.label} type="number" fullWidth value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} sx={inputSx} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined" sx={{ borderRadius: '11px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} startIcon={<Restaurant />} sx={{ borderRadius: '11px' }}>Add Meal</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}