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
        console.log("✅ [CategoriaRedFields] Cargado desde initialData:", initialData.tipoIncidencia);
      } else {
        setTipoIncidencia("");
        console.log("🔄 [CategoriaRedFields] Resetado a vacío");
      }
    }
  }, [initialData, isOpen]);

  React.useEffect(() => {
    console.log("📤 [CategoriaRedFields] Emitiendo al padre:", tipoIncidencia);
    onTipoIncidenciaChange(tipoIncidencia);
  }, [tipoIncidencia, onTipoIncidenciaChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("🎯 [CategoriaRedFields] Usuario seleccionó:", newValue);
    setTipoIncidencia(newValue);
  };

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
        onChange={handleChange}
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