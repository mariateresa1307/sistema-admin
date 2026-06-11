"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, Drawer, Button, AppBar, Toolbar, List, Typography, IconButton, ListItemButton, ListItemIcon, ListItemText, Avatar, Collapse,  Menu,
  MenuItem, Tooltip, Divider, Stack} from "@mui/material";
import { Dashboard, People,  ExpandLess, ExpandMore, Logout, Settings, VerifiedUser, Assessment, } from "@mui/icons-material";
import {  ThemeProvider, useTheme, type ThemeMode} from "../context/ThemeContext";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TicketModal from "../home/ticketModal";
import { motion } from "motion/react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TuneIcon from '@mui/icons-material/Tune';

import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

const DRAWER_WIDTH = 260;
const APP_BAR_HEIGHT = 64;

type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
  children?: { label: string; path: string; icon: React.ReactElement }[];
};

type UserData = {
  primerNombre: string;
  primerApellido: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/home",
    icon: <Dashboard />,
  },
  {
    label: "Gestión",
    path: "#",
    icon: <People />,
    children: [
      { 
        label: "Usuarios", 
        path: "/user", 
        icon: <People fontSize="small" /> 
      },
      {
        label: "Reportes", // ✅ Opción agregada antes de Auditoría
        path: "/report",
        icon: <Assessment fontSize="small" />,
      },
       {
        label: "Configuracion", // ✅ Opción agregada antes de Auditoría
        path: "/miscellaneous",
        icon: <TuneIcon fontSize="small" />,
      },
      {
        label: "Auditoría",
        path: "/admin",
        icon: <VerifiedUser fontSize="small" />,
      },
    ],
  },
  {
    label: "Servicios",
    path: "/servicios",
    icon: <People fontSize="small" />,
  },
];

// ============ ESTILOS COMPARTIDOS ============
const sharedStyles = {
  selectedButton: {
    "&.Mui-selected": {
      borderRadius: "8px",
      marginLeft: 1,
      marginRight: 1,
      backgroundColor: "primary.main",
      "&:hover": { backgroundColor: "primary.main" },
    },
  },
  iconPrimary: { color: "primary.main" },
  iconSecondary: { color: "secondary.main" },
  textSecondary: { "& span": { color: "text.secondary" } },
};

// ============ HOOKS PERSONALIZADOS ============
function useUserData() {
  const [modalOpen, setModalOpen] = useState(false);
  const [userData, setUserData] = React.useState<UserData>({
    primerNombre: "U",
    primerApellido: "S",
  });
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        setUserData(JSON.parse(stored));
      } catch (err) {
        console.error("Error parsing userData:", err);
      }
    }
  }, []);

  return { userData, mounted };
}

// ============ SUBCOMPONENTES ============

const ThemeSwitcher = React.memo<{
  isDark: boolean;
  onToggle: (mode: ThemeMode) => void;
  onClose: () => void;
}>(({ isDark, onToggle, onClose }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1,
      p: 0.5,
      borderRadius: "12px",
      bgcolor: "background.default",
    }}
  >
    {(["corporate", "dark"] as ThemeMode[]).map((mode) => {
      const isActive =
        (mode === "dark" && isDark) || (mode === "corporate" && !isDark);
      return (
        <ListItemButton
          key={mode}
          onClick={() => {
            onToggle(mode);
            onClose();
          }}
          sx={{
            borderRadius: "8px",
            justifyContent: "center",
            py: 1,
            bgcolor: isActive ? "primary.main" : "background.default",
            color: "secondary.main",
            "&:hover": { bgcolor: isActive ? "primary.main" : "action.hover" },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {mode === "corporate" ? "Light" : "Dark"}
          </Typography>
        </ListItemButton>
      );
    })}
  </Box>
));
ThemeSwitcher.displayName = "ThemeSwitcher";

const UserMenu = React.memo<{
  userData: UserData;
  onThemeToggle: (mode: ThemeMode) => void;
  isDark: boolean;
  onNavigate: (path: string) => void;
}>(({ userData, onThemeToggle, isDark, onNavigate }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleSaveTicket = (data?: any) => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon fontSize="large" />}
            onClick={() => setModalOpen(true)}
            sx={{
              backgroundColor: "primary.light",
              borderRadius: "9px",
              px: 2,
              py: 1,
              "&:hover": { bgcolor: "#5757c7" },
            }}
          >
            Ticket
          </Button>
        </Box>
      </motion.div>

      <TicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTicket}
      />
      
      <Avatar sx={{ bgcolor: "secondary.main", width: 38, height: 38, ml: 2 }}>
        {userData.primerNombre[0]?.toUpperCase()}
      </Avatar>

      <Tooltip title="Configuración de Interfaz">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: "inherit", mx: 2 }}
          aria-label="Abrir menú de configuración"
          aria-controls={open ? "settings-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <SettingsSuggestIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            p: 2,
            width: 280,
            borderRadius: "16px",
            bgcolor: "background.paper",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, fontWeight: 700, opacity: 0.8 }}
        >
          CONFIGURACIÓN
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1,
            fontWeight: 600,
            letterSpacing: 1,
            opacity: 0.7,
          }}
        >
          MODO DE INTERFAZ
        </Typography>

        <ThemeSwitcher
          isDark={isDark}
          onToggle={onThemeToggle}
          onClose={() => setAnchorEl(null)}
        />

        <Divider sx={{ my: 2 }} />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onNavigate("/perfil");
          }}
          sx={{ borderRadius: "8px" }}
        >
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: "inherit" }} />
          </ListItemIcon>
          Ajustes de Cuenta
        </MenuItem>
      </Menu>
    </Box>
  );
});
UserMenu.displayName = "UserMenu";

const SidebarItem = React.memo<{
  item: MenuItem;
  pathname: string;
  isOpen: boolean;
  onNavigate: (path: string) => void;
}>(({ item, pathname, isOpen, onNavigate }) => {
  const [subOpen, setSubOpen] = React.useState(true);
  const hasChildren = !!item.children;
  const isSelected = pathname === item.path;

  const handleClick = () => {
    if (hasChildren) {
      setSubOpen((prev) => !prev);
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        selected={isSelected}
        sx={sharedStyles.selectedButton}
      >
        <ListItemIcon sx={sharedStyles.iconSecondary}>{item.icon}</ListItemIcon>
        {isOpen && (
          <ListItemText
            primary={item.label}
            sx={{ "& span": { fontWeight: 500 } }}
          />
        )}
        {isOpen && hasChildren && (subOpen ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={subOpen && isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <ListItemButton
                key={child.path}
                sx={{ pl: 4 }}
                onClick={() => onNavigate(child.path)}
                selected={pathname === child.path}
              >
                <ListItemIcon sx={sharedStyles.iconPrimary}>
                  {child.icon}
                </ListItemIcon>
                <ListItemText
                  primary={child.label}
                  sx={sharedStyles.textSecondary}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
});
SidebarItem.displayName = "SidebarItem";

const Sidebar = React.memo<{
  pathname: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}>(({ pathname, onNavigate, onLogout }) => {
  const [open] = React.useState(true);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          color: "text.primary",
          marginTop: `${APP_BAR_HEIGHT}px`,
          height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
          border: "none",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      <List sx={{ pt: 2, flexGrow: 1 }}>
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            pathname={pathname}
            isOpen={open}
            onNavigate={onNavigate}
          />
        ))}
      </List>

      <Box sx={{ pb: 2 }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            color: "error.main",
            "&:hover": { bgcolor: "error.main", color: "white" },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <Logout />
          </ListItemIcon>
          {open && <ListItemText primary="Cerrar Sesión" />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
});
Sidebar.displayName = "Sidebar";

// ============ COMPONENTE PRINCIPAL ============
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme, isDark } = useTheme();
  const { userData } = useUserData();

  const handleNavigate = React.useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  const handleLogout = React.useCallback(() => {
    localStorage.clear();
    router.push("/");
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          zIndex: 1201,
          backdropFilter: "blur(15px)",
          transition: "background-color 0.4s, color 0.4s",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <AcUnitIcon />
          <UserMenu
            userData={userData}
            isDark={isDark}
            onThemeToggle={toggleTheme}
            onNavigate={handleNavigate}
          />
        </Toolbar>
      </AppBar>

      <Sidebar
        pathname={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <Box
        component="main"
        sx={{
          paddingTop: `${APP_BAR_HEIGHT + 32}px`,
          width: "100%",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Stack
          direction="row"
          justifyContent="center"
          sx={{ maxWidth: 1400, mx: "auto", px: 2 }}
        >
          <Box sx={{ width: "91.666%" }}>{children}</Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeProvider>
  );
}