import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

interface ElementoModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (nuevoElemento: string) => void;
}

export default function ElementoModal({ open, onClose, onAdd }: ElementoModalProps) {
  const [valor, setValor] = useState('');

  const handleGuardar = () => {
    if (valor.trim()) {
      onAdd(valor);
      setValor(''); // Limpiar input
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 300, bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 24 
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Agregar nuevo elemento</Typography>
        <TextField 
          fullWidth 
          label="Nombre" 
          value={valor} 
          onChange={(e) => setValor(e.target.value)} 
          size="small"
        />
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleGuardar} 
          sx={{ mt: 3 }}
        >
          Guardar
        </Button>
      </Box>
    </Modal>
  );
}