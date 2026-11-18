"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertTitle, Button, Box } from "@mui/material";
import { WarningAmberRounded, LockClockRounded, LogoutRounded } from "@mui/icons-material";

const MENSAJES: Record<string, { title: string; body: string; severity: "warning" | "info" | "success"; icon: React.ReactNode }> = {
  inactividad: {
    title: "Sesión cerrada por inactividad",
    body: "Tu sesión se cerró automáticamente porque no hubo actividad durante un tiempo. Por seguridad, inicia sesión nuevamente.",
    severity: "warning",
    icon: <LockClockRounded />,
  },
  turno: {
    title: "Tu turno finalizó",
    body: "Se cerró tu sesión porque terminó el horario asignado. Si necesitas continuar, inicia sesión nuevamente.",
    severity: "info",
    icon: <WarningAmberRounded />,
  },
  expirada: {
    title: "Sesión expirada",
    body: "Tu sesión expiró en el servidor. Inicia sesión nuevamente para continuar.",
    severity: "warning",
    icon: <LockClockRounded />,
  },
  manual: {
    title: "Sesión cerrada",
    body: "Cerraste tu sesión correctamente. ¡Hasta pronto!",
    severity: "success",
    icon: <LogoutRounded />,
  },
};

export const SessionExpiredNotice = () => {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  if (!reason || !MENSAJES[reason]) return null;

  const cfg = MENSAJES[reason];

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Alert
        severity={cfg.severity}
        icon={cfg.icon}
        sx={{
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          "& .MuiAlert-action": { alignItems: "center" },
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              // Limpia el query param sin recargar la página
              window.history.replaceState(null, "", "/");
            }}
          >
            Ocultar
          </Button>
        }
      >
        <AlertTitle sx={{ fontWeight: 700 }}>{cfg.title}</AlertTitle>
        {cfg.body}
      </Alert>
    </Box>
  );
};