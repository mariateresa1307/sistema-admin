import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import { AuthProvider } from './context/authContext'; 
import NotificationProvider from './components/NotificationProvider';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AuthProvider> 
              <CssBaseline />
              <NotificationProvider />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}