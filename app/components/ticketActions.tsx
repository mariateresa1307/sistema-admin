// app/home/components/TicketActions.tsx
import React from 'react';
import { Box, Button } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SaveIcon from '@mui/icons-material/Save';

interface TicketActionsProps {
  activeStep: number;
  totalSteps: number;
  isStep0Complete: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const TicketActions = React.memo(
  ({ activeStep, totalSteps, isStep0Complete, onBack, onNext, onClose, onSave }: TicketActionsProps) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        mt: 4,
        pt: 2,
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Button
        variant="outlined"
        color="error"
        onClick={onClose}
        sx={{ borderRadius: '50px', px: 3, fontWeight: 600, textTransform: 'none' }}
      >
        Descartar
      </Button>

      {activeStep > 0 && (
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={onBack}
          sx={{
            borderRadius: '50px',
            px: 3,
            fontWeight: 600,
            textTransform: 'none',
            color: '#000027',
            borderColor: '#000027',
          }}
        >
          Atrás
        </Button>
      )}

      {activeStep < totalSteps - 1 ? (
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={!isStep0Complete}
          sx={{
            bgcolor: '#000027',
            borderRadius: '50px',
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#000045' },
          }}
        >
          Continuar
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSave}
          variant="contained"
          startIcon={<SaveIcon />}
          sx={{
            bgcolor: '#2e7d32',
            borderRadius: '50px',
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1b5e20' },
          }}
        >
          Guardar e Insertar
        </Button>
      )}
    </Box>
  )
);

TicketActions.displayName = 'TicketActions';