"use client";
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography,
  Button, TextField, Box
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface EstadosDialogProps {
  open: boolean;
  onClose: () => void;
  estados: MiscellaneousItem[];
  onAgregar: (valor: string) => Promise<void>;
  onEliminar: (estado: MiscellaneousItem) => Promise<void>;
}

export const EstadosDialog = ({
  open,
  onClose,
  estados,
  onAgregar,
  onEliminar,
}: EstadosDialogProps) => {
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAgregar = async () => {
    if (!nuevoEstado.trim()) return;
    setLoading(true);
    await onAgregar(nuevoEstado);
    setNuevoEstado("");
    setLoading(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Gestión de Estados</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Los estados son la base de la jerarquía geográfica
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Nombre del estado"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAgregar(); }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleAgregar}
            startIcon={<AddIcon />}
            disabled={!nuevoEstado.trim() || loading}
            sx={{ bgcolor: '#1976d2', textTransform: 'none', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Agregar
          </Button>
        </Box>

        {estados.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <MapIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay estados registrados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {estados.map((estado) => (
              <Box
                key={estado._id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {estado.valor}
                  </Typography>
                  {estado.descripcion && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      - {estado.descripcion}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onEliminar(estado)}
                  sx={{ color: '#d32f2f' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};