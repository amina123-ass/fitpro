import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useFitTheme } from '../../context/ThemeContext';
import { alpha } from '@mui/material/styles';

export default function StatCard({ title, value, subtitle, icon, color = '#7C6FFF', trend, trendValue }) {
  const muiTheme = useMuiTheme();
  const { isDark } = useFitTheme();

  return (
    <Box sx={{
      background: muiTheme.palette.background.paper,
      border: `1px solid ${muiTheme.palette.divider}`,
      borderRadius: '20px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      height: '100%',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: isDark
          ? `0 20px 48px rgba(0,0,0,0.45)`
          : `0 12px 40px ${alpha(color, 0.18)}`,
        borderColor: alpha(color, 0.35),
      },
    }}>
      {/* Top accent line */}
      <Box sx={{
        position: 'absolute', top: 0, left: 24, right: 24, height: '2px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: 1,
      }} />

      {/* BG glow */}
      <Box sx={{
        position: 'absolute', bottom: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: alpha(color, isDark ? 0.08 : 0.07),
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, position: 'relative' }}>
        <Box>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'text.secondary', mb: 1,
            fontFamily: '"Syne", sans-serif',
          }}>
            {title}
          </Typography>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: '2rem', lineHeight: 1, color: 'text.primary',
            letterSpacing: '-0.5px',
          }}>
            {value}
          </Typography>
        </Box>

        <Box sx={{
          width: 52, height: 52, borderRadius: '16px',
          background: alpha(color, isDark ? 0.12 : 0.1),
          border: `1px solid ${alpha(color, 0.2)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
          '& svg': { fontSize: 22 },
        }}>
          {icon}
        </Box>
      </Box>

      {(subtitle || trend) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, position: 'relative' }}>
          {trend && (
            <>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                background: trend === 'up' ? alpha('#2EE89A', 0.12) : alpha('#FF5F7E', 0.12),
                border: `1px solid ${trend === 'up' ? alpha('#2EE89A', 0.25) : alpha('#FF5F7E', 0.25)}`,
                borderRadius: '100px', px: 1, py: 0.25,
              }}>
                {trend === 'up'
                  ? <TrendingUp sx={{ fontSize: 13, color: '#2EE89A' }} />
                  : <TrendingDown sx={{ fontSize: 13, color: '#FF5F7E' }} />}
                <Typography sx={{
                  fontSize: '11px', fontWeight: 700,
                  color: trend === 'up' ? '#2EE89A' : '#FF5F7E',
                  fontFamily: '"Syne", sans-serif',
                }}>
                  {trendValue}
                </Typography>
              </Box>
            </>
          )}
          {subtitle && (
            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}