import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Pagination, Stack, Tabs, Tab,
  Checkbox, InputAdornment, Alert, Tooltip,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  Add, Edit, Delete, Close, FitnessCenter, Search, FilterList,
  ContentCopy, Star, StarBorder, Refresh, Timer,
} from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';
import { debounce } from 'lodash';

/* ─── Constants ─────────────────────────────────────────────── */
const CATEGORIES   = ['cardio', 'strength', 'flexibility', 'sports', 'hiit', 'yoga', 'pilates'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'abs', 'full body'];

const DIFF_STYLE = {
  beginner:     { bg: alpha('#2EE89A', 0.12), border: alpha('#2EE89A', 0.25), color: '#2EE89A' },
  intermediate: { bg: alpha('#FFB547', 0.12), border: alpha('#FFB547', 0.25), color: '#FFB547' },
  advanced:     { bg: alpha('#FF5F7E', 0.12), border: alpha('#FF5F7E', 0.25), color: '#FF5F7E' },
};

const CAT_GRAD = {
  cardio:     ['#EF4444', '#F97316'], strength:    ['#7C6FFF', '#A78BFA'],
  flexibility:['#2EE89A', '#10B981'], hiit:        ['#FFB547', '#FBBF24'],
  sports:     ['#5CE1E6', '#38BDF8'], yoga:        ['#EC4899', '#F47193'],
  pilates:    ['#8B5CF6', '#A78BFA'],
};

const empty = {
  name: '', description: '', duration: '', calories_burned: '',
  category: 'cardio', difficulty: 'beginner', muscle_group: '',
  video_url: '', equipment: '', instructions: '', tips: '',
  sets_default: 3, reps_default: 10,
};

/* ─── Shared section card ────────────────────────────────────── */
function FCard({ children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '16px', position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s', ...sx,
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
      {children}
    </Box>
  );
}

/* ─── Exercise card ──────────────────────────────────────────── */
function ExerciseCard({ ex, onEdit, onDelete, onDuplicate, onFavorite, selected, onSelect, canEdit }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;

  const diff = DIFF_STYLE[ex.difficulty] || DIFF_STYLE.beginner;
  const [g1, g2] = CAT_GRAD[ex.category] || CAT_GRAD.strength;

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `${selected ? 2 : 1}px solid ${selected ? primary : muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: alpha(primary, 0.35),
        boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.45)' : `0 12px 40px ${alpha(primary, 0.15)}`,
      },
    }}>
      {/* Card header */}
      <Box sx={{
        height: 140, position: 'relative', overflow: 'hidden',
        background: isDark
          ? `linear-gradient(135deg, ${alpha(g1, 0.22)}, ${alpha(g2, 0.15)})`
          : `linear-gradient(135deg, ${alpha(g1, 0.12)}, ${alpha(g2, 0.08)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ position: 'absolute', top: -28, right: -28, width: 110, height: 110, borderRadius: '50%', border: `1px solid ${alpha(g1, 0.2)}` }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: '50%', border: `1px solid ${alpha(g2, 0.18)}` }} />
        <Box sx={{
          width: 56, height: 56, borderRadius: '16px',
          background: alpha(g1, 0.15), border: `1px solid ${alpha(g1, 0.3)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FitnessCenter sx={{ color: g1, fontSize: 26 }} />
        </Box>

        {/* Checkbox */}
        {canEdit && (
          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
            <Box onClick={e => { e.stopPropagation(); onSelect(ex.id); }} sx={{
              width: 22, height: 22, borderRadius: '7px', cursor: 'pointer',
              background: selected ? primary : muiTheme.palette.background.paper,
              border: `2px solid ${selected ? primary : muiTheme.palette.divider}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              {selected && <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />}
            </Box>
          </Box>
        )}

        {/* Favorite */}
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton size="small" onClick={() => onFavorite(ex)} sx={{
            width: 30, height: 30, background: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            '&:hover': { borderColor: alpha('#FFB547', 0.5) },
          }}>
            {ex.is_favorited
              ? <Star sx={{ fontSize: 14, color: '#FFB547' }} />
              : <StarBorder sx={{ fontSize: 14, color: 'text.secondary' }} />
            }
          </IconButton>
        </Box>

        {/* Difficulty badge */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 10, background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color, fontFamily: '"Syne", sans-serif' }}>
            {ex.difficulty}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.25 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, textTransform: 'capitalize', fontFamily: '"Syne", sans-serif' }}>{ex.category}</Typography>
          </Box>
          {ex.muscle_group && (
            <Box sx={{ background: alpha(accent, 0.1), border: `1px solid ${alpha(accent, 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.25 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'capitalize', fontFamily: '"Syne", sans-serif' }}>{ex.muscle_group}</Typography>
            </Box>
          )}
        </Box>

        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '14px', color: 'text.primary', mb: 0.75, lineHeight: 1.3 }}>
          {ex.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.6, flex: 1, mb: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {ex.description || 'Aucune description'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: alpha('#5CE1E6', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Timer sx={{ fontSize: 12, color: '#5CE1E6' }} />
            </Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary' }}>{ex.duration} min</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: alpha(accent, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WhatshotIcon sx={{ fontSize: 12, color: accent }} />
            </Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary' }}>{ex.calories_burned} kcal</Typography>
          </Box>
          {ex.favorites_count > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ fontSize: 12, color: '#FFB547' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#FFB547' }}>{ex.favorites_count}</Typography>
            </Box>
          )}
        </Box>

        {canEdit && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => onEdit(ex)}
              sx={{ flex: 1, borderRadius: '10px', fontSize: '12px', py: '6px' }}>
              Modifier
            </Button>
            <Tooltip title="Dupliquer">
              <IconButton size="small" onClick={() => onDuplicate(ex.id)} sx={{ border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '10px', width: 34, height: 34, '&:hover': { borderColor: alpha(primary, 0.4) } }}>
                <ContentCopy sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton size="small" color="error" onClick={() => onDelete(ex.id)} sx={{ border: `1px solid ${alpha('#FF5F7E', 0.3)}`, borderRadius: '10px', width: 34, height: 34, '&:hover': { background: alpha('#FF5F7E', 0.08) } }}>
                <Delete sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── Form Dialog ────────────────────────────────────────────── */
function ExerciseFormDialog({ open, onClose, onSave, editing }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const [form, setForm] = useState(empty);
  const [tab, setTab]   = useState(0);
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '', description: editing.description || '',
        duration: editing.duration || '', calories_burned: editing.calories_burned || '',
        category: editing.category || 'cardio', difficulty: editing.difficulty || 'beginner',
        muscle_group: editing.muscle_group || '', video_url: editing.video_url || '',
        equipment: editing.equipment || '',
        instructions: Array.isArray(editing.instructions) ? editing.instructions.join('\n') : (editing.instructions || ''),
        tips: Array.isArray(editing.tips) ? editing.tips.join('\n') : (editing.tips || ''),
        sets_default: editing.sets_default || 3, reps_default: editing.reps_default || 10,
      });
    } else { setForm(empty); }
    setTab(0);
  }, [editing, open]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.duration || !form.calories_burned) {
      enqueueSnackbar('Veuillez remplir les champs obligatoires', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        instructions: form.instructions ? form.instructions.split('\n').filter(Boolean) : [],
        tips: form.tips ? form.tips.split('\n').filter(Boolean) : [],
      };
      if (editing) {
        await api.put(`/exercises/${editing.id}`, payload);
        enqueueSnackbar('Exercice mis à jour !', { variant: 'success' });
      } else {
        await api.post('/exercises', payload);
        enqueueSnackbar('Exercice créé !', { variant: 'success' });
      }
      onSave();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erreur', { variant: 'error' });
    } finally { setSaving(false); }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  const TABS = ['Infos de base', 'Détails', 'Instructions'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '17px', color: 'text.primary' }}>
          {editing ? '✏️ Modifier l\'exercice' : '➕ Nouvel exercice'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tab nav */}
      <Box sx={{ px: 3, borderBottom: `1px solid ${muiTheme.palette.divider}` }}>
        <Box sx={{ display: 'flex', gap: 0 }}>
          {TABS.map((label, i) => (
            <Box
              key={label}
              onClick={() => setTab(i)}
              sx={{
                px: 2, py: 1.25, cursor: 'pointer', fontSize: '13px', fontWeight: tab === i ? 700 : 500,
                fontFamily: '"Syne", sans-serif',
                color: tab === i ? primary : 'text.secondary',
                borderBottom: `2px solid ${tab === i ? primary : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
              {label}
            </Box>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField label="Nom *" fullWidth value={form.name} onChange={set('name')} sx={inputSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" multiline rows={3} fullWidth value={form.description} onChange={set('description')} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Durée (min) *" type="number" fullWidth value={form.duration} onChange={set('duration')} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Calories brûlées *" type="number" fullWidth value={form.calories_burned} onChange={set('calories_burned')} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Catégorie" fullWidth value={form.category} onChange={set('category')} sx={inputSx}>
                {CATEGORIES.map(c => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Difficulté" fullWidth value={form.difficulty} onChange={set('difficulty')} sx={inputSx}>
                {DIFFICULTIES.map(d => <MenuItem key={d} value={d} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2.5}>
            <Grid item xs={6}>
              <TextField select label="Groupe musculaire" fullWidth value={form.muscle_group} onChange={set('muscle_group')} sx={inputSx}>
                <MenuItem value="">Non spécifié</MenuItem>
                {MUSCLE_GROUPS.map(m => <MenuItem key={m} value={m} sx={{ textTransform: 'capitalize' }}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Équipement" fullWidth value={form.equipment} onChange={set('equipment')} placeholder="Ex: haltères, tapis…" sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Séries par défaut" type="number" fullWidth value={form.sets_default} onChange={set('sets_default')} sx={inputSx} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Répétitions par défaut" type="number" fullWidth value={form.reps_default} onChange={set('reps_default')} sx={inputSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="URL vidéo (optionnel)" fullWidth value={form.video_url} onChange={set('video_url')} placeholder="https://youtube.com/…" sx={inputSx} />
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: 1 }}>
                Entrez chaque étape sur une nouvelle ligne
              </Typography>
              <TextField label="Instructions (une par ligne)" multiline rows={6} fullWidth value={form.instructions} onChange={set('instructions')}
                placeholder={"1. Position de départ…\n2. Mouvement…\n3. Retour position…"} sx={inputSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Conseils (un par ligne)" multiline rows={4} fullWidth value={form.tips} onChange={set('tips')}
                placeholder={"Gardez le dos droit…\nRespirez régulièrement…"} sx={inputSx} />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: '11px' }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
          {editing ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function ManageExercises() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const primary = muiTheme.palette.primary.main;

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dialog, setDialog]       = useState(false);
  const [editing, setEditing]     = useState(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected]   = useState([]);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ category: '', difficulty: '', muscle_group: '' });
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async (p = 1, s = search, f = filters) => {
    setLoading(true);
    try {
      const { data } = await api.get('/exercises', {
        params: { page: p, per_page: 9, search: s || undefined, ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) },
      });
      setExercises(data.data);
      setTotalPages(data.last_page);
    } finally { setLoading(false); }
  }, []);

  const debouncedSearch = useCallback(debounce(v => { setPage(1); load(1, v, filters); }, 400), [filters]);

  useEffect(() => { load(page, search, filters); }, [page]);

  const handleSearch = e => { setSearch(e.target.value); debouncedSearch(e.target.value); };
  const applyFilter  = newF => { setFilters(newF); setPage(1); load(1, search, newF); };

  const handleFavorite = async ex => {
    try {
      const { data } = await api.post(`/exercises/${ex.id}/favorite`);
      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, is_favorited: data.is_favorited } : e));
    } catch {}
  };
  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet exercice ?')) return;
    try { await api.delete(`/exercises/${id}`); enqueueSnackbar('Supprimé', { variant: 'success' }); load(page); } catch {}
  };
  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer ${selected.length} exercice(s) ?`)) return;
    try { await api.post('/exercises/bulk-delete', { ids: selected }); enqueueSnackbar(`${selected.length} exercices supprimés`, { variant: 'success' }); setSelected([]); load(page); } catch {}
  };
  const handleDuplicate = async id => {
    try { await api.post(`/exercises/${id}/duplicate`); enqueueSnackbar('Exercice dupliqué !', { variant: 'success' }); load(page); } catch {}
  };
  const toggleSelect = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            🏋️ Gérer les exercices
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            Créez et gérez votre bibliothèque d'exercices
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => load(page)} sx={{ borderRadius: '11px' }}>
            Actualiser
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setDialog(true); }} sx={{ borderRadius: '11px' }}>
            Ajouter
          </Button>
        </Box>
      </Box>

      {/* Filters bar */}
      <FCard sx={{ mb: 3 }}>
        <Box sx={{ p: '16px 20px' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField placeholder="Rechercher par nom, muscle…" value={search} onChange={handleSearch} size="small"
              sx={{ flexGrow: 1, ...inputSx }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
            />
            <Button
              variant={showFilters ? 'contained' : 'outlined'} size="small"
              startIcon={<FilterList />} onClick={() => setShowFilters(p => !p)}
              sx={{ borderRadius: '10px', flexShrink: 0 }}>
              Filtres
            </Button>
          </Box>

          {showFilters && (
            <Grid container spacing={2} mt={1}>
              {[
                { label: 'Catégorie', key: 'category', options: CATEGORIES },
                { label: 'Difficulté', key: 'difficulty', options: DIFFICULTIES },
                { label: 'Muscle', key: 'muscle_group', options: MUSCLE_GROUPS },
              ].map(({ label, key, options }) => (
                <Grid item xs={12} sm={4} key={key}>
                  <TextField select label={label} size="small" fullWidth value={filters[key]}
                    onChange={e => applyFilter({ ...filters, [key]: e.target.value })} sx={inputSx}>
                    <MenuItem value="">Tous</MenuItem>
                    {options.map(o => <MenuItem key={o} value={o} sx={{ textTransform: 'capitalize' }}>{o}</MenuItem>)}
                  </TextField>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </FCard>

      {/* Bulk action */}
      {selected.length > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
          background: alpha(primary, 0.08), border: `1px solid ${alpha(primary, 0.25)}`,
          borderRadius: '14px', px: 2.5, py: 1.5, mb: 2.5,
        }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
            {selected.length} exercice(s) sélectionné(s)
          </Typography>
          <Button color="error" size="small" onClick={handleBulkDelete} startIcon={<Delete />}
            sx={{ borderRadius: '10px' }}>
            Supprimer ({selected.length})
          </Button>
        </Box>
      )}

      {/* Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10} flexDirection="column" gap={2}>
          <CircularProgress sx={{ color: primary }} />
          <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Chargement…</Typography>
        </Box>
      ) : exercises.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FitnessCenter sx={{ color: primary, fontSize: 32 }} />
          </Box>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>Aucun exercice trouvé</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setDialog(true); }} sx={{ borderRadius: '11px' }}>
            Créer le premier
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5}>
            {exercises.map(ex => (
              <Grid item xs={12} sm={6} lg={4} key={ex.id}>
                <ExerciseCard
                  ex={ex} selected={selected.includes(ex.id)} onSelect={toggleSelect}
                  onEdit={e => { setEditing(e); setDialog(true); }}
                  onDelete={handleDelete} onDuplicate={handleDuplicate} onFavorite={handleFavorite}
                  canEdit={user?.role === 'admin' || ex.created_by === user?.id}
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

      <ExerciseFormDialog open={dialog} onClose={() => setDialog(false)} onSave={() => { setDialog(false); load(page); }} editing={editing} />
    </AppLayout>
  );
}