import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Typography, Button, TextField, MenuItem,
  Chip, CircularProgress, InputAdornment, Pagination,
  Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, LinearProgress, Avatar, Tooltip, Alert,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import {
  Search, ExpandMore, MenuBook, CheckCircle, AccessTime,
  FitnessCenter, Close, BookmarkAdd, BookmarkRemove,
  EmojiEvents, People, Star, FilterList, ViewModule, ViewList,
} from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

/* ─── Constants ──────────────────────────────────────────────── */
const diffColors = {
  beginner:     { bg: alpha('#2EE89A', 0.12), border: alpha('#2EE89A', 0.25), color: '#2EE89A' },
  intermediate: { bg: alpha('#FFB547', 0.12), border: alpha('#FFB547', 0.25), color: '#FFB547' },
  advanced:     { bg: alpha('#FF5F7E', 0.12), border: alpha('#FF5F7E', 0.25), color: '#FF5F7E' },
};

const GRADIENTS = [
  ['#7C6FFF', '#FF5F7E'],
  ['#2EE89A', '#00B4D8'],
  ['#FFB547', '#FF5F7E'],
  ['#5CE1E6', '#7C6FFF'],
  ['#FF5F7E', '#FFB547'],
  ['#2EE89A', '#7C6FFF'],
];

const GOALS = ['', 'weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'];
const STATUS_META = {
  active:    { label: 'Active',    color: '#2EE89A' },
  completed: { label: 'Completed', color: '#7C6FFF' },
  cancelled: { label: 'Cancelled', color: '#FF5F7E' },
};

/* ─── Program card ───────────────────────────────────────────── */
function ProgramCard({ p, index, onFollow, onDetail, isFollowing, onUnfollow, viewMode }) {
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();
  const [g1, g2]   = GRADIENTS[index % GRADIENTS.length];
  const diff        = diffColors[p.difficulty] || diffColors.beginner;
  const isList      = viewMode === 'list';

  if (isList) {
    return (
      <Box sx={{
        background: muiTheme.palette.background.paper,
        border: `1px solid ${muiTheme.palette.divider}`,
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 2,
        p: '16px 20px',
        transition: 'all 0.2s',
        '&:hover': { borderColor: alpha(g1, 0.35), transform: 'translateX(4px)' },
      }}>
        <Box sx={{ width: 6, alignSelf: 'stretch', borderRadius: '100px', background: `linear-gradient(180deg, ${g1}, ${g2})`, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '15px', color: 'text.primary' }} noWrap>
              {p.name}
            </Typography>
            <Box sx={{ background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1, py: 0.2 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color }}>{p.difficulty}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '12px', color: 'text.secondary' }} noWrap>{p.description}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '16px', color: g1 }}>{p.duration_weeks}</Typography>
            <Typography sx={{ fontSize: '10px', color: 'text.disabled' }}>weeks</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => onDetail(p)}
              sx={{ borderRadius: '9px', fontSize: '12px', height: 32, borderColor: alpha(g1, 0.4), color: g1, '&:hover': { background: alpha(g1, 0.08) } }}>
              View
            </Button>
            {isFollowing ? (
              <Button size="small" variant="outlined" color="error" onClick={() => onUnfollow(p.id)}
                sx={{ borderRadius: '9px', fontSize: '12px', height: 32 }}>
                Unfollow
              </Button>
            ) : (
              <Button size="small" variant="contained" onClick={() => onFollow(p.id)}
                sx={{ borderRadius: '9px', fontSize: '12px', height: 32, background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
                Follow
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        borderColor: alpha(g1, 0.35),
        boxShadow: isDark ? '0 20px 48px rgba(0,0,0,0.45)' : `0 12px 40px ${alpha(g1, 0.18)}`,
      },
    }}>
      <Box sx={{ height: 6, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      <Box sx={{ p: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badges row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1.5, py: 0.4 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color, fontFamily: '"Syne", sans-serif' }}>
                {p.difficulty}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {p.followers_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <People sx={{ fontSize: 12, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: '10px', color: 'text.disabled' }}>{p.followers_count}</Typography>
              </Box>
            )}
            <Box sx={{
              background: alpha('#7C6FFF', 0.1), border: `1px solid ${alpha('#7C6FFF', 0.2)}`,
              borderRadius: '100px', px: 1.5, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5,
            }}>
              <AccessTime sx={{ fontSize: 11, color: '#7C6FFF' }} />
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#7C6FFF', fontFamily: '"Syne", sans-serif' }}>
                {p.duration_weeks}w
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Title + description */}
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '17px', color: 'text.primary', mb: 0.75 }}>
          {p.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.65, mb: 2, flex: 1 }}>
          {p.description || 'No description available.'}
        </Typography>

        {/* Goal */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 2.5,
          background: alpha(g1, 0.1), border: `1px solid ${alpha(g1, 0.2)}`,
          borderRadius: '100px', px: 1.5, py: 0.5, alignSelf: 'flex-start',
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: g1, fontFamily: '"Syne", sans-serif', textTransform: 'capitalize' }}>
            🎯 {p.goal?.replace(/_/g, ' ')}
          </Typography>
        </Box>

        {/* Days accordion — first 2 only */}
        {p.days?.slice(0, 2).map(day => (
          <Accordion key={day.id} disableGutters elevation={0} sx={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(108,95,232,0.04)',
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: '12px !important', mb: 1,
            '&::before': { display: 'none' },
            '&.Mui-expanded': { borderColor: alpha(g1, 0.3) },
          }}>
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />}
              sx={{ minHeight: 42, px: 2, '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '12px', fontFamily: '"Syne", sans-serif', fontWeight: 700, color: 'text.primary' }}>
                Day {day.day_number}{day.title ? `: ${day.title}` : ''}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
              {(day.exercises ?? []).map((ex, i) => (
                <Box key={ex.id ?? i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <CheckCircle sx={{ fontSize: 13, color: '#2EE89A' }} />
                  <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {ex.name ?? ex.exercise?.name ?? '—'} — {ex.sets ?? ex.duration ?? '—'} {ex.sets ? 'sets' : 'min'}
                  </Typography>
                </Box>
              ))}
              {(!day.exercises || day.exercises.length === 0) && (
                <Typography sx={{ fontSize: '12px', color: 'text.disabled', fontStyle: 'italic' }}>No exercises listed</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {p.days?.length > 2 && (
          <Typography sx={{ fontSize: '11px', color: 'text.disabled', mb: 1.5, pl: 0.5 }}>
            +{p.days.length - 2} more days
          </Typography>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => onDetail(p)}
            sx={{
              borderRadius: '12px', py: '9px', fontSize: '13px',
              borderColor: alpha(g1, 0.4), color: g1,
              '&:hover': { background: alpha(g1, 0.06), borderColor: g1 },
            }}>
            Details
          </Button>
          {isFollowing ? (
            <Button fullWidth variant="outlined" color="error" startIcon={<BookmarkRemove />}
              onClick={() => onUnfollow(p.id)}
              sx={{ borderRadius: '12px', py: '9px', fontSize: '13px' }}>
              Unfollow
            </Button>
          ) : (
            <Button fullWidth variant="contained" startIcon={<BookmarkAdd />}
              onClick={() => onFollow(p.id)}
              sx={{
                borderRadius: '12px', py: '9px', fontSize: '13px',
                background: `linear-gradient(135deg, ${g1}, ${g2})`,
                '&:hover': { background: `linear-gradient(135deg, ${g1}, ${g2})`, opacity: 0.9 },
              }}>
              Follow
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* ─── My program card ────────────────────────────────────────── */
function MyProgramCard({ up, index, onComplete, onUnfollow }) {
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();
  const [g1, g2]   = GRADIENTS[index % GRADIENTS.length];
  const p           = up.program;
  const status      = STATUS_META[up.status] ?? STATUS_META.active;
  const diff        = diffColors[p?.difficulty] || diffColors.beginner;

  const startDate  = up.start_date ? new Date(up.start_date) : null;
  const totalDays  = (p?.duration_weeks ?? 0) * 7;
  const daysPassed = startDate ? Math.min(Math.ceil((Date.now() - startDate) / 86400000), totalDays) : 0;
  const pct        = totalDays > 0 ? Math.round((daysPassed / totalDays) * 100) : 0;

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${alpha(g1, up.status === 'active' ? 0.25 : 0.1)}`,
      borderRadius: '20px', overflow: 'hidden',
      transition: 'all 0.2s',
      opacity: up.status !== 'active' ? 0.7 : 1,
    }}>
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />
      <Box sx={{ p: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '15px', color: 'text.primary' }} noWrap>
              {p?.name ?? '—'}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
              Started {up.start_date ?? '—'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
            <Box sx={{ background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: diff.color }}>{p?.difficulty}</Typography>
            </Box>
            <Box sx={{ background: alpha(status.color, 0.1), border: `1px solid ${alpha(status.color, 0.25)}`, borderRadius: '100px', px: 1.25, py: 0.3 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: status.color }}>{status.label}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress bar */}
        {up.status === 'active' && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Progress</Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: g1, fontFamily: '"Syne", sans-serif' }}>{pct}%</Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: '100px', background: alpha(g1, 0.12), overflow: 'hidden' }}>
              <Box sx={{
                height: '100%', width: `${pct}%`, borderRadius: '100px',
                background: `linear-gradient(90deg, ${g1}, ${g2})`,
                transition: 'width 0.8s ease',
              }} />
            </Box>
            <Typography sx={{ fontSize: '11px', color: 'text.disabled', mt: 0.75 }}>
              {daysPassed} / {totalDays} days · {p?.duration_weeks}w program
            </Typography>
          </Box>
        )}

        {up.status === 'active' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={() => onComplete(up.program_id)}
              sx={{ borderRadius: '9px', fontSize: '12px', flex: 1, background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
              Mark Complete ✅
            </Button>
            <Tooltip title="Unfollow program">
              <IconButton size="small" onClick={() => onUnfollow(up.program_id)}
                sx={{ border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '9px', p: '5px', color: 'text.secondary' }}>
                <BookmarkRemove sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {up.status === 'completed' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <EmojiEvents sx={{ fontSize: 18, color: '#FFB547' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#FFB547', fontFamily: '"Syne", sans-serif' }}>
              Completed on {up.end_date ?? '—'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── Detail modal ───────────────────────────────────────────── */
function ProgramDetailModal({ open, program, onClose, onFollow, onUnfollow, isFollowing, index }) {
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();
  if (!program) return null;

  const [g1, g2] = GRADIENTS[index % GRADIENTS.length];
  const diff      = diffColors[program.difficulty] || diffColors.beginner;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
      <Box sx={{ height: 6, background: `linear-gradient(90deg, ${g1}, ${g2})` }} />
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '18px', color: 'text.primary' }}>
            {program.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.75 }}>
            <Box sx={{ background: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '100px', px: 1.5, py: 0.3 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: diff.color }}>{program.difficulty}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, background: alpha('#7C6FFF', 0.1), border: `1px solid ${alpha('#7C6FFF', 0.2)}`, borderRadius: '100px', px: 1.5, py: 0.3 }}>
              <AccessTime sx={{ fontSize: 11, color: '#7C6FFF' }} />
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#7C6FFF' }}>{program.duration_weeks} weeks</Typography>
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary', lineHeight: 1.7, mb: 2.5 }}>
          {program.description}
        </Typography>

        {/* Meta grid */}
        <Grid container spacing={1.5} mb={3}>
          {[
            { label: 'Goal',       value: program.goal?.replace(/_/g, ' '), color: g1 },
            { label: 'Duration',   value: `${program.duration_weeks} weeks`,  color: '#7C6FFF' },
            { label: 'Days/week',  value: program.days_per_week ? `${program.days_per_week} days` : `${program.days?.length ?? '—'} days`, color: '#FFB547' },
            { label: 'Followers',  value: program.followers_count ?? 0,       color: '#2EE89A' },
          ].map(m => (
            <Grid item xs={6} key={m.label}>
              <Box sx={{ background: muiTheme.palette.background.default, borderRadius: '12px', p: '12px 16px' }}>
                <Typography sx={{ fontSize: '11px', color: 'text.disabled', mb: 0.25 }}>{m.label}</Typography>
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: m.color, textTransform: 'capitalize' }}>
                  {m.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* All days */}
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.primary', mb: 1.5 }}>
          Program Schedule
        </Typography>
        {(program.days ?? []).map(day => (
          <Accordion key={day.id} disableGutters elevation={0} sx={{
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(108,95,232,0.04)',
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: '12px !important', mb: 1,
            '&::before': { display: 'none' },
          }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 16 }} />}
              sx={{ minHeight: 44, px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                  background: `linear-gradient(135deg, ${g1}, ${g2})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>{day.day_number}</Typography>
                </Box>
                <Typography sx={{ fontSize: '13px', fontFamily: '"Syne", sans-serif', fontWeight: 700, color: 'text.primary' }}>
                  {day.title || `Day ${day.day_number}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
              {(day.exercises ?? []).length === 0 ? (
                <Typography sx={{ fontSize: '12px', color: 'text.disabled', fontStyle: 'italic' }}>Rest day</Typography>
              ) : (
                (day.exercises ?? []).map((ex, i) => (
                  <Box key={ex.id ?? i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 14, color: '#2EE89A', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '13px', color: 'text.primary', fontWeight: 500 }}>
                        {ex.name ?? ex.exercise?.name ?? '—'}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                      {ex.sets ? `${ex.sets}×${ex.reps ?? '—'}` : ex.duration ? `${ex.duration} min` : '—'}
                    </Typography>
                  </Box>
                ))
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '11px' }}>Close</Button>
        {isFollowing ? (
          <Button variant="outlined" color="error" startIcon={<BookmarkRemove />}
            onClick={() => { onUnfollow(program.id); onClose(); }}
            sx={{ borderRadius: '11px' }}>
            Unfollow
          </Button>
        ) : (
          <Button variant="contained" startIcon={<BookmarkAdd />}
            onClick={() => { onFollow(program.id); onClose(); }}
            sx={{ borderRadius: '11px', background: `linear-gradient(135deg, ${g1}, ${g2})` }}>
            Follow Program
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main page
═══════════════════════════════════════════════════════════════ */
export default function ProgramsPage() {
  const muiTheme   = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary     = muiTheme.palette.primary.main;

  const [tab, setTab]               = useState(0);
  const [programs, setPrograms]     = useState([]);
  const [myPrograms, setMyPrograms] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [myLoading, setMyLoading]   = useState(false);
  const [search, setSearch]         = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [goal, setGoal]             = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode]     = useState('grid');  // 'grid' | 'list'
  const [detailProgram, setDetailProgram] = useState(null);
  const [detailIndex, setDetailIndex]     = useState(0);
  const [error, setError]           = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  /* IDs the user is already following */
  const followingIds = new Set(
    myPrograms.filter(up => up.status === 'active').map(up => up.program_id)
  );

  /* ── Fetch browse list ── */
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/programs', {
        params: {
          page,
          search:     search     || undefined,
          difficulty: difficulty || undefined,
          goal:       goal       || undefined,
          per_page: 6,
        },
      });
      setPrograms(data.data ?? []);
      setTotalPages(data.last_page ?? 1);
    } catch (e) {
      setError('Failed to load programs.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, difficulty, goal]);

  /* ── Fetch my programs ── */
  const fetchMyPrograms = useCallback(async () => {
    setMyLoading(true);
    try {
      const { data } = await api.get('/my-programs');
      setMyPrograms(data ?? []);
    } catch (e) {
      console.error('My programs error:', e);
    } finally {
      setMyLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);
  useEffect(() => { fetchMyPrograms(); }, [fetchMyPrograms]);

  /* ── Actions ── */
  const handleFollow = async (id) => {
    try {
      await api.post(`/programs/${id}/follow`);
      enqueueSnackbar('Program started! 🎉', { variant: 'success' });
      fetchMyPrograms();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Already following this program', { variant: 'warning' });
    }
  };

  const handleUnfollow = async (id) => {
    try {
      await api.post(`/programs/${id}/unfollow`);
      enqueueSnackbar('Program unfollowed', { variant: 'info' });
      fetchMyPrograms();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Error', { variant: 'error' });
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.post(`/programs/${id}/complete`);
      enqueueSnackbar('Congratulations! Program completed! 🏆', { variant: 'success' });
      fetchMyPrograms();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Error', { variant: 'error' });
    }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  /* ── Stats strip ── */
  const activeCount    = myPrograms.filter(p => p.status === 'active').length;
  const completedCount = myPrograms.filter(p => p.status === 'completed').length;

  return (
    <AppLayout>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
            Training Programs 📋
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
            Find the perfect program for your goals
          </Typography>
        </Box>

        {/* Quick stats */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[
            { label: 'Active',    value: activeCount,    color: '#2EE89A' },
            { label: 'Completed', value: completedCount, color: '#7C6FFF' },
          ].map(s => (
            <Box key={s.label} sx={{
              background: alpha(s.color, 0.08), border: `1px solid ${alpha(s.color, 0.2)}`,
              borderRadius: '12px', px: 2, py: 1, textAlign: 'center', minWidth: 70,
            }}>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '20px', color: s.color, lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.25 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Tabs ── */}
      <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', mb: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '13px', textTransform: 'none', minHeight: 48 } }}>
          <Tab label="Browse Programs" />
          <Tab label={`My Programs${myPrograms.length ? ` (${myPrograms.length})` : ''}`} />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ══ Tab 0: Browse ══════════════════════════════════════ */}
      {tab === 0 && (
        <>
          {/* Filters bar */}
          <Box sx={{ background: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '16px', p: '16px 20px', mb: 3 }}>
            <Box component="form" onSubmit={e => { e.preventDefault(); setPage(1); fetchPrograms(); }}
              sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" placeholder="Search programs…" value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: 1, minWidth: 180, ...inputSx }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> }} />
              <TextField select size="small" label="Difficulty" value={difficulty}
                onChange={e => setDifficulty(e.target.value)} sx={{ minWidth: 130, ...inputSx }}>
                {['', 'beginner', 'intermediate', 'advanced'].map(d => (
                  <MenuItem key={d} value={d}>{d || 'All Levels'}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Goal" value={goal}
                onChange={e => setGoal(e.target.value)} sx={{ minWidth: 150, ...inputSx }}>
                {GOALS.map(g => (
                  <MenuItem key={g} value={g}>{g ? g.replace(/_/g, ' ') : 'All Goals'}</MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained" sx={{ borderRadius: '11px', px: 3, height: 40 }}>
                Search
              </Button>
              {/* View toggle */}
              <Box sx={{ display: 'flex', border: `1px solid ${muiTheme.palette.divider}`, borderRadius: '10px', overflow: 'hidden', ml: 'auto' }}>
                {[['grid', <ViewModule sx={{ fontSize: 18 }} />], ['list', <ViewList sx={{ fontSize: 18 }} />]].map(([mode, icon]) => (
                  <IconButton key={mode} size="small" onClick={() => setViewMode(mode)}
                    sx={{
                      borderRadius: 0, px: 1.5,
                      background: viewMode === mode ? alpha(primary, 0.1) : 'transparent',
                      color: viewMode === mode ? primary : 'text.disabled',
                    }}>
                    {icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={10} flexDirection="column" gap={2}>
              <CircularProgress sx={{ color: primary }} />
              <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Loading programs…</Typography>
            </Box>
          ) : programs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <MenuBook sx={{ color: primary, fontSize: 32 }} />
              </Box>
              <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>No programs found. Try different filters.</Typography>
            </Box>
          ) : viewMode === 'grid' ? (
            <>
              <Grid container spacing={2.5}>
                {programs.map((p, i) => (
                  <Grid item xs={12} md={6} lg={4} key={p.id}>
                    <ProgramCard
                      p={p} index={i} viewMode="grid"
                      isFollowing={followingIds.has(p.id)}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onDetail={(prog) => { setDetailProgram(prog); setDetailIndex(i); }}
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
          ) : (
            /* List view */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {programs.map((p, i) => (
                <ProgramCard key={p.id} p={p} index={i} viewMode="list"
                  isFollowing={followingIds.has(p.id)}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  onDetail={(prog) => { setDetailProgram(prog); setDetailIndex(i); }}
                />
              ))}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary"
                    sx={{ '& .MuiPaginationItem-root': { fontFamily: '"Syne", sans-serif', fontWeight: 600 } }} />
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      {/* ══ Tab 1: My Programs ═════════════════════════════════ */}
      {tab === 1 && (
        <>
          {myLoading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: primary }} /></Box>
          ) : myPrograms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '20px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <EmojiEvents sx={{ color: primary, fontSize: 32 }} />
              </Box>
              <Typography sx={{ color: 'text.secondary', fontWeight: 500, mb: 2 }}>
                You haven't followed any programs yet.
              </Typography>
              <Button variant="contained" onClick={() => setTab(0)} sx={{ borderRadius: '12px' }}>
                Browse Programs
              </Button>
            </Box>
          ) : (
            <>
              {/* Active */}
              {myPrograms.filter(u => u.status === 'active').length > 0 && (
                <Box mb={3}>
                  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏃 Active
                  </Typography>
                  <Grid container spacing={2}>
                    {myPrograms.filter(u => u.status === 'active').map((up, i) => (
                      <Grid item xs={12} md={6} lg={4} key={up.id}>
                        <MyProgramCard up={up} index={i} onComplete={handleComplete} onUnfollow={handleUnfollow} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {/* Completed */}
              {myPrograms.filter(u => u.status === 'completed').length > 0 && (
                <Box mb={3}>
                  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '14px', color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🏆 Completed
                  </Typography>
                  <Grid container spacing={2}>
                    {myPrograms.filter(u => u.status === 'completed').map((up, i) => (
                      <Grid item xs={12} md={6} lg={4} key={up.id}>
                        <MyProgramCard up={up} index={i} onComplete={handleComplete} onUnfollow={handleUnfollow} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* ── Detail modal ── */}
      <ProgramDetailModal
        open={!!detailProgram}
        program={detailProgram}
        index={detailIndex}
        isFollowing={detailProgram ? followingIds.has(detailProgram.id) : false}
        onClose={() => setDetailProgram(null)}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
    </AppLayout>
  );
}