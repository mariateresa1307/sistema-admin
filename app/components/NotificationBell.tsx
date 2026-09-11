"use client";
import React, { useState, useEffect } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  Typography,
  Box,
  Button,
  Divider,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningIcon from "@mui/icons-material/Warning";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from "@/lib/api";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ticket_auto_assignment':
      return <AssignmentIcon sx={{ color: '#1976d2' }} />;
    case 'ticket_assignment':
      return <AssignmentIcon sx={{ color: '#2e7d32' }} />;
    case 'ticket_closure':
      return <ConfirmationNumberIcon sx={{ color: '#4caf50' }} />;
    case 'ticket_delay_alert':
      return <WarningIcon sx={{ color: '#f57c00' }} />;
    case 'login_stale_alert':
      return <WarningIcon sx={{ color: '#d32f2f' }} />;
    case 'login_alert':
      return <AssignmentIcon sx={{ color: '#1976d2' }} />;
    default:
      return <NotificationsIcon sx={{ color: '#64748b' }} />;
  }
};

export const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    // ✅ POLLING cada 2 minutos (120000 ms)
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res?.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
  };

  // ✅ CORREGIDO: Usar .filter() para eliminarla de la vista, ya que el backend la borra
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // ✅ CORREGIDO: Vaciar el array local completamente
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: "relative",
          color: "white",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          marginLeft: "15px",
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#080769",
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Notificaciones{" "}
            {unreadCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.2,
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  fontSize: "0.75rem",
                }}
              >
                {unreadCount}
              </Box>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "0.8rem",
              }}
            >
              Marcar todas
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ maxHeight: 400, overflow: "auto", p: 0 }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">Cargando...</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon
                sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }}
              />
              <Typography color="text.secondary" variant="body2">
                No tienes notificaciones
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <React.Fragment key={notif._id}>
                <ListItemButton
                  onClick={() => handleMarkAsRead(notif._id)}
                  sx={{
                    bgcolor: notif.read ? "transparent" : "#f0f4ff",
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: notif.read ? "#f8fafc" : "#e3f2fd",
                    },
                    borderLeft: notif.read
                      ? "3px solid transparent"
                      : "3px solid #1976d2",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notif.type)}
                  </ListItemIcon>

                  <Box sx={{ flex: 1, ml: 1 }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        fontWeight: notif.read ? 400 : 600,
                        color: notif.read ? "#64748b" : "#0f172a",
                      }}
                    >
                      {notif.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ mt: 0.5, fontSize: "0.8rem", color: "#64748b" }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                      }}
                    >
                      {new Date(notif.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>

                  {!notif.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        bgcolor: "#1976d2",
                        borderRadius: "50%",
                        ml: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </ListItemButton>
                <Divider sx={{ m: 0 }} />
              </React.Fragment>
            ))
          )}
        </List>
      </Popover>
    </>
  );
};