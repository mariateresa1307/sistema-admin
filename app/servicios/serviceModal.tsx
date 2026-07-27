// app/servicios/serviceModal.tsx
"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Button,
  TextField, MenuItem, Box, Divider, Avatar, Collapse, Snackbar, Alert, CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { 
  Close as CloseIcon, 
  CloudUpload as UploadIcon, 
  PhotoCamera, 
  Schema as DiagramIcon, 
  AddPhotoAlternate as AddIcon,
  ZoomIn as ZoomInIcon
} from "@mui/icons-material";
import { ConfiguracionInterface } from "app/utils/types";
import { createService, updateService, getMiscellaneous } from "@/lib/api";

const TIPOS_SERVICIO = ["DOG", "Redes Compartidas", "METROLAN", "RBS", "IU"];

export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData, onSuccess }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState("RBS");
  const [proveedorOUM, setProveedorOUM] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showImageSection, setShowImageSection] = React.useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Listas desde Miscellaneous
  const [ciudades, setCiudades] = React.useState<ConfiguracionInterface[]>([]);
  const [tipoClienteList, setTipoClienteList] = React.useState<ConfiguracionInterface[]>([]);
  const [proveedoresList, setProveedoresList] = React.useState<ConfiguracionInterface[]>([]);
  const [ultimaMillaList, setUltimaMillaList] = React.useState<ConfiguracionInterface[]>([]);
  
  const [loadingMisc, setLoadingMisc] = React.useState(true);

  // Selecciones
  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState<string>("");
  const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = React.useState<string>('');
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [vlanValue, setVlanValue] = React.useState<string>("");

  const triggerNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  };

  // 🔄 Carga de Miscellaneous desde Backend
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const cargarMiscellaneous = async () => {
      setLoadingMisc(true);
      try {
        const [resCiudades, resTiposCliente, resProveedores, resUltimaMilla] = await Promise.all([
          getMiscellaneous({ categoria: 'CIUDAD' }),
          getMiscellaneous({ categoria: 'TIPO_CLIENTE' }),
          getMiscellaneous({ categoria: 'PROVEEDOR' }),
          getMiscellaneous({ categoria: 'ULTIMA_MILLA' }),
        ]);

        if (isMounted) {
          setCiudades(resCiudades?.data || []);
          setTipoClienteList(resTiposCliente?.data || []);
          setProveedoresList(resProveedores?.data || []);
          setUltimaMillaList(resUltimaMilla?.data || []);
        }
      } catch (error) {
        console.error("❌ [Modal] Error cargando los datos miscellaneous:", error);
      } finally {
        if (isMounted) setLoadingMisc(false);
      }
    };

    cargarMiscellaneous();
    return () => { isMounted = false; };
  }, [isOpen]);

  // ✏️ Carga y sincronización de datos iniciales con dependencias estables
  React.useEffect(() => {
    if (!isOpen) {
      setTipoServicio("RBS");
      setProveedorOUM("");
      setCiudadSeleccionada("");
      setTipoClienteSeleccionado("");
      setImagePreview(null);
      setShowImageSection(false);
      setVlanValue("");
      return;
    }

    if (loadingMisc) return;

    if (!initialData || !initialData._id) {
      setTipoServicio("RBS");
      setProveedorOUM("");
      setCiudadSeleccionada("");
      setTipoClienteSeleccionado("");
      setImagePreview(null);
      setShowImageSection(false);
      setVlanValue("");
      return;
    }

    const currentTipo = initialData?.tipoServicio || "RBS";
    setTipoServicio(currentTipo);
    
    // ✅ MEJORA: Búsqueda robusta de la ciudad (maneja si viene como ID o como Nombre)
    let cityVal = "";
    if (typeof initialData.city === 'object' && initialData.city?.valor) {
      cityVal = initialData.city.valor;
    } else if (typeof initialData.city === 'string') {
      const foundCity = ciudades.find(c => String(c._id) === initialData.city || c.valor === initialData.city);
      cityVal = foundCity ? foundCity.valor : initialData.city;
    }
    setCiudadSeleccionada(cityVal || "");

    const tcId = typeof initialData.tipoCliente === 'object' ? initialData.tipoCliente?._id : initialData.tipoCliente;
    setTipoClienteSeleccionado(tcId ? String(tcId) : "");

    // ✅ LÓGICA ROBUSTA PARA RECUPERAR EL VALOR GUARDADO DE PROVEEDOR/ULTIMA MILLA
    if (currentTipo === "METROLAN") {
      const rawValue = initialData?.proveedorUM || initialData?.ultimaMilla;
      if (rawValue) {
        if (typeof rawValue === 'object' && rawValue.valor) {
          setProveedorOUM(String(rawValue.valor));
        } else {
          const searchId = String(rawValue);
          const foundItem = ultimaMillaList.find(item => String(item._id) === searchId);
          if (foundItem) {
            setProveedorOUM(String(foundItem.valor));
          } else {
            const foundByValue = ultimaMillaList.find(item => String(item.valor) === searchId);
            setProveedorOUM(foundByValue ? String(foundByValue.valor) : searchId);
          }
        }
      } else {
        setProveedorOUM("");
      }
    } else {
      const rawValue = initialData?.proveedorDelServicioCompartido;
      if (rawValue) {
        if (typeof rawValue === 'object' && rawValue.valor) {
          setProveedorOUM(String(rawValue.valor));
        } else {
          const searchId = String(rawValue);
          const foundItem = proveedoresList.find(item => String(item._id) === searchId);
          if (foundItem) {
            setProveedorOUM(String(foundItem.valor));
          } else {
            const foundByValue = proveedoresList.find(item => String(item.valor) === searchId);
            setProveedorOUM(foundByValue ? String(foundByValue.valor) : searchId);
          }
        }
      } else {
        setProveedorOUM("");
      }
    }

    setImagePreview(initialData?.diagramaRed || null);
    setShowImageSection(Boolean(initialData?.diagramaRed));
    setVlanValue(initialData?.vlan ? String(initialData.vlan) : "");
    
  }, [isOpen, loadingMisc, initialData, ciudades, ultimaMillaList, proveedoresList]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const labelStyle = { fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 };
  const isEditMode = Boolean(initialData?._id);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerNotification("La imagen no debe superar los 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/[^0-9-]/g, '');
    setVlanValue(cleanedValue);
  };

  const handleSave = async () => {
    if (!formRef.current || saving) return;
    
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries()) as any;
    const serviceId = initialData?._id || initialData?.id;
    
    if (isEditMode && !serviceId) {
      triggerNotification("Error: No se encontró el ID del servicio", "error");
      return;
    }

    const parseNumberOrNull = (value: any) => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = Number(value);
      return isNaN(parsed) ? null : parsed;
    };

    let parsedVlan: string | null = null;
    if (vlanValue && vlanValue.trim() !== "") {
      parsedVlan = vlanValue.trim();
    }

    const isMetrolan = tipoServicio === "METROLAN";
    
    // ✅ Busca el ID correspondiente al valor seleccionado para enviarlo al backend
    let idToSend: string | null = null;
    if (proveedorOUM && proveedorOUM.trim() !== "") {
      const listToSearch = isMetrolan ? ultimaMillaList : proveedoresList;
      const foundItem = listToSearch.find(item => 
        String(item.valor) === proveedorOUM || String(item._id) === proveedorOUM
      );
      idToSend = foundItem ? String(foundItem._id) : null;
    }

    const rawPayload = {
      tipoServicio,
      name: data.name || undefined,
      city: ciudadSeleccionada || undefined,
      tipoCliente: tipoClienteSeleccionado || undefined,
      
      ...(isMetrolan 
        ? { proveedorUM: idToSend || undefined } 
        : { proveedorDelServicioCompartido: idToSend || undefined }
      ),

      diagramaRed: imagePreview || undefined,
      ipNetuno: data.ipNetuno || undefined,
      id_circuito: data.id_circuito || undefined,
      id_netuno: data.id_netuno || undefined,
      idRBS: data.idRBS || undefined,
      idDOG: data.idDOG || undefined,
      nodoA: data.nodoA || undefined,
      nodoB: data.nodoB || undefined,
      nodoOLT: data.oltnode || undefined,
      vlan: parsedVlan || undefined,
      contrato: parseNumberOrNull(data.contrato),
      serialONT: data.serialONT || undefined,
      proveedor: data.proveedor || undefined,
      status: initialData?.status || "Activo"
    };

    // ✅ Limpia el payload eliminando undefined y strings vacíos, pero mantiene null y 0
    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([_, v]) => v !== undefined && v !== "")
    );

    try {
      setSaving(true);
      if (isEditMode && serviceId) {
        const response = await updateService(payload, String(serviceId));
        if (response.status === 200 || response.status === 201) {
          triggerNotification("Servicio actualizado correctamente", "success");
          onClose();
          if (onSuccess) onSuccess();
        }
      } else {
        const response = await createService(payload);
        if (response.status === 201) {
          triggerNotification("Servicio creado correctamente", "success");
          onClose();
          if (onSuccess) onSuccess();
        }
      }
    } catch (error: any) {
      console.error("❌ [Modal] Error completo:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error al guardar";
      triggerNotification(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const isMetrolan = tipoServicio === "METROLAN";
  const listaOpcionesDinamica = isMetrolan ? ultimaMillaList : proveedoresList;

  return (
    <>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#1ccf46' : '#d32f2f' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog 
        open={isImageModalOpen} 
        onClose={() => setIsImageModalOpen(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{ sx: { bgcolor: 'rgba(0, 0, 0, 0.9)', boxShadow: 'none' } }}
      >
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
          <IconButton 
            onClick={() => setIsImageModalOpen(false)} 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              color: 'white', 
              bgcolor: 'rgba(255, 255, 255, 0.1)', 
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              zIndex: 10
            }}
          >
            <CloseIcon />
          </IconButton>
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Diagrama de red ampliado" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '85vh', 
                objectFit: 'contain', 
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }} 
            />
          )}
        </Box>
      </Dialog>

      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0, fontWeight: 700 }}>
          {title}
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" ref={formRef} sx={{ mt: 2 }} key={initialData?._id || 'new-service'}>
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
                    <Box 
                      onClick={() => imagePreview && setIsImageModalOpen(true)}
                      sx={{ 
                        position: 'relative', 
                        cursor: imagePreview ? 'zoom-in' : 'default',
                        transition: 'transform 0.2s ease',
                        '&:hover': imagePreview ? { transform: 'scale(1.02)' } : {}
                      }}
                    >
                      <Avatar src={imagePreview || ""} variant="rounded" sx={{ width: '100%', height: 160, mb: 2, bgcolor: '#F8FAFC' }}>
                        {tipoServicio === "METROLAN" ? <DiagramIcon sx={{ fontSize: 40, color: '#94a3b8' }} /> : <PhotoCamera sx={{ fontSize: 40, color: '#94a3b8' }} />}
                      </Avatar>
                      {imagePreview && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          bgcolor: 'rgba(0,0,0,0.6)', 
                          color: 'white', 
                          borderRadius: '50%', 
                          p: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ZoomInIcon fontSize="small" />
                        </Box>
                      )}
                    </Box>
                    <Button component="label" variant="text" startIcon={<UploadIcon />}>
                      {imagePreview ? "Cambiar archivo" : "Seleccionar imagen"}
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                  </Box>
                </Collapse>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>Tipo de Servicio</Typography>
                <TextField select fullWidth value={tipoServicio} onChange={(e) => {
                  setTipoServicio(e.target.value);
                  setProveedorOUM("");
                }} size="small">
                  {TIPOS_SERVICIO.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>{tipoServicio === "IU" ? "Nombre del enlace" : "Nombre del Cliente"}</Typography>
                <TextField fullWidth name="name" defaultValue={initialData?.name ?? ""} size="small" />
              </Grid>

              <Grid size={6}>
                <Typography sx={labelStyle}>Ciudad</Typography>
                <TextField 
                  select 
                  fullWidth 
                  name="city" 
                  value={ciudadSeleccionada} 
                  onChange={(e) => setCiudadSeleccionada(e.target.value)} 
                  size="small"
                >
                  <MenuItem value=""><em>Seleccione una ciudad</em></MenuItem>
                  {ciudades.map((c) => (
                    <MenuItem key={c._id || c.valor} value={c.valor}>{c.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid size={6}>
                <Typography sx={labelStyle}>
                  {isMetrolan ? "Última Milla" : "Proveedor del servicio compartido"}
                </Typography>
                <TextField 
                  select 
                  fullWidth 
                  name={isMetrolan ? "proveedorUM" : "proveedorDelServicioCompartido"} 
                  value={proveedorOUM} 
                  onChange={(e) => setProveedorOUM(e.target.value)} 
                  size="small"
                >
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {listaOpcionesDinamica.map((item) => (
                    <MenuItem key={item._id || item.valor} value={item.valor}>{item.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid size={6}>
                <Typography sx={labelStyle}>Tipo de cliente</Typography>
                <TextField select fullWidth name="tipoCliente" value={tipoClienteSeleccionado} onChange={(e) => setTipoClienteSeleccionado(e.target.value)} size="small">
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {tipoClienteList.map((c) => (
                    <MenuItem key={c._id} value={String(c._id)}>{c.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

              {tipoServicio === "METROLAN" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="NODO A" fullWidth defaultValue={initialData?.nodoA ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="NODO B" fullWidth defaultValue={initialData?.nodoB ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="ipNetuno" label="IP NETUNO" fullWidth defaultValue={initialData?.ipNetuno ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} /></Grid>
                </>
              )}

              {tipoServicio === "RBS" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="idRBS" label="ID RBS" fullWidth defaultValue={initialData?.idRBS ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.nodoOLT ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} /></Grid>
                </>
              )}

              {tipoServicio === "IU" && (
                <>
                  <Grid size={6}><TextField name="id_circuito" label="ID Circuito" fullWidth defaultValue={initialData?.id_circuito ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN / Segmento" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y Puerto" fullWidth defaultValue={initialData?.nodoA ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB ?? ""} size="small" /></Grid>
                </>
              )}

              {tipoServicio === "DOG" && (
                <>
                  <Grid size={6}><TextField name="id_netuno" label="ID NETUNO" fullWidth defaultValue={initialData?.id_netuno ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="id_circuito" label="Circuito" fullWidth defaultValue={initialData?.id_circuito ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A y puerto" fullWidth defaultValue={initialData?.nodoA ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoB" label="Nodo B" fullWidth defaultValue={initialData?.nodoB ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="oltnode" label="Nodo OLT" fullWidth defaultValue={initialData?.nodoOLT ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="serialONT" label="Serial ONT" fullWidth defaultValue={initialData?.serialONT ?? ""} size="small" /></Grid>
                </>
              )}

              {tipoServicio === "Redes Compartidas" && (
                <>
                  <Grid size={6}><TextField name="ipNetuno" label="IP NETUNO" fullWidth defaultValue={initialData?.ipNetuno ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="contrato" label="Contrato" fullWidth defaultValue={initialData?.contrato ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="nodoA" label="Nodo A" fullWidth defaultValue={initialData?.nodoA ?? ""} size="small" /></Grid>
                  <Grid size={6}><TextField name="vlan" label="VLAN" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} /></Grid>
                </>
              )}
            </Grid>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#080769', borderRadius: '8px', px: 4 }} disabled={saving}>
              {saving ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};