"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Collapse,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Grid,
} from "@mui/material";
import {
  Dashboard,
  People,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Logout,
  Settings,
} from "@mui/icons-material";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import Image from "next/image";

const drawerWidth = 260;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(true);
  const [usersOpen, setUsersOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { toggleTheme, isDark } = useTheme();

  const [userData, setUserData] = React.useState({
    primerNombre: "U",
    primerApellido: "S",
  });

  React.useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) setUserData(JSON.parse(storedUser));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* HEADER BAR */}
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/NETUNO_logo.png"
              alt="Logo"
              width={120}
              height={40}
              style={{
                filter: "brightness(0) invert(1)",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 38,
                height: 38,
                ml: 2,
              }}
            >
              {userData.primerNombre[0]}
            </Avatar>
            <Tooltip title="Configuración de Interfaz">
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ color: "inherit", mx: 1 }}
              >
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

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  p: 0.5,
                  borderRadius: "12px",
                  bgcolor: "background.default",
                }}
              >
                <ListItemButton
                  onClick={() => {
                    toggleTheme("corporate");
                    setAnchorEl(null);
                  }}
                  sx={{
                    borderRadius: "8px",
                    justifyContent: "center",
                    flexDirection: "column",
                    py: 1,
                    bgcolor: isDark ? "background.default" : "primary.main",
                    color: isDark ? "secondary.main" : "secondary.main",
                    "&:hover": {
                      bgcolor: isDark
                        ? "background.default"
                        : "background.default",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Light
                    </Typography>
                  </Box>
                </ListItemButton>

                <ListItemButton
                  onClick={() => {
                    toggleTheme("dark");
                    // setAnchorEl(null);
                  }}
                  sx={{
                    borderRadius: "8px",
                    justifyContent: "center",
                    py: 1,
                    bgcolor: !isDark ? "background.default" : "primary.main",
                    color: "secondary.main",
                    "&:hover": {
                      bgcolor:
                        isDark ? "primary.main" : "action.hover",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Dark
                  </Typography>
                </ListItemButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              <MenuItem
                onClick={() => router.push("/perfil")}
                sx={{ borderRadius: "8px" }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" sx={{ color: "inherit" }} />
                </ListItemIcon>
                Ajustes de Cuenta
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            color: "text.primary",
            marginTop: "64px",
            height: "calc(100% - 64px)",
            border: "none",
            transition: "width 0.3s ease",
            overflowX: "hidden",
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          <ListItemButton
            onClick={() => router.push("/home")}
            selected={pathname === "/home"}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "secondary.main" }}>
              <Dashboard />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Dashboard"
                sx={{ "& span": { fontWeight: 500 } }}
              />
            )}
          </ListItemButton>

          <ListItemButton onClick={() => setUsersOpen(!usersOpen)}>
            <ListItemIcon sx={{ color: "secondary.main" }}>
              <People />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Gestión"
                sx={{ "& span": { fontWeight: 500 } }}
              />
            )}
            {open && (usersOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>

          <Collapse in={usersOpen && open} timeout="auto">
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/user")}
              >
                <ListItemIcon sx={{ color: "primary.main" }}>
                  <People fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Usuarios"
                  sx={{ "& span": { color: "text.secondary" } }}
                />
              </ListItemButton>
               <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => router.push("/admin")}
              >
                <ListItemIcon sx={{ color: "primary.main" }}>
                  <People fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Auditoría"
                  sx={{ "& span": { color: "text.secondary" } }}
                />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            onClick={() => router.push("/servicios")}
            selected={pathname === "/servicios"}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                "&:hover": {
                  backgroundColor: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: "secondary.main" }}>
              <People fontSize="small" />
            </ListItemIcon>
            {open && <ListItemText primary="servicios" />}
          </ListItemButton>
        </List>

        <Box sx={{ mt: "auto", pb: 2 }}>
          <ListItemButton
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <Logout />
            </ListItemIcon>
            {open && <ListItemText primary="Cerrar Sesión" />}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <Box id="test" component="main" sx={{ paddingTop: 10, width: "100%" }}>
        <Grid container justifyContent={"center"}>
          <Grid size={11}>{children}</Grid>
        </Grid>
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
