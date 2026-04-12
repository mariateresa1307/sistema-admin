"use client";

import * as React from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  DialogContent,
  Container,
  TextField,
  Grid,
  LinearProgress,
  Alert,
  Paper,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { createUser, updateUser } from '@/lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isEditMode?: boolean;
  initialData?: any;
  onSubmit: () => Promise<void>; // TODO: Renombrar. 
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

  // Referencia para resetear el formulario físicamente
  const formRef = React.useRef<HTMLFormElement>(null);

  // Sincroniza el formulario cuando el modal se abre o cambia el usuario
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

  const sendForm = async (data) => {
    if (initialData) {
      await updateUser(initialData.id, data);
    } else {
      createUser(data);
    }
    onSubmit();
  };

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      key={initialData?.id || "new-user"}
    >
      <Box
        component="form"
        ref={formRef}
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
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
          <Toolbar>
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
                borderRadius: "8px",
              }}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </Toolbar>
        </AppBar>

        {loading && <LinearProgress sx={{ height: 3 }} />}

        <DialogContent sx={{ p: 0, backgroundColor: "#c5d2df" }}>
          <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                boxShadow: "0 10px 25px rgba(0,0,0,0.02)",
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
                    defaultValue={initialData?.primerNombre || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="segundoNombre"
                    label="Segundo Nombre"
                    fullWidth
                    defaultValue={initialData?.segundoNombre || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="primerApellido"
                    label="Primer Apellido"
                    fullWidth
                    required
                    defaultValue={initialData?.primerApellido || ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="segundoApellido"
                    label="Segundo Apellido"
                    fullWidth
                    defaultValue={initialData?.segundoApellido || ""}
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="username"
                    label="Nombre de Usuario"
                    fullWidth
                    required
                    defaultValue={initialData?.username || ""}
                  />
                </Grid>

                {!isEditMode && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      required={!isEditMode}
                    >
                      <InputLabel htmlFor="clave">Contraseña</InputLabel>
                      <OutlinedInput
                        id="clave"
                        name="clave" 
                        type={showPassword ? "text" : "password"}
                        label="Contraseña"
                        placeholder={
                          isEditMode ? "Dejar en blanco para no cambiar" : ""
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Container>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
