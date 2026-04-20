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
  Grid,
  LinearProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  styled,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { createUser, updateUser } from '@/lib/api';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(8),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiPaper-root': {
    
    maxHeight: '100%',
    maxWidth: '100%',
    width: '77%',
  height: '60%',
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

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (isOpen && formRef.current) {
      formRef.current.reset();
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (isEditMode && !data.clave) {
      delete data.clave;
    }

    try {
      await sendForm(data);
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
    if (initialData) {
      await updateUser(initialData.id, data);
    } else {
      await createUser(data);
    }
    onSubmit();
  };

  return (
    <BootstrapDialog
      onClose={onClose}
      open={isOpen}
      key={initialData?.id || "new-user"}
      aria-labelledby="customized-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <Box component="form" ref={formRef} onSubmit={handleSubmit}>
        {/* 🔹 Header con título y botón de cerrar */}
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: '#080769', color: 'white' }} id="customized-dialog-title">
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, pr: 4 }}>
            {isEditMode ? `Editar Usuario: ${initialData?.username}` : title}
          </Typography>
        </DialogTitle>
        
        {/* 🔹 Botón de cerrar en esquina superior derecha */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {loading && <LinearProgress />}

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="primerNombre"
                label="Primer Nombre"
                fullWidth
                required
                defaultValue={initialData?.primerNombre || ""}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="segundoNombre"
                label="Segundo Nombre"
                fullWidth
                defaultValue={initialData?.segundoNombre || ""}
                size="small"
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="segundoApellido"
                label="Segundo Apellido"
                fullWidth
                defaultValue={initialData?.segundoApellido || ""}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="email"
                label="Correo Electrónico"
                type="email"
                fullWidth
                required
                defaultValue={initialData?.email || ""}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="username"
                label="Nombre de Usuario"
                fullWidth
                required
                defaultValue={initialData?.username || ""}
                size="small"
              />
            </Grid>

            {!isEditMode && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  variant="outlined"
                  fullWidth
                  required={!isEditMode}
                  size="small"
                >
                  <InputLabel htmlFor="clave">Contraseña</InputLabel>
                  <OutlinedInput
                    id="clave"
                    name="clave"
                    type={showPassword ? "text" : "password"}
                    label="Contraseña"
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

        {/* 🔹 Footer con botones de acción */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={loading}
            sx={{ 
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: '#080769',
              color: 'white',
              fontWeight: 600,
              px: 4,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#06055a',
              },
              '&:disabled': {
                bgcolor: 'rgba(8,7,105,0.5)',
              },
            }}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </BootstrapDialog>
  );
};