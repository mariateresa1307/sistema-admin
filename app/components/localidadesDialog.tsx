
"use client";
import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography,
  Button, TextField, Box
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface LocalidadesDialogProps {
  open: boolean;
  onClose: () => void;
  ciudadSeleccionada: MiscellaneousItem | null;
  localidades: MiscellaneousItem[];
  onAgregar: (valor: string) => Promise<void>;
  onEliminar: (localidad: MiscellaneousItem) => Promise<void>;
}

export const LocalidadesDialog = ({
  open,
  onClose,
  ciudadSeleccionada,
  localidades,
  onAgregar,
  onEliminar,
}: LocalidadesDialogProps) => {
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug: Log cuando cambien las localidades
  useEffect(() => {
    console.log('📍 Ciudad seleccionada:', ciudadSeleccionada);
    console.log('📍 Localidades recibidas:', localidades);
    console.log('📍 Cantidad de localidades:', localidades?.length);
  }, [ciudadSeleccionada, localidades]);

  const handleAgregar = async () => {
    if (!nuevaLocalidad.trim()) return;
    setLoading(true);
    await onAgregar(nuevaLocalidad);
    setNuevaLocalidad("");
    setLoading(false);
  };

  if (!ciudadSeleccionada) {
    return null;
  }

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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Localidades de {ciudadSeleccionada.valor}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Gestiona las localidades asociadas
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Nombre de la localidad"
            value={nuevaLocalidad}
            onChange={(e) => setNuevaLocalidad(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAgregar(); }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleAgregar}
            startIcon={<AddIcon />}
            disabled={!nuevaLocalidad.trim() || loading}
            sx={{ bgcolor: '#1976d2', textTransform: 'none', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Agregar
          </Button>
        </Box>

        {localidades.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <PlaceIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay localidades registradas
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {localidades.map((loc) => (
              <Box
                key={loc._id}
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
                  <PlaceIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {loc.valor}
                  </Typography>
                  {loc.descripcion && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      - {loc.descripcion}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onEliminar(loc)}
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