import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box 
} from "@mui/material";
import { WarningAmber as WarningIcon } from "@mui/icons-material";

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const ConfirmDialog = ({ open, onClose, onConfirm, title, description }: ConfirmProps) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
    {/* Cambiamos la estructura del título para evitar h6 dentro de h2 */}
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <WarningIcon color="error" />
      {/* Usamos component="span" para que Typography no renderice un <h6>,
        evitando así el error de hidratación.
      */}
      <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </DialogTitle>

    <DialogContent>
      <Typography color="text.secondary">
        {description}
      </Typography>
    </DialogContent>

    <DialogActions sx={{ pb: 2, px: 3 }}>
      <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
        Cancelar
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained" 
        color="error" 
        sx={{ borderRadius: '8px', fontWeight: 700, px: 3 }}
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);