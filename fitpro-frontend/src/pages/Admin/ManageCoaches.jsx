import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, TextField, Button, CircularProgress,
  IconButton, Pagination, Tooltip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Search, Delete, Visibility, Close, PersonAdd, People, FitnessCenter, MenuBook } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Create Coach Dialog ────────────────────────────────── */
function CreateCoachDialog({ open, onClose, onCreated }) {
  const muiTheme = useMuiTheme();
  const primary = muiTheme.palette.primary.main;
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { enqueueSnackbar('Veuillez remplir tous les champs obligatoires', { variant: 'warning' }); return; }
    setLoading(true);
    try {
      await api.post('/admin/coaches', form);
      enqueueSnackbar('Coach créé avec succès !', { variant: 'success' });
      setForm({ name: '', email: '', password: '', phone: '' });
      onCreated();
    } catch (err) { enqueueSnackbar(err.response?.data?.message || 'Erreur', { variant: 'error' }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>➕ Nouveau coach</Typography>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Box sx={{ mx: 3, mb: 2, height: '1px', background: muiTheme.palette.divider }} />
      <DialogContent sx={{ pt: 0 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}><TextField label="Nom complet *" fullWidth value={form.name} onChange={set('name')} sx={inputSx} /></Grid>
          <Grid item xs={12}><TextField label="Email *" type="email" fullWidth value={form.email} onChange={set('email')} sx={inputSx} /></Grid>
          <Grid item xs={6}><TextField label="Mot de passe *" type="password" fullWidth value={form.password} onChange={set('password')} helperText="Minimum 8 caractères" sx={inputSx} /></Grid>
          <Grid item xs={6}><TextField label="Téléphone" fullWidth value={form.phone} onChange={set('phone')} placeholder="+212 6xx xxx xxx" sx={inputSx} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Annuler</Button>
        <Button variant="contained" onClick={handleCreate} disabled={loading} startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <PersonAdd />} sx={{ borderRadius: '11px' }}>
          Créer le coach
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Coach Detail Dialog ────────────────────────────────── */
function CoachDetailDialog({ coach, open, onClose }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const green   = '#2EE89A';
  if (!coach) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>Profil coach</Typography>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Box sx={{ mx: 3, mb: 2, height: '1px', background: muiTheme.palette.divider }} />
      <DialogContent sx={{ pt: 0 }}>
        {/* Avatar row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: '14px 16px', background: isDark ? 'rgba(46,232,154,0.06)' : alpha(green, 0.05), border: `1px solid ${alpha(green, 0.2)}`, borderRadius: '14px' }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '15px', background: `linear-gradient(135deg, ${alpha(green, 0.3)}, ${alpha(primary, 0.2)})`, border: `1px solid ${alpha(green, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '20px', color: green, flexShrink: 0 }}>
            {coach.name?.charAt(0)}
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '15px', color: 'text.primary' }}>{coach.name}</Typography>
            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{coach.email}</Typography>
            {coach.phone && <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>{coach.phone}</Typography>}
          </Box>
        </Box>
        <Grid container spacing={1.5} mb={2}>
          {[
            { label: 'Utilisateurs', value: coach.assigned_users_count ?? 0, color: primary, icon: '👥' },
            { label: 'Programmes',   value: coach.programs_count ?? 0,       color: '#FFB547', icon: '📚' },
            { label: 'Exercices',    value: coach.exercises_count ?? 0,      color: green,    icon: '🏋️' },
          ].map(({ label, value, color, icon }) => (
            <Grid item xs={4} key={label}>
              <Box sx={{ textAlign: 'center', background: alpha(color, isDark ? 0.1 : 0.07), border: `1px solid ${alpha(color, 0.2)}`, borderRadius: '12px', p: '12px 6px' }}>
                <Typography sx={{ fontSize: '16px', mb: 0.25 }}>{icon}</Typography>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color, lineHeight: 1.1 }}>{value}</Typography>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.25 }}>{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Typography sx={{ fontSize: '11px', color: 'text.disabled' }}>
          Inscrit le {new Date(coach.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function ManageCoaches() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const green   = '#2EE89A';
  const { enqueueSnackbar } = useSnackbar();

  const [coaches, setCoaches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewCoach, setViewCoach]       = useState(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coaches', { params: { page: p, search: search || undefined } });
      setCoaches(data.data); setTotalPages(data.last_page);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  const handleRemove = async coach => {
    if (!window.confirm(`Rétrograder ${coach.name} en utilisateur ?`)) return;
    try {
      await api.delete(`/admin/coaches/${coach.id}`);
      enqueueSnackbar('Coach rétrogradé en utilisateur', { variant: 'info' });
      load(page);
    } catch (e) { enqueueSnackbar(e.response?.data?.message || 'Erreur', { variant: 'error' }); }
  };

  const totalAssigned  = coaches.reduce((s, c) => s + (c.assigned_users_count ?? 0), 0);
  const totalPrograms  = coaches.reduce((s, c) => s + (c.programs_count ?? 0), 0);
  const totalExercises = coaches.reduce((s, c) => s + (c.exercises_count ?? 0), 0);

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };
  const thSx = { fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'text.secondary', py: '14px', background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), borderBottom: `1px solid ${muiTheme.palette.divider}` };

  return (
    <AppLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>🏋️ Gestion des coachs</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Créez et gérez les comptes coach</Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setCreateDialog(true)} sx={{ borderRadius: '11px' }}>
          Nouveau coach
        </Button>
      </Box>

      {/* Summary tiles */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: 'Total coachs',        value: coaches.length,  color: green,   emoji: '🏋️' },
          { label: 'Utilisateurs suivis', value: totalAssigned,   color: primary, emoji: '👥' },
          { label: 'Programmes créés',    value: totalPrograms,   color: '#FFB547', emoji: '📚' },
          { label: 'Exercices créés',     value: totalExercises,  color: '#FF5F7E', emoji: '💪' },
        ].map(({ label, value, color, emoji }) => (
          <Grid item xs={6} md={3} key={label}>
            <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '18px', p: '20px 22px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { borderColor: alpha(color, 0.4), transform: 'translateY(-3px)' } }}>
              <Box sx={{ position: 'absolute', top: 0, left: 14, right: 14, height: '2px', background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
              <Box sx={{ position: 'absolute', bottom: -16, right: -16, width: 70, height: 70, borderRadius: '50%', background: alpha(color, 0.06), filter: 'blur(14px)', pointerEvents: 'none' }} />
              <Typography sx={{ fontSize: '20px', mb: 0.5 }}>{emoji}</Typography>
              <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '2rem', color, lineHeight: 1.1 }}>{value}</Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', p: '16px 20px', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField placeholder="Rechercher un coach…" size="small" sx={{ flexGrow: 1, ...inputSx }} value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
          />
          <Button variant="contained" onClick={() => load(1)} sx={{ borderRadius: '11px' }}>Chercher</Button>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>{['Coach','Email','Utilisateurs','Programmes','Exercices','Inscrit le','Actions'].map(h => <TableCell key={h} sx={thSx}>{h}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress sx={{ color: primary }} /></TableCell></TableRow>
              : coaches.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><People sx={{ color: primary, fontSize: 24 }} /></Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '13px', mb: 2 }}>Aucun coach trouvé</Typography>
                  <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setCreateDialog(true)} sx={{ borderRadius: '11px' }}>Créer le premier coach</Button>
                </TableCell></TableRow>
              ) : coaches.map(c => (
                <TableRow key={c.id} sx={{ transition: 'background 0.15s', '&:hover': { background: isDark ? 'rgba(124,111,255,0.04)' : alpha(primary, 0.03) }, '& td': { borderColor: muiTheme.palette.divider }, '&:last-child td': { border: 'none' } }}>
                  <TableCell sx={{ py: '14px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '11px', background: alpha(green, 0.15), border: `1px solid ${alpha(green, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '13px', color: green, flexShrink: 0 }}>{c.name?.charAt(0)}</Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>{c.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{c.email}</Typography></TableCell>
                  <TableCell><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.22)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}><People sx={{ fontSize: 11, color: primary }} /><Typography sx={{ fontSize: '10px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif' }}>{c.assigned_users_count ?? 0}</Typography></Box></TableCell>
                  <TableCell><Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>{c.programs_count ?? 0}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>{c.exercises_count ?? 0}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Voir profil"><IconButton size="small" onClick={() => setViewCoach(c)} sx={{ width: 30, height: 30, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '9px', '&:hover': { borderColor: alpha(primary, 0.4) } }}><Visibility sx={{ fontSize: 14, color: 'text.secondary' }} /></IconButton></Tooltip>
                      <Tooltip title="Rétrograder en utilisateur"><IconButton size="small" onClick={() => handleRemove(c)} sx={{ width: 30, height: 30, border: `1px solid ${alpha('#FF5F7E', 0.3)}`, borderRadius: '9px', '&:hover': { background: alpha('#FF5F7E', 0.08) } }}><Delete sx={{ fontSize: 14, color: '#FF5F7E' }} /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {totalPages > 1 && <Box display="flex" justifyContent="center" mt={3}><Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" sx={{ '& .MuiPaginationItem-root': { fontFamily: '"Syne",sans-serif', fontWeight: 600 } }} /></Box>}

      <CreateCoachDialog open={createDialog} onClose={() => setCreateDialog(false)} onCreated={() => { setCreateDialog(false); load(page); }} />
      <CoachDetailDialog coach={viewCoach} open={!!viewCoach} onClose={() => setViewCoach(null)} />
    </AppLayout>
  );
}