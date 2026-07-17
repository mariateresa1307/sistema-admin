'use client';
import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getNivelSeveridadConfig } from 'app/utils/auxiliares';

// ✅ Exportación nombrada de la interfaz para que coincida con la importación
export interface TicketHeaderProps {
  severidad: string;
  isEditMode?: boolean;
  onClose: () => void;
}

// ✅ Exportación nombrada del componente
export const TicketHeader = React.memo(({ severidad, isEditMode = false, onClose }: TicketHeaderProps) => {
  const config = getNivelSeveridadConfig(severidad);

  return (
    <>
      {/* Barra superior de color según severidad (más sutil y elegante) */}
      <Box
        sx={{
          background: config.bgcolor,
          height: 8,
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      />
      
      <Box
        sx={{
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 2,
          mt: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* ✅ TIPOGRAFÍA: Calibri Bold para titulación (Manual de Identidad) */}
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#121227', // Azul Marino NetUno (RGB: 18, 18, 39)
              fontWeight: 700, // Calibri Bold
              fontFamily: 'Calibri, Arial, sans-serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            {isEditMode ? 'Editar Ticket - NOC' : 'Apertura y Tipificación - NOC'}
          </Typography>
          
          {/* Chip de severidad integrado */}
          {severidad && (
            <Chip
              label={`${config.icon} ${config.label}`}
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: '6px',
                fontSize: '0.72rem',
                px: 1.5,
                py: 0.5,
                bgcolor: config.bgcolor,
                color: config.color,
                fontFamily: 'Calibri, Arial, sans-serif',
                width: 'fit-content',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
          )}
        </Box>

        <IconButton 
          onClick={onClose} 
          edge="end"
          sx={{ 
            color: '#121227',
            bgcolor: 'transparent',
            '&:hover': { 
              bgcolor: 'rgba(18, 18, 39, 0.08)' 
            },
            mt: 0.5
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </>
  );
});

TicketHeader.displayName = 'TicketHeader';