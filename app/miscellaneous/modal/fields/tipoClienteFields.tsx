"use client";
import * as React from "react";
import { Typography, Grid, Chip, Box } from "@mui/material";
import { NIVEL_SEVERIDAD } from "app/utils/constants";

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
    
    const validate = () => {
      return nivelSeleccionado !== "";
    };
    
    onValidate(validate);
  }, [nivelSeleccionado, onNivelSeveridadChange, onValidate]);

  const handleSelectNivel = (nivelValue: string) => {
    setNivelSeleccionado(nivelValue);
  };

  // Colores dinámicos según el nivel de severidad
  const getNivelColor = (nivelValue: string, isSelected: boolean) => {
    if (!isSelected) return { bgcolor: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' };
    
    const nivelUpper = nivelValue.toUpperCase();
    if (nivelUpper.includes('CRÍT') || nivelUpper.includes('CRIT') || nivelUpper.includes('ALTO') || nivelUpper.includes('1')) {
      return { bgcolor: '#fee2e2', color: '#b91c1c', borderColor: '#ef4444' };
    }
    if (nivelUpper.includes('MED') || nivelUpper.includes('2')) {
      return { bgcolor: '#ffedd5', color: '#c2410c', borderColor: '#f97316' };
    }
    if (nivelUpper.includes('BAJ') || nivelUpper.includes('3')) {
      return { bgcolor: '#dcfce7', color: '#15803d', borderColor: '#22c55e' };
    }
    return { bgcolor: '#e0f2fe', color: '#0369a1', borderColor: '#0ea5e9' };
  };

  return (
    <Grid size={12}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          color: "#64748b",
          textTransform: "uppercase",
          mb: 1,
          letterSpacing: '0.05em'
        }}
      >
        Nivel de Severidad *
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, //  Espacio entre chips
        p: 2.5,
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        bgcolor: '#f8fafc',
        minHeight: '72px',
        alignItems: 'center'
      }}>
        {NIVEL_SEVERIDAD.map((nivel) => {
          
          const value = typeof nivel === 'string' ? nivel : nivel.value;
          const label = typeof nivel === 'string' ? nivel : nivel.label;
          const isSelected = nivelSeleccionado === value;
          const colors = getNivelColor(value, isSelected);
          
          return (
            <Chip
              key={value}
              label={label}
              onClick={() => handleSelectNivel(value)}
              sx={{
                cursor: 'pointer',
                bgcolor: colors.bgcolor,
                color: colors.color,
                fontWeight: isSelected ? 700 : 500,
                border: `1px solid ${colors.borderColor}`,
                flex: '1 0 120px', // Permite que los chips se ajusten al contenedor
                minWidth: '100px',
                maxWidth: '100%',
                justifyContent: 'center',
                height: '44px',
                fontSize: '0.9rem',
                boxShadow: isSelected ? `0 4px 6px -1px ${colors.borderColor}40` : 'none',
                '&:hover': {
                  opacity: 0.9,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 8px -1px ${colors.borderColor}50`
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          );
        })}
      </Box>
      
      {nivelSeleccionado === "" && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>⚠️</span> Debes seleccionar un nivel de severidad
        </Typography>
      )}
    </Grid>
  );
};