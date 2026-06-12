"use client";
import * as React from "react";
import {
  Typography, TextField, MenuItem, Box, Grid
} from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { BaseMiscellaneousModal } from "./BaseMiscellaneousModal";

type MiscellaneousItem = {
  _id?: string;
  id?: string;
  categoria: string;
  valor: string;
  descripcion?: string;
  padreId?: string;
  padreNombre?: string;
  activo?: boolean;
};

interface SubcategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: MiscellaneousItem | null;
  categoria: string;
  onSave: (payload: any) => Promise<boolean>;
}

export const SubcategoriaModal = ({
  isOpen,
  onClose,
  title = "Nueva Subcategoría",
  initialData,
  categoria,
  onSave,
}: SubcategoriaModalProps) => {
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
    if (isOpen && initialData?.padreId) {
      setCategoriaSeleccionada(initialData.padreId);
    } else if (isOpen && !initialData) {
      setCategoriaSeleccionada("");
    }
  }, [initialData, isOpen]);

  // Wrapper para onSave que agrega los datos de la categoría
  const handleSaveWithCategoria = async (basePayload: any) => {
    if (!categoriaSeleccionada) {
      return false;
    }

    const cat = categorias.find((c) => (c._id || c.id) === categoriaSeleccionada);
    if (cat) {
      basePayload.padreId = cat._id || cat.id;
      basePayload.padreNombre = cat.valor;
    }

    return onSave(basePayload);
  };

  return (
    <BaseMiscellaneousModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      initialData={initialData}
      categoria={categoria}
      onSave={handleSaveWithCategoria}
    >
      {/* SELECTOR DE CATEGORÍA */}
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
    </BaseMiscellaneousModal>
  );
};