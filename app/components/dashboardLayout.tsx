"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Box, Drawer, Button, AppBar, Toolbar, List, Typography, IconButton, 
  ListItemButton, ListItemIcon, ListItemText, Avatar, Collapse, Menu, 
  MenuItem, Tooltip, Divider, Stack
} from "@mui/material";
import { 
  Dashboard, People, ExpandLess, ExpandMore, Logout, Settings, 
  VerifiedUser, Assessment, Lock
} from "@mui/icons-material";
import { ThemeProvider, useTheme, type ThemeMode } from "../context/ThemeContext";
import { HomeRefreshProvider, useHomeRefresh } from "../context/homeRefreshContext";
import { useAuth } from "../context/authContext";
import { filterMenuByRole } from "../utils/permissions";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TicketModal from "../home/ticketModal";
import { motion } from "motion/react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TuneIcon from '@mui/icons-material/Tune';
import { logout } from '@/lib/api'; 
import { NotificationBell } from '../components/NotificationBell';
import { ChangePasswordModal } from "../components/ChangePasswordModal"; 
import api from '@/lib/api'; 

const DRAWER_WIDTH = 260;
const APP_BAR_HEIGHT = 64;

type MenuItemType = {
  label: string;
  path: string;
  icon: React.ReactElement;
  module?: string;
  children?: { label: string; path: string; icon: React.ReactElement; module?: string }[];
};

type UserData = {
  primerNombre: string;
  primerApellido: string;
  email?: string;
};

const MENU_ITEMS: MenuItemType[] = [
  { label: "Dashboard", path: "/home", icon: <Dashboard />, module: "dashboard" },
  {
    label: "Gestión", path: "#", icon: <People />,
    children: [
      { label: "Usuarios", path: "/user", icon: <People fontSize="small" />, module: "usuarios" },
      { label: "Reportes", path: "/report", icon: <Assessment fontSize="small" />, module: "reportes" },
      { label: "Configuracion", path: "/miscellaneous", icon: <TuneIcon fontSize="small" />, module: "miscellaneous" },
      { label: "Auditoría", path: "/admin", icon: <VerifiedUser fontSize="small" />, module: "auditoria" },
    ],
  },
  { label: "Servicios", path: "/servicios", icon: <People fontSize="small" />, module: "servicios" },
];

const sharedStyles = {
  selectedButton: {
    "&.Mui-selected": { borderRadius: "8px", marginLeft: 1, marginRight: 1, backgroundColor: "primary.main", "&:hover": { backgroundColor: "primary.main" } },
  },
  iconPrimary: { color: "primary.main" },
  iconSecondary: { color: "secondary.main" },
  textSecondary: { "& span": { color: "text.secondary" } },
};

const ThemeSwitcher = React.memo<{ isDark: boolean; onToggle: (mode: ThemeMode) => void; onClose: () => void }>(({ isDark, onToggle, onClose }) => (
  <Box sx={{ display: "flex", gap: 1, p: 0.5, borderRadius: "12px", bgcolor: "background.default" }}>
    {(["corporate", "dark"] as ThemeMode[]).map((mode) => {
      const isActive = (mode === "dark" && isDark) || (mode === "corporate" && !isDark);
      return (
        <ListItemButton key={mode} onClick={() => { onToggle(mode); onClose(); }}
          sx={{ borderRadius: "8px", justifyContent: "center", py: 1, bgcolor: isActive ? "primary.main" : "background.default", color: "secondary.main", "&:hover": { bgcolor: isActive ? "primary.main" : "action.hover" } }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{mode === "corporate" ? "Light" : "Dark"}</Typography>
        </ListItemButton>
      );
    })}
  </Box>
));
ThemeSwitcher.displayName = "ThemeSwitcher";

const UserMenu = React.memo<{ onThemeToggle: (mode: ThemeMode) => void; isDark: boolean; onNavigate: (path: string) => void }>(({ onThemeToggle, isDark, onNavigate }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pwdModalOpen, setPwdModalOpen] = React.useState(false);
  const { refreshHomeData } = useHomeRefresh();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserData({ 
          primerNombre: parsed.primerNombre || "U", 
          primerApellido: parsed.primerApellido || "S",
          email: parsed.email || ""
        });
      } catch {
        setUserData({ primerNombre: "U", primerApellido: "S", email: "" });
      }
    } else {
      setUserData({ primerNombre: "U", primerApellido: "S", email: "" });
    }
  }, []);

  const initial = userData ? userData.primerNombre[0]?.toUpperCase() : "U";

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      // await logout();
    } catch (error) {
      console.error('Error durante el logout:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="contained" startIcon={<AddCircleIcon fontSize="large" />} onClick={() => setModalOpen(true)}
            sx={{ backgroundColor: "primary.light", borderRadius: "9px", px: 2, py: 1, "&:hover": { bgcolor: "#5757c7" } }}>
            Ticket
          </Button>
        </Box>
      </motion.div>

      <TicketModal open={modalOpen} onClose={() => { setModalOpen(false); refreshHomeData(); }} onSave={() => setModalOpen(false)} />
      
    

      {/* 👤 Avatar con Menú de Usuario Integrado */}
      <Tooltip title="Cuenta y Configuración">
        <Avatar 
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ 
            bgcolor: "secondary.main", 
            width: 38, 
            height: 38, 
            ml: 2,
            cursor: 'pointer',
            '&:hover': { 
              bgcolor: 'primary.dark',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease'
            }
          }}
        >
          {initial}
        </Avatar>
      </Tooltip>

      {/* Menú del Avatar (Configuración + Perfil + Logout) */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            p: 1,
            width: 280,
            borderRadius: 3,
            bgcolor: "background.paper",
            backdropFilter: "blur(10px)",
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header con información del usuario */}
        <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {userData?.primerNombre} {userData?.primerApellido}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {userData?.email || 'usuario@noc.com'}
          </Typography>
        </Box>

        <MenuItem 
          onClick={() => { 
            setAnchorEl(null); 
            setPwdModalOpen(true); 
          }} 
          sx={{ borderRadius: 2, py: 1.5, my: 0.5 }}
        >
          <ListItemIcon>
            <Lock fontSize="small" sx={{ color: 'primary.main' }} />
          </ListItemIcon>
          <Typography sx={{ fontWeight: 500 }}>Cambiar Contraseña</Typography>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Cerrar Sesión menu*/}
        <MenuItem 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: 2, 
            py: 1.5, 
            my: 0.5,
            color: 'error.main',
            '&:hover': { bgcolor: 'error.lighter' }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <Typography sx={{ fontWeight: 600 }}>Cerrar Sesión</Typography>
        </MenuItem>
      </Menu>

        {/* ✅ COMPONENTE DE NOTIFICACIONES INTEGRADO (Reemplaza todo el menú hardcodeado anterior) */}
      <NotificationBell />

      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />
    </Box>
  );
});
UserMenu.displayName = "UserMenu";

const SidebarItem = React.memo<{ item: MenuItemType; pathname: string; isOpen: boolean; onNavigate: (path: string) => void }>(({ item, pathname, isOpen, onNavigate }) => {
  const [subOpen, setSubOpen] = React.useState(true);
  const hasChildren = !!item.children;
  const isSelected = pathname === item.path;

  return (
    <>
      <ListItemButton onClick={() => hasChildren ? setSubOpen(!subOpen) : onNavigate(item.path)} selected={isSelected} sx={sharedStyles.selectedButton}>
        <ListItemIcon sx={sharedStyles.iconSecondary}>{item.icon}</ListItemIcon>
        {isOpen && <ListItemText primary={item.label} sx={{ "& span": { fontWeight: 500 } }} />}
        {isOpen && hasChildren && (subOpen ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
      {hasChildren && (
        <Collapse in={subOpen && isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <ListItemButton key={child.path} sx={{ pl: 4 }} onClick={() => onNavigate(child.path)} selected={pathname === child.path}>
                <ListItemIcon sx={sharedStyles.iconPrimary}>{child.icon}</ListItemIcon>
                <ListItemText primary={child.label} sx={sharedStyles.textSecondary} />
              </ListItemButton>
            ))}
            <Divider sx={{ my: 1, mx: 2, opacity: 0.3 }} />
          </List>
        </Collapse>
      )}
    </>
  );
});
SidebarItem.displayName = "SidebarItem";

const Sidebar = React.memo<{ pathname: string; onNavigate: (path: string) => void; onLogout: () => void }>(({ pathname, onNavigate, onLogout }) => {
  const [open] = React.useState(true);
  const { user, isLoading } = useAuth();
  const filteredMenuItems = React.useMemo(() => filterMenuByRole(MENU_ITEMS, user?.role), [user?.role]);

  if (isLoading && !user) return <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, marginTop: `${APP_BAR_HEIGHT}px`, height: `calc(100% - ${APP_BAR_HEIGHT}px)`, border: "none", display: "flex", alignItems: "center", justifyContent: "center" } }}><Typography variant="body2" color="text.secondary">Cargando menú...</Typography></Drawer>;
  if (!user) return <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, marginTop: `${APP_BAR_HEIGHT}px`, height: `calc(100% - ${APP_BAR_HEIGHT}px)`, border: "none" } }}><List sx={{ pt: 2, flexGrow: 1 }}><Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Sin permisos</Typography></List></Drawer>;

  return (
    <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, marginTop: `${APP_BAR_HEIGHT}px`, height: `calc(100% - ${APP_BAR_HEIGHT}px)`, border: "none", transition: "width 0.3s ease", overflowX: "hidden" } }}>
      <List sx={{ pt: 2, flexGrow: 1 }}>
        {filteredMenuItems.map((item) => <SidebarItem key={item.path} item={item} pathname={pathname} isOpen={open} onNavigate={onNavigate} />)}
      </List>
    </Drawer>
  );
});
Sidebar.displayName = "Sidebar";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();
  
  const handleNavigate = React.useCallback((path: string) => router.push(path), [router]);
  const handleLogout = React.useCallback(async () => {
    try { /* await logout(); */ } catch (error) { console.error('Error durante el logout:', error); } 
    finally { localStorage.clear(); window.location.href = '/'; }
  }, []);

  // ✅ HEARTBEAT: Mantiene la sesión del usuario como "activa" para recibir notificaciones
  React.useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await api.post('/user-sessions/heartbeat');
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    };

    // Enviar heartbeat cada 2 minutos
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
      <AppBar elevation={0} position="fixed" sx={{ zIndex: 1201, backdropFilter: "blur(15px)", transition: "background-color 0.4s, color 0.4s" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <AcUnitIcon />
          <UserMenu isDark={isDark} onThemeToggle={toggleTheme} onNavigate={handleNavigate} />
        </Toolbar>
      </AppBar>
      <Sidebar pathname={pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
      <Box component="main" sx={{ paddingTop: `${APP_BAR_HEIGHT + 32}px`, width: "100%", minHeight: "100vh", boxSizing: "border-box" }}>
        <Stack direction="row" justifyContent="center" sx={{ maxWidth: 1400, mx: "auto", px: 2 }}>
          <Box sx={{ width: "91.666%" }}>{children}</Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HomeRefreshProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </HomeRefreshProvider>
    </ThemeProvider>
  );
}