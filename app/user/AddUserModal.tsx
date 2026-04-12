'use client';

import * as React from 'react';
import { 
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, 
  DialogContent, Container, TextField, Grid, LinearProgress, 
  Alert, Paper, Box, FormControl, InputLabel, OutlinedInput, 
  InputAdornment 
} from "@mui/material";
import { 
  Close as CloseIcon, 
  Save as SaveIcon, 
  Visibility, 
  VisibilityOff 
} from "@mui/icons-material";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title?: string;
  isEditMode?: boolean;
}

export const FullScreenUserDialog = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Nuevo Usuario",
  isEditMode = false,
}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          // Fondo azul claro sutil
          backgroundColor: "#F0F4F8", 
        }}
      >
        <AppBar
          sx={{
            position: "relative",
            bgcolor: "#080769",
            color: "#ffffff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          elevation={0}
        >
          <Toolbar >
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1, fontWeight: 700 }} variant="h6">
              {title}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? null : <SaveIcon />}
              sx={{
                bgcolor: "#5d6a9f",
                "&:hover": { bgcolor: "#52509d" },
                px: 4,
                borderRadius: '8px'
              }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </Toolbar>
        </AppBar>

        {loading && <LinearProgress sx={{ height: 3 }} />}

        <DialogContent sx={{ p: 0 , backgroundColor: '#c5d2df'}}>
          <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
            {/* Box Blanco para el Formulario */}
            <Paper
              elevation={0}
              sx={{ 
                p: { xs: 3, md: 5 }, 
                borderRadius: 4, 
                border: "1px solid #e2e8f0",
                bgcolor: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="primerNombre"
                    label="Primer Nombre"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="segundoNombre"
                    label="Segundo Nombre"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="primerApellido"
                    label="Primer Apellido"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="segundoApellido"
                    label="Segundo Apellido"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    name="email"
                    label="Correo Electrónico"
                    type="email"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="username"
                    label="Nombre de Usuario"
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl variant="outlined" fullWidth required>
                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      name="clave"
                      type={showPassword ? "text" : "password"}
                      label="Contraseña"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </DialogContent>
      </Box>
    </Dialog>
  );
};