"use client";
import * as React from "react";
import {
  Typography, TextField, MenuItem, Box, Grid
} from "@mui/material";
import { Map as MapIcon } from "@mui/icons-material";
import { MiscellaneousItem } from "./baseMiscellaneousModal";

interface CiudadFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  onEstadoChange: (estadoId: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

export const CiudadFields = ({
  isOpen,
  initialData,
  onEstadoChange,
  onValidate,
}: CiudadFieldsProps) => {
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [loadingEstados, setLoadingEstados] = React.useState(false);

  // Cargar estados cuando se abre el modal
  React.useEffect(() => {
    const cargarEstados = async () => {
      if (isOpen) {
        setLoadingEstados(true);
        try {
          const res = await fetch("http://localhost:4000/miscellaneous?categoria=ESTADO");
          const data = await res.json();
          const estadosData = Array.isArray(data) ? data : [];
          const estadosActivos = estadosData.filter((e: MiscellaneousItem) => e.activo !== false);
          setEstados(estadosActivos);
        } catch (error) {
          console.error("Error al cargar estados:", error);
        } finally {
          setLoadingEstados(false);
        }
      }
    };
    cargarEstados();
  }, [isOpen]);

  // Inicializar estado seleccionado al editar
  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.padreId) {
        setEstadoSeleccionado(initialData.padreId);
      } else {
        setEstadoSeleccionado("");
      }
    }
  }, [initialData, isOpen]);

  // Notificar al padre cuando cambia el estado
  React.useEffect(() => {
    onEstadoChange(estadoSeleccionado);
  }, [estadoSeleccionado, onEstadoChange]);

  // Registrar función de validación en el padre
  React.useEffect(() => {
    onValidate(() => {
      if (!estadoSeleccionado) {
        return false;
      }
      return true;
    });
  }, [estadoSeleccionado, onValidate]);

  return (
    <Grid size={12}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          color: "#1976d2",
        }}
      >
        <MapIcon fontSize="small" />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Estado *
        </Typography>
      </Box>

      {loadingEstados ? (
        <Typography variant="body2" color="text.secondary">
          Cargando estados...
        </Typography>
      ) : estados.length === 0 ? (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3e0",
            borderRadius: 1,
            border: "1px solid #ffb74d",
          }}
        >
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ No hay estados disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Primero debes crear estados desde el botón "Gestionar Estados" en el tab de Ciudad
          </Typography>
        </Box>
      ) : (
        <TextField
          select
          fullWidth
          value={estadoSeleccionado}
          onChange={(e) => setEstadoSeleccionado(e.target.value)}
          size="small"
          required
          helperText="Selecciona el estado al que pertenece esta ciudad"
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2",
            },
          }}
        >
          <MenuItem value="" disabled>
            <Typography variant="body2" color="text.secondary">
              -- Selecciona un estado --
            </Typography>
          </MenuItem>
          {estados.map((estado) => (
            <MenuItem key={estado._id || estado.id} value={estado._id || estado.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MapIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                <Typography>{estado.valor}</Typography>
                {estado.descripcion && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    - {estado.descripcion}
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