'use client';
import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getNivelSeveridadConfig } from 'app/utils/auxiliares';

export interface TicketHeaderProps {
  severidad: string;
  isEditMode?: boolean;
  numeroTicket?: string; 
  onClose: () => void;
}

export const TicketHeader = React.memo(({ severidad, isEditMode = false, numeroTicket, onClose }: TicketHeaderProps) => {
  const config = getNivelSeveridadConfig(severidad);

  return (
    <>
      {/* Barra superior de color según severidad */}
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
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#121227',
              fontWeight: 700,
              fontFamily: 'Calibri, Arial, sans-serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {isEditMode ? 'Editar Ticket - NOC' : 'Apertura y Tipificación - NOC'}
            
            {/* ✅ Mostrar número de ticket solo en modo edición */}
            {isEditMode  && numeroTicket && (
              <Typography 
                component="span" 
                sx={{ 
                  color:  '#BE2915',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  fontFamily: 'Calibri, Arial, sans-serif',
                  bgcolor: config.bgcolor,
                  px: 1.5,
                  py: 0.2,
                  borderRadius: '6px'
                }}
              >
               {numeroTicket}
              </Typography>
            )}
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