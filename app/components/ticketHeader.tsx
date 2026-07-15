// app/home/components/TicketHeader.tsx
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getNivelSeveridadConfig } from 'app/utils/auxiliares';

interface TicketHeaderProps {
  severidad: string;
  isEditMode?: boolean;
  onClose: () => void;
}

export const TicketHeader = React.memo(({ severidad, isEditMode = false, onClose }: TicketHeaderProps) => (
  <>
    <Box
      sx={{
        background: getNivelSeveridadConfig(severidad).bgcolor,
        height: 30,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
    <Box
      sx={{
        zIndex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1,
      }}
    >
      <Typography variant="h5" sx={{ color: '#000027', fontWeight: 600 }}>
        {isEditMode ? 'Editar Ticket - NOC' : 'Apertura y Tipificación - NOC'}
      </Typography>
      <IconButton onClick={onClose} edge="end">
        <CloseIcon />
      </IconButton>
    </Box>
  </>
));

TicketHeader.displayName = 'TicketHeader';