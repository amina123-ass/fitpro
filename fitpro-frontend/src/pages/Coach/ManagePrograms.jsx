import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Pagination, Stack, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails, Divider, Tooltip,
  InputAdornment, Alert, Card, CardContent,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  Add, Edit, Delete, Close, MenuBook, Search, ExpandMore,
  ContentCopy, FitnessCenter, CheckCircle, DragIndicator, People,
  AccessTime, CalendarToday,
} from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Constants ─────────────────────────────────────────────── */
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const GOALS = ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness', 'sport_specific'];
const DAYS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const DIFF_STYLE = {
  beginner:     { bg: alpha('#2EE89A', 0.12), border: alpha('#2EE89A', 0.25), color: '#2EE89A' },
  intermediate: { bg: alpha('#FFB547', 0.12), border: alpha('#FFB547', 0.25), color: '#FFB547' },
  advanced:     { bg: alpha('#FF5F7E', 0.12), border: alpha('#FF5F7E', 0.25), color: '#FF5F7E' },
};

const PROG_GRADIENTS = [
  ['#7C6FFF', '#FF5F7E'], ['#2EE89A', '#5CE1E6'],
  ['#FFB547', '#FF5F7E'], ['#5CE1E6', '#7C6FFF'],
  ['#FF5F7E', '#FFB547'], ['#2EE89A', '#7C6FFF'],
];

const emptyProgram = {
  name: '', description: '', difficulty: 'beginner',
  duration_weeks: 4, goal: 'general_fitness',
  days_per_week: 3, equipment_needed: '',
  target_audience: '', estimated_calories_week: '', is_public: true,
};

/* ─── Program Card ───────────────────────────────────────────── */
function ProgramCard({ prog, index, onEdit, onDelete, onDuplicate, canEdit }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const [g1, g2]  = PROG_GRADIENTS[index % PROG_GRADIENTS.length];
  const diff       = DIFF_STYLE[prog.difficulty] || DIFF_STYLE.beginner;
  const totalEx    = prog.days?.reduce((acc, d) => acc + (d.exercises?.length ?? 0), 0) ?? 0;

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: alpha(g1, 0.4),
        boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.45)' : `0 12px 40px ${alpha(g1, 0.18)}`,
      },
    }}>
      {/* Gradient strip */}
      <Box sx={{ height: 5, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      {/* Header area */}
      <Box sx={{
        height: 120, position: 'relative', overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(g1, 0.2)}, ${alpha(g2, 0.12)})`
          : `linear-gradient(135deg, ${alpha(g1, 0.1)}, ${alpha(g2, 0.07)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', border: `1px solid ${alpha(g1, 0.18)}` }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: '50%', border: `1px solid ${alpha(g2, 0.15)}` }} />
        <Box sx={{ width: 52, height: 52, borderRadius: '15px', background: alpha(g1, 0.15), border: `1px solid ${alpha(g1, 0.28)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MenuBook sx={{ color: g1, fontSize: 24 }} />
        </Box>

        {/* Followers */}
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.6, background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '100px', px: 1.25, py: 0.4 }}>
          <People sx={{ fontSize: 11, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', fontFamily: '"Syne", sans-serif' }}>
            {prog.followers_count ?? 0}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badges */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color, fontFamily: '"Syne", sans-serif' }}>
              {prog.difficulty}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: alpha('#7C6FFF', 0.1), border: `1px solid ${alpha('#7C6FFF', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
            <AccessTime sx={{ fontSize: 11, color: '#7C6FFF' }} />
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#7C6FFF', fontFamily: '"Syne", sans-serif' }}>
              {prog.duration_weeks}s
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '15px', color: 'text.primary', mb: 0.75, lineHeight: 1.3 }}>
          {prog.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.65, flex: 1, mb: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {prog.description || 'Aucune description'}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75, mb: 2 }}>
          {[
            { label: `${prog.days_per_week ?? '?'}j/sem`, emoji: '📅' },
            { label: `${prog.duration_weeks}sem`, emoji: '⏳' },
            { label: `${totalEx} ex.`, emoji: '🏃' },
          ].map(({ label, emoji }) => (
            <Box key={label} sx={{ textAlign: 'center', py: '7px', px: '4px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.04)' : alpha('#7C6FFF', 0.05), border: `1px solid ${muiTheme.palette.divider}` }}>
              <Typography sx={{ fontSize: '13px', mb: 0.25 }}>{emoji}</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', fontFamily: '"Syne", sans-serif' }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Goal pill */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 2, background: alpha(g1, 0.1), border: `1px solid ${alpha(g1, 0.22)}`, borderRadius: '100px', px: 1.5, py: 0.5, alignSelf: 'flex-start' }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: g1, fontFamily: '"Syne", sans-serif', textTransform: 'capitalize' }}>
            🎯 {prog.goal?.replace(/_/g, ' ')}
          </Typography>
        </Box>

        {canEdit && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => onEdit(prog)}
              sx={{ flex: 1, borderRadius: '10px', fontSize: '12px', py: '6px' }}>
              Modifier
            </Button>
            <Tooltip title="Dupliquer">
              <IconButton size="small" onClick={() => onDuplicate(prog.id)} sx={{ border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '10px', width: 34, height: 34 }}>
                <ContentCopy sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton size="small" color="error" onClick={() => onDelete(prog.id)} sx={{ border: `1px solid ${alpha('#FF5F7E', 0.3)}`, borderRadius: '10px', width: 34, height: 34 }}>
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── Day Editor ─────────────────────────────────────────────── */
function DayEditor({ day, dayIndex, exercises, onChange }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const [expanded, setExpanded] = useState(false);

  const addExercise = () => {
    onChange(dayIndex, { ...day, exercises: [...(day.exercises ?? []), { exercise_id: '', sets: 3, reps: 10, rest_seconds: 60, notes: '' }] });
  };
  const updateExercise = (i, field, value) => {
    const updated = [...(day.exercises ?? [])];
    updated[i] = { ...updated[i], [field]: value };
    onChange(dayIndex, { ...day, exercises: updated });
  };
  const removeExercise = i => onChange(dayIndex, { ...day, exercises: day.exercises.filter((_, idx) => idx !== i) });

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' } };

  return (
    <Box sx={{
      background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.02),
      border: `1px solid ${expanded ? alpha(primary, 0.3) : muiTheme.palette.divider}`,
      borderRadius: '14px', mb: 1.5, overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      <Box onClick={() => setExpanded(!expanded)} sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: '16px', py: '12px', cursor: 'pointer',
        background: expanded ? (isDark ? 'rgba(124,111,255,0.06)' : alpha(primary, 0.04)) : 'transparent',
        transition: 'background 0.2s',
      }}>
        <Box sx={{ background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '8px', px: 1.25, py: 0.3 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 800, color: primary, fontFamily: '"Syne", sans-serif' }}>
            Jour {day.day_number}
          </Typography>
        </Box>
        <TextField
          label="Titre du jour" value={day.title ?? ''} size="small"
          sx={{ width: 180, ...inputSx }}
          onChange={e => onChange(dayIndex, { ...day, title: e.target.value })}
          onClick={e => e.stopPropagation()}
        />
        <Box sx={{ flex: 1 }} />
        <Box onClick={e => { e.stopPropagation(); onChange(dayIndex, { ...day, is_rest: !day.is_rest, exercises: [] }); }} sx={{
          px: 1.5, py: 0.5, borderRadius: '100px', cursor: 'pointer',
          background: day.is_rest ? alpha('#2EE89A', 0.12) : 'transparent',
          border: `1px solid ${day.is_rest ? alpha('#2EE89A', 0.3) : muiTheme.palette.divider}`,
          transition: 'all 0.2s',
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: day.is_rest ? '#2EE89A' : 'text.secondary', fontFamily: '"Syne", sans-serif' }}>
            {day.is_rest ? '✓ Repos' : 'Repos ?'}
          </Typography>
        </Box>
        <Box sx={{ background: alpha(primary, 0.08), border: `1px solid ${alpha(primary, 0.15)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, fontFamily: '"Syne", sans-serif' }}>
            {day.exercises?.length ?? 0} ex.
          </Typography>
        </Box>
        {expanded ? <ExpandMore sx={{ fontSize: 18, color: primary }} /> : <ExpandMore sx={{ fontSize: 18, color: 'text.secondary', transform: 'rotate(-90deg)' }} />}
      </Box>

      {expanded && !day.is_rest && (
        <Box sx={{ px: '16px', pb: '16px', pt: '8px' }}>
          <Divider sx={{ mb: 2 }} />
          {(day.exercises ?? []).map((ex, i) => (
            <Box key={i} sx={{
              background: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.divider}`,
              borderRadius: '12px', p: '12px 14px', mb: 1.5,
            }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <DragIndicator sx={{ mt: 1, color: 'text.disabled', fontSize: 18 }} />
                <Grid container spacing={1.5} sx={{ flex: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField select label="Exercice" size="small" fullWidth required value={ex.exercise_id}
                      onChange={e => updateExercise(i, 'exercise_id', e.target.value)} sx={inputSx}>
                      {exercises.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField label="Séries" type="number" size="small" fullWidth value={ex.sets}
                      onChange={e => updateExercise(i, 'sets', e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField label="Reps" type="number" size="small" fullWidth value={ex.reps}
                      onChange={e => updateExercise(i, 'reps', e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <TextField label="Repos (s)" type="number" size="small" fullWidth value={ex.rest_seconds}
                      onChange={e => updateExercise(i, 'rest_seconds', e.target.value)} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Notes" size="small" fullWidth value={ex.notes}
                      onChange={e => updateExercise(i, 'notes', e.target.value)} sx={inputSx} />
                  </Grid>
                </Grid>
                <IconButton size="small" color="error" onClick={() => removeExercise(i)} sx={{ mt: 0.5 }}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Button size="small" startIcon={<Add />} onClick={addExercise} variant="outlined"
            sx={{ borderRadius: '10px', borderStyle: 'dashed', fontSize: '12px' }}>
            Ajouter un exercice
          </Button>
        </Box>
      )}
    </Box>
  );
}

/* ─── Program Form Dialog ────────────────────────────────────── */
function ProgramFormDialog({ open, onClose, onSave, editing }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const green   = '#2EE89A';

  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState(emptyProgram);
  const [days, setDays]       = useState([]);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving]   = useState(false);
  const { enqueueSnackbar }   = useSnackbar();

  const STEPS = ['Informations', 'Planning des jours', 'Récapitulatif'];

  useEffect(() => {
    if (open) api.get('/exercises', { params: { per_page: 100 } }).then(({ data }) => setExercises(data.data));
    if (editing) {
      setForm({ name: editing.name || '', description: editing.description || '', difficulty: editing.difficulty || 'beginner', duration_weeks: editing.duration_weeks || 4, goal: editing.goal || 'general_fitness', days_per_week: editing.days_per_week || 3, equipment_needed: editing.equipment_needed || '', target_audience: editing.target_audience || '', estimated_calories_week: editing.estimated_calories_week || '', is_public: editing.is_public ?? true });
      setDays(editing.days?.map(d => ({ day_number: d.day_number, title: d.title || '', is_rest: d.is_rest || false, exercises: d.exercises?.map(e => ({ exercise_id: e.pivot?.exercise_id || e.id, sets: e.pivot?.sets || 3, reps: e.pivot?.reps || 10, rest_seconds: e.pivot?.rest_seconds || 60, notes: e.pivot?.notes || '' })) ?? [] })) ?? []);
    } else {
      setForm(emptyProgram);
      setDays(Array.from({ length: 7 }, (_, i) => ({ day_number: i + 1, title: DAYS_LABELS[i], is_rest: i >= 5, exercises: [] })));
    }
    setStep(0);
  }, [editing, open]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const updateDay = (idx, updated) => setDays(prev => prev.map((d, i) => i === idx ? updated : d));

  const handleSave = async () => {
    if (!form.name) { enqueueSnackbar('Le nom est requis', { variant: 'warning' }); return; }
    setSaving(true);
    try {
      const payload = { ...form, days: days.map(d => ({ ...d, exercises: d.exercises.filter(e => e.exercise_id) })) };
      if (editing) {
        await api.put(`/programs/${editing.id}`, form);
        await api.put(`/programs/${editing.id}/days`, { days: payload.days });
        enqueueSnackbar('Programme mis à jour !', { variant: 'success' });
      } else {
        await api.post('/programs', payload);
        enqueueSnackbar('Programme créé !', { variant: 'success' });
      }
      onSave();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erreur', { variant: 'error' });
    } finally { setSaving(false); }
  };

  const totalExercises = days.reduce((a, d) => a + (d.exercises?.filter(e => e.exercise_id).length ?? 0), 0);
  const activeDays     = days.filter(d => !d.is_rest).length;

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '20px', minHeight: '80vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '17px', color: 'text.primary' }}>
          {editing ? '✏️ Modifier le programme' : '🆕 Nouveau programme'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Step indicator */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 0 }}>
          {STEPS.map((label, i) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <Box onClick={() => i < step && setStep(i)} sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: i < step ? 'pointer' : 'default',
                px: '12px', py: '8px', borderRadius: '100px',
                background: i === step ? alpha(primary, 0.1) : 'transparent',
              }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? green : i === step ? primary : 'transparent',
                  border: `2px solid ${i < step ? green : i === step ? primary : muiTheme.palette.divider}`,
                  fontSize: '11px', fontWeight: 800, color: i <= step ? '#fff' : 'text.disabled',
                  fontFamily: '"Syne", sans-serif',
                }}>
                  {i < step ? '✓' : i + 1}
                </Box>
                <Typography sx={{ fontSize: '12px', fontWeight: i === step ? 700 : 400, color: i === step ? primary : i < step ? green : 'text.secondary', fontFamily: '"Syne", sans-serif' }}>
                  {label}
                </Typography>
              </Box>
              {i < STEPS.length - 1 && (
                <Box sx={{ flex: 1, height: 2, background: i < step ? alpha(green, 0.4) : muiTheme.palette.divider, mx: 0.5, borderRadius: '100px' }} />
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Step 0 */}
        {step === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField label="Nom du programme *" fullWidth value={form.name} onChange={set('name')} sx={inputSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" multiline rows={3} fullWidth value={form.description} onChange={set('description')} sx={inputSx} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField select label="Difficulté" fullWidth value={form.difficulty} onChange={set('difficulty')} sx={inputSx}>
                {DIFFICULTIES.map(d => <MenuItem key={d} value={d} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Durée (semaines)" type="number" fullWidth value={form.duration_weeks} onChange={set('duration_weeks')} sx={inputSx} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Jours / semaine" type="number" fullWidth value={form.days_per_week} onChange={set('days_per_week')} inputProps={{ min: 1, max: 7 }} sx={inputSx} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Cal. estimées/sem." type="number" fullWidth value={form.estimated_calories_week} onChange={set('estimated_calories_week')} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Objectif" fullWidth value={form.goal} onChange={set('goal')} sx={inputSx}>
                {GOALS.map(g => <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Public cible" fullWidth value={form.target_audience} onChange={set('target_audience')} placeholder="Ex: débutants 30-50 ans" sx={inputSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Équipement nécessaire" fullWidth value={form.equipment_needed} onChange={set('equipment_needed')} placeholder="Ex: haltères, tapis, barre…" sx={inputSx} />
            </Grid>
          </Grid>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <Box>
            <Box sx={{ background: alpha('#7C6FFF', 0.08), border: `1px solid ${alpha('#7C6FFF', 0.2)}`, borderRadius: '12px', px: 2, py: 1.5, mb: 2.5, display: 'flex', gap: 1 }}>
              <Typography sx={{ fontSize: '13px' }}>ℹ️</Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                Configurez chaque jour de la semaine. Activez "Repos" pour les jours de récupération.
              </Typography>
            </Box>
            {days.map((day, idx) => (
              <DayEditor key={idx} day={day} dayIndex={idx} exercises={exercises} onChange={updateDay} />
            ))}
          </Box>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Box>
            <Grid container spacing={2} mb={3}>
              {[
                { label: 'Nom', value: form.name },
                { label: 'Difficulté', value: form.difficulty },
                { label: 'Durée', value: `${form.duration_weeks} semaines` },
                { label: 'Objectif', value: form.goal?.replace('_', ' ') },
                { label: 'Jours actifs', value: `${activeDays} / 7` },
                { label: 'Total exercices', value: totalExercises },
              ].map(({ label, value }) => (
                <Grid item xs={6} sm={4} key={label}>
                  <Box sx={{
                    background: muiTheme.palette.background.paper,
                    border: `1px solid ${muiTheme.palette.divider}`,
                    borderRadius: '12px', p: '12px 16px', textAlign: 'center',
                  }}>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary', textTransform: 'capitalize' }}>
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'text.primary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Planning des jours
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {days.map(day => (
                <Box key={day.day_number} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: '16px', py: '12px', borderRadius: '12px',
                  background: muiTheme.palette.background.paper,
                  border: `1px solid ${muiTheme.palette.divider}`,
                }}>
                  <Box sx={{ background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '8px', px: 1.25, py: 0.3 }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 800, color: primary, fontFamily: '"Syne", sans-serif' }}>Jour {day.day_number}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'text.primary', flex: 1 }}>{day.title}</Typography>
                  {day.is_rest ? (
                    <Box sx={{ background: alpha('#9090A8', 0.1), border: `1px solid ${alpha('#9090A8', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.secondary', fontFamily: '"Syne", sans-serif' }}>Repos</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ background: alpha('#2EE89A', 0.1), border: `1px solid ${alpha('#2EE89A', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#2EE89A', fontFamily: '"Syne", sans-serif' }}>
                        {day.exercises?.filter(e => e.exercise_id).length ?? 0} exercices
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button onClick={() => step > 0 ? setStep(step - 1) : onClose()} disabled={saving} variant="outlined" sx={{ borderRadius: '11px' }}>
          {step === 0 ? 'Annuler' : '← Précédent'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={() => setStep(step + 1)} sx={{ borderRadius: '11px' }}>
            Suivant →
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <CheckCircle />}
            sx={{ borderRadius: '11px', background: 'linear-gradient(135deg, #7C6FFF, #2EE89A)', '&:hover': { background: 'linear-gradient(135deg, #7C6FFF, #2EE89A)' } }}>
            {editing ? 'Mettre à jour' : 'Créer le programme'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function ManagePrograms() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const primary = muiTheme.palette.primary.main;

  const [programs, setPrograms]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [dialog, setDialog]         = useState(false);
  const [editing, setEditing]       = useState(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState('');
  const [filters, setFilters]       = useState({ goal: '', difficulty: '' });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/programs', { params: { page: p, per_page: 9, search: search || undefined, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) } });
      setPrograms(data.data);
      setTotalPages(data.last_page);
    } finally { setLoading(false); }
  }, [search, filters]);

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce programme ?')) return;
    try { await api.delete(`/programs/${id}`); enqueueSnackbar('Programme supprimé', { variant: 'success' }); load(page); } catch {}
  };
  const handleDuplicate = async id => {
    try { await api.post(`/programs/${id}/duplicate`); enqueueSnackbar('Programme dupliqué !', { variant: 'success' }); load(page); } catch {}
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            📚 Gérer les programmes
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            Créez des programmes fitness complets avec planning quotidien
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setDialog(true); }} sx={{ borderRadius: '11px' }}>
          Nouveau programme
        </Button>
      </Box>

      {/* Search bar */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', p: '16px 20px', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Rechercher un programme…" size="small" sx={{ flexGrow: 1, minWidth: 200, ...inputSx }}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
          />
          <TextField select label="Objectif" size="small" sx={{ width: 160, ...inputSx }} value={filters.goal}
            onChange={e => { setFilters(p => ({ ...p, goal: e.target.value })); setPage(1); }}>
            <MenuItem value="">Tous</MenuItem>
            {GOALS.map(g => <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField select label="Difficulté" size="small" sx={{ width: 140, ...inputSx }} value={filters.difficulty}
            onChange={e => { setFilters(p => ({ ...p, difficulty: e.target.value })); setPage(1); }}>
            <MenuItem value="">Tous</MenuItem>
            {DIFFICULTIES.map(d => <MenuItem key={d} value={d} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={() => load(page)} sx={{ borderRadius: '11px', flexShrink: 0 }}>Chercher</Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10} flexDirection="column" gap={2}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : programs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MenuBook sx={{ color: primary, fontSize: 32 }} />
          </Box>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>Aucun programme trouvé</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setDialog(true); }} sx={{ borderRadius: '11px' }}>
            Créer le premier programme
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            {programs.map((prog, i) => (
              <Grid item xs={12} sm={6} lg={4} key={prog.id}>
                <ProgramCard prog={prog} index={i}
                  onEdit={p => { setEditing(p); setDialog(true); }}
                  onDelete={handleDelete} onDuplicate={handleDuplicate}
                  canEdit={user?.role === 'admin' || prog.created_by === user?.id}
                />
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

      <ProgramFormDialog open={dialog} onClose={() => setDialog(false)} onSave={() => { setDialog(false); load(page); }} editing={editing} />
    </AppLayout>
  );
}