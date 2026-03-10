import { createTheme, alpha } from '@mui/material/styles';

/* ─────────────────────────────────────────────────────────────────
   FitPro Design Tokens
   Aligned with ThemeContext.jsx (DARK / LIGHT token sets)
───────────────────────────────────────────────────────────────── */
const TOKENS = {
  dark: {
    bg:          '#0A0A0F',
    bgCard:      '#111118',
    bgElevated:  '#14141E',
    bgInput:     'rgba(255,255,255,0.04)',
    border:      'rgba(255,255,255,0.07)',
    borderHover: 'rgba(124,111,255,0.25)',
    text:        '#FFFFFF',
    textSub:     '#E8E8F0',
    textMuted:   '#9090A8',
    textDisabled:'#3A3A50',
    divider:     'rgba(255,255,255,0.07)',
    shadow:      '0 8px 32px rgba(0,0,0,0.5)',
    shadowCard:  '0 24px 60px rgba(0,0,0,0.5)',
    shadowBtn:   '0 8px 24px rgba(124,111,255,0.35)',
    tooltipBg:   '#1E1E2E',
  },
  light: {
    bg:          '#F0EFFE',
    bgCard:      '#FFFFFF',
    bgElevated:  '#F7F6FF',
    bgInput:     'rgba(108,95,232,0.05)',
    border:      'rgba(108,95,232,0.12)',
    borderHover: 'rgba(108,95,232,0.3)',
    text:        '#0D0B1E',
    textSub:     '#2A2840',
    textMuted:   '#6862A0',
    textDisabled:'#B0AACC',
    divider:     'rgba(108,95,232,0.1)',
    shadow:      '0 4px 24px rgba(108,95,232,0.1)',
    shadowCard:  '0 8px 40px rgba(108,95,232,0.12)',
    shadowBtn:   '0 8px 24px rgba(108,95,232,0.3)',
    tooltipBg:   '#1A1830',
  },
};

const BRAND = {
  primary:        '#7C6FFF',
  primaryLight:   '#A89BFF',
  primaryDark:    '#5548D9',
  primaryDarkMode:'#6C5FE8',  // slightly adjusted for light bg
  accent:         '#FF5F7E',
  accentLight:    '#FF92A6',
  accentDark:     '#CC3D5E',
  green:          '#2EE89A',
  greenDark:      '#18C97A',
  gold:           '#FFB547',
  goldDark:       '#E8A020',
  info:           '#5CE1E6',
  infoDark:       '#0EA5E9',
};

/* ─────────────────────────────────────────────────────────────────
   Theme factory
───────────────────────────────────────────────────────────────── */
export function buildMuiTheme(mode = 'dark') {
  const isDark = mode === 'dark';
  const t = isDark ? TOKENS.dark : TOKENS.light;

  const primary = isDark ? BRAND.primary : BRAND.primaryDarkMode;
  const accent   = isDark ? BRAND.accent  : BRAND.accentDark;
  const green    = isDark ? BRAND.green   : BRAND.greenDark;
  const gold     = isDark ? BRAND.gold    : BRAND.goldDark;

  return createTheme({
    palette: {
      mode,

      primary: {
        main:        primary,
        light:       BRAND.primaryLight,
        dark:        BRAND.primaryDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main:        accent,
        light:       BRAND.accentLight,
        dark:        BRAND.accentDark,
        contrastText: '#FFFFFF',
      },
      success: {
        main:        green,
        light:       alpha(green, 0.8),
        dark:        BRAND.greenDark,
        contrastText: isDark ? '#0A0A0F' : '#FFFFFF',
      },
      warning: {
        main:        gold,
        light:       alpha(gold, 0.8),
        dark:        BRAND.goldDark,
        contrastText: isDark ? '#0A0A0F' : '#FFFFFF',
      },
      error: {
        main:        accent,
        light:       BRAND.accentLight,
        dark:        BRAND.accentDark,
        contrastText: '#FFFFFF',
      },
      info: {
        main:        isDark ? BRAND.info : BRAND.infoDark,
        contrastText: '#FFFFFF',
      },

      background: {
        default: t.bg,
        paper:   t.bgCard,
      },
      text: {
        primary:   t.text,
        secondary: t.textMuted,
        disabled:  t.textDisabled,
      },
      divider: t.divider,

      /* Custom tokens exposed via theme.palette.fitpro.* */
      fitpro: {
        bgElevated:  t.bgElevated,
        bgInput:     t.bgInput,
        border:      t.border,
        borderHover: t.borderHover,
        textSub:     t.textSub,
        shadow:      t.shadow,
        shadowCard:  t.shadowCard,
        shadowBtn:   t.shadowBtn,
        gradient:    `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
        gradientShimmer: `linear-gradient(135deg, ${primary} 0%, #B06FFF 50%, ${accent} 100%)`,
      },
    },

    /* ── Typography ────────────────────────────────────────── */
    typography: {
      fontFamily: '"DM Sans", "Roboto", sans-serif',
      h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.05 },
      h2: { fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-1px',   lineHeight: 1.1  },
      h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2  },
      h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.3  },
      h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600, lineHeight: 1.5 },
      subtitle1: { fontWeight: 500, lineHeight: 1.6 },
      subtitle2: { fontWeight: 500, lineHeight: 1.6, color: t.textMuted },
      body1:  { fontWeight: 400, lineHeight: 1.75, fontSize: '0.9375rem' },
      body2:  { fontWeight: 400, lineHeight: 1.7,  fontSize: '0.875rem' },
      caption:{ fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.4px' },
      overline:{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1.5px' },
      button: { fontFamily: '"Syne", sans-serif', textTransform: 'none', fontWeight: 700, letterSpacing: '0.3px' },
    },

    shape: { borderRadius: 14 },

    /* ── Shadows ────────────────────────────────────────────── */
    shadows: [
      'none',
      t.shadow,
      `0 2px 8px ${alpha(primary, 0.12)}`,
      `0 4px 16px ${alpha(primary, 0.14)}`,
      `0 8px 24px ${alpha(primary, 0.16)}`,
      `0 12px 32px ${alpha(primary, 0.18)}`,
      `0 16px 40px ${alpha(primary, 0.2)}`,
      `0 20px 48px ${alpha(primary, 0.22)}`,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
      t.shadowCard,
    ],

    /* ── Components ─────────────────────────────────────────── */
    components: {

      /* ── MuiCssBaseline ── */
      MuiCssBaseline: {
        styleOverrides: {
          '@import': "url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap')",
          '*': { boxSizing: 'border-box' },
          'html': { scrollBehavior: 'smooth' },
          'body': {
            background: t.bg,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transition: 'background 0.3s, color 0.3s',
          },
          '::-webkit-scrollbar':       { width: 6 },
          '::-webkit-scrollbar-track': { background: t.bg },
          '::-webkit-scrollbar-thumb': { background: primary, borderRadius: 3 },
        },
      },

      /* ── MuiButton ── */
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '12px 28px',
            fontSize: '0.9375rem',
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
            '&:hover': { transform: 'translateY(-2px)' },
            '&:active': { transform: 'translateY(0)' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            boxShadow: 'none',
            '&:hover': { boxShadow: t.shadowBtn, background: `linear-gradient(135deg, ${primary}, ${accent})` },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${accent}, ${BRAND.accentLight})`,
            boxShadow: 'none',
            '&:hover': { boxShadow: `0 8px 24px ${alpha(accent, 0.4)}` },
          },
          outlined: {
            border: `1px solid ${t.border}`,
            color: t.textSub,
            background: t.bgInput,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              border: `1px solid ${alpha(primary, 0.4)}`,
              color: t.text,
              background: alpha(primary, 0.08),
              boxShadow: 'none',
            },
          },
          text: {
            color: t.textMuted,
            '&:hover': { color: t.text, background: alpha(primary, 0.06) },
          },
          sizeLarge:  { padding: '14px 36px', fontSize: '1rem' },
          sizeSmall:  { padding: '8px 18px', fontSize: '0.8125rem', borderRadius: 10 },
        },
      },

      /* ── MuiIconButton ── */
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: t.textMuted,
            transition: 'color 0.2s, background 0.2s',
            '&:hover': { color: t.text, background: alpha(primary, 0.08) },
          },
        },
      },

      /* ── MuiCard ── */
      MuiCard: {
        styleOverrides: {
          root: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 24,
            boxShadow: isDark ? 'none' : t.shadowCard,
            transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 32, right: 32, height: 1,
              background: `linear-gradient(90deg, transparent, ${alpha(primary, 0.5)}, transparent)`,
              borderRadius: 1,
            },
            '&:hover': {
              borderColor: t.borderHover,
              transform: 'translateY(-4px)',
              boxShadow: t.shadowCard,
            },
          },
        },
      },

      /* ── MuiCardContent ── */
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '28px 32px',
            '&:last-child': { paddingBottom: '28px' },
          },
        },
      },

      /* ── MuiPaper ── */
      MuiPaper: {
        styleOverrides: {
          root: {
            background: t.bgCard,
            backgroundImage: 'none',
            border: `1px solid ${t.border}`,
            transition: 'background 0.3s',
          },
          elevation1: { boxShadow: isDark ? 'none' : t.shadow },
          elevation2: { boxShadow: isDark ? 'none' : t.shadowCard },
        },
      },

      /* ── MuiTextField ── */
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& label': {
              color: t.textMuted,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.875rem',
            },
            '& label.Mui-focused': { color: primary },
            '& .MuiOutlinedInput-root': {
              borderRadius: 14,
              background: t.bgInput,
              color: t.text,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.9rem',
              transition: 'background 0.2s, box-shadow 0.2s',
              '& fieldset': { borderColor: t.border },
              '&:hover fieldset': { borderColor: alpha(primary, 0.4) },
              '&.Mui-focused': {
                background: alpha(primary, 0.06),
                '& fieldset': {
                  borderColor: alpha(primary, 0.6),
                  boxShadow: `0 0 0 3px ${alpha(primary, 0.1)}`,
                },
              },
              '&.Mui-error fieldset': { borderColor: accent },
            },
            '& .MuiInputAdornment-root svg': { color: t.textDisabled },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 6, color: t.textMuted },
            '& .MuiFormHelperText-root.Mui-error': { color: accent },
          },
        },
      },

      /* ── MuiSelect ── */
      MuiSelect: {
        styleOverrides: {
          icon: { color: t.textMuted },
          select: {
            background: t.bgInput,
            borderRadius: 14,
            color: t.text,
          },
        },
      },

      /* ── MuiMenuItem ── */
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.9rem',
            color: t.text,
            borderRadius: 8,
            margin: '2px 6px',
            padding: '8px 14px',
            transition: 'background 0.15s',
            '&:hover': { background: alpha(primary, 0.1) },
            '&.Mui-selected': {
              background: alpha(primary, 0.15),
              color: primary,
              '&:hover': { background: alpha(primary, 0.2) },
            },
          },
        },
      },

      /* ── MuiMenu ── */
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: t.shadowCard,
            padding: '6px 0',
          },
        },
      },

      /* ── MuiChip ── */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 100,
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            height: 28,
            border: `1px solid ${t.border}`,
            background: t.bgInput,
            color: t.textMuted,
            transition: 'all 0.2s',
          },
          colorPrimary: {
            background: alpha(primary, 0.12),
            border: `1px solid ${alpha(primary, 0.25)}`,
            color: primary,
          },
          colorSuccess: {
            background: alpha(green, 0.12),
            border: `1px solid ${alpha(green, 0.25)}`,
            color: green,
          },
          colorWarning: {
            background: alpha(gold, 0.12),
            border: `1px solid ${alpha(gold, 0.25)}`,
            color: gold,
          },
          colorError: {
            background: alpha(accent, 0.12),
            border: `1px solid ${alpha(accent, 0.25)}`,
            color: accent,
          },
          deleteIcon: { color: t.textMuted, '&:hover': { color: t.text } },
        },
      },

      /* ── MuiAvatar ── */
      MuiAvatar: {
        styleOverrides: {
          root: {
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
          },
        },
      },

      /* ── MuiDivider ── */
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.border },
        },
      },

      /* ── MuiTooltip ── */
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: t.tooltipBg,
            color: '#fff',
            fontSize: '0.75rem',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            borderRadius: 8,
            padding: '7px 12px',
            border: `1px solid ${alpha('#fff', 0.1)}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          },
          arrow: { color: t.tooltipBg },
        },
      },

      /* ── MuiDialog ── */
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 24,
            boxShadow: t.shadowCard,
          },
        },
      },

      /* ── MuiDialogTitle ── */
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            color: t.text,
            padding: '24px 28px 16px',
          },
        },
      },

      /* ── MuiDialogContent ── */
      MuiDialogContent: {
        styleOverrides: {
          root: { padding: '8px 28px 24px' },
        },
      },

      /* ── MuiDialogActions ── */
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 28px 24px',
            gap: 10,
          },
        },
      },

      /* ── MuiAppBar ── */
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(10,10,15,0.85)' : 'rgba(240,239,254,0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${t.border}`,
          },
        },
      },

      /* ── MuiDrawer ── */
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadowCard,
          },
        },
      },

      /* ── MuiLinearProgress ── */
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 100,
            height: 6,
            background: alpha(primary, 0.12),
          },
          bar: {
            borderRadius: 100,
            background: `linear-gradient(90deg, ${primary}, ${accent})`,
          },
        },
      },

      /* ── MuiCircularProgress ── */
      MuiCircularProgress: {
        defaultProps: { thickness: 4 },
        styleOverrides: {
          colorPrimary: { color: primary },
        },
      },

      /* ── MuiSwitch ── */
      MuiSwitch: {
        styleOverrides: {
          root: { padding: 6 },
          switchBase: {
            '&.Mui-checked': {
              color: '#fff',
              '& + .MuiSwitch-track': {
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                opacity: 1,
              },
            },
          },
          track: {
            borderRadius: 100,
            background: t.textDisabled,
            opacity: 1,
          },
          thumb: {
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          },
        },
      },

      /* ── MuiCheckbox ── */
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: t.textDisabled,
            '&.Mui-checked': { color: primary },
          },
        },
      },

      /* ── MuiRadio ── */
      MuiRadio: {
        styleOverrides: {
          root: {
            color: t.textDisabled,
            '&.Mui-checked': { color: primary },
          },
        },
      },

      /* ── MuiSlider ── */
      MuiSlider: {
        styleOverrides: {
          root: { color: primary },
          rail: { background: t.border, opacity: 1 },
          track: { background: `linear-gradient(90deg, ${primary}, ${accent})`, border: 'none' },
          thumb: {
            background: '#fff',
            border: `2px solid ${primary}`,
            width: 18, height: 18,
            '&:hover': { boxShadow: `0 0 0 8px ${alpha(primary, 0.16)}` },
          },
          mark:      { background: t.border },
          markActive:{ background: primary },
          valueLabel:{
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            color: t.text,
            borderRadius: 10,
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            boxShadow: t.shadow,
          },
        },
      },

      /* ── MuiTabs ── */
      MuiTabs: {
        styleOverrides: {
          root: {
            background: t.bgInput,
            borderRadius: 14,
            padding: 4,
            minHeight: 44,
          },
          indicator: {
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            borderRadius: 10,
            height: '100%',
            top: 0,
            zIndex: 0,
            boxShadow: `0 4px 16px ${alpha(primary, 0.35)}`,
          },
        },
      },

      /* ── MuiTab ── */
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 600,
            fontSize: '0.8125rem',
            letterSpacing: '0.3px',
            textTransform: 'none',
            color: t.textMuted,
            minHeight: 36,
            borderRadius: 10,
            zIndex: 1,
            transition: 'color 0.2s',
            '&.Mui-selected': { color: '#fff' },
          },
        },
      },

      /* ── MuiAccordion ── */
      MuiAccordion: {
        styleOverrides: {
          root: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: '16px !important',
            marginBottom: 8,
            boxShadow: 'none',
            '&::before': { display: 'none' },
            '&.Mui-expanded': {
              borderColor: alpha(primary, 0.25),
              boxShadow: t.shadow,
            },
          },
        },
      },

      /* ── MuiAccordionSummary ── */
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            padding: '4px 20px',
            '& .MuiAccordionSummary-expandIconWrapper': { color: t.textMuted },
          },
          content: {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 600,
            color: t.text,
          },
        },
      },

      /* ── MuiAccordionDetails ── */
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: '0 20px 20px',
            color: t.textMuted,
            fontSize: '0.9rem',
            lineHeight: 1.75,
          },
        },
      },

      /* ── MuiAlert ── */
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.875rem',
            border: '1px solid transparent',
          },
          standardSuccess: {
            background: alpha(green, 0.1),
            border: `1px solid ${alpha(green, 0.25)}`,
            color: green,
            '& .MuiAlert-icon': { color: green },
          },
          standardError: {
            background: alpha(accent, 0.1),
            border: `1px solid ${alpha(accent, 0.25)}`,
            color: accent,
            '& .MuiAlert-icon': { color: accent },
          },
          standardWarning: {
            background: alpha(gold, 0.1),
            border: `1px solid ${alpha(gold, 0.25)}`,
            color: gold,
            '& .MuiAlert-icon': { color: gold },
          },
          standardInfo: {
            background: alpha(primary, 0.1),
            border: `1px solid ${alpha(primary, 0.25)}`,
            color: primary,
            '& .MuiAlert-icon': { color: primary },
          },
        },
      },

      /* ── MuiSnackbar / MuiSnackbarContent ── */
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            background: t.bgCard,
            color: t.text,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            boxShadow: t.shadowCard,
            fontFamily: '"DM Sans", sans-serif',
          },
        },
      },

      /* ── MuiTableContainer ── */
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 20,
            boxShadow: 'none',
            overflow: 'hidden',
          },
        },
      },

      /* ── MuiTableHead ── */
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(108,95,232,0.05)',
              borderBottom: `1px solid ${t.border}`,
              color: t.textMuted,
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '14px 20px',
            },
          },
        },
      },

      /* ── MuiTableBody ── */
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              transition: 'background 0.15s',
              '&:hover': { background: isDark ? 'rgba(255,255,255,0.02)' : alpha(primary, 0.04) },
              '&:last-child .MuiTableCell-root': { borderBottom: 0 },
            },
          },
        },
      },

      /* ── MuiTableCell ── */
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${t.border}`,
            color: t.textSub,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.875rem',
            padding: '14px 20px',
          },
        },
      },

      /* ── MuiTablePagination ── */
      MuiTablePagination: {
        styleOverrides: {
          root:    { color: t.textMuted, fontFamily: '"DM Sans", sans-serif' },
          toolbar: { minHeight: 52 },
          select:  { borderRadius: 8 },
          actions: { color: t.textMuted },
        },
      },

      /* ── MuiPagination ── */
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 600,
            color: t.textMuted,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            '&:hover': { background: alpha(primary, 0.1), borderColor: alpha(primary, 0.3) },
            '&.Mui-selected': {
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              border: 'none',
              color: '#fff',
              boxShadow: `0 4px 16px ${alpha(primary, 0.35)}`,
              '&:hover': { background: `linear-gradient(135deg, ${primary}, ${accent})` },
            },
          },
        },
      },

      /* ── MuiStepper / MuiStep ── */
      MuiStepLabel: {
        styleOverrides: {
          label: {
            fontFamily: '"DM Sans", sans-serif',
            color: t.textMuted,
            '&.Mui-active':    { color: t.text, fontWeight: 600 },
            '&.Mui-completed': { color: primary },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: t.textDisabled,
            '&.Mui-active':    { color: primary },
            '&.Mui-completed': { color: green },
          },
          text: { fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.7rem' },
        },
      },

      /* ── MuiFormLabel ── */
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: t.textMuted,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.875rem',
            '&.Mui-focused': { color: primary },
          },
        },
      },

      /* ── MuiFormHelperText ── */
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.75rem',
            marginTop: 6,
            '&.Mui-error': { color: accent },
          },
        },
      },

      /* ── MuiInputLabel ── */
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: '"DM Sans", sans-serif',
            '&.Mui-focused': { color: primary },
          },
        },
      },

      /* ── MuiInputAdornment ── */
      MuiInputAdornment: {
        styleOverrides: {
          root: { color: t.textDisabled },
        },
      },

      /* ── MuiList / MuiListItem ── */
      MuiList: {
        styleOverrides: {
          root: { padding: '6px 0' },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 6px',
            color: t.textMuted,
            fontFamily: '"DM Sans", sans-serif',
            transition: 'all 0.2s',
            '&:hover': {
              background: alpha(primary, 0.08),
              color: t.text,
            },
            '&.Mui-selected': {
              background: alpha(primary, 0.12),
              color: primary,
              '& .MuiListItemIcon-root': { color: primary },
              '&:hover': { background: alpha(primary, 0.18) },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { color: t.textMuted, minWidth: 40 },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary:   { fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', fontWeight: 500 },
          secondary: { fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: t.textMuted },
        },
      },

      /* ── MuiBadge ── */
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: '0.65rem',
          },
          colorPrimary: {
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
          },
        },
      },

      /* ── MuiFab ── */
      MuiFab: {
        styleOverrides: {
          root: {
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            color: '#fff',
            boxShadow: t.shadowBtn,
            '&:hover': {
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              boxShadow: `0 12px 32px ${alpha(primary, 0.5)}`,
              transform: 'translateY(-2px)',
            },
          },
        },
      },

      /* ── MuiSkeleton ── */
      MuiSkeleton: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(108,95,232,0.08)',
            borderRadius: 8,
          },
        },
      },

      /* ── MuiBackdrop ── */
      MuiBackdrop: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(10,10,15,0.8)' : 'rgba(13,11,30,0.5)',
            backdropFilter: 'blur(8px)',
          },
        },
      },

      /* ── MuiPopover / MuiPopper ── */
      MuiPopover: {
        styleOverrides: {
          paper: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: t.shadowCard,
          },
        },
      },

      /* ── MuiAutocomplete ── */
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            borderRadius: 16,
            boxShadow: t.shadowCard,
            padding: '6px',
          },
          option: {
            borderRadius: 8,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.9rem',
            color: t.text,
            '&[aria-selected="true"]': {
              background: alpha(primary, 0.15),
              color: primary,
            },
            '&:hover': { background: alpha(primary, 0.08) },
          },
          noOptions: { color: t.textMuted, fontFamily: '"DM Sans", sans-serif' },
          clearIndicator: { color: t.textMuted },
          popupIndicator: { color: t.textMuted },
          tag: {
            background: alpha(primary, 0.12),
            border: `1px solid ${alpha(primary, 0.25)}`,
            color: primary,
            borderRadius: 100,
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
          },
        },
      },

      /* ── MuiDatePicker / MuiPickersDay ── */
      MuiPickersDay: {
        styleOverrides: {
          root: {
            fontFamily: '"DM Sans", sans-serif',
            color: t.textSub,
            borderRadius: 10,
            '&:hover': { background: alpha(primary, 0.1) },
            '&.Mui-selected': {
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              color: '#fff',
              '&:hover': { background: `linear-gradient(135deg, ${primary}, ${accent})` },
            },
          },
          today: {
            border: `1px solid ${alpha(primary, 0.5)} !important`,
          },
        },
      },
    },
  });
}

/* ─────────────────────────────────────────────────────────────────
   Default export — dark theme (backwards-compatible)
───────────────────────────────────────────────────────────────── */
export default buildMuiTheme('dark');