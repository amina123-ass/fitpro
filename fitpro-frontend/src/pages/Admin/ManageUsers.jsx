import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, TextField, Button, MenuItem,
  CircularProgress, IconButton, Pagination, Tooltip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  Search, Edit, Delete, Block, CheckCircle, Close,
  Visibility, FilterList, People, FitnessCenter,
} from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Role & status styles ───────────────────────────────── */
const ROLE_STYLE = {
  admin: { color: '#FF5F7E' },
  coach: { color: '#2EE89A' },
  user:  { color: '#7C6FFF' },
};

function RoleBadge({ role }) {
  const { color } = ROLE_STYLE[role] || ROLE_STYLE.user;
  return (
    <Box sx={{ display: 'inline-block', background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
      <Typography sx={{ fontSize: '10px', fontWeight: 700, color, fontFamily: '"Syne",sans-serif', textTransform: 'capitalize' }}>{role}</Typography>
    </Box>
  );
}

function StatusBadge({ active }) {
  const color = active ? '#2EE89A' : '#FF5F7E';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <Typography sx={{ fontSize: '10px', fontWeight: 700, color, fontFamily: '"Syne",sans-serif' }}>{active ? 'Actif' : 'Suspendu'}</Typography>
    </Box>
  );
}

/* ─── User Detail Dialog ─────────────────────────────────── */
function UserDetailDialog({ userId, open, onClose }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    api.get(`/admin/users/${userId}`).then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, [userId, open]);

  const user = data?.user;
  const stats = data?.stats ?? {};
  const roleColor = (ROLE_STYLE[user?.role] || ROLE_STYLE.user).color;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>Profil utilisateur</Typography>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Box sx={{ mx: 3, mb: 2, height: '1px', background: muiTheme.palette.divider }} />
      <DialogContent sx={{ pt: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: primary }} /></Box>
        ) : user ? (
          <>
            {/* Avatar card */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: '14px 16px', background: alpha(roleColor, isDark ? 0.08 : 0.05), border: `1px solid ${alpha(roleColor, 0.2)}`, borderRadius: '14px' }}>
              <Box sx={{ width: 52, height: 52, borderRadius: '15px', background: alpha(roleColor, 0.2), border: `1px solid ${alpha(roleColor, 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '20px', color: roleColor, flexShrink: 0 }}>
                {user.name?.charAt(0)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '15px', color: 'text.primary' }}>{user.name}</Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }} noWrap>{user.email}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
                  <RoleBadge role={user.role} />
                  <StatusBadge active={user.is_active} />
                </Box>
              </Box>
            </Box>

            {/* Stats */}
            <Grid container spacing={1.5} mb={2.5}>
              {[
                { label: 'Total séances',    value: stats.total_workouts ?? 0,                          color: primary },
                { label: 'Calories brûlées', value: `${(stats.total_calories ?? 0).toLocaleString()} kcal`, color: accent },
                { label: 'Cette semaine',    value: stats.week_workouts ?? 0,                           color: '#2EE89A' },
                { label: 'Programmes actifs',value: stats.active_programs ?? 0,                         color: '#FFB547' },
              ].map(({ label, value, color }) => (
                <Grid item xs={6} key={label}>
                  <Box sx={{ textAlign: 'center', background: alpha(color, isDark ? 0.1 : 0.07), border: `1px solid ${alpha(color, 0.2)}`, borderRadius: '12px', p: '12px 8px' }}>
                    <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color, lineHeight: 1.2 }}>{value}</Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.4 }}>{label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Recent workouts */}
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary', mb: 1 }}>Dernières séances</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {(user.workouts ?? []).slice(0, 5).map(w => (
                <Box key={w.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '10px', px: '12px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.04), border: `1px solid ${muiTheme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: '7px', background: alpha(primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FitnessCenter sx={{ fontSize: 13, color: primary }} />
                    </Box>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary' }}>{w.exercise?.name || 'Exercice'}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                    {new Date(w.workout_date).toLocaleDateString('fr-FR')} · {w.calories_burned} kcal
                  </Typography>
                </Box>
              ))}
              {!(user.workouts?.length) && <Typography sx={{ fontSize: '12px', color: 'text.secondary', textAlign: 'center', py: 2 }}>Aucune séance enregistrée</Typography>}
            </Box>
          </>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Edit Role Dialog ───────────────────────────────────── */
function EditRoleDialog({ user, open, onClose, onSave }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const [role, setRole] = useState(user?.role || 'user');
  useEffect(() => { if (user) setRole(user.role); }, [user]);
  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };
  const roleColor = (ROLE_STYLE[role] || ROLE_STYLE.user).color;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '16px', color: 'text.primary' }}>Modifier le rôle</Typography>
        <IconButton onClick={onClose} size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <Box sx={{ mx: 3, mb: 2, height: '1px', background: muiTheme.palette.divider }} />
      <DialogContent sx={{ pt: 0 }}>
        {/* User preview */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, p: '12px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.04), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '12px' }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '11px', background: alpha(primary, 0.15), border: `1px solid ${alpha(primary, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '15px', color: primary, flexShrink: 0 }}>
            {user?.name?.charAt(0)}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>{user?.name}</Typography>
            <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>{user?.email}</Typography>
          </Box>
        </Box>
        <TextField select fullWidth label="Rôle" value={role} onChange={e => setRole(e.target.value)} sx={inputSx}>
          {[['user','👤 Utilisateur'],['coach','🏋️ Coach'],['admin','🛡️ Admin']].map(([v,l]) => (
            <MenuItem key={v} value={v}>{l}</MenuItem>
          ))}
        </TextField>
        {/* Preview badge */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Nouveau rôle :</Typography>
          <RoleBadge role={role} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Annuler</Button>
        <Button variant="contained" onClick={() => onSave(role)} sx={{ borderRadius: '11px' }}>Mettre à jour</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function ManageUsers() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [role, setRole]             = useState('');
  const [status, setStatus]         = useState('');
  const [sort, setSort]             = useState('created_at');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected]     = useState([]);
  const [editUser, setEditUser]     = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { page: p, search: search || undefined, role: role || undefined, status: status || undefined, sort, per_page: 15 },
      });
      setUsers(data.data);
      setTotalPages(data.last_page);
      setSelected([]);
    } finally { setLoading(false); }
  }, [search, role, status, sort]);

  useEffect(() => { fetchUsers(page); }, [page, role, status, sort]);

  const handleToggle = async u => {
    try { const { data } = await api.patch(`/admin/users/${u.id}/toggle-status`); enqueueSnackbar(data.message, { variant: 'success' }); fetchUsers(page); }
    catch { enqueueSnackbar('Erreur', { variant: 'error' }); }
  };
  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet utilisateur définitivement ?')) return;
    try { await api.delete(`/admin/users/${id}`); enqueueSnackbar('Utilisateur supprimé', { variant: 'success' }); fetchUsers(page); }
    catch (e) { enqueueSnackbar(e.response?.data?.message || 'Erreur', { variant: 'error' }); }
  };
  const handleRoleSave = async newRole => {
    try { await api.put(`/admin/users/${editUser.id}`, { role: newRole }); enqueueSnackbar('Rôle mis à jour !', { variant: 'success' }); setEditUser(null); fetchUsers(page); }
    catch { enqueueSnackbar('Erreur', { variant: 'error' }); }
  };
  const handleBulk = async action => {
    if (!selected.length) return;
    if (!window.confirm(`Appliquer "${action}" sur ${selected.length} utilisateur(s) ?`)) return;
    setBulkLoading(true);
    try { const { data } = await api.post('/admin/bulk-action', { action, user_ids: selected }); enqueueSnackbar(data.message, { variant: 'success' }); fetchUsers(page); }
    catch { enqueueSnackbar('Erreur', { variant: 'error' }); }
    finally { setBulkLoading(false); }
  };

  const toggleSelect = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll    = () => setSelected(selected.length === users.length ? [] : users.map(u => u.id));

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };
  const thSx = { fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'text.secondary', py: '14px', background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), borderBottom: `1px solid ${muiTheme.palette.divider}` };

  return (
    <AppLayout>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            👥 Gestion utilisateurs
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Gérez tous les comptes de la plateforme</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', p: '16px 20px', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Nom, email…" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers(1)}
            sx={{ flexGrow: 1, minWidth: 200, ...inputSx }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }}
          />
          {[
            { label: 'Rôle',    val: role,   set: v => { setRole(v);   setPage(1); }, opts: [['','Tous'],['user','Utilisateur'],['coach','Coach'],['admin','Admin']] },
            { label: 'Statut',  val: status, set: v => { setStatus(v); setPage(1); }, opts: [['','Tous'],['active','Actif'],['inactive','Suspendu']] },
            { label: 'Trier',   val: sort,   set: v => setSort(v),                   opts: [['created_at','Date inscription'],['name','Nom'],['workouts_count','Séances']] },
          ].map(f => (
            <TextField key={f.label} select size="small" label={f.label} value={f.val}
              onChange={e => f.set(e.target.value)} sx={{ minWidth: 140, ...inputSx }}>
              {f.opts.map(([v,l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
          ))}
          <Button variant="contained" onClick={() => fetchUsers(1)} startIcon={<FilterList />} sx={{ borderRadius: '11px', flexShrink: 0 }}>
            Filtrer
          </Button>
        </Box>
      </Box>

      {/* Bulk action strip */}
      {selected.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, background: alpha(primary, 0.08), border: `1px solid ${alpha(primary, 0.25)}`, borderRadius: '14px', px: '18px', py: '12px', mb: 2.5 }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
            {selected.length} utilisateur(s) sélectionné(s)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Activer',   action: 'activate', color: green },
              { label: 'Suspendre', action: 'suspend',  color: '#FFB547' },
              { label: 'Supprimer', action: 'delete',   color: '#FF5F7E' },
            ].map(({ label, action, color }) => (
              <Button key={action} size="small" onClick={() => handleBulk(action)} disabled={bulkLoading}
                sx={{ borderRadius: '9px', fontSize: '11px', fontWeight: 700, px: 1.5, color, border: `1px solid ${alpha(color, 0.3)}`, background: alpha(color, 0.08), '&:hover': { background: alpha(color, 0.14) } }}>
                {label}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Table */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ ...thSx, pl: '20px' }}>
                  <Checkbox
                    checked={selected.length === users.length && users.length > 0}
                    indeterminate={selected.length > 0 && selected.length < users.length}
                    onChange={toggleAll}
                    size="small"
                    sx={{ color: 'text.disabled', '&.Mui-checked': { color: primary } }}
                  />
                </TableCell>
                {['Utilisateur','Email','Rôle','Statut','Séances','Inscrit le','Actions'].map(h => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><CircularProgress sx={{ color: primary }} /></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <People sx={{ color: primary, fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucun utilisateur trouvé</Typography>
                </TableCell></TableRow>
              ) : users.map(u => {
                const roleColor = (ROLE_STYLE[u.role] || ROLE_STYLE.user).color;
                return (
                  <TableRow key={u.id} selected={selected.includes(u.id)} sx={{
                    transition: 'background 0.15s',
                    background: selected.includes(u.id) ? alpha(primary, isDark ? 0.07 : 0.04) : 'transparent',
                    '&:hover': { background: selected.includes(u.id) ? alpha(primary, 0.08) : isDark ? 'rgba(124,111,255,0.04)' : alpha(primary, 0.03) },
                    '& td': { borderColor: muiTheme.palette.divider },
                    '&:last-child td': { border: 'none' },
                  }}>
                    <TableCell padding="checkbox" sx={{ pl: '20px' }}>
                      <Checkbox checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} size="small" sx={{ color: 'text.disabled', '&.Mui-checked': { color: primary } }} />
                    </TableCell>
                    <TableCell sx={{ py: '14px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '11px', background: alpha(roleColor, 0.15), border: `1px solid ${alpha(roleColor, 0.28)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '13px', color: roleColor, flexShrink: 0 }}>
                          {u.name?.charAt(0)}
                        </Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary' }}>{u.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{u.email}</Typography></TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell><StatusBadge active={u.is_active} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'inline-block', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.22)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif' }}>{u.workouts_count ?? 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                        {new Date(u.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[
                          { tip: 'Voir profil',      icon: <Visibility sx={{ fontSize: 13 }} />,    color: isDark ? '#8888AA' : '#888899', borderColor: muiTheme.palette.divider, fn: () => setViewUserId(u.id) },
                          { tip: 'Modifier rôle',    icon: <Edit sx={{ fontSize: 13 }} />,          color: primary,          borderColor: alpha(primary, 0.3),       fn: () => setEditUser(u) },
                          { tip: u.is_active ? 'Suspendre' : 'Activer',
                            icon: u.is_active ? <Block sx={{ fontSize: 13 }} /> : <CheckCircle sx={{ fontSize: 13 }} />,
                            color: u.is_active ? '#FFB547' : green,
                            borderColor: alpha(u.is_active ? '#FFB547' : green, 0.3),
                            fn: () => handleToggle(u) },
                          { tip: 'Supprimer',        icon: <Delete sx={{ fontSize: 13 }} />,        color: '#FF5F7E',         borderColor: alpha('#FF5F7E', 0.3),     fn: () => handleDelete(u.id), disabled: u.role === 'admin' },
                        ].map(({ tip, icon, color, borderColor, fn, disabled }, i) => (
                          <Tooltip title={tip} key={i}>
                            <span>
                              <IconButton size="small" onClick={fn} disabled={disabled} sx={{ width: 30, height: 30, border: `1px solid ${borderColor}`, borderRadius: '9px', color, '&:hover': { background: alpha(color, 0.08) }, '&.Mui-disabled': { opacity: 0.3 } }}>
                                {icon}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <UserDetailDialog userId={viewUserId} open={!!viewUserId} onClose={() => setViewUserId(null)} />
      <EditRoleDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSave={handleRoleSave} />
    </AppLayout>
  );
}