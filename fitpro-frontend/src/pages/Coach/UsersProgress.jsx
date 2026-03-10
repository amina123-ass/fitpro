import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, CircularProgress, Collapse,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { ExpandMore, ExpandLess, FitnessCenter, TrendingUp, People } from '@mui/icons-material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Mini stat tile ─────────────────────────────────────────── */
function MiniTile({ label, value, icon, color }) {
  const muiTheme = useMuiTheme();
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '14px', p: '14px 16px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ position: 'absolute', bottom: -12, right: -12, width: 60, height: 60, borderRadius: '50%', background: alpha(color, 0.08), filter: 'blur(16px)', pointerEvents: 'none' }} />
      <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color, '& svg': { fontSize: 16 } }}>
        {icon}
      </Box>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '18px', color, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
    </Box>
  );
}

export default function UsersProgress() {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;
  const green   = '#2EE89A';

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [progress, setProgress] = useState({});
  const [loadingUser, setLoadingUser] = useState(null);

  useEffect(() => {
    api.get('/coach/users')
      .then(r => setUsers(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const loadProgress = async userId => {
    if (expanded === userId) { setExpanded(null); return; }
    if (progress[userId]) { setExpanded(userId); return; }
    setLoadingUser(userId);
    try {
      const { data } = await api.get(`/coach/users/${userId}/progress`);
      setProgress(p => ({ ...p, [userId]: data }));
      setExpanded(userId);
    } catch {}
    finally { setLoadingUser(null); }
  };

  if (loading) return (
    <AppLayout>
      <Box display="flex" justifyContent="center" alignItems="center" py={10} flexDirection="column" gap={2}>
        <CircularProgress sx={{ color: primary }} />
        <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Chargement…</Typography>
      </Box>
    </AppLayout>
  );

  return (
    <AppLayout>
      {/* Header */}
      <Box mb={4}>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
          Progrès des utilisateurs 📊
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
          Suivez les progrès de vos utilisateurs assignés
        </Typography>
      </Box>

      {!users.length ? (
        <Box sx={{
          background: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: '20px', textAlign: 'center', py: 8,
        }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '18px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <People sx={{ color: primary, fontSize: 28 }} />
          </Box>
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Aucun utilisateur assigné pour le moment.
          </Typography>
        </Box>
      ) : (
        <Box sx={{
          background: muiTheme.palette.background.paper,
          border: `1px solid ${muiTheme.palette.divider}`,
          borderRadius: '20px', overflow: 'hidden', position: 'relative',
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />

          {users.map((u, idx) => (
            <Box key={u.id}>
              {/* User row */}
              <Box
                onClick={() => loadProgress(u.id)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, px: '24px', py: '18px', cursor: 'pointer',
                  borderBottom: `1px solid ${muiTheme.palette.divider}`,
                  transition: 'background 0.2s',
                  background: expanded === u.id
                    ? isDark ? 'rgba(124,111,255,0.06)' : 'rgba(108,95,232,0.04)'
                    : 'transparent',
                  '&:hover': { background: isDark ? 'rgba(124,111,255,0.06)' : 'rgba(108,95,232,0.04)' },
                }}>
                {/* Avatar */}
                <Box sx={{
                  width: 44, height: 44, borderRadius: '13px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${alpha(primary, 0.3)}, ${alpha(accent, 0.2)})`,
                  border: `1px solid ${alpha(primary, 0.25)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: primary,
                }}>
                  {u.name?.charAt(0)}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary' }} noWrap>
                    {u.name}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }} noWrap>
                    {u.email}
                  </Typography>
                </Box>

                {/* Progress button */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    background: expanded === u.id ? alpha(primary, 0.12) : 'transparent',
                    border: `1px solid ${expanded === u.id ? alpha(primary, 0.35) : muiTheme.palette.divider}`,
                    borderRadius: '10px', px: 1.5, py: 0.75, transition: 'all 0.2s',
                    '&:hover': { borderColor: alpha(primary, 0.3) },
                  }}>
                  {loadingUser === u.id
                    ? <CircularProgress size={13} sx={{ color: primary }} />
                    : <TrendingUp sx={{ fontSize: 14, color: expanded === u.id ? primary : 'text.secondary' }} />
                  }
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: expanded === u.id ? primary : 'text.secondary', fontFamily: '"Syne", sans-serif' }}>
                    Progrès
                  </Typography>
                  {expanded === u.id ? <ExpandLess sx={{ fontSize: 14, color: primary }} /> : <ExpandMore sx={{ fontSize: 14, color: 'text.secondary' }} />}
                </Box>
              </Box>

              {/* Expandable detail */}
              <Collapse in={expanded === u.id}>
                {progress[u.id] && (
                  <Box sx={{
                    px: '24px', py: '20px',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(108,95,232,0.03)',
                    borderBottom: `1px solid ${muiTheme.palette.divider}`,
                  }}>
                    {/* Stat mini tiles */}
                    <Grid container spacing={1.5} mb={3}>
                      <Grid item xs={12} sm={4}>
                        <MiniTile label="Total Workouts" value={progress[u.id].stats.total_workouts} icon={<FitnessCenter />} color={primary} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MiniTile label="Calories brûlées" value={`${progress[u.id].stats.total_calories} kcal`} icon={<WhatshotIcon />} color={accent} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <MiniTile label="Cette semaine" value={`${progress[u.id].stats.week_workouts} séances`} icon={<TrendingUp />} color={green} />
                      </Grid>
                    </Grid>

                    {/* Recent workouts */}
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', color: 'text.primary', mb: 1.5, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '11px' }}>
                      Séances récentes
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {progress[u.id].workouts?.slice(0, 5).map(w => (
                        <Box key={w.id} sx={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          py: 1.25, px: 1.5, borderRadius: '10px',
                          background: isDark ? 'rgba(255,255,255,0.03)' : alpha(primary, 0.04),
                          border: `1px solid ${muiTheme.palette.divider}`,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: alpha(primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FitnessCenter sx={{ fontSize: 14, color: primary }} />
                            </Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary' }}>
                              {w.exercise?.name}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                            {w.workout_date} · {w.duration}min · {w.calories_burned}kcal
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Collapse>
            </Box>
          ))}
        </Box>
      )}
    </AppLayout>
  );
}