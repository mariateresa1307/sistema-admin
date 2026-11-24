"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Paper, Typography, Button, Divider, Chip, CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Assignment,
  Warning,
  ConfirmationNumber,
  DoneAll,
  CheckCircle,
} from "@mui/icons-material";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/api";

interface NotificationItem {
  _id: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  ticketNumber?: string;
  createdAt?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case "ticket_auto_assignment": return <Assignment sx={{ color: "#1976d2" }} />;
    case "ticket_assignment":      return <Assignment sx={{ color: "#2e7d32" }} />;
    case "ticket_closure":         return <ConfirmationNumber sx={{ color: "#4caf50" }} />;
    case "ticket_delay_alert":
    case "login_stale_alert":      return <Warning sx={{ color: "#f57c00" }} />;
    default:                       return <NotificationsIcon sx={{ color: "#64748b" }} />;
  }
};

// ✅ ESTE "export default" ES OBLIGATORIO PARA QUE NEXT.JS COMPILE
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setNotifications(list);
      setUnreadCount(list.filter((n: NotificationItem) => !n.read).length);
    } catch (error) {
      console.error("❌ [NotificationsPage] Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleClick = async (notif: NotificationItem) => {
    try {
      await markNotificationAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (notif.type === "login_stale_alert") {
        router.push("/tickets");
      } else if (notif.ticketNumber) {
        router.push(`/tickets?openTicket=${encodeURIComponent(notif.ticketNumber)}`);
      }
    } catch (error) {
      console.error("❌ [NotificationsPage] Error al marcar:", error);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("❌ [NotificationsPage] Error:", error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid #e8ecf1",
          overflow: "hidden",
          maxWidth: 800,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            p: 3,
            bgcolor: "#080769",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <NotificationsIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Bandeja de Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} sin leer`} size="small" color="error" />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAll}
              startIcon={<DoneAll />}
              size="small"
              sx={{ color: "white", textTransform: "none", fontWeight: 600 }}
            >
              Marcar todas
            </Button>
          )}
        </Box>

        <Divider />

        <Box sx={{ p: 2, maxHeight: "70vh", overflowY: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#080769" }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }} />
              <Typography color="text.secondary">No tienes notificaciones</Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <Paper
                key={notif._id}
                onClick={() => handleClick(notif)}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: notif.read ? "#e8ecf1" : "#bbdefb",
                  bgcolor: notif.read ? "#ffffff" : "#f0f4ff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
                }}
              >
                <Box sx={{ mt: 0.5 }}>{getIcon(notif.type || "")}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: notif.read ? 500 : 700, color: "#0f172a" }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                    {notif.message}
                  </Typography>
                  {notif.createdAt && (
                    <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
                      {new Date(notif.createdAt).toLocaleString("es-ES", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </Typography>
                  )}
                </Box>
                {!notif.read && <CheckCircle sx={{ color: "#1976d2", fontSize: 20, mt: 0.5 }} />}
              </Paper>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}