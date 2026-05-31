"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Button,
  TextField, MenuItem, Box, Divider, Avatar, Collapse
} from "@mui/material";
import Grid from "@mui/material/Grid"; 
import { Close as CloseIcon, CloudUpload as UploadIcon, PhotoCamera, Schema as DiagramIcon, AddPhotoAlternate as AddIcon } from "@mui/icons-material";

const CIUDADES_VENEZUELA = ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "San Cristóbal", "Mérida", "Puerto la cruz"].sort();
const TIPOS_SERVICIO = ["DOG", "METROLAN", "RBS", "IU"];
const TIPO_CLIENTE_FULL = ["TELEFONICA", "GALANET","DIGITEL","MOVILNET", "INTER", "EWINET", "VNET"];
const PROVEEDOR_IU = ["INTER", "DIGITEL", "VNET"];
const TIPOS_CLIENTE_METROLAN = ["CARRIER", "BANCA", "CORPO"];

export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState(initialData?.tipoServicio || "RBS");
  const [imagePreview, setImagePreview] = React.useState<string | null>(initialData?.imageUrl || null);
  const [showImageSection, setShowImageSection] = React.useState(!!initialData?.imageUrl);
  
  // Referencia para capturar los datos del formulario
  const formRef = React.useRef<HTMLFormElement>(null);

  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 };

  const opcionesCliente = React.useMemo(() => {
    if (tipoServicio === "METROLAN") return TIPOS_CLIENTE_METROLAN;
    if (tipoServicio === "IU") return PROVEEDOR_IU;
    return TIPO_CLIENTE_FULL;
  }, [tipoServicio]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries()) as any;

    const payload = {
      ...data,
      tipoServicio,
      diagramaRed: imagePreview,
      // Conversión de tipos obligatoria para que coincida con el backend
      vlan: data.vlan ? Number(data.vlan) : null,
      contrato: data.contrato ? Number(data.contrato) : null,
    };

    try {
      const response = await fetch('http://localhost:4000/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Servicio guardado exitosamente");
        onClose();
      } else {
        const err = await response.json();
        alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        {/* FORMULARIO CON REF */}
        <Box component="form" ref={formRef} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            
            {/* SECCIÓN DIAGRAMA */}
            <Grid size={12}>
              <Box 
                onClick={() => setShowImageSection(!showImageSection)}
                sx={{ 
                  display: 'flex', alignItems: 'center', p: 2, mb: 3, borderRadius: '8px',
                  bgcolor: showImageSection ? '#E8E7F5' : '#F1F0FB', 
                  cursor: 'pointer', transition: 'background-color 0.3s ease',
                  '&:hover': { bgcolor: '#DEDCF0' }
                }}
              >
                <AddIcon sx={{ color: '#080769', mr: 1 }} />
                <Typography sx={{ color: '#080769', fontWeight: 600, fontSize: '0.9rem' }}>
                  {showImageSection ? "Ocultar diagrama de red" : "Agregar diagrama de red"}
                </Typography>
              </Box>
              
              <Collapse in={showImageSection}>
                <Box sx={{ mb: 3, px: 1 }}>
                  <Avatar src={imagePreview || ""} variant="rounded" sx={{ width: '100%', height: 160, mb: 2, bgcolor: '#F8FAFC' }}>
                    {tipoServicio === "METROLAN" ? <DiagramIcon sx={{ fontSize: 40, color: '#94a3b8' }} /> : <PhotoCamera sx={{ fontSize: 40, color: '#94a3b8' }} />}
                  </Avatar>
                  <Button component="label" variant="text" startIcon={<UploadIcon />}>
                    {imagePreview ? "Cambiar archivo" : "Seleccionar imagen"}
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </Box>
              </Collapse>
            </Grid>

            {/* CAMPOS BASE */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>Tipo de Servicio</Typography>
                <TextField select fullWidth value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)} size="small">
                    {TIPOS_SERVICIO.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>{tipoServicio === "IU" ? "ID Servicio" : "Nombre del Cliente"}</Typography>
                <TextField fullWidth name={tipoServicio === "IU" ? "idServicio" : "name"} defaultValue={initialData?.name || initialData?.idServicio || ""} size="small" />
            </Grid>

            <Grid size={6}>
                <Typography sx={labelStyle}>Ciudad</Typography>
                <TextField select fullWidth name="city" defaultValue={initialData?.city || ""} size="small">
                    {CIUDADES_VENEZUELA.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
            </Grid>

            <Grid size={6}>
                <Typography sx={labelStyle}>Tipo de Cliente</Typography>
                <TextField select fullWidth name="tipo_cliente" defaultValue={initialData?.tipo_cliente || ""} size="small">
                    {opcionesCliente.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
            </Grid>

            <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

            {/* CAMPOS DINÁMICOS */}
            {tipoServicio === "METROLAN" && (
              <>
                <Grid size={12}><TextField name="idServicio" label="ID SERVICIO METROLAN" fullWidth required defaultValue={initialData?.idServicio || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodeA" label="NODO A" fullWidth required defaultValue={initialData?.nodeA || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodeB" label="NODO B" fullWidth required defaultValue={initialData?.nodeB || ""} size="small" /></Grid>
                <Grid size={12}><TextField name="vlan" label="VLAN / Segmento" fullWidth defaultValue={initialData?.vlan || ""} size="small" /></Grid>
              </>
            )}

            {tipoServicio === "RBS" && (
              <>
                <Grid size={6}><TextField name="idNetuno" label="ID Netuno" fullWidth required defaultValue={initialData?.idNetuno || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="idRBS" label="ID RBS" fullWidth required defaultValue={initialData?.idRBS || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.oltnode || ""} size="small" /></Grid>
                <Grid size={12}><TextField name="instalado" label="Fecha Instalación" type="date" fullWidth InputLabelProps={{ shrink: true }} defaultValue={initialData?.instalado || ""} size="small" /></Grid>
              </>
            )}

            {tipoServicio === "DOG" && (
              <>
                <Grid size={6}><TextField name="idNETUNO" label="ID Netuno" fullWidth required defaultValue={initialData?.idNETUNO || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="idDOG" label="ID Circuito" fullWidth required defaultValue={initialData?.idDOG || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth required defaultValue={initialData?.contrato || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="vlan" label="Vlan" fullWidth required defaultValue={initialData?.vlan || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.oltnode || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="idont" label="ID ONT" fullWidth defaultValue={initialData?.idont || ""} size="small" /></Grid>
                <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" /></Grid>
              </>
            )}
          </Grid>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#080769', borderRadius: '8px', px: 4 }}>
            Guardar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};