"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  TextField,
  LinearProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  styled,
  Divider,
  Switch,
  Chip,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { createUser, updateUser } from '@/lib/api';

const CustomStyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(4),
    border: 'none',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(3),
    borderTop: '1px solid #f1f5f9',
  },
  '& .MuiPaper-root': {
    maxHeight: '90vh',
    maxWidth: '550px',
    width: '100%',
    borderRadius: '18px',
    border: '1px solid #eaedf1',
    boxShadow: '0px 10px 40px rgba(0,0,0,0.06), 0px 20px 70px rgba(0,0,20,0.04)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
  },
}));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isEditMode?: boolean;
  initialData?: any;
  onSubmit: () => Promise<void>;
}

export const FullScreenUserDialog = ({
  isOpen,
  onClose,
  title = "Nuevo Usuario",
  isEditMode = false,
  initialData,
  onSubmit
}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Estado local para controlar el Switch de estado
  const [isActive, setIsActive] = React.useState<boolean>(true);

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      if (formRef.current) formRef.current.reset();
      
      // Sincronizamos el Switch usando únicamente la propiedad nativa real de la BD
      if (isEditMode && initialData) {
        const estadoInicial = initialData.isActive !== undefined ? initialData.isActive : (initialData.is_active ?? true);
        setIsActive(estadoInicial);
      } else {
        setIsActive(true); 
      }
    }
  }, [isOpen, initialData, isEditMode]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(event.target.checked);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 🔹 SOLUCIÓN SEGURA: Aseguramos que 'isActive' reescriba cualquier valor antiguo y se envíe el booleano real
    const payload: any = {
      ...data,
      isActive: isActive
    };

    if (isEditMode && !payload.clave) {
      delete payload.clave;
    }

    try {
      await sendForm(payload);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error interno del servidor (500)",
      );
    } finally {
      setLoading(false);
    }
  };

  const sendForm = async (data: any) => {
    if (initialData?._id) {
      await updateUser(initialData._id, data);
    } else {
      await createUser(data);
    }
    // Llama al callback para refrescar el DataGrid antes de cerrar
    await onSubmit();
  };

  return (
    <CustomStyledDialog
      onClose={onClose}
      open={isOpen}
      key={initialData?._id || "new-user"}
      aria-labelledby="customized-dialog-title"
    >
      <Box sx={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
        bgcolor: '#080769'
      }} />

      <Box component="form" ref={formRef} onSubmit={handleSubmit}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 4, px: 4, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AccountCircleIcon sx={{ color: '#080769', fontSize: '1.5rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {isEditMode ? `Editar Usuario` : title}
            </Typography>
          </Box>
          
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            size="small" 
            sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {isEditMode && initialData?.username && (
          <Box sx={{ px: 4, mt: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5', bgcolor: '#4f46e50d', px: 1, py: 0.4, borderRadius: '6px', display: 'inline-block' }}>
              @{initialData.username}
            </Typography>
          </Box>
        )}

        <Box sx={{ px: 4, mt: 2.5 }}>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
        </Box>

        {loading && <LinearProgress sx={{ mx: 4, mt: 1, height: '3px', borderRadius: '2px' }} />}

        <DialogContent sx={{ mt: loading ? 1 : 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', fontWeight: 500 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="primerNombre"
                label="Primer Nombre"
                fullWidth
                required
                defaultValue={initialData?.primerNombre || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="segundoNombre"
                label="Segundo Nombre"
                fullWidth
                defaultValue={initialData?.segundoNombre || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="primerApellido"
                label="Primer Apellido"
                fullWidth
                required
                defaultValue={initialData?.primerApellido || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="segundoApellido"
                label="Segundo Apellido"
                fullWidth
                defaultValue={initialData?.segundoApellido || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name="email"
                label="Correo Electrónico"
                type="email"
                fullWidth
                required
                defaultValue={initialData?.email || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            
            {/* Grid adaptativo: toma ancho completo si es nuevo usuario */}
            <Grid size={{ xs: 12, sm: isEditMode ? 6 : 12 }}>
              <TextField
                name="username"
                label="Nombre de Usuario"
                fullWidth
                required
                defaultValue={initialData?.username || ""}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* SECCIÓN DE ESTATUS CONDICIONADA */}
            {isEditMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  Estado de Cuenta
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  bgcolor: '#f8fafc', 
                  p: '4px 12px', 
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  height: '40px'
                }}>
                  <Chip 
                    label={isActive ? "Activo" : "Inactivo"} 
                    size="small"
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: '6px',
                      bgcolor: isActive ? '#e8f5e9' : '#ffebee',
                      color: isActive ? '#2e7d32' : '#c62828',
                      minWidth: '70px',
                      transition: 'all 0.25s ease'
                    }} 
                  />
                  <Switch
                    checked={isActive}
                    onChange={handleSwitchChange}
                    color="success"
                    size="small"
                  />
                </Box>
              </Grid>
            )}

            {!isEditMode && (
              <Grid size={12}>
                <FormControl
                  variant="outlined"
                  fullWidth
                  required={!isEditMode}
                  size="small"
                >
                  <InputLabel htmlFor="clave" shrink>Contraseña</InputLabel>
                  <OutlinedInput
                    id="clave"
                    name="clave"
                    type={showPassword ? "text" : "password"}
                    label="Contraseña"
                    notched
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={loading}
            sx={{ 
              fontWeight: 700,
              px: 3,
              borderRadius: '8px',
              color: '#64748b',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={!loading && <SaveIcon />}
            sx={{
              bgcolor: '#080769',
              color: 'white',
              fontWeight: 700,
              px: 4,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0px 4px 12px rgba(8,7,105,0.15)',
              '&:hover': {
                bgcolor: '#06055a',
                boxShadow: '0px 6px 16px rgba(8,7,105,0.25)',
              },
              '&:disabled': {
                bgcolor: 'rgba(8,7,105,0.5)',
              },
            }}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Box>
    </CustomStyledDialog>
  );
};