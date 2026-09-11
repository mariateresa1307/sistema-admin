"use client";
import * as React from "react";
import { Typography, Grid, Chip, Box, CircularProgress } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { getMiscellaneous } from "@/lib/api";
import { MiscellaneousItem } from "../baseMiscellaneousModal";

interface CausaRaizFieldsProps {
  isOpen: boolean;
  initialData?: MiscellaneousItem | null;
  onCategoriasRedChange: (ids: string[]) => void;
}

export const CausaRaizFields = ({
  isOpen,
  initialData,
  onCategoriasRedChange,
}: CausaRaizFieldsProps) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = React.useState<MiscellaneousItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      const fetchCategorias = async () => {
        try {
          const res = await getMiscellaneous({ categoria: 'CATEGORIA_RED', limit: 9999 });
          const rawData = res?.data;
          const data = Array.isArray(rawData?.data) 
            ? rawData.data 
            : (Array.isArray(rawData) ? rawData : []);
          
          setCategoriasDisponibles(data.filter((c: MiscellaneousItem) => c.activo !== false));
        } catch (error) {
          console.error("Error cargando categorías de red:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCategorias();

      if (initialData?.categoriaRedIds) {
        setSelectedIds(Array.isArray(initialData.categoriaRedIds) ? initialData.categoriaRedIds : []);
      } else {
        setSelectedIds([]);
      }
    }
  }, [initialData, isOpen]);

  React.useEffect(() => {
    onCategoriasRedChange(selectedIds);
  }, [selectedIds, onCategoriasRedChange]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <Grid size={12}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Cargando categorías...</Typography>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid size={12}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "#7b1fa2" }}>
        <CategoryIcon fontSize="small" />
        <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
          Categorías de Red Asociadas (Opcional)
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', flexWrap: 'wrap', gap: 1, p: 2, border: '1px solid #e2e8f0',
        borderRadius: 2, bgcolor: '#f8fafc', minHeight: '56px'
      }}>
        {categoriasDisponibles.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No hay categorías de red registradas. Primero créalas en el tab "Categoría Red".
          </Typography>
        ) : (
          categoriasDisponibles.map((categoria) => {
            const categoriaId = categoria._id || categoria.id || "";
            if (!categoriaId) return null;

            const isSelected = selectedIds.includes(categoriaId);
            return (
              <Chip
                key={categoriaId}
                label={categoria.valor}
                onClick={() => handleToggle(categoriaId)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#f3e5f5' : '#e0e0e0',
                  color: isSelected ? '#7b1fa2' : '#616161',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '2px solid #7b1fa2' : '1px solid #e0e0e0',
                  '&:hover': { opacity: 0.85, transform: 'translateY(-1px)' },
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Selecciona las categorías de red a las que aplica esta causa raíz
      </Typography>
    </Grid>
  );
};