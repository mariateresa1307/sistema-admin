"use client";
import * as React from "react";
import { Typography, TextField, MenuItem, Grid } from "@mui/material";
import { TIPO_INCIDENCIA } from "app/utils/constants";

interface CategoriaRedFieldsProps {
  isOpen: boolean;
  initialData?: any;
  onTipoIncidenciaChange: (tipo: string) => void;
}

export const CategoriaRedFields = ({
  isOpen,
  initialData,
  onTipoIncidenciaChange,
}: CategoriaRedFieldsProps) => {
  const [tipoIncidencia, setTipoIncidencia] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.tipoIncidencia) {
        setTipoIncidencia(initialData.tipoIncidencia);
      } else {
        setTipoIncidencia("");
      }
    }
  }, [initialData, isOpen]);

  React.useEffect(() => {
    onTipoIncidenciaChange(tipoIncidencia);
  }, [tipoIncidencia, onTipoIncidenciaChange]);

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
        Tipo de incidencia
      </Typography>
      <TextField
        select
        fullWidth
        required
        label="Tipo de Incidencia"
        name="tipoIncidencia"
        value={tipoIncidencia}
        onChange={(e) => setTipoIncidencia(e.target.value)}
        size="small"
      >
        {TIPO_INCIDENCIA.map((tipo) => (
          <MenuItem key={tipo} value={tipo}>
            {tipo}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );
};