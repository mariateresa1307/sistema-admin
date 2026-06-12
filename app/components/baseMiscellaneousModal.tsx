"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography,
  Button, TextField, Box, Snackbar, Alert, FormControlLabel, Switch
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Close as CloseIcon } from "@mui/icons-material";

type MiscellaneousItem = {
  _id?: string;
  id?: string;
  categoria: string;
  valor: string;
  descripcion?: string;
  padreId?: string;
  padreNombre?: string;
  activo?: boolean;
  [key: string]: any; // Para campos adicionales
};

interface BaseMiscellaneousModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: MiscellaneousItem | null;
  categoria: string;
  onSave: (payload: any) => Promise<boolean>;
  children?: React.ReactNode; // Para campos personalizados
}

export const BaseMiscellaneousModal = ({
  isOpen,
  onClose,
  title = "Nuevo Elemento",
  initialData,
  categoria,
  onSave,
  children,
}: BaseMiscellaneousModalProps) => {
  const [valor, setValor] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [activo, setActivo] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Inicializar valores cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValor(initialData.valor || "");
        setDescripcion(initialData.descripcion || "");
        setActivo(initialData.activo !== false);
      } else {
        setValor("");
        setDescripcion("");
        setActivo(true);
      }
    }
  }, [initialData, isOpen]);

  const triggerNotification = (message: string, severity: "success" | "error") => {
    setNotification({ open: true, message, severity });
  };

  const handleSave = async () => {
    if (!valor.trim()) {
      triggerNotification("El valor es obligatorio", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        categoria,
        valor: valor.toUpperCase(),
        descripcion,
        activo,
      };

      // Llamar al onSave del componente padre (que agregará campos específicos)
      const success = await onSave(payload);
      
      if (success) {
        triggerNotification("Elemento guardado correctamente", "success");
        setTimeout(onClose, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      triggerNotification("Error al guardar el elemento", "error");
    } finally {
      setSaving(false);
    }
  };

  // Funciones para que los hijos puedan actualizar el payload
  const updatePayload = (field: string, value: any) => {
    // Esto se maneja en el onSave del componente padre
  };

  return (
    <>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor: notification.severity === "success" ? "#1ccf46" : "#d32f2f",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 0,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Categoría: {categoria.replace("_", " ")}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              {/* Campos personalizados de los hijos */}
              {children}

              {/* CAMPO VALOR */}
              <Grid size={12}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Valor *
                </Typography>
                <TextField
                  fullWidth
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={
                    categoria === "CIUDAD" ? "Ej: CARACAS" : "Ej: NUEVO VALOR"
                  }
                  size="small"
                  autoFocus
                />
              </Grid>

              {/* CAMPO DESCRIPCIÓN */}
              <Grid size={12}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Descripción
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional del elemento"
                  size="small"
                />
              </Grid>

              {/* SWITCH ACTIVO */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#2e7d32",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#2e7d32",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: activo ? "#2e7d32" : "#666",
                      }}
                    >
                      {activo ? "Activo" : "Inactivo"}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button onClick={onClose} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{
                bgcolor: "#000027",
                borderRadius: "8px",
                px: 4,
                textTransform: "none",
                "&:hover": { bgcolor: "#000045" },
              }}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};