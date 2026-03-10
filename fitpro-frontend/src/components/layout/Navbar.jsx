import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, Container, useScrollTrigger,
} from '@mui/material';
import { Menu as MenuIcon, SportsMartialArts } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

const navLinks = ['Home','Programs','Features','Contact'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 50 });

  return (
    <>
      <AppBar position="fixed" elevation={trigger ? 4 : 0}
        sx={{
          background: trigger ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: trigger ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          borderBottom: trigger ? '1px solid rgba(0,0,0,0.06)' : 'none',
        }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 70 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SportsMartialArts sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}
                sx={{ color: trigger ? 'text.primary' : '#fff', letterSpacing: 1 }}>
                Fit<span style={{ color: '#6C63FF' }}>Pro</span>
              </Typography>
            </Box>

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 3 }}>
              {navLinks.map(link => (
                <Button key={link}
                  sx={{ color: trigger ? 'text.primary' : 'rgba(255,255,255,0.9)', fontWeight: 500, '&:hover': { color: '#6C63FF', bgcolor: 'transparent' } }}>
                  {link}
                </Button>
              ))}
            </Box>

            {/* Auth buttons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/login')}
                sx={{ borderColor: trigger ? 'primary.main' : 'rgba(255,255,255,0.6)', color: trigger ? 'primary.main' : '#fff' }}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Box>

            {/* Mobile menu */}
            <IconButton sx={{ display: { md: 'none' }, color: trigger ? 'text.primary' : '#fff' }}
              onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260, p: 2 }}>
          {navLinks.map(link => (
            <ListItem key={link} disablePadding>
              <ListItemButton onClick={() => setMobileOpen(false)}>
                <Typography fontWeight={500}>{link}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Login</Button>
            <Button fullWidth variant="contained" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Get Started</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}