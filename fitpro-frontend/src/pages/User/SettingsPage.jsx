import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress,
  Stack, InputAdornment, IconButton,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Lock, Visibility, VisibilityOff, Logout, Shield, Palette, Warning } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

/* ─── Section card ───────────────────────────────────────── */
function Section({ title, subtitle, icon, accentColor, children }) {
  const muiTheme = useMuiTheme();
  const primary  = muiTheme.palette.primary.main;
  const lineColor = accentColor || primary;
  return (
    <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '20px', overflow: 'hidden', position: 'relative', transition: 'background 0.3s' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 28, right: 28, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(lineColor, 0.6)},transparent)` }} />
      <Box sx={{ p: '28px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: subtitle ? 0.25 : 3 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '11px', background: alpha(lineColor, 0.1), border: `1px solid ${alpha(lineColor, 0.22)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: lineColor, '& svg': { fontSize: 20 } }}>
            {icon}
          </Box>
          <Box>
            <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: '16px', color: 'text.primary', lineHeight: 1.2 }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{subtitle}</Typography>}
          </Box>
        </Box>
        {subtitle && <Box sx={{ mb: 3 }} />}
        {children}
      </Box>
    </Box>
  );
}

/* ─── Password strength meter ────────────────────────────── */
function StrengthMeter({ password }) {
  const muiTheme = useMuiTheme();
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const colors = ['#FF5F7E', '#FF5F7E', '#FFB547', '#2EE89A', '#2EE89A'];
  const labels = ['', 'Faible', 'Passable', 'Bon', 'Fort'];

  return (
    <Box sx={{ mt: 1.25 }}>
      <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75 }}>
        {[0,1,2,3].map(i => (
          <Box key={i} sx={{ flex: 1, height: 4, borderRadius: '100px', background: i < score ? colors[score] : muiTheme.palette.divider, transition: 'background 0.3s' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: colors[score], fontFamily: '"Syne",sans-serif' }}>
          {labels[score]}
        </Typography>
        <Typography sx={{ fontSize: '10px', color: 'text.disabled' }}>
          {checks.filter(Boolean).length}/4 critères
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Criteria chip ──────────────────────────────────────── */
function PasswordCriteria({ password }) {
  if (!password) return null;
  const items = [
    { label: '8+ caractères', ok: password.length >= 8 },
    { label: 'Majuscule',     ok: /[A-Z]/.test(password) },
    { label: 'Chiffre',       ok: /[0-9]/.test(password) },
    { label: 'Symbole',       ok: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.25 }}>
      {items.map(({ label, ok }) => (
        <Box key={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, background: ok ? alpha('#2EE89A', 0.1) : alpha('#FF5F7E', 0.08), border: `1px solid ${ok ? alpha('#2EE89A', 0.25) : alpha('#FF5F7E', 0.2)}`, borderRadius: '100px', px: 1, py: 0.25 }}>
          <Typography sx={{ fontSize: '9px', fontWeight: 700, color: ok ? '#2EE89A' : '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>
            {ok ? '✓' : '✗'} {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function SettingsPage() {
  const muiTheme = useMuiTheme();
  const { isDark, toggle } = useFitTheme();
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';

  const [form, setForm]   = useState({ current_password: '', password: '', password_confirmation: '' });
  const [show, setShow]   = useState({ cur: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleChangePassword = async e => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      enqueueSnackbar('Les mots de passe ne correspondent pas', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/profile/password', form);
      enqueueSnackbar('Mot de passe mis à jour ! 🔐', { variant: 'success' });
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Erreur lors de la mise à jour', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  const eyeAdornment = key => (
    <InputAdornment position="end">
      <IconButton size="small" onClick={() => setShow(p => ({ ...p, [key]: !p[key] }))} sx={{ color: 'text.secondary' }}>
        {show[key] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  const passwordsMatch = form.password && form.password_confirmation && form.password === form.password_confirmation;
  const passwordsMismatch = form.password_confirmation && form.password !== form.password_confirmation;

  return (
    <AppLayout>
      {/* Header */}
      <Box mb={4}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.25)}`, borderRadius: '100px', px: 1.5, py: 0.4, mb: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: primary }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: primary, fontFamily: '"Syne",sans-serif' }}>Paramètres</Typography>
        </Box>
        <Typography sx={{ fontFamily: '"Syne",sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
          Paramètres ⚙️
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>Sécurité, apparence et gestion de votre compte</Typography>
      </Box>

      <Stack spacing={3} maxWidth={640}>

        {/* ── Changer le mot de passe ───────────────────────── */}
        <Section title="Changer le mot de passe" subtitle="Modifiez votre mot de passe de connexion" icon={<Shield />} accentColor={primary}>
          <Box component="form" onSubmit={handleChangePassword}>
            <Stack spacing={2.5}>

              {/* Mot de passe actuel */}
              <TextField label="Mot de passe actuel" required fullWidth
                type={show.cur ? 'text' : 'password'}
                value={form.current_password} onChange={set('current_password')} sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment>,
                  endAdornment: eyeAdornment('cur'),
                }}
              />

              {/* Nouveau mot de passe */}
              <Box>
                <TextField label="Nouveau mot de passe" required fullWidth
                  type={show.new ? 'text' : 'password'}
                  value={form.password} onChange={set('password')} sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment>,
                    endAdornment: eyeAdornment('new'),
                  }}
                />
                <StrengthMeter password={form.password} />
                <PasswordCriteria password={form.password} />
              </Box>

              {/* Confirmation */}
              <Box>
                <TextField label="Confirmer le nouveau mot de passe" required fullWidth
                  type={show.confirm ? 'text' : 'password'}
                  value={form.password_confirmation} onChange={set('password_confirmation')} sx={inputSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ fontSize: 17, color: 'text.disabled' }} /></InputAdornment>,
                    endAdornment: eyeAdornment('confirm'),
                  }}
                />
                {(passwordsMatch || passwordsMismatch) && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1, background: passwordsMatch ? alpha(green, 0.1) : alpha('#FF5F7E', 0.08), border: `1px solid ${passwordsMatch ? alpha(green, 0.25) : alpha('#FF5F7E', 0.2)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: passwordsMatch ? green : '#FF5F7E', fontFamily: '"Syne",sans-serif' }}>
                      {passwordsMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ pt: 0.5 }}>
                <Button type="submit" variant="contained" size="large" disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Lock />}
                  sx={{ borderRadius: '12px', px: 4, fontFamily: '"Syne",sans-serif', fontWeight: 700 }}>
                  {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Section>

        {/* ── Apparence ─────────────────────────────────────── */}
        <Section title="Apparence" subtitle="Choisissez votre thème d'affichage" icon={<Palette />} accentColor={accent}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '16px 20px', borderRadius: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.04), border: `1px solid ${muiTheme.palette.divider}` }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'text.primary', mb: 0.3 }}>
                {isDark ? '🌙 Mode sombre' : '☀️ Mode clair'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                {isDark ? 'Basculer vers une interface plus claire' : 'Basculer vers une interface plus sombre'}
              </Typography>
            </Box>
            {/* Toggle pill */}
            <Box onClick={toggle} sx={{ width: 52, height: 28, borderRadius: '100px', cursor: 'pointer', position: 'relative', flexShrink: 0, background: `linear-gradient(135deg,${primary},${accent})`, boxShadow: `0 2px 12px ${alpha(primary, 0.5)}`, transition: 'all 0.3s', '&:hover': { boxShadow: `0 4px 18px ${alpha(primary, 0.55)}` } }}>
              <Box sx={{ position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', left: isDark ? 'calc(100% - 24px)' : '4px', transition: 'left 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', boxShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
                {isDark ? '🌙' : '☀️'}
              </Box>
            </Box>
          </Box>

          {/* Thème preview tiles */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            {[
              { label: 'Sombre', active: isDark,  bg: '#0A0A0F', card: '#111118', dots: ['#7C6FFF','#FF5F7E','#2EE89A'] },
              { label: 'Clair',  active: !isDark, bg: '#F0EFFE', card: '#FFFFFF', dots: ['#6C5FE8','#F0405E','#18C97A'] },
            ].map(t => (
              <Box key={t.label} onClick={isDark !== t.active ? undefined : toggle} sx={{ flex: 1, p: '12px', borderRadius: '14px', cursor: isDark !== t.active ? 'default' : 'pointer', background: t.active ? alpha(primary, isDark ? 0.1 : 0.08) : 'transparent', border: `1px solid ${t.active ? alpha(primary, 0.4) : muiTheme.palette.divider}`, transition: 'all 0.2s', '&:hover': { borderColor: alpha(primary, 0.3) } }}>
                <Box sx={{ width: '100%', height: 52, borderRadius: '10px', background: t.bg, mb: 1.25, p: '8px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ height: 8, borderRadius: '4px', background: t.card, width: '70%' }} />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {t.dots.map((c, i) => <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: t.active ? primary : 'text.secondary', fontFamily: '"Syne",sans-serif' }}>{t.label}</Typography>
                  {t.active && <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: primary }} />}
                </Box>
              </Box>
            ))}
          </Box>
        </Section>

        {/* ── Session ───────────────────────────────────────── */}
        <Section title="Session" subtitle="Gérez votre connexion à FitPro" icon={<Logout />} accentColor="#FF5F7E">
          <Typography sx={{ fontSize: '14px', color: 'text.secondary', mb: 2.5, lineHeight: 1.65 }}>
            Déconnectez-vous de votre compte FitPro sur cet appareil. Vous devrez vous reconnecter pour accéder à vos données.
          </Typography>

          <Button variant="outlined" size="large" startIcon={<Logout />} onClick={handleLogout}
            sx={{ borderRadius: '12px', px: 3, borderColor: alpha('#FF5F7E', 0.45), color: '#FF5F7E', fontFamily: '"Syne",sans-serif', fontWeight: 700, '&:hover': { borderColor: '#FF5F7E', background: alpha('#FF5F7E', 0.08) } }}>
            Se déconnecter
          </Button>

          {/* Zone danger */}
          <Box sx={{ mt: 3, p: '16px 18px', borderRadius: '14px', background: alpha('#FF5F7E', 0.05), border: `1px solid ${alpha('#FF5F7E', 0.18)}`, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: alpha('#FF5F7E', 0.12), border: `1px solid ${alpha('#FF5F7E', 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Warning sx={{ fontSize: 17, color: '#FF5F7E' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 800, color: '#FF5F7E', fontFamily: '"Syne",sans-serif', mb: 0.3 }}>
                Zone de danger
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.55 }}>
                La suppression du compte et l'export de vos données seront disponibles prochainement.
              </Typography>
            </Box>
          </Box>
        </Section>

      </Stack>
    </AppLayout>
  );
}