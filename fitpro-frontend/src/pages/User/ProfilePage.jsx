import React, { useState } from 'react';
import { Box, Grid, Typography, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Save, Person, FitnessCenter } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';
import { useSnackbar } from 'notistack';

const GOALS = [
  { value: 'weight_loss',     emoji: '🔥', label: 'Perte de poids',  full: '🔥 Perte de poids'  },
  { value: 'muscle_gain',     emoji: '💪', label: 'Prise de muscle', full: '💪 Prise de muscle' },
  { value: 'endurance',       emoji: '🏃', label: 'Endurance',       full: '🏃 Endurance'       },
  { value: 'flexibility',     emoji: '🧘', label: 'Flexibilité',     full: '🧘 Flexibilité'     },
  { value: 'general_fitness', emoji: '⚡', label: 'Forme générale',  full: '⚡ Forme générale'  },
];

const ROLE_STYLES = {
  admin: { color: '#FF5F7E', label: 'Admin',  emoji: '👑' },
  coach: { color: '#2EE89A', label: 'Coach',  emoji: '🎯' },
  user:  { color: '#7C6FFF', label: 'Membre', emoji: '💪' },
};

function FCard({ children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  return (
    <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative', transition: 'background 0.3s', ...sx }}>
      <Box sx={{ position: 'absolute', top: 0, left: 28, right: 28, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.5)},transparent)` }} />
      {children}
    </Box>
  );
}

function StatTile({ label, value, color }) {
  const { isDark } = useFitTheme();
  return (
    <Box sx={{ flex: 1, textAlign: 'center', p: '12px 8px', background: alpha(color, isDark ? 0.1 : 0.07), border: `1px solid ${alpha(color, 0.22)}`, borderRadius: '14px' }}>
      <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '17px', color, lineHeight: 1.1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.3 }}>{label}</Typography>
    </Box>
  );
}

function InfoRow({ label, value }) {
  const muiTheme = useMuiTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: `1px solid ${muiTheme.palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
      <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'text.primary', fontFamily: '"Syne",sans-serif' }}>{value}</Typography>
    </Box>
  );
}

export default function ProfilePage() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar }  = useSnackbar();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';
  const gold    = '#FFB547';

  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.user;

  const [form, setForm] = useState({
    name:         user?.name         || '',
    age:          user?.age          || '',
    weight:       user?.weight       || '',
    height:       user?.height       || '',
    fitness_goal: user?.fitness_goal || '',
  });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/profile', form);
      updateUser(data.user);
      enqueueSnackbar('Profil mis à jour ! ✨', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erreur lors de la mise à jour', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const bmi = form.weight && form.height
    ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
    : null;
  const bmiColor = !bmi ? primary : bmi < 18.5 ? '#5CE1E6' : bmi < 25 ? green : bmi < 30 ? gold : '#FF5F7E';
  const bmiLabel = !bmi ? '' : bmi < 18.5 ? 'Insuffisance pondérale' : bmi < 25 ? 'Poids normal ✓' : bmi < 30 ? 'Surpoids' : 'Obésité';

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      {/* Header */}
      <Box mb={4}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.25)}`, borderRadius: '100px', px: 1.5, py: 0.4, mb: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: primary }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif' }}>Mon compte</Typography>
        </Box>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
          Mon Profil 👤
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Gérez vos informations personnelles et vos objectifs fitness</Typography>
      </Box>

      <Grid container spacing={3}>

        {/* ── Carte identité ───────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <FCard>
            {/* Bannière */}
            <Box sx={{ height: 96, position: 'relative', background: `linear-gradient(135deg,${alpha(primary, 0.32)},${alpha(accent, 0.22)})`, overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', border: `1px solid ${alpha(primary, 0.2)}` }} />
              <Box sx={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', border: `1px solid ${alpha(accent, 0.2)}` }} />
              <Box sx={{ position: 'absolute', top: 20, left: '40%', width: 50, height: 50, borderRadius: '50%', border: `1px solid ${alpha(green, 0.15)}` }} />
            </Box>

            <Box sx={{ px: '24px', pb: '24px', mt: '-38px', position: 'relative' }}>
              {/* Avatar + badge rôle */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ width: 76, height: 76, borderRadius: '22px', background: `linear-gradient(135deg,${primary},${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '28px', color: '#fff', boxShadow: `0 8px 28px ${alpha(primary, 0.5)}`, border: `3px solid ${muiTheme.palette.background.paper}` }}>
                    {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Box>
                  <Box sx={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: roleStyle.color, border: `2px solid ${muiTheme.palette.background.paper}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                    {roleStyle.emoji}
                  </Box>
                </Box>
                <Box sx={{ background: alpha(roleStyle.color, 0.12), border: `1px solid ${alpha(roleStyle.color, 0.28)}`, borderRadius: '100px', px: 1.5, py: 0.5 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, color: roleStyle.color, fontFamily: '"Syne",sans-serif', letterSpacing: '0.5px' }}>{roleStyle.label}</Typography>
                </Box>
              </Box>

              <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '17px', color: 'text.primary', mb: 0.3 }}>{user?.name ?? '—'}</Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary', mb: 2 }}>{user?.email ?? '—'}</Typography>

              {/* Objectif pill */}
              {user?.fitness_goal && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 2.5, background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.22)}`, borderRadius: '100px', px: 1.5, py: 0.5 }}>
                  <FitnessCenter sx={{ fontSize: 12, color: primary }} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif' }}>
                    {GOALS.find(g => g.value === user.fitness_goal)?.label ?? user.fitness_goal.replace(/_/g,' ')}
                  </Typography>
                </Box>
              )}

              {/* Stats tiles row */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                <StatTile label="Âge"    value={user?.age    ? `${user.age} ans`  : '—'} color={primary} />
                <StatTile label="Poids"  value={user?.weight ? `${user.weight} kg` : '—'} color={accent} />
                <StatTile label="Taille" value={user?.height ? `${user.height} cm` : '—'} color={green} />
              </Box>

              {/* IMC */}
              {bmi && (
                <Box sx={{ p: '12px 16px', background: alpha(bmiColor, isDark ? 0.1 : 0.07), border: `1px solid ${alpha(bmiColor, 0.25)}`, borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'text.secondary', fontFamily: '"Syne",sans-serif', mb: 0.2 }}>IMC</Typography>
                    <Typography sx={{ fontSize: '11px', color: bmiColor, fontWeight: 600 }}>{bmiLabel}</Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: '24px', color: bmiColor, letterSpacing: '-0.5px' }}>{bmi}</Typography>
                </Box>
              )}

              {/* Info supplémentaires */}
              {(user?.phone || user?.created_at) && (
                <Box sx={{ mt: 2, background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.03), border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '14px', px: '14px', py: '2px' }}>
                  {user?.phone && <InfoRow label="Téléphone" value={user.phone} />}
                  {user?.created_at && (
                    <InfoRow label="Membre depuis" value={new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} />
                  )}
                </Box>
              )}
            </Box>
          </FCard>
        </Grid>

        {/* ── Formulaire d'édition ─────────────────────────── */}
        <Grid item xs={12} md={8}>
          <FCard>
            <Box sx={{ p: '28px' }}>
              {/* En-tête section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '11px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Person sx={{ fontSize: 20, color: primary }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '16px', color: 'text.primary', lineHeight: 1.2 }}>Modifier mon profil</Typography>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Informations personnelles et données physiques</Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {/* Nom */}
                <Grid item xs={12}>
                  <TextField fullWidth label="Nom complet" value={form.name} onChange={set('name')} sx={inputSx}
                    InputProps={{ startAdornment: <Person sx={{ fontSize: 17, color: 'text.disabled', mr: 1 }} /> }} />
                </Grid>

                {/* Données physiques */}
                {[
                  { label: 'Âge',    key: 'age',    unit: 'ans', min: 10, max: 120 },
                  { label: 'Poids',  key: 'weight', unit: 'kg',  step: 0.1 },
                  { label: 'Taille', key: 'height', unit: 'cm' },
                ].map(f => (
                  <Grid item xs={12} sm={4} key={f.key}>
                    <TextField fullWidth label={`${f.label} (${f.unit})`} type="number"
                      value={form[f.key]} onChange={set(f.key)}
                      inputProps={{ min: f.min, max: f.max, step: f.step }}
                      sx={inputSx} />
                  </Grid>
                ))}

                {/* Objectif select */}
                <Grid item xs={12}>
                  <TextField select fullWidth label="Objectif fitness" value={form.fitness_goal} onChange={set('fitness_goal')} sx={inputSx}>
                    {GOALS.map(g => <MenuItem key={g.value} value={g.value}>{g.full}</MenuItem>)}
                  </TextField>
                </Grid>

                {/* Sélection visuelle objectif */}
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1.5, fontFamily: '"Syne",sans-serif' }}>
                    Choisir visuellement
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                    {GOALS.map(g => {
                      const active = form.fitness_goal === g.value;
                      return (
                        <Box key={g.value} onClick={() => setForm(p => ({ ...p, fitness_goal: g.value }))} sx={{
                          textAlign: 'center', p: '12px 6px', borderRadius: '14px', cursor: 'pointer',
                          background: active ? alpha(primary, 0.12) : isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.04),
                          border: `1px solid ${active ? alpha(primary, 0.42) : muiTheme.palette.divider}`,
                          boxShadow: active ? `0 4px 16px ${alpha(primary, 0.22)}` : 'none',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: alpha(primary, 0.3), transform: 'translateY(-2px)' },
                        }}>
                          <Typography sx={{ fontSize: '20px', mb: 0.5 }}>{g.emoji}</Typography>
                          <Typography sx={{ fontSize: '9px', fontWeight: 700, color: active ? primary : 'text.disabled', fontFamily: '"Syne",sans-serif', lineHeight: 1.2 }}>
                            {g.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Grid>

                {/* Bouton enregistrer */}
                <Grid item xs={12}>
                  <Box sx={{ pt: 2, borderTop: `1px solid ${muiTheme.palette.divider}`, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="large"
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      onClick={handleSave} disabled={loading}
                      sx={{ borderRadius: '12px', px: 4, py: 1.25, fontSize: '14px', fontFamily: '"Syne",sans-serif', fontWeight: 700 }}>
                      {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </FCard>
        </Grid>

      </Grid>
    </AppLayout>
  );
}