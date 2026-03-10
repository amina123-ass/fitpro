import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Button, TextField, MenuItem,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, Pagination, InputAdornment, IconButton,
  Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  Select, FormControl, InputLabel,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  Search, Add, Timer, FitnessCenter, Close, CalendarMonth,
  ViewList, Download, Mood,
} from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

const DIFFICULTIES = ['', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES   = ['', 'cardio', 'strength', 'flexibility', 'sports'];
const MOODS        = [
  { value: 'great', label: '😄 Great' },
  { value: 'good',  label: '🙂 Good' },
  { value: 'okay',  label: '😐 Okay' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'bad',   label: '😞 Bad'  },
];

const diffColors = {
  beginner:     { bg: alpha('#2EE89A', 0.12), border: alpha('#2EE89A', 0.25), color: '#2EE89A' },
  intermediate: { bg: alpha('#FFB547', 0.12), border: alpha('#FFB547', 0.25), color: '#FFB547' },
  advanced:     { bg: alpha('#FF5F7E', 0.12), border: alpha('#FF5F7E', 0.25), color: '#FF5F7E' },
};

/* ─── Calendar cell ──────────────────────────────────────────── */
function CalendarView({ calendarData, year, month }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <Box>
      {/* Day headers */}
      <Grid container columns={7} mb={1}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <Grid item xs={1} key={d}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.disabled', textAlign: 'center', fontFamily: '"Syne", sans-serif' }}>
              {d}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Grid container columns={7} spacing={0.5}>
        {cells.map((day, i) => {
          if (!day) return <Grid item xs={1} key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const log = calendarData[dateStr];
          const today = new Date().toISOString().slice(0,10) === dateStr;
          return (
            <Grid item xs={1} key={dateStr}>
              <Box sx={{
                aspectRatio: '1/1', borderRadius: '10px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'default',
                background: log
                  ? alpha(primary, 0.15)
                  : today
                  ? alpha(primary, 0.06)
                  : 'transparent',
                border: today ? `1px solid ${alpha(primary, 0.4)}` : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': log ? { background: alpha(primary, 0.22) } : {},
              }}>
                <Typography sx={{
                  fontSize: '12px', fontWeight: today ? 800 : log ? 700 : 400,
                  color: log ? primary : today ? primary : 'text.secondary',
                  fontFamily: log || today ? '"Syne", sans-serif' : 'inherit',
                }}>
                  {day}
                </Typography>
                {log && (
                  <Typography sx={{ fontSize: '9px', color: alpha(primary, 0.7), lineHeight: 1 }}>
                    {log.count}x
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

/* ─── Exercise Card ─────────────────────────────────────────── */
function ExerciseCard({ ex, onLog }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary  = muiTheme.palette.primary.main;
  const accent   = muiTheme.palette.secondary.main;
  const diff     = diffColors[ex.difficulty] || { bg: alpha(primary, 0.1), border: alpha(primary, 0.2), color: primary };

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s ease', position: 'relative',
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: alpha(primary, 0.3),
        boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.45)' : `0 12px 40px ${alpha(primary, 0.15)}`,
      },
    }}>
      <Box sx={{
        height: 130, position: 'relative', overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(primary, 0.2)}, ${alpha(accent, 0.15)})`
          : `linear-gradient(135deg, ${alpha(primary, 0.1)}, ${alpha(accent, 0.08)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: '18px',
          background: alpha(primary, isDark ? 0.15 : 0.1),
          border: `1px solid ${alpha(primary, 0.25)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FitnessCenter sx={{ color: primary, fontSize: 26 }} />
        </Box>
        <Box sx={{
          position: 'absolute', top: 10, right: 10,
          background: diff.bg, border: `1px solid ${diff.border}`,
          borderRadius: '100px', px: 1.25, py: 0.3,
        }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color, fontFamily: '"Syne", sans-serif' }}>
            {ex.difficulty}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '14px', color: 'text.primary', flex: 1, pr: 1 }}>
            {ex.name}
          </Typography>
          <Chip label={ex.category} size="small" sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 700, borderRadius: '100px', fontSize: '10px',
            textTransform: 'capitalize', flexShrink: 0,
            background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, color: primary,
          }} />
        </Box>

        <Typography sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.6, flex: 1, mb: 1.5 }}>
          {ex.description || 'No description available.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          {[
            { icon: <Timer sx={{ fontSize: 13, color: '#5CE1E6' }} />, val: `${ex.duration} min`, bg: '#5CE1E6' },
            { icon: <WhatshotIcon sx={{ fontSize: 13, color: accent }} />, val: `${ex.calories_burned} kcal`, bg: accent },
          ].map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '7px', background: alpha(item.bg, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary' }}>{item.val}</Typography>
            </Box>
          ))}
        </Box>

        <Button fullWidth variant="contained" startIcon={<Add />} onClick={() => onLog(ex)}
          sx={{ borderRadius: '11px', py: '9px', fontSize: '13px' }}>
          Log Workout
        </Button>
      </Box>
    </Box>
  );
}

export default function WorkoutsPage() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;

  const [tab, setTab]             = useState(0);
  const [exercises, setExercises] = useState([]);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [logDialog, setLogDialog] = useState(null);
  const [calYear, setCalYear]     = useState(new Date().getFullYear());
  const [calMonth, setCalMonth]   = useState(new Date().getMonth() + 1);
  const [logForm, setLogForm]     = useState({
    duration: '', calories_burned: '', notes: '',
    workout_date: new Date().toISOString().slice(0,10),
    sets: '', reps: '', weight_used: '', mood: 'good',
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 9, search, category: category || undefined, difficulty: difficulty || undefined };
      const { data } = await api.get('/exercises', { params });
      setExercises(data.data);
      setTotalPages(data.last_page);
    } finally { setLoading(false); }
  };

  const fetchMyWorkouts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workouts');
      setMyWorkouts(data.data ?? data);
    } finally { setLoading(false); }
  };

  const fetchCalendar = async () => {
    const { data } = await api.get('/workouts/calendar', { params: { month: calMonth, year: calYear } });
    setCalendarData(data);
  };

  useEffect(() => {
    if (tab === 0) fetchExercises();
    else if (tab === 1) fetchMyWorkouts();
    else if (tab === 2) fetchCalendar();
  }, [tab, page, category, difficulty, calMonth, calYear]);

  const handleLog = async () => {
    try {
      await api.post('/workouts', { exercise_id: logDialog.id, ...logForm });
      enqueueSnackbar('Workout logged! 🔥', { variant: 'success' });
      setLogDialog(null);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Error', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      enqueueSnackbar('Workout deleted', { variant: 'info' });
      fetchMyWorkouts();
    } catch { enqueueSnackbar('Error', { variant: 'error' }); }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/workouts/export');
      const csv = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'workouts.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { enqueueSnackbar('Export failed', { variant: 'error' }); }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            Exercises Library 🏋️
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Browse, log and track your workouts</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExport}
          sx={{ borderRadius: '11px', height: 40 }}>
          Export CSV
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{
        background: muiTheme.palette.background.paper,
        border: `1px solid ${muiTheme.palette.divider}`,
        borderRadius: '16px', mb: 3, overflow: 'hidden',
      }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'none', minHeight: 48 } }}>
          <Tab icon={<FitnessCenter sx={{ fontSize: 18 }} />} iconPosition="start" label="Browse" />
          <Tab icon={<ViewList sx={{ fontSize: 18 }} />} iconPosition="start" label="My Workouts" />
          <Tab icon={<CalendarMonth sx={{ fontSize: 18 }} />} iconPosition="start" label="Calendar" />
        </Tabs>
      </Box>

      {/* Tab: Browse Exercises */}
      {tab === 0 && (
        <>
          <Box sx={{
            background: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: '16px', p: '16px 20px', mb: 3,
          }}>
            <Box component="form" onSubmit={e => { e.preventDefault(); setPage(1); fetchExercises(); }}
              sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" placeholder="Search exercises…" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, minWidth: 200, ...inputSx }}
                InputProps={{ startAdornment: <Search sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} /> }} />
              <TextField select size="small" label="Category" value={category}
                onChange={e => setCategory(e.target.value)} sx={{ minWidth: 140, ...inputSx }}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c || 'All Categories'}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Difficulty" value={difficulty}
                onChange={e => setDifficulty(e.target.value)} sx={{ minWidth: 140, ...inputSx }}>
                {DIFFICULTIES.map(d => <MenuItem key={d} value={d}>{d || 'All Levels'}</MenuItem>)}
              </TextField>
              <Button type="submit" variant="contained" sx={{ borderRadius: '11px', px: 3, height: 40 }}>
                Search
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: primary }} /></Box>
          ) : (
            <>
              <Grid container spacing={2.5}>
                {exercises.map(ex => (
                  <Grid item xs={12} sm={6} lg={4} key={ex.id}>
                    <ExerciseCard ex={ex} onLog={ex => {
                      setLogDialog(ex);
                      setLogForm(p => ({ ...p, duration: ex.duration, calories_burned: ex.calories_burned }));
                    }} />
                  </Grid>
                ))}
              </Grid>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary"
                    sx={{ '& .MuiPaginationItem-root': { fontFamily: '"Syne", sans-serif', fontWeight: 600 } }} />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Tab: My Workouts */}
      {tab === 1 && (
        <Box sx={{
          background: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: '20px', overflow: 'hidden',
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: primary }} /></Box>
          ) : myWorkouts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ color: 'text.secondary' }}>No workouts logged yet. Start now! 💪</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {['Date','Exercise','Duration','Calories','Sets','Reps','Mood',''].map(h => (
                    <TableCell key={h} sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '12px', color: 'text.secondary', borderColor: muiTheme.palette.divider }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {myWorkouts.map(w => (
                  <TableRow key={w.id} sx={{ '&:hover': { background: alpha(primary, 0.03) } }}>
                    <TableCell sx={{ fontSize: '13px', borderColor: muiTheme.palette.divider }}>{w.workout_date}</TableCell>
                    <TableCell sx={{ fontSize: '13px', fontWeight: 600, borderColor: muiTheme.palette.divider }}>{w.exercise?.name}</TableCell>
                    <TableCell sx={{ fontSize: '13px', borderColor: muiTheme.palette.divider }}>{w.duration} min</TableCell>
                    <TableCell sx={{ fontSize: '13px', borderColor: muiTheme.palette.divider }}>{w.calories_burned} kcal</TableCell>
                    <TableCell sx={{ fontSize: '13px', borderColor: muiTheme.palette.divider }}>{w.sets ?? '—'}</TableCell>
                    <TableCell sx={{ fontSize: '13px', borderColor: muiTheme.palette.divider }}>{w.reps ?? '—'}</TableCell>
                    <TableCell sx={{ fontSize: '16px', borderColor: muiTheme.palette.divider }}>
                      {w.mood === 'great' ? '😄' : w.mood === 'good' ? '🙂' : w.mood === 'okay' ? '😐' : w.mood === 'tired' ? '😴' : w.mood === 'bad' ? '😞' : '—'}
                    </TableCell>
                    <TableCell sx={{ borderColor: muiTheme.palette.divider }}>
                      <IconButton size="small" onClick={() => handleDelete(w.id)}
                        sx={{ color: 'text.disabled', '&:hover': { color: '#FF5F7E', background: alpha('#FF5F7E', 0.08) }, p: 0.5 }}>
                        <Close sx={{ fontSize: 15 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* Tab: Calendar */}
      {tab === 2 && (
        <Box sx={{
          background: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: '20px', p: '24px 28px',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TextField select size="small" value={calMonth} onChange={e => setCalMonth(+e.target.value)} sx={inputSx}>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i+1} value={i+1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" value={calYear} onChange={e => setCalYear(+e.target.value)} sx={inputSx}>
              {[2023, 2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Box>
          <CalendarView calendarData={calendarData} year={calYear} month={calMonth} />
        </Box>
      )}

      {/* Log Workout Dialog */}
      <Dialog open={!!logDialog} onClose={() => setLogDialog(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>
              Log Workout
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.25 }}>{logDialog?.name}</Typography>
          </Box>
          <IconButton onClick={() => setLogDialog(null)} size="small" sx={{ color: 'text.secondary' }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {[
              { label: 'Date',            key: 'workout_date',    type: 'date' },
              { label: 'Duration (min)',   key: 'duration',        type: 'number', min: 1 },
              { label: 'Calories Burned', key: 'calories_burned', type: 'number', min: 0 },
              { label: 'Sets',            key: 'sets',            type: 'number', min: 1 },
              { label: 'Reps',            key: 'reps',            type: 'number', min: 1 },
              { label: 'Weight Used (kg)',key: 'weight_used',     type: 'number', min: 0 },
            ].map(f => (
              <TextField key={f.key} label={f.label} type={f.type} fullWidth
                value={logForm[f.key]}
                onChange={e => setLogForm(p => ({ ...p, [f.key]: e.target.value }))}
                InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                inputProps={{ min: f.min }}
                sx={inputSx} />
            ))}
            <TextField select label="Mood" fullWidth value={logForm.mood}
              onChange={e => setLogForm(p => ({ ...p, mood: e.target.value }))} sx={inputSx}>
              {MOODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
            </TextField>
            <TextField label="Notes (optional)" multiline rows={2} fullWidth
              value={logForm.notes}
              onChange={e => setLogForm(p => ({ ...p, notes: e.target.value }))} sx={inputSx} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setLogDialog(null)} variant="outlined" sx={{ borderRadius: '11px' }}>Cancel</Button>
          <Button variant="contained" onClick={handleLog} sx={{ borderRadius: '11px' }}>
            Log Workout 🔥
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}