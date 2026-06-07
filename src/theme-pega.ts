import { createTheme } from '@mui/material/styles';

export const pegaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a6f8f'
    },
    secondary: {
      main: '#536d35'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif'
  },
  shape: {
    borderRadius: 6
  }
});
