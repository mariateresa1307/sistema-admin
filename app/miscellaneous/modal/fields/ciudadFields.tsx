"use client";
import * as React from "react";
import {
  Typography, TextField, MenuItem, Box, Grid, CircularProgress
} from "@mui/material";
import { Map as MapIcon, ErrorOutline as ErrorIcon } from "@mui/icons-material";
import { MiscellaneousItem } from "../baseMiscellaneousModal";
import { getMiscellaneous } from "@/lib/api";

interface CiudadFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  onEstadoChange: (estadoId: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

export const CiudadFields = React.memo(({
  isOpen,
  initialData,
  onEstadoChange,
  onValidate,
}: CiudadFieldsProps) => {
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [loadingEstados, setLoadingEstados] = React.useState(false);
  const [errorEstados, setErrorEstados] = React.useState<string | null>(null);
  
  // ✅ Cache: solo carga una vez aunque se abra/cierre el modal varias veces
  const estadosCacheRef = React.useRef<MiscellaneousItem[] | null>(null);

  // Cargar estados (con cache)
  React.useEffect(() => {
    if (!isOpen) return;

    // Si ya hay cache, usarla sin hacer fetch
    if (estadosCacheRef.current) {
      setEstados(estadosCacheRef.current);
      return;
    }

    let mounted = true;
    const cargarEstados = async () => {
      setLoadingEstados(true);
      setErrorEstados(null);
      try {
        const response = await getMiscellaneous({ categoria: "ESTADO", limit: 9999 });
        const rawData = response?.data;
        const estadosData = Array.isArray(rawData?.data)
          ? rawData.data
          : (Array.isArray(rawData) ? rawData : []);

        const estadosActivos = estadosData.filter(
          (e: MiscellaneousItem) => e.activo !== false
        );

        if (mounted) {
          estadosCacheRef.current = estadosActivos;
          setEstados(estadosActivos);
        }
      } catch (error) {
        console.error("❌ Error al cargar estados:", error);
        if (mounted) {
          setErrorEstados("No se pudieron cargar los estados. Intenta nuevamente.");
        }
      } finally {
        if (mounted) setLoadingEstados(false);
      }
    };

    cargarEstados();
    return () => { mounted = false; };
  }, [isOpen]);

  // Sincronizar con initialData al abrir el modal
  React.useEffect(() => {
    if (!isOpen) {
      setEstadoSeleccionado("");
      return;
    }

    if (initialData?.padreId) {
      setEstadoSeleccionado(String(initialData.padreId));
    } else {
      setEstadoSeleccionado("");
    }
  }, [initialData, isOpen]);

  // Notificar al padre el estado seleccionado
  React.useEffect(() => {
    if (isOpen) {
      onEstadoChange(estadoSeleccionado);
    }
  }, [estadoSeleccionado, isOpen, onEstadoChange]);

  // Registrar función de validación
  React.useEffect(() => {
    onValidate(() => {
      return !!estadoSeleccionado;
    });
  }, [estadoSeleccionado, onValidate]);

  const handleEstadoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEstadoSeleccionado(e.target.value);
  }, []);

  const handleRetry = React.useCallback(async () => {
    estadosCacheRef.current = null;
    setLoadingEstados(true);
    setErrorEstados(null);
    try {
      const response = await getMiscellaneous({ categoria: "ESTADO", limit: 9999 });
      const rawData = response?.data;
      const estadosData = Array.isArray(rawData?.data)
        ? rawData.data
        : (Array.isArray(rawData) ? rawData : []);

      const estadosActivos = estadosData.filter(
        (e: MiscellaneousItem) => e.activo !== false
      );
      estadosCacheRef.current = estadosActivos;
      setEstados(estadosActivos);
    } catch (error) {
      setErrorEstados("Error al recargar. Intenta nuevamente.");
    } finally {
      setLoadingEstados(false);
    }
  }, []);

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

      {/* Estado de carga */}
      {loadingEstados && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Cargando estados...
          </Typography>
        </Box>
      )}

      {/* Estado de error */}
      {!loadingEstados && errorEstados && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#ffebee",
            borderRadius: 1,
            border: "1px solid #ef9a9a",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ErrorIcon color="error" fontSize="small" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
              {errorEstados}
            </Typography>
          </Box>
          <TextField
            size="small"
            variant="outlined"
            onClick={handleRetry}
            sx={{ minWidth: 100 }}
            inputProps={{ readOnly: true }}
            value="Reintentar"
          />
        </Box>
      )}

      {/* Sin estados disponibles */}
      {!loadingEstados && !errorEstados && estados.length === 0 && (
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
      )}

      {/* Select de estados */}
      {!loadingEstados && !errorEstados && estados.length > 0 && (
        <TextField
          select
          fullWidth
          value={estadoSeleccionado}
          onChange={handleEstadoChange}
          size="small"
          required
          error={!estadoSeleccionado}
          helperText={
            estadoSeleccionado
              ? "Estado seleccionado correctamente"
              : "Selecciona el estado al que pertenece esta ciudad"
          }
          FormHelperTextProps={{
            sx: {
              color: estadoSeleccionado ? "#2e7d32" : "text.secondary",
              fontWeight: 500,
            },
          }}
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
            <MenuItem
              key={String(estado._id || estado.id)}
              value={String(estado._id || estado.id)}
            >
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
});

CiudadFields.displayName = "CiudadFields";