"use client";
import * as React from "react";
import { Typography, TextField, MenuItem, Box, Grid, ListSubheader } from "@mui/material";
import { Category as CategoryIcon, AccountTree as AccountTreeIcon } from "@mui/icons-material";
import { MiscellaneousItem } from "../baseMiscellaneousModal";

interface DetalleFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  subcategorias: MiscellaneousItem[];
  onSubcategoriaChange: (subcategoriaId: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

export const DetalleFields = ({
  isOpen,
  initialData,
  subcategorias,
  onSubcategoriaChange,
  onValidate,
}: DetalleFieldsProps) => {
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = React.useState("");

  // Agrupar subcategorías por categoría
  const subcategoriasPorCategoria = React.useMemo(() => {
    const agrupadas: Record<string, MiscellaneousItem[]> = {};

    subcategorias.forEach((sub) => {
      const catNombre = sub.padreNombre || "Sin categoría";
      if (!agrupadas[catNombre]) {
        agrupadas[catNombre] = [];
      }
      agrupadas[catNombre].push(sub);
    });

    return agrupadas;
  }, [subcategorias]);

  // Crear array plano de elementos para el Select (sin Fragment)
  const selectChildren = React.useMemo(() => {
    const children: React.ReactNode[] = [
      <MenuItem key="placeholder" value="" disabled>
        <Typography variant="body2" color="text.secondary">
          -- Selecciona una subcategoría --
        </Typography>
      </MenuItem>,
    ];

    Object.entries(subcategoriasPorCategoria).forEach(([catNombre, subs]) => {
      // Agregar header del grupo con ListSubheader
      children.push(
        <ListSubheader
          key={`header-${catNombre}`}
          sx={{
            bgcolor: "#e3f2fd",
            color: "#1976d2",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            lineHeight: "32px",
            display: "flex",
            alignItems: "center",
            gap: 1,
            py: 0,
            borderBottom: "1px solid #bbdefb",
          }}
        >
          <CategoryIcon sx={{ fontSize: 14 }} />
          {catNombre}
        </ListSubheader>
      );

      // Agregar subcategorías del grupo
      subs.forEach((sub) => {
        children.push(
          <MenuItem
            key={sub._id || sub.id}
            value={sub._id || sub.id}
            sx={{
              pl: 4,
              "&:hover": {
                bgcolor: "#fce4ec",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountTreeIcon sx={{ fontSize: 16, color: "#c2185b" }} />
              <Typography>{sub.valor}</Typography>
              {sub.descripcion && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  - {sub.descripcion}
                </Typography>
              )}
            </Box>
          </MenuItem>
        );
      });
    });

    return children;
  }, [subcategoriasPorCategoria]);

  // Inicializar valor al editar
  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.padreId) {
        setSubcategoriaSeleccionada(initialData.padreId);
      } else {
        setSubcategoriaSeleccionada("");
      }
    }
  }, [initialData, isOpen]);

  // Notificar al padre cuando cambia la subcategoría
  React.useEffect(() => {
    onSubcategoriaChange(subcategoriaSeleccionada);
  }, [subcategoriaSeleccionada, onSubcategoriaChange]);

  // Registrar función de validación
  React.useEffect(() => {
    onValidate(() => {
      return !!subcategoriaSeleccionada;
    });
  }, [subcategoriaSeleccionada, onValidate]);

  return (
    <Grid size={12}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          color: "#c2185b",
        }}
      >
        <AccountTreeIcon fontSize="small" />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Subcategoría *
        </Typography>
      </Box>

      {subcategorias.length === 0 ? (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3e0",
            borderRadius: 1,
            border: "1px solid #ffb74d",
          }}
        >
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ No hay subcategorías disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Primero debes crear subcategorías desde el tab de Subcategoría
          </Typography>
        </Box>
      ) : (
        <TextField
          select
          fullWidth
          value={subcategoriaSeleccionada}
          onChange={(e) => setSubcategoriaSeleccionada(e.target.value)}
          size="small"
          required
          helperText="Selecciona la subcategoría a la que pertenece este detalle"
          SelectProps={{
            native: false,
            MenuProps: {
              PaperProps: {
                sx: {
                  maxHeight: 300,
                },
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#c2185b",
            },
          }}
        >
          {/* ✅ Solo renderizar el array plano, sin duplicados ni Fragments */}
          {selectChildren}
        </TextField>
      )}
    </Grid>
  );
};