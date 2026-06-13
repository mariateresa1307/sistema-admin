"use client";
import * as React from "react";
import {
  Typography, TextField, MenuItem, Box, Grid
} from "@mui/material";
import { Timeline as TimelineIcon, BugReport as BugReportIcon } from "@mui/icons-material";
import { MiscellaneousItem } from "../baseMiscellaneousModal";

interface SolucionCasoFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  causasRaiz: MiscellaneousItem[];
  onCausaRaizChange: (causaId: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

export const SolucionCasoFields = ({
  isOpen,
  initialData,
  causasRaiz,
  onCausaRaizChange,
  onValidate,
}: SolucionCasoFieldsProps) => {
  const [causaRaizSeleccionada, setCausaRaizSeleccionada] = React.useState("");

  // Inicializar valor al editar
  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.padreId) {
        setCausaRaizSeleccionada(initialData.padreId);
      } else {
        setCausaRaizSeleccionada("");
      }
    }
  }, [initialData, isOpen]);

  // Notificar al padre cuando cambia la causa raíz
  React.useEffect(() => {
    onCausaRaizChange(causaRaizSeleccionada);
  }, [causaRaizSeleccionada, onCausaRaizChange]);

  // Registrar función de validación
  React.useEffect(() => {
    onValidate(() => {
      return !!causaRaizSeleccionada;
    });
  }, [causaRaizSeleccionada, onValidate]);

  return (
    <Grid size={12}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          color: "#f57c00",
        }}
      >
        <TimelineIcon fontSize="small" />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Causa Raíz *
        </Typography>
      </Box>

      {causasRaiz.length === 0 ? (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3e0",
            borderRadius: 1,
            border: "1px solid #ffb74d",
          }}
        >
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ No hay causas raíz disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Primero debes crear causas raíz desde el tab de Causa Raíz
          </Typography>
        </Box>
      ) : (
        <TextField
          select
          fullWidth
          value={causaRaizSeleccionada}
          onChange={(e) => setCausaRaizSeleccionada(e.target.value)}
          size="small"
          required
          helperText="Selecciona la causa raíz asociada a esta solución"
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f57c00",
            },
          }}
        >
          <MenuItem value="" disabled>
            <Typography variant="body2" color="text.secondary">
              -- Selecciona una causa raíz --
            </Typography>
          </MenuItem>
          {causasRaiz.map((causa) => (
            <MenuItem key={causa._id || causa.id} value={causa._id || causa.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BugReportIcon sx={{ fontSize: 16, color: "#d32f2f" }} />
                <Typography>{causa.valor}</Typography>
                {causa.descripcion && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    - {causa.descripcion}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      )}
    </Grid>
  );
};