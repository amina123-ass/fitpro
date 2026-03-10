/* ═══════════════════════════════════════════════════════════
   MessagesPage.jsx
═══════════════════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  CircularProgress, Stack,
} from '@mui/material';
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles';
import { Send, Message, Inbox } from '@mui/icons-material';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';

function FCard({ children, sx = {} }) {
  const muiTheme = useMuiTheme();
  const primary = muiTheme.palette.primary.main;
  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px', overflow: 'hidden', position: 'relative',
      transition: 'background 0.3s', ...sx,
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 24, right: 24, height: '1px', background: `linear-gradient(90deg,transparent,${alpha(primary, 0.45)},transparent)` }} />
      {children}
    </Box>
  );
}

export function MessagesPage() {
  const { user } = useAuth();
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();
  const primary = muiTheme.palette.primary.main;
  const accent  = muiTheme.palette.secondary.main;

  const [messages, setMessages] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ receiver_id: '', content: '' });
  const { enqueueSnackbar }     = useSnackbar();

  useEffect(() => {
    Promise.all([api.get('/messages'), api.get('/coach/users')])
      .then(([m, u]) => { setMessages(m.data.data || []); setUsers(u.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async e => {
    e.preventDefault();
    try {
      await api.post('/messages', form);
      enqueueSnackbar('Message envoyé !', { variant: 'success' });
      setForm(p => ({ ...p, content: '' }));
      const { data } = await api.get('/messages');
      setMessages(data.data || []);
    } catch (e) {
      enqueueSnackbar(e.response?.data?.message || 'Erreur', { variant: 'error' });
    }
  };

  const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  return (
    <AppLayout>
      <Box mb={4}>
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: { xs: '22px', md: '28px' }, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>
          Messages 💬
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
          Envoyez conseils et feedbacks à vos utilisateurs
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Compose */}
        <FCard sx={{ flex: 1 }}>
          <Box sx={{ p: '24px 28px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: alpha(primary, 0.1), border: `1px solid ${alpha(primary, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary }}>
                <Message sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
                ✉️ Envoyer un message
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSend}>
              <Stack spacing={2.5}>
                <TextField select label="Envoyer à" value={form.receiver_id} required
                  onChange={e => setForm(p => ({ ...p, receiver_id: e.target.value }))} sx={inputSx}>
                  {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                </TextField>
                <TextField label="Message" multiline rows={5} required fullWidth value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))} sx={inputSx}
                  placeholder="Tapez votre message ici…" />
                <Button type="submit" variant="contained" endIcon={<Send />} sx={{ borderRadius: '12px', py: '11px' }}>
                  Envoyer
                </Button>
              </Stack>
            </Box>
          </Box>
        </FCard>

        {/* History */}
        <FCard sx={{ flex: 1.5 }}>
          <Box sx={{ p: '24px 28px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: alpha(accent, 0.1), border: `1px solid ${alpha(accent, 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                <Inbox sx={{ fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '15px', color: 'text.primary' }}>
                📬 Historique des conversations
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} sx={{ color: primary }} />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>Aucun message pour le moment</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <Box key={msg.id} sx={{
                      display: 'flex', gap: 1.5, alignItems: 'flex-start',
                      flexDirection: isMine ? 'row-reverse' : 'row',
                    }}>
                      {/* Avatar */}
                      <Box sx={{
                        width: 34, height: 34, borderRadius: '11px', flexShrink: 0,
                        background: isMine
                          ? `linear-gradient(135deg, ${primary}, ${accent})`
                          : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(108,95,232,0.08)',
                        border: `1px solid ${isMine ? alpha(primary, 0.3) : muiTheme.palette.divider}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '13px',
                        color: isMine ? '#fff' : 'text.secondary',
                      }}>
                        {msg.sender?.name?.charAt(0)}
                      </Box>

                      {/* Bubble */}
                      <Box sx={{ maxWidth: '72%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: 'text.primary', fontFamily: '"Syne", sans-serif' }}>
                            {msg.sender?.name}
                          </Typography>
                          <Typography sx={{ fontSize: '10px', color: 'text.disabled' }}>
                            {msg.created_at?.slice(0, 10)}
                          </Typography>
                        </Box>
                        <Box sx={{
                          p: '10px 14px', borderRadius: isMine ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                          background: isMine
                            ? `linear-gradient(135deg, ${alpha(primary, 0.15)}, ${alpha(accent, 0.1)})`
                            : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(108,95,232,0.05)',
                          border: `1px solid ${isMine ? alpha(primary, 0.2) : muiTheme.palette.divider}`,
                        }}>
                          <Typography sx={{ fontSize: '13px', color: 'text.primary', lineHeight: 1.6 }}>
                            {msg.content}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '10px', color: 'text.disabled', mt: 0.5, textAlign: isMine ? 'right' : 'left' }}>
                          → {msg.receiver?.name}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </FCard>
      </Stack>
    </AppLayout>
  );
}

export default MessagesPage;