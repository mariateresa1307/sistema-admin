"use client";
import * as React from "react";
import { Typography, Grid, Chip, Box } from "@mui/material";
import { TIPO_INCIDENCIA } from "app/utils/constants";
import { TipoIncidenciaKey } from "app/utils/types";

interface CategoriaRedFieldsProps {
  isOpen: boolean;
  initialData?: any;
  onTipoIncidenciaChange: (tipos: string[]) => void;
}

export const CategoriaRedFields = ({
  isOpen,
  initialData,
  onTipoIncidenciaChange,
}: CategoriaRedFieldsProps) => {
  const [tipoIncidencia, setTipoIncidencia] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData?.tipoIncidencia) {
        const tipos = Array.isArray(initialData.tipoIncidencia) 
          ? initialData.tipoIncidencia 
          : [initialData.tipoIncidencia];
        setTipoIncidencia(tipos);
      } else {
        setTipoIncidencia([]);
      }
    }
  }, [initialData, isOpen]);

  React.useEffect(() => {
    onTipoIncidenciaChange(tipoIncidencia);
  }, [tipoIncidencia, onTipoIncidenciaChange]);

  const handleToggleTipo = (tipo: string) => {
    setTipoIncidencia((prev) => {
      if (prev.includes(tipo)) {
        return prev.filter((t) => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  const getTipoColor = (tipo: string, isSelected: boolean) => {
    if (!isSelected) return { bgcolor: '#e0e0e0', color: '#616161' };
    
    const tipoUpper = tipo.toUpperCase();
    if (tipoUpper.includes('PUNTUAL')) return { bgcolor: '#fff3e0', color: '#e65100' };
    if (tipoUpper.includes('MASIVA')) return { bgcolor: '#ffebee', color: '#c62828' };
    if (tipoUpper.includes('MANTENIMIENTO')) return { bgcolor: '#e3f2fd', color: '#1565c0' };
    return { bgcolor: '#f5f5f5', color: '#616161' };
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
        Tipos de incidencia *
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        p: 2,
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        bgcolor: '#f8fafc',
        minHeight: '56px'
      }}>
        {(Object.keys(TIPO_INCIDENCIA) as TipoIncidenciaKey[]).map((tipoKey) => {
          const tipo = TIPO_INCIDENCIA[tipoKey];
          const isSelected = tipoIncidencia.includes(tipo);
          const colors = getTipoColor(tipo, isSelected);
          return (
            <Chip
              key={tipo}
              label={tipo}
              onClick={() => handleToggleTipo(tipo)}
              sx={{
                cursor: 'pointer',
                bgcolor: colors.bgcolor,
                color: colors.color,
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? `2px solid ${colors.color}` : '1px solid #e0e0e0',
                '&:hover': {
                  opacity: 0.85,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </Box>
      
      {tipoIncidencia.length === 0 && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          Debes seleccionar al menos un tipo de incidencia
        </Typography>
      )}
    </Grid>
  );
};