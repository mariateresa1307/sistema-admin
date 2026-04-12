// src/theme.ts
'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Esto cambiará el fondo negro por uno blanco/claro profesional
    primary: {
      main: '#1976d2', // Azul estándar de Material UI
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f4f6f8', // Un gris muy claro para el fondo de la app
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;