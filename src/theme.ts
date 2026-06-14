import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { blue } from '@mui/material/colors';

declare module '@mui/material/styles' {
  interface Palette {
    kelurahan: { navy: string; blue: string; lightBlue: string; accent: string };
  }
  interface PaletteOptions {
    kelurahan?: { navy?: string; blue?: string; lightBlue?: string; accent?: string };
  }
}

const baseTheme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: true },
  palette: {
    primary: { main: '#1565C0', light: '#1976D2', dark: '#0D47A1' },
    secondary: { main: '#0288D1', light: '#03A9F4', dark: '#01579B' },
    kelurahan: { navy: '#0D47A1', blue: '#1565C0', lightBlue: '#E3F2FD', accent: '#FFC107' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: {},
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(21,101,192,0.25)',
          '&:hover': { boxShadow: '0 4px 16px rgba(21,101,192,0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': { fontWeight: 700, backgroundColor: blue[50] },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.12)' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
  },
});

const theme = responsiveFontSizes(baseTheme);
export default theme;
