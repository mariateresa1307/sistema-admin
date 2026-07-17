'use client';
import React from 'react';
import { Box, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';

const corporateFont = 'Calibri, Arial, sans-serif';

interface TicketActionsProps {
  activeStep: number;
  totalSteps: number;
  isStep0Complete: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onSave: () => void;
  onCloseTicket?: () => void;
  onReopenTicket?: () => void;
  isEditMode?: boolean;
  ticketStatus?: string;
  isAdmin?: boolean;
}



export const TicketActions = ({
  activeStep,
  totalSteps,
  isStep0Complete,
  onBack,
  onNext,
  onClose,
  onSave,
  onCloseTicket,
  onReopenTicket,
  isEditMode = false,
  ticketStatus = '',
  isAdmin = false,
}: TicketActionsProps) => {
  const isLastStep = activeStep === totalSteps - 1;

  const normalizedStatus = ticketStatus?.toString().trim().toUpperCase() || '';

  // ✅ LOGS DE DIAGNÓSTICO (eliminar después de verificar)
console.log('🔍 [TicketActions] Diagnóstico completo:', {
    isLastStep,
    isEditMode,
    ticketStatus: `"${ticketStatus}"`,
    normalizedStatus: `"${normalizedStatus}"`,
    isAdmin,
    hasOnReopenTicket: !!onReopenTicket,
    hasOnCloseTicket: !!onCloseTicket,
  });

  console.log('🔍 [TicketActions] Condiciones para "Activar Ticket":', {
    'isEditMode': isEditMode,
    'onReopenTicket existe': !!onReopenTicket,
    'ticketStatus es CERRADO': normalizedStatus === 'CERRADO',
    'isAdmin': isAdmin,
    'TODAS las condiciones': isEditMode && !!onReopenTicket && normalizedStatus === 'CERRADO' && isAdmin,
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 4,
        pt: 3,
        borderTop: '1px solid #e0e0e0',
      }}
    >
      {/* Botones de la izquierda */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: corporateFont,
              color: '#121227',
              borderColor: '#cbd5e1',
              '&:hover': { borderColor: '#121227', bgcolor: 'rgba(18, 18, 39, 0.04)' }
            }}
          >
            Anterior
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: corporateFont,
          }}
        >
          Cancelar
        </Button>
      </Box>

      {/* Botones de la derecha */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        
        {/* ✅ CASO 1: Último paso (Paso 2) */}
        {isLastStep ? (
          <>
            {/* Botón de Estado: Activar (Solo si está CERRADO y es Admin) */}
         {isEditMode && onReopenTicket && normalizedStatus === 'CERRADO' && isAdmin && (
              <Button
                variant="contained"
                onClick={onReopenTicket}
                startIcon={<ReplayIcon />}
                sx={{
                  bgcolor: '#6BB1E2',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#0288d1' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontFamily: corporateFont,
                  px: 3,
                }}
              >
                Activar Ticket
              </Button>
            )}

            {/* Botón de Estado: Cerrar (Solo si está ACTIVO o EN_GESTION) */}
          {isEditMode && onCloseTicket && (normalizedStatus === 'ACTIVO' || normalizedStatus === 'EN_GESTION') && (
              <Button
                variant="contained"
                onClick={onCloseTicket}
                startIcon={<CloseIcon />}
                sx={{
                  bgcolor: '#BE2915',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#9A2111' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontFamily: corporateFont,
                  px: 3,
                }}
              >
                Cerrar Ticket
              </Button>
            )}


            {/* Botón Guardar (SIEMPRE visible en el último paso) */}
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: '#121227',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#0a0a1a' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontFamily: corporateFont,
                px: 3,
              }}
            >
              Guardar
            </Button>
          </>
        ) : (
          /* ✅ CASO 2: Paso 1 (Mostrar solo "Siguiente") */
      <Button
            variant="contained"
            onClick={onNext}
            disabled={!isStep0Complete}
            sx={{
              bgcolor: '#121227',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#0a0a1a' },
              '&:disabled': { bgcolor: '#9e9e9e', color: '#ffffff' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontFamily: corporateFont,
              px: 3,
            }}
          >
            Siguiente
          </Button>
        )}
      </Box>
    </Box>
  );
};