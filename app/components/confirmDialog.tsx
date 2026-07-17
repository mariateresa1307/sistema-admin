'use client';
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface ConfirmProps {
  open: boolean;
  title: string;
  message: string; 
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'success';
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
}: ConfirmProps) => {
  const brandColors = {
    warning: { 
      icon: <WarningAmberIcon sx={{ color: '#BE2915', fontSize: '1.5rem' }} />, 
      buttonBg: '#BE2915', 
      buttonText: '#FFFFFF' 
    },
    info: { 
      icon: <InfoIcon sx={{ color: '#6BB1E2', fontSize: '1.5rem' }} />, 
      buttonBg: '#6BB1E2', 
      buttonText: '#FFFFFF' 
    },
    success: { 
      icon: <CheckCircleIcon sx={{ color: '#CFC600', fontSize: '1.5rem' }} />, 
      buttonBg: '#CFC600', 
      buttonText: '#121227' 
    },
  };

  const { icon, buttonBg, buttonText } = brandColors[type];

  return (
    <Dialog 
      open={open} 
      onClose={onCancel} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(18, 18, 39, 0.15)',
        }
      }}
    >
      {/* ✅ CORRECCIÓN: component="div" evita que MUI renderice un <h2> y anide el <h6> */}
      <DialogTitle component="div" sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pb: 1,
        pt: 2.5,
        px: 3
      }}>
        {icon}
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Calibri, Arial, sans-serif', 
            fontWeight: 700,
            color: '#121227',
            letterSpacing: '-0.01em'
          }}
        >
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: 'Calibri, Arial, sans-serif', 
            fontWeight: 400,
            color: '#121227',
            lineHeight: 1.6 
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, pt: 1, gap: 1.5 }}>
        <Button 
          onClick={onCancel} 
          variant="outlined"
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none', 
            fontWeight: 600,
            color: '#121227',
            borderColor: '#cbd5e1',
            fontFamily: 'Calibri, Arial, sans-serif',
            px: 3,
            '&:hover': { 
              borderColor: '#121227', 
              bgcolor: 'rgba(18, 18, 39, 0.04)' 
            }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          autoFocus
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none', 
            fontWeight: 700,
            bgcolor: buttonBg,
            color: buttonText,
            fontFamily: 'Calibri, Arial, sans-serif',
            px: 3,
            boxShadow: 'none',
            '&:hover': { 
              bgcolor: type === 'warning' ? '#9A2111' : type === 'success' ? '#B0A800' : '#0288d1',
              boxShadow: '0 4px 12px rgba(18, 18, 39, 0.2)'
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};