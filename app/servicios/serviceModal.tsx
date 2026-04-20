"use client";

import * as React from "react";
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, DialogContent,
  Container, TextField, Grid, LinearProgress, Alert, Paper, Box,
  Avatar, Divider, MenuItem
} from "@mui/material";
import {
  Close as CloseIcon, Save as SaveIcon, CloudUpload as UploadIcon, 
  PhotoCamera, Router as RouterIcon, Hub as NodeIcon, Business as BusinessIcon,
  Schema as DiagramIcon
} from "@mui/icons-material";
import { createService, updateService } from '@/lib/api';

const CIUDADES_VENEZUELA = ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Barcelona", "Maturín", "San Cristóbal", "Mérida", "Puerto Ordaz", "Coro"].sort();
const TIPOS_SERVICIO = ["DOG", "METROLAN", "RBS"];
const PROVEEDORES = ["Netuno", "Inter", "Telefonica", "Galanet"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isEditMode?: boolean;
  initialData?: any;
  onSubmit: () => Promise<void>;
}

export const FullScreenServiceDialog = ({
  isOpen, onClose, title = "Nuevo Servicio", isEditMode = false, initialData, onSubmit
}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  
  // ESTADO PARA LA LÓGICA DINÁMICA
  const [tipoServicio, setTipoServicio] = React.useState("RBS");
  
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (formRef.current) formRef.current.reset();
      setImagePreview(initialData?.imageUrl || null);
      setTipoServicio(initialData?.tipoServicio || "RBS"); // Inicializar el tipo
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      isEditMode && initialData ? await updateService(initialData.id, data) : await createService(data);
      await onSubmit();
      onClose();
    } catch (err: any) {
      setError("Error al guardar el servicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog fullScreen open={isOpen} onClose={onClose}>
      <Box component="form" ref={formRef} onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: '#F1F5F9' }}>
        
        <AppBar sx={{ position: "relative", bgcolor: "#080769" }} elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1, fontWeight: 700 }} variant="h6">{title}</Typography>
            <Button type="submit" variant="contained" disabled={loading} startIcon={<SaveIcon />} sx={{ bgcolor: '#00C9FF', px: 4 }}>
              Guardar
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent sx={{ py: 4 }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              
              {/* PANEL IZQUIERDO: IMAGEN */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                    "DIAGRAMA DE RED"
                  </Typography>
                  <Avatar 
                    src={imagePreview || ""} 
                    variant="rounded"
                    sx={{ width: '100%', height: 280, mb: 2, bgcolor: '#F8FAFC', border: '2px dashed #CBD5E1' }}
                  >
                  {tipoServicio === "METROLAN" ? <DiagramIcon sx={{ fontSize: 40 }} /> : <PhotoCamera sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Button component="label" variant="outlined" startIcon={<UploadIcon />} fullWidth>
                    {imagePreview ? "Cambiar Imagen" : "Subir Imagen"}
                    <input type="file" name="foto" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </Paper>
              </Grid>

              {/* PANEL DERECHO: DATOS */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                  
                  {/* SELECTOR DE TIPO (DISPARADOR) */}
                  <TextField 
                    select 
                    name="tipoServicio" 
                    label="Tipo de Servicio" 
                    fullWidth 
                    required 
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value)}
                    size="small"
                    sx={{ mb: 4 }}
                  >
                    {TIPOS_SERVICIO.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>

                  <Divider sx={{ mb: 4 }} />

                  {/* CAMPOS COMUNES */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField name="name" label="Nombre del Cliente" fullWidth required defaultValue={initialData?.name || ""} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField select name="city" label="Ciudad" fullWidth required defaultValue={initialData?.city || ""} size="small">
                        {CIUDADES_VENEZUELA.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>

                
                 {/* --- LÓGICA DINÁMICA DE SERVICIOS --- */}
<Box sx={{ mt: 2 }}>
  {/* TÍTULO DINÁMICO SEGÚN EL SERVICIO */}
  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#080769', display: 'flex', alignItems: 'center', gap: 1 }}>
    {tipoServicio === "METROLAN" && <><NodeIcon fontSize="small" /> Configuración METROLAN</>}
    {tipoServicio === "RBS" && <><RouterIcon fontSize="small" /> Configuración RBS</>}
    {tipoServicio === "DOG" && <><BusinessIcon fontSize="small" /> Configuración DOG (Dedicado)</>}
    {!tipoServicio && "Seleccione un tipo de servicio"}
  </Typography>

  <Grid container spacing={2.5}>
    {/* VISTA PARA METROLAN */}
    {tipoServicio === "METROLAN" && (
      <>
        <Grid size={{ xs: 12 }}>
          <TextField name="idServicio" label="ID SERVICIO METROLAN" fullWidth required defaultValue={initialData?.idServicio || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodeA" label="NODO A" fullWidth required defaultValue={initialData?.nodeA || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodeB" label="NODO B" fullWidth required defaultValue={initialData?.nodeB || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField name="vlan" label="VLAN / Segmento" fullWidth defaultValue={initialData?.vlan || ""} size="small" />
        </Grid>
      </>
    )}

    {/* VISTA PARA RBS */}
    {tipoServicio === "RBS" && (
      <>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="idNetuno" label="ID Netuno" fullWidth required defaultValue={initialData?.idNetuno || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="idRBS" label="ID RBS" fullWidth required defaultValue={initialData?.idRBS || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.oltnode || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField name="instalado" label="Fecha Instalación" type="date" fullWidth InputLabelProps={{ shrink: true }} defaultValue={initialData?.instalado || ""} size="small" />
        </Grid>
      </>
    )}

    {/* VISTA PARA DOG (Internet Dedicado / GPON Business) */}
    {tipoServicio === "DOG" && (
      <>

      <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="idNETUNO" label="ID Netuno" fullWidth required defaultValue={initialData?.idNETUNO || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="idDOG" label="ID Circuito" fullWidth required defaultValue={initialData?.idDOG || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="contrato" label="Contrato" fullWidth required defaultValue={initialData?.contrato || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="vlan" label="Vlan" fullWidth required defaultValue={initialData?.vlan || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" />
        </Grid>
         <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.oltnode || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6  }}>
          <TextField name="idont" label="ID ONT" fullWidth defaultValue={initialData?.idont || ""} size="small" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" />
        </Grid>

      </>
    )}
  </Grid>
</Box>

                </Paper>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>
      </Box>
    </Dialog>
  );
};