"use client";
import * as React from "react";
import {
  Typography, TextField, MenuItem, Box, Grid
} from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { MiscellaneousItem } from "../baseMiscellaneousModal";

interface SubcategoriaFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  onCategoriaChange: (categoriaId: string) => void;
  onValidate: (validateFn: () => boolean) => void;
}

// ✅ EXPORTAR SubcategoriaFields
export const SubcategoriaFields = ({
  isOpen,
  initialData,
  onCategoriaChange,
  onValidate,
}: SubcategoriaFieldsProps) => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
  const [categorias, setCategorias] = React.useState<MiscellaneousItem[]>([]);
  const [loadingCategorias, setLoadingCategorias] = React.useState(false);

  // Cargar categorías cuando se abre el modal
  React.useEffect(() => {
    const cargarCategorias = async () => {
      if (isOpen) {
        setLoadingCategorias(true);
        try {
          const res = await fetch("http://localhost:4000/miscellaneous?categoria=CATEGORIA_RED");
          const data = await res.json();
          const categoriasData = Array.isArray(data) ? data : [];
          const categoriasActivas = categoriasData.filter((c: MiscellaneousItem) => c.activo !== false);
          setCategorias(categoriasActivas);
        } catch (error) {
          console.error("Error al cargar categorías:", error);
        } finally {
          setLoadingCategorias(false);
        }
      }
    };
    cargarCategorias();
  }, [isOpen]);

  // Inicializar categoría seleccionada al editar
  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.padreId) {
        setCategoriaSeleccionada(initialData.padreId);
      } else {
        setCategoriaSeleccionada("");
      }
    }
  }, [initialData, isOpen]);

  // Notificar al padre cuando cambia la categoría
  React.useEffect(() => {
    onCategoriaChange(categoriaSeleccionada);
  }, [categoriaSeleccionada, onCategoriaChange]);

  // Registrar función de validación en el padre
  React.useEffect(() => {
    onValidate(() => {
      if (!categoriaSeleccionada) {
        return false;
      }
      return true;
    });
  }, [categoriaSeleccionada, onValidate]);

  return (
    <Grid size={12}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          color: "#7b1fa2",
        }}
      >
        <CategoryIcon fontSize="small" />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Categoría *
        </Typography>
      </Box>

      {loadingCategorias ? (
        <Typography variant="body2" color="text.secondary">
          Cargando categorías...
        </Typography>
      ) : categorias.length === 0 ? (
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff3e0",
            borderRadius: 1,
            border: "1px solid #ffb74d",
          }}
        >
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            ⚠️ No hay categorías disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Primero debes crear categorías desde el tab de Categoría Red
          </Typography>
        </Box>
      ) : (
        <TextField
          select
          fullWidth
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          size="small"
          required
          helperText="Selecciona la categoría a la que pertenece esta subcategoría"
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7b1fa2",
            },
          }}
        >
          <MenuItem value="" disabled>
            <Typography variant="body2" color="text.secondary">
              -- Selecciona una categoría --
            </Typography>
          </MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CategoryIcon sx={{ fontSize: 16, color: "#7b1fa2" }} />
                <Typography>{cat.valor}</Typography>
                {cat.descripcion && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    - {cat.descripcion}
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