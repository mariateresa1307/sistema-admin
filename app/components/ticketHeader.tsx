'use client';
import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'; // ✅ Icono agregado
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
              gap: 1.5
            }}
          >
            {isEditMode ? 'Editar Ticket - NOC' : 'Ficha Técnica del Caso - NOC'}
            
            {/* ✅ Mostrar número de ticket SIEMPRE que exista, con diseño de etiqueta */}
            {numeroTicket && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  bgcolor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  px: 1.5,
                  py: 0.3,
                  borderRadius: '6px'
                }}
              >
                <ConfirmationNumberIcon sx={{ fontSize: '1rem', color: '#475569' }} />
                <Typography 
                  component="span" 
                  sx={{ 
                    color: '#1e293b',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Calibri, Arial, sans-serif',
                    letterSpacing: '0.02em'
                  }}
                >
                  {numeroTicket}
                </Typography>
              </Box>
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


