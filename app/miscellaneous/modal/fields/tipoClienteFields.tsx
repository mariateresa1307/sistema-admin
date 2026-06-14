"use client";
import * as React from "react";
import { Typography, TextField, MenuItem, Grid } from "@mui/material";
import { NIVEL_SEVERIDAD } from "app/utils/constants"; // ✅ Usar constantes

interface TipoClienteFieldsProps {
  isOpen: boolean;
  initialData?: any;
  onNivelSeveridadChange: (nivel: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

export const TipoClienteFields = ({
  isOpen,
  initialData,
  onNivelSeveridadChange,
  onValidate,
}: TipoClienteFieldsProps) => {
  const [nivelSeleccionado, setNivelSeleccionado] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.nivelSeveridad) {
        setNivelSeleccionado(initialData.nivelSeveridad);
      } else {
        setNivelSeleccionado("");
      }
    }
  }, [initialData, isOpen]);

  React.useEffect(() => {
    onNivelSeveridadChange(nivelSeleccionado);
    
    // Función de validación
    const validate = () => {
      return nivelSeleccionado !== "";
    };
    
    onValidate(validate);
  }, [nivelSeleccionado, onNivelSeveridadChange, onValidate]);

  return (
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
        Nivel de Severidad *
      </Typography>
      <TextField
        select
        fullWidth
        required
        label="Nivel de Severidad"
        name="nivelSeveridad"
        value={nivelSeleccionado}
        onChange={(e) => setNivelSeleccionado(e.target.value)}
        size="small"
        error={!nivelSeleccionado}
        helperText={!nivelSeleccionado ? "Seleccione un nivel de severidad" : ""}
      >
        {NIVEL_SEVERIDAD.map((nivel) => (
          <MenuItem key={nivel} value={nivel.trim()}>
            {nivel.trim()}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );
};