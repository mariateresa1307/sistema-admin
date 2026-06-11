"use client";
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography,
  Button, TextField, Box
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface SubcategoriasDialogProps {
  open: boolean;
  onClose: () => void;
  categoriaSeleccionada: MiscellaneousItem | null;
  subcategorias: MiscellaneousItem[];
  onAgregar: (valor: string) => Promise<void>;
  onEliminar: (subcategoria: MiscellaneousItem) => Promise<void>;
}

export const SubcategoriasDialog = ({
  open,
  onClose,
  categoriaSeleccionada,
  subcategorias,
  onAgregar,
  onEliminar,
}: SubcategoriasDialogProps) => {
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAgregar = async () => {
    if (!nuevaSubcategoria.trim()) return;
    setLoading(true);
    await onAgregar(nuevaSubcategoria);
    setNuevaSubcategoria("");
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Subcategorías de {categoriaSeleccionada?.valor}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Gestiona las subcategorías asociadas
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Nombre de la subcategoría"
            value={nuevaSubcategoria}
            onChange={(e) => setNuevaSubcategoria(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAgregar(); }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleAgregar}
            startIcon={<AddIcon />}
            disabled={!nuevaSubcategoria.trim() || loading}
            sx={{ bgcolor: '#7b1fa2', textTransform: 'none', '&:hover': { bgcolor: '#6a1b9a' } }}
          >
            Agregar
          </Button>
        </Box>

        {subcategorias.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CategoryIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay subcategorías registradas
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {subcategorias.map((sub) => (
              <Box
                key={sub._id}
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
                  <CategoryIcon sx={{ color: '#7b1fa2', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {sub.valor}
                  </Typography>
                  {sub.descripcion && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      - {sub.descripcion}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onEliminar(sub)}
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