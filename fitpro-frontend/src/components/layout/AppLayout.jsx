import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, IconButton, Divider,
  useMediaQuery, Tooltip, AppBar, Toolbar,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  Dashboard, FitnessCenter, MenuBook, TrendingUp, Restaurant,
  Person, Settings, Logout, Menu as MenuIcon,
  AdminPanelSettings, People, SupervisorAccount, BarChart,
  Message, SportsMartialArts, ChevronLeft,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useFitTheme } from '../../context/ThemeContext';
import { useSnackbar } from 'notistack';

const DRAWER_WIDTH = 264;

const userNav = [
  { label: 'Dashboard',  icon: <Dashboard />,     path: '/dashboard', group: 'main' },
  { label: 'Workouts',   icon: <FitnessCenter />,  path: '/workouts',  group: 'main' },
  { label: 'Programs',   icon: <MenuBook />,        path: '/programs',  group: 'main' },
  { label: 'Progress',   icon: <TrendingUp />,      path: '/progress',  group: 'main' },
  { label: 'Nutrition',  icon: <Restaurant />,      path: '/nutrition', group: 'main' },
  { label: 'Profile',    icon: <Person />,          path: '/profile',   group: 'account' },
  { label: 'Settings',   icon: <Settings />,        path: '/settings',  group: 'account' },
];

const coachNav = [
  { label: 'Dashboard',  icon: <Dashboard />,       path: '/coach',           group: 'main' },
  { label: 'Exercises',  icon: <FitnessCenter />,   path: '/coach/exercises', group: 'main' },
  { label: 'Programs',   icon: <MenuBook />,         path: '/coach/programs',  group: 'main' },
  { label: 'My Users',   icon: <People />,           path: '/coach/users',     group: 'main' },
  { label: 'Messages',   icon: <Message />,          path: '/coach/messages',  group: 'main' },
  { label: 'Profile',    icon: <Person />,           path: '/profile',         group: 'account' },
  { label: 'Settings',   icon: <Settings />,         path: '/settings',        group: 'account' },
];

const adminNav = [
  { label: 'Dashboard',  icon: <AdminPanelSettings />, path: '/admin',            group: 'main' },
  { label: 'Users',      icon: <People />,              path: '/admin/users',      group: 'main' },
  { label: 'Coaches',    icon: <SupervisorAccount />,   path: '/admin/coaches',    group: 'main' },
  { label: 'Exercises',  icon: <FitnessCenter />,       path: '/admin/exercises',  group: 'main' },
  { label: 'Programs',   icon: <MenuBook />,             path: '/admin/programs',   group: 'main' },
  { label: 'Reports',    icon: <BarChart />,             path: '/admin/reports',    group: 'main' },
  { label: 'Profile',    icon: <Person />,               path: '/profile',          group: 'account' },
  { label: 'Settings',   icon: <Settings />,             path: '/settings',         group: 'account' },
];

/* ─── Theme Toggle ───────────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggle } = useFitTheme();
  const muiTheme = useMuiTheme();
  return (
    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <Box onClick={toggle} sx={{
        width: 44, height: 24, borderRadius: '100px', cursor: 'pointer', position: 'relative',
        background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
        transition: 'all 0.3s',
        boxShadow: `0 2px 10px ${alpha(muiTheme.palette.primary.main, 0.5)}`,
        flexShrink: 0,
      }}>
        <Box sx={{
          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.3s ease',
          left: isDark ? 'calc(100% - 21px)' : '3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}>
          {isDark ? '🌙' : '☀️'}
        </Box>
      </Box>
    </Tooltip>
  );
}

export default function AppLayout({ children }) {
  const muiTheme = useMuiTheme();
  const { isDark, T } = useFitTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout, isAdmin, isCoach } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const navItems    = isAdmin() ? adminNav : isCoach() ? coachNav : userNav;
  const roleColor   = isAdmin() ? '#FF5F7E' : isCoach() ? '#2EE89A' : '#7C6FFF';
  const roleLabel   = isAdmin() ? 'Admin' : isCoach() ? 'Coach' : 'Member';
  const roleBadgeBg = isAdmin()
    ? alpha('#FF5F7E', 0.15)
    : isCoach()
    ? alpha('#2EE89A', 0.15)
    : alpha('#7C6FFF', 0.15);

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/');
  };

  /* ── Sidebar colors ── */
  const sidebarBg     = isDark ? '#0D0D14' : '#FFFFFF';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(108,95,232,0.1)';
  const textPrimary   = isDark ? '#FFFFFF' : '#0D0B1E';
  const textMuted     = isDark ? 'rgba(255,255,255,0.45)' : '#8880C0';
  const dividerColor  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(108,95,232,0.1)';
  const hoverBg       = isDark ? 'rgba(124,111,255,0.08)' : 'rgba(108,95,232,0.07)';
  const activeBg      = isDark
    ? 'linear-gradient(135deg, rgba(124,111,255,0.25), rgba(255,95,126,0.1))'
    : 'linear-gradient(135deg, rgba(108,95,232,0.15), rgba(240,64,94,0.06))';
  const activeColor   = isDark ? '#FFFFFF' : '#0D0B1E';
  const groupLabel    = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(108,95,232,0.4)';
  const userCardBg    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(108,95,232,0.06)';
  const userCardBorder= isDark ? 'rgba(255,255,255,0.07)' : 'rgba(108,95,232,0.12)';

  const drawerContent = (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      transition: 'background 0.3s',
    }}>
      {/* ── Logo + Close ── */}
      <Box sx={{ p: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #7C6FFF, #FF5F7E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,111,255,0.4)',
          }}>
            <SportsMartialArts sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: '18px', color: textPrimary, letterSpacing: '-0.3px',
          }}>
            Fit<span style={{ color: '#7C6FFF' }}>Pro</span>
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)}
            sx={{ color: textMuted, '&:hover': { color: textPrimary, background: hoverBg } }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* ── User card ── */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{
          p: '12px 14px', borderRadius: '14px',
          background: userCardBg, border: `1px solid ${userCardBorder}`,
          display: 'flex', alignItems: 'center', gap: 1.5,
          transition: 'background 0.3s',
        }}>
          <Avatar sx={{
            width: 38, height: 38, borderRadius: '11px',
            background: `linear-gradient(135deg, ${roleColor}80, ${roleColor}40)`,
            border: `1px solid ${alpha(roleColor, 0.3)}`,
            fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '15px',
            color: '#fff',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '13px', fontWeight: 700, color: textPrimary, lineHeight: 1.3 }}>
              {user?.name}
            </Typography>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center',
              background: roleBadgeBg, borderRadius: '100px',
              px: '8px', py: '2px', mt: '3px',
            }}>
              <Typography sx={{
                fontSize: '10px', fontWeight: 700,
                color: roleColor, letterSpacing: '0.5px',
                fontFamily: '"Syne", sans-serif',
              }}>
                {roleLabel}
              </Typography>
            </Box>
          </Box>
          <ThemeToggle />
        </Box>
      </Box>

      <Box sx={{ mx: 2, height: '1px', background: dividerColor, mb: 1.5 }} />

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: alpha('#7C6FFF', 0.3), borderRadius: 2 },
      }}>
        {/* Main group */}
        <Typography sx={{
          fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: groupLabel,
          px: 1.5, mb: 1, mt: 0.5, fontFamily: '"Syne", sans-serif',
        }}>
          Main Menu
        </Typography>
        {navItems.filter(i => i.group === 'main').map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: '12px', py: '10px', px: '12px',
                  color: active ? activeColor : textMuted,
                  background: active ? activeBg : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { background: active ? activeBg : hoverBg, color: textPrimary },
                  position: 'relative', overflow: 'hidden',
                }}>
                {active && (
                  <Box sx={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%', borderRadius: '0 2px 2px 0',
                    background: 'linear-gradient(180deg, #7C6FFF, #FF5F7E)',
                  }} />
                )}
                <ListItemIcon sx={{ color: active ? '#7C6FFF' : 'inherit', minWidth: 38, '& svg': { fontSize: 19 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '13.5px',
                    fontWeight: active ? 700 : 500,
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                />
                {active && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#7C6FFF', opacity: 0.6 }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* Account group */}
        <Box sx={{ mx: 1.5, height: '1px', background: dividerColor, my: 1.5 }} />
        <Typography sx={{
          fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: groupLabel,
          px: 1.5, mb: 1, fontFamily: '"Syne", sans-serif',
        }}>
          Account
        </Typography>
        {navItems.filter(i => i.group === 'account').map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  borderRadius: '12px', py: '10px', px: '12px',
                  color: active ? activeColor : textMuted,
                  background: active ? activeBg : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { background: active ? activeBg : hoverBg, color: textPrimary },
                }}>
                <ListItemIcon sx={{ color: active ? '#7C6FFF' : 'inherit', minWidth: 38, '& svg': { fontSize: 19 } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '13.5px', fontWeight: active ? 700 : 500, fontFamily: '"DM Sans", sans-serif' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </Box>

      {/* ── Logout ── */}
      <Box sx={{ p: 1.5, pt: 1 }}>
        <Box sx={{ height: '1px', background: dividerColor, mb: 1.5 }} />
        <ListItemButton onClick={handleLogout} sx={{
          borderRadius: '12px', py: '10px', px: '12px',
          color: textMuted, transition: 'all 0.2s',
          '&:hover': {
            color: '#FF5F7E',
            background: alpha('#FF5F7E', 0.08),
            '& .logout-icon': { color: '#FF5F7E' },
          },
        }}>
          <ListItemIcon className="logout-icon" sx={{ color: 'inherit', minWidth: 38, '& svg': { fontSize: 19 } }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '13.5px', fontWeight: 500, fontFamily: '"DM Sans", sans-serif' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', transition: 'background 0.3s' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary" open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'background 0.3s' }}>
        {/* Mobile top bar */}
        {isMobile && (
          <Box sx={{
            position: 'sticky', top: 0, zIndex: 100,
            background: isDark ? 'rgba(10,10,15,0.9)' : 'rgba(240,239,254,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(108,95,232,0.1)'}`,
            display: 'flex', alignItems: 'center', px: 2, py: 1.5, gap: 2,
          }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '17px', color: 'text.primary' }}>
              Fit<span style={{ color: '#7C6FFF' }}>Pro</span>
            </Typography>
            <Box sx={{ ml: 'auto' }}><ThemeToggle /></Box>
          </Box>
        )}

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}