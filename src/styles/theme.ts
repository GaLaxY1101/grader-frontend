import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#64748B',
      light: '#94A3B8',
      dark: '#334155',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F1F5F9',
      paper: '#FFFFFF',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
    },
    success: {
      main: '#16A34A',
      light: '#DCFCE7',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
    },
    info: {
      main: '#0284C7',
      light: '#E0F2FE',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    divider: '#CBD5E1',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
    h5: { fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.4 },
    h6: { fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0em', lineHeight: 1.5 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 1px 3px rgba(15, 23, 42, 0.08), 0px 1px 2px rgba(15, 23, 42, 0.06)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.06)',
    '0px 10px 15px -3px rgba(15, 23, 42, 0.08), 0px 4px 6px -4px rgba(15, 23, 42, 0.04)',
    '0px 20px 25px -5px rgba(15, 23, 42, 0.08), 0px 8px 10px -6px rgba(15, 23, 42, 0.04)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.15)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.20)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.30)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.35)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.40)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.45)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.50)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.55)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.60)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.65)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.70)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.75)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.80)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.85)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.90)',
    '0px 25px 50px -12px rgba(15, 23, 42, 0.95)',
    '0px 25px 50px -12px rgba(15, 23, 42, 1.0)',
    '0px 25px 50px -12px rgba(15, 23, 42, 1.0)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
        },
        '*::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#CBD5E1',
          borderRadius: '3px',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.1)',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(15, 23, 42, 0.12)',
          },
        },
        sizeSmall: {
          borderRadius: 6,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08), 0px 1px 2px rgba(15, 23, 42, 0.06)',
          borderRadius: 12,
          border: '1px solid #CBD5E1',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
        sizeSmall: {
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F8FAFC',
          color: '#475569',
          fontSize: '0.8125rem',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#CBD5E1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#64748B',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow:
            '0px 20px 25px -5px rgba(15, 23, 42, 0.12), 0px 8px 10px -6px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          color: '#15803D',
        },
        standardError: {
          backgroundColor: '#FFF1F2',
          color: '#B91C1C',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          color: '#B45309',
        },
        standardInfo: {
          backgroundColor: '#F0F9FF',
          color: '#0369A1',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#CBD5E1',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 10px',
        },
      },
    },
  },
});
