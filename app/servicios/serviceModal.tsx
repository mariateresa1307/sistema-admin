"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Button,
  TextField, MenuItem, Box, Divider, Avatar, Collapse, Snackbar, Alert, CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Close as CloseIcon, CloudUpload as UploadIcon, PhotoCamera, Schema as DiagramIcon, AddPhotoAlternate as AddIcon } from "@mui/icons-material";
import { Switch, FormControlLabel } from "@mui/material";
import { ConfiguracionInterface } from "app/utils/types";
import { createService, updateService, getMiscellaneous } from "@/lib/api";

const CIUDADES_VENEZUELA = ["Caracas", "Maracaibo", "Valencia", "Guarenas / Guatire", "Barquisimeto", "Maracay", "San Cristóbal", "Mérida", "Puerto la cruz"].sort();
const TIPOS_SERVICIO = ["DOG", "Redes Compartidas", "METROLAN", "RBS", "IU"];
const TIPO_CLIENTE_FULL = ["TELEFONICA", "GALANET", "DIGITEL", "MOVILNET", "INTER", "EWINET", "VNET"];
const PROVEEDOR_IU = ["INTER", "DIGITEL", "VNET"];
const TIPOS_CLIENTE_METROLAN = ["CARRIER", "BANCA", "CORPO"];
const PROVEEDORES_UM = ["Inter", "Digitel", "Vnet", "Movistar", "Otro"];

export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState("RBS");
  const [proveedorCompartido, setProveedorCompartido] = React.useState(""); // ✅ NUEVO: Estado controlado
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showImageSection, setShowImageSection] = React.useState(false);
  const [tipoCliente, setTipoCliente] = React.useState<Array<ConfiguracionInterface>>([]);
  const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = React.useState<string>('');
  const [hasUltimaMilla, setHasUltimaMilla] = React.useState(false);
  const [proveedorUM, setProveedorUM] = React.useState("");
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'success' as any });
  const [loadingTiposCliente, setLoadingTiposCliente] = React.useState(false);

  const triggerNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };
  React.useEffect(() => {
    if (!isOpen) return;
    setTipoServicio(initialData?.tipoServicio || "RBS");
    setProveedorCompartido(initialData?.proveedorDelServicioCompartido || "");
    setHasUltimaMilla(!!initialData?.ultimaMilla);
    setProveedorUM(initialData?.proveedorUM || "");
    setImagePreview(initialData?.diagramaRed || null);
    setShowImageSection(!!initialData?.diagramaRed);

    if (initialData?.tipoCliente) {
      let tipoClienteId = '';
      
      if (typeof initialData.tipoCliente === 'object' && initialData.tipoCliente._id) {
        tipoClienteId = initialData.tipoCliente._id;
      } else if (typeof initialData.tipoCliente === 'string') {
        tipoClienteId = initialData.tipoCliente;
      }
      
      setTipoClienteSeleccionado(tipoClienteId);
      console.log("✅ [Modal] tipoCliente ID:", tipoClienteId);
    } else {
      setTipoClienteSeleccionado('');
    }
    const cargarTiposCliente = async () => {
      setLoadingTiposCliente(true);
      try {
        const config = await getMiscellaneous({ categoria: 'TIPO_CLIENTE' });
        console.log("✅ [Modal] Tipos de cliente cargados:", config.data);
        setTipoCliente(config.data || []);
      } catch (error) {
        console.error("❌ [Modal] Error cargando tipos de cliente:", error);
      } finally {
        setLoadingTiposCliente(false);
      }
    };

    cargarTiposCliente();
  }, [isOpen, initialData]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 };
  const isEditMode = Boolean(initialData?._id);

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
  const serviceId = initialData?._id || initialData?.id;
  
  if (isEditMode && !serviceId) {
    console.error("❌ [Modal] No se encontró el ID del servicio");
    triggerNotification("Error: No se encontró el ID del servicio", "error");
    return;
  }

  const payload = {
    tipoServicio,
    name: data.name || "",
    city: data.city || "",
    tipoCliente: tipoClienteSeleccionado || "",
    proveedorDelServicioCompartido: data.proveedorDelServicioCompartido || "",
    diagramaRed: imagePreview || "",
    ipNetuno: data.ipNetuno || null,
    id_circuito: data.id_circuito || null,
    id_netuno: data.id_netuno || null,
    idRBS: data.idRBS || null,
    idDOG: data.idDOG || null,
    nodoA: data.nodoA || null,
    nodoB: data.nodoB || null,
    nodoOLT: data.oltnode || null,
    vlan: data.vlan ? Number(data.vlan) : null,
    contrato: data.contrato ? Number(data.contrato) : null,
    serialONT: data.serialONT || null,
    ultimaMilla: data.hasUltimaMilla,
    proveedorUM: data.hasUltimaMilla ? data.proveedorUM : null,
    proveedor: data.proveedor || null,
    status: "Activo"
  };

  try {
    if (isEditMode && serviceId) {

      console.log(`🔄 [Modal] Actualizando servicio ${serviceId}...`);

      const response = await updateService(payload, String(serviceId));
      
      if (response.status === 200 || response.status === 201) {
        triggerNotification("Servicio actualizado correctamente", "success");
        setTimeout(onClose, 1000);
      }
    } else {
      // ✅ Crear nuevo servicio
      console.log("➕ [Modal] Creando nuevo servicio...");
      const response = await createService(payload);
      
      if (response.status === 201) {
        triggerNotification("Servicio creado correctamente", "success");
        setTimeout(onClose, 1000);
      }
    }
  } catch (error: any) {
    console.error("❌ [Modal] Error completo:", error);
    console.error("❌ [Modal] Response:", error.response);
    
    const errorMessage = error.response?.data?.message || error.message || "Error al guardar";
    triggerNotification(errorMessage, "error");
  }
};
  return (
    <>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#1ccf46' : '#d32f2f' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0, fontWeight: 700 }}>
          {title}
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" ref={formRef} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Box onClick={() => setShowImageSection(!showImageSection)} sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 3, borderRadius: '8px', bgcolor: showImageSection ? '#E8E7F5' : '#F1F0FB', cursor: 'pointer' }}>
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
                <TextField 
                  select 
                  fullWidth 
                  value={tipoServicio} 
                  onChange={(e) => {
                    setTipoServicio(e.target.value);
                  
                    if (e.target.value !== "METROLAN" && e.target.value !== "IU") {
                      setProveedorCompartido("");
                    }
                  }} 
                  size="small"
                >
                  {TIPOS_SERVICIO.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>{tipoServicio === "IU" ? "Nombre del enlace" : "Nombre del Cliente"}</Typography>
                <TextField fullWidth name="name" defaultValue={initialData?.name || ""} size="small" />
              </Grid>
              <Grid size={6}>
                <Typography sx={labelStyle}>Ciudad</Typography>
                <TextField select fullWidth name="city" defaultValue={initialData?.city || ""} size="small">
                  {CIUDADES_VENEZUELA.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              
              {/*  CORREGIDO: Proveedor del servicio compartido con estado controlado */}
              <Grid size={6}>
                <Typography sx={labelStyle}>{"Proveedor del servicio compartido"}</Typography>
                <TextField 
                  select 
                  fullWidth 
                  name="proveedorDelServicioCompartido" 
                  value={proveedorCompartido}
                  onChange={(e) => {
                    console.log("🔄 [Modal] Cambiando proveedor a:", e.target.value);
                    setProveedorCompartido(e.target.value);
                  }}
                  size="small"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {opcionesCliente.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Tipo de cliente */}
              <Grid size={6}>
                <Typography sx={labelStyle}>Tipo de cliente</Typography>
                {loadingTiposCliente ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Cargando...</Typography>
                  </Box>
                ) : (
                  <TextField 
                    select 
                    fullWidth 
                    name="tipoCliente" 
                    value={tipoClienteSeleccionado}
                    onChange={(e) => setTipoClienteSeleccionado(e.target.value)}
                    size="small"
                  >
            
                    {tipoCliente.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.valor}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>

              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

              {/* Resto de campos según tipoServicio... */}
              {tipoServicio === "METROLAN" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="NODO A" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="NODO B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="ipNetuno" label="IP NETUNO" fullWidth defaultValue={initialData?.ipNetuno || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN " fullWidth defaultValue={initialData?.vlan || ""} size="small" /></Grid>
                  <Grid size={6} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Switch checked={hasUltimaMilla} onChange={(e) => setHasUltimaMilla(e.target.checked)} />} label="¿Tiene última milla?" /></Grid>
                  {hasUltimaMilla && (
                    <Grid size={6}>
                      <TextField select fullWidth label="Proveedor UM" size="small" 
                      value={proveedorUM} onChange={(e) => setProveedorUM(e.target.value)}>
                        {PROVEEDORES_UM.map((prov) => (
                          <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}
                </>
              )}
              {tipoServicio === "RBS" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="idRBS" label="ID RBS" fullWidth defaultValue={initialData?.idRBS || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.nodoOLT || ""} size="small" /></Grid>
                </>
              )}
              {tipoServicio === "IU" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN / Segmento" fullWidth defaultValue={initialData?.vlan || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                </>
              )}
              {tipoServicio === "DOG" && (
                <>
                  <Grid size={6}><TextField name="id_netuno" label="ID NETUNO" fullWidth defaultValue={initialData?.id_netuno || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="id_circuito" label="Circuito" fullWidth defaultValue={initialData?.id_circuito || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth defaultValue={initialData?.vlan || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y puerto" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.nodoOLT || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT || ""} size="small" /></Grid>
                </>
              )}
              {tipoServicio === "Redes Compartidas" && (
                <>
                  <Grid size={6}><TextField name="ipNetuno" label="IP NETUNO" fullWidth defaultValue={initialData?.ipNetuno || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A" fullWidth defaultValue={initialData?.nodoA || ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth defaultValue={initialData?.vlan || ""} size="small" /></Grid>
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
    </>
  );
};