import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem,
  CircularProgress, IconButton, Pagination, Tooltip,
  Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Search, Delete, Visibility, Close, FitnessCenter, FilterList } from '@mui/icons-material';
import { MenuBook } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── helpers ────────────────────────────────────────────── */
const DIFF_STYLE = {
  beginner:     '#2EE89A',
  intermediate: '#FFB547',
  advanced:     '#FF5F7E',
};

function DiffBadge({ val }) {
  const color = DIFF_STYLE[val] || DIFF_STYLE.beginner;
  return (
    <Box sx={{ display: 'inline-block', background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
      <Typography sx={{ fontSize: '10px', fontWeight: 700, color, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{val}</Typography>
    </Box>
  );
}

/* ─── Detail dialog ──────────────────────────────────────── */
function ExerciseDetailDialog({ exercise, open, onClose }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  if (!exercise) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>{exercise.name}</Typography>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Box sx={{ mx: 3, mb: 2, height: '1px', background: muiTheme.palette.divider }} />
      <DialogContent sx={{ pt: 0 }}>
        <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap">
          <DiffBadge val={exercise.difficulty} />
          <Box sx={{ background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3, display: 'inline-block' }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{exercise.category}</Typography>
          </Box>
          {exercise.muscle_group && (
            <Box sx={{ background: alpha(accent, 0.1), border: `1px solid ${alpha(accent, 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3, display: 'inline-block' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: accent, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{exercise.muscle_group}</Typography>
            </Box>
          )}
        </Stack>
        <Typography sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.7, mb: 2.5 }}>{exercise.description || 'Aucune description'}</Typography>
        <Grid container spacing={1.5} mb={2.5}>
          {[
            { label: 'Durée', value: `${exercise.duration} min`, color: '#5CE1E6' },
            { label: 'Calories', value: `${exercise.calories_burned} kcal`, color: accent },
            { label: 'Séances', value: exercise.workouts_count ?? 0, color: primary },
          ].map(({ label, value, color }) => (
            <Grid item xs={4} key={label}>
              <Box sx={{ textAlign: 'center', background: alpha(color, isDark ? 0.1 : 0.07), border: `1px solid ${alpha(color, 0.2)}`, borderRadius: '14px', p: '12px 8px' }}>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color, lineHeight: 1.2 }}>{value}</Typography>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.4 }}>{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
          Créé par : <strong style={{ color: muiTheme.palette.text.primary }}>{exercise.creator?.name}</strong>
        </Typography>
        {exercise.video_url && (
          <Button href={exercise.video_url} target="_blank" size="small" sx={{ mt: 1, borderRadius: '10px' }}>🎬 Voir la vidéo</Button>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function AdminExercises() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const { enqueueSnackbar } = useSnackbar();

  const [exercises, setExercises]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewEx, setViewEx]         = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/exercises', {
        params: { page: p, per_page: 15, search: search || undefined, category: category || undefined, difficulty: difficulty || undefined },
      });
      setExercises(data.data);
      setTotalPages(data.last_page);
    } finally { setLoading(false); }
  }, [search, category, difficulty]);

  useEffect(() => { load(page); }, [page, category, difficulty]);

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet exercice ?')) return;
    try { await api.delete(`/exercises/${id}`); enqueueSnackbar('Exercice supprimé', { variant: 'success' }); load(page); }
    catch { enqueueSnackbar('Erreur', { variant: 'error' }); }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };
  const bg = isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03);
  const thSx = { fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'text.secondary', py: '14px', background: bg, borderBottom: `1px solid ${muiTheme.palette.divider}` };

  return (
    <AppLayout>
      <Box mb={4}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>🏋️ Exercices</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Modérez tous les exercices de la plateforme</Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', p: '16px 20px', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Rechercher un exercice…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)}
            sx={{ flexGrow: 1, minWidth: 200, ...inputSx }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
          />
          <TextField select size="small" label="Catégorie" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} sx={{ minWidth: 140, ...inputSx }}>
            {[['','Toutes'],['cardio','Cardio'],['strength','Force'],['flexibility','Flexibilité'],['hiit','HIIT'],['sports','Sports']].map(([v,l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Difficulté" value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} sx={{ minWidth: 150, ...inputSx }}>
            {[['','Toutes'],['beginner','Débutant'],['intermediate','Intermédiaire'],['advanced','Avancé']].map(([v,l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={() => load(1)} startIcon={<FilterList />} sx={{ borderRadius: '11px', flexShrink: 0 }}>Filtrer</Button>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Nom','Catégorie','Difficulté','Durée','Calories','Créateur','Séances','Actions'].map(h => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><CircularProgress sx={{ color: primary }} /></TableCell></TableRow>
              ) : exercises.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary', fontSize: '13px' }}>Aucun exercice trouvé</TableCell></TableRow>
              ) : exercises.map(ex => (
                <TableRow key={ex.id} sx={{ transition: 'background 0.15s', '&:hover': { background: isDark ? 'rgba(124,111,255,0.04)' : alpha(primary, 0.03) }, '& td': { borderColor: muiTheme.palette.divider }, '&:last-child td': { border: 'none' } }}>
                  <TableCell sx={{ py: '14px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FitnessCenter sx={{ fontSize: 14, color: primary }} />
                      </Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>{ex.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'inline-block', background: alpha(primary, 0.08), border: `1px solid ${alpha(primary, 0.18)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{ex.category}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><DiffBadge val={ex.difficulty} /></TableCell>
                  <TableCell><Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{ex.duration} min</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{ex.calories_burned} kcal</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{ex.creator?.name || '—'}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'inline-block', background: alpha('#5CE1E6', 0.1), border: `1px solid ${alpha('#5CE1E6', 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#5CE1E6', fontFamily: '"Syne",sans-serif' }}>{ex.workouts_count ?? 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Détails">
                        <IconButton size="small" onClick={() => setViewEx(ex)} sx={{ width: 30, height: 30, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '9px', '&:hover': { borderColor: alpha(primary, 0.4) } }}>
                          <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => handleDelete(ex.id)} sx={{ width: 30, height: 30, border: `1px solid ${alpha('#FF5F7E', 0.3)}`, borderRadius: '9px', '&:hover': { background: alpha('#FF5F7E', 0.08) } }}>
                          <Delete sx={{ fontSize: 14, color: '#FF5F7E' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary"
            sx={{ '& .MuiPaginationItem-root': { fontFamily: '"Syne",sans-serif', fontWeight: 600 } }} />
        </Box>
      )}
      <ExerciseDetailDialog exercise={viewEx} open={!!viewEx} onClose={() => setViewEx(null)} />
    </AppLayout>
  );
}