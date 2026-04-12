'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, IconButton,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Collapse,
  Menu, MenuItem, Tooltip,Divider
} from '@mui/material';
import {
  Dashboard, People, ChevronLeft, Menu as MenuIcon,
  ExpandLess, ExpandMore, PersonAdd, Logout, Settings
} from '@mui/icons-material';
import { s } from 'motion/react-client';

const drawerWidth = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  const [usersOpen, setUsersOpen] = React.useState(true);
  const [servicesOpen, setServicesOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Estado inicial vacío para evitar hidratación incorrecta
  const [themeMode, setThemeMode] = React.useState<'corporate' | 'dark'>('corporate');
  const [userData, setUserData] = React.useState({ primerNombre: 'U', primerApellido: 'S' });

  React.useEffect(() => {
    // 1. Persistencia: Cargar tema guardado del usuario
    const savedTheme = localStorage.getItem('netuno-theme') as 'corporate' | 'dark';
    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    const storedUser = localStorage.getItem('userData');
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  const toggleTheme = (mode: 'corporate' | 'dark') => {
    setThemeMode(mode);
    // Guardar como predeterminado para este usuario en este navegador
    localStorage.setItem('netuno-theme', mode);
    setAnchorEl(null);
  };

  const isDark = themeMode === 'dark';

  // Configuración de Colores y Tipografía para Visibilidad Óptima
  const themeConfig = {
    background: isDark 
      ? '#efeff5' // Contexto Login Dark
      : '#c5d2df',
    headerBg: isDark ? '#11001fcc' : 'rgb(0, 0, 39)',
    sidebarBg: isDark ? '#11001fcc' : '#000027',
    
    textColor: isDark ? '#FFFFFF' : '#e7e7e9',
    // Texto Secundario (Descripciones o iconos desactivados)
    textSecondary: isDark ? 'rgb(255, 255, 255)' : 'rgba(9, 9, 121, 0.7)',
    
    glassPanel: isDark ? {
      backgroundColor: 'rgba(248, 248, 248, 0.08)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    } : {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(255, 255, 255, 0.05)',
      border: '1px solid #e0e0e0',
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: themeConfig.background,///fondo
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
    }}>
      {/* HEADER BAR */}
      <AppBar position="fixed" sx={{ 
        zIndex: 1201,
        backgroundColor: themeConfig.headerBg,
        backdropFilter: 'blur(15px)',
        
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.46)' : 'rgba(0,0,0,0.1)'}`,
        color: themeConfig.textColor,
        transition: 'background-color 0.4s, color 0.4s'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setOpen(!open)} sx={{ color: 'inherit', mr: 2 }}>
              {open ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
              NETUNO
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>

             <Avatar sx={{ 
              bgcolor: isDark ? '#6f277c' : '#278022', 
              width: 38, height: 38, ml: 2,
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'transparent'}`
            }}>
              {userData.primerNombre[0]}
            </Avatar>
            <Tooltip title="Configuración de Interfaz">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'inherit', mx: 1 }}>
                <Settings />
              </IconButton>
            </Tooltip>
            

            
         
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
  PaperProps={{
    sx: {
      mt: 1.5,
      p: 2,
      width: 280,
      borderRadius: '16px',
      // Aplicamos glassmorphism al menú también si es modo dark
      backgroundColor: isDark ? 'rgba(30, 0, 50, 0.9)' : '#fff',
      backdropFilter: 'blur(10px)',
      color: isDark ? '#fff' : '#000',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #eee',
    }
  }}
>
  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, opacity: 0.8 }}>
    CONFIGURACIÓN
  </Typography>

  <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: 1 }}>
    MODO DE INTERFAZ
  </Typography>

  <Box sx={{ 
    display: 'flex', 
    gap: 1, 
    p: 0.5, 
    borderRadius: '12px', 
    bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#f5f5f5' 
  }}>
    <ListItemButton 
      onClick={() => toggleTheme('corporate')}
      sx={{
        borderRadius: '8px',
        justifyContent: 'center',
        flexDirection: 'column',
        py: 1,
        bgcolor: !isDark ? '#fff' : 'transparent',
        boxShadow: !isDark ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        color: !isDark ? '#090979' : 'inherit',
        '&:hover': { bgcolor: !isDark ? '#fff' : 'rgba(255,255,255,0.05)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Light</Typography>
      </Box>
    </ListItemButton>

    <ListItemButton 
      onClick={() => toggleTheme('dark')}
      sx={{
        borderRadius: '8px',
        justifyContent: 'center',
        flexDirection: 'column',
        py: 1,
        bgcolor: isDark ? '#090979' : 'transparent',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        color: isDark ? '#fff' : 'inherit',
        '&:hover': { bgcolor: isDark ? '#090979' : 'rgba(0,0,0,0.05)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Dark</Typography>
      </Box>
    </ListItemButton>
  </Box>
  
  <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#eee' }} />
  
  <MenuItem onClick={() => router.push('/perfil')} sx={{ borderRadius: '8px' }}>
    <ListItemIcon><Settings fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
    Ajustes de Cuenta
  </MenuItem>
</Menu>


           
          </Box>
       
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer variant="permanent" sx={{
        width: open ? drawerWidth : 70,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 70,
          backgroundColor: themeConfig.sidebarBg,///bar
          backdropFilter: isDark ? 'blur(25px)' : 'none',
          color: '#ffffff',
          marginTop: '64px',
          height: 'calc(100% - 64px)',
          border: 'none',
          transition: 'width 0.3s ease, background-color 0.4s',
          overflowX: 'hidden'
        },
      }}>
        <List sx={{ pt: 2 }}>
          <ListItemButton onClick={() => router.push('/home')} selected={pathname === '/home'}>
            <ListItemIcon sx={{ color: '#fff' }}><Dashboard /></ListItemIcon>
            {open && <ListItemText primary="Dashboard" sx={{ '& span': { fontWeight: 500 } }} />}
          </ListItemButton>

          <ListItemButton onClick={() => setUsersOpen(!usersOpen)}>
            <ListItemIcon sx={{ color: '#fff' }}><People /></ListItemIcon>
            {open && <ListItemText primary="Gestión" sx={{ '& span': { fontWeight: 500 } }} />}
            {open && (usersOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>

          <Collapse in={usersOpen && open} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/user')}>
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)' }}><People fontSize="small" /></ListItemIcon>
                <ListItemText primary="Usuarios" />
              </ListItemButton>
            </List>
          </Collapse>

          

             <ListItemButton onClick={() => setServicesOpen(!servicesOpen)}>
            <ListItemIcon sx={{ color: '#fff' }}><People /></ListItemIcon>
            {open && <ListItemText primary="Servicios" sx={{ '& span': { fontWeight: 500 } }} />}
            {open && (servicesOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
          <Collapse in={servicesOpen && open} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/services/rbs')}>
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)' }}><People fontSize="small" /></ListItemIcon>
                <ListItemText primary="RBS" />
              </ListItemButton>
            </List>
          </Collapse>
          <Collapse in={servicesOpen && open} timeout="auto">
          <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/services/dog')}>
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)' }}><People fontSize="small" /></ListItemIcon>
                <ListItemText primary="DOG" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>

        <Box sx={{ mt: 'auto', pb: 2 }}>
          <ListItemButton onClick={() => { localStorage.clear(); router.push('/'); }} sx={{ color: '#ff5252' }}>
            <ListItemIcon sx={{ color: '#ff5252' }}><Logout /></ListItemIcon>
            {open && <ListItemText primary="Cerrar Sesión" />}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, md: 4 }, 
        mt: '64px', 
        display: 'flex',
        
        alignItems: 'center'
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '1400px',
          minHeight: '80vh',
          p: 4,
          
          color: themeConfig.textColor,
          transition: 'all 0.4s ease'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}