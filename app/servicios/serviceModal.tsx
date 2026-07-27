"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Button,
  TextField, MenuItem, Box, Divider, Avatar, Collapse, Snackbar, Alert, CircularProgress,
  FormControl, Select
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { 
  Close as CloseIcon, CloudUpload as UploadIcon, PhotoCamera, 
  Schema as DiagramIcon, AddPhotoAlternate as AddIcon, ZoomIn as ZoomInIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { ConfiguracionInterface } from "app/utils/types";
import { createService, updateService, getMiscellaneous } from "@/lib/api";
import { PRODUCTO } from "app/utils/constants"; // ✅ Constante importada directamente

const TIPOS_SERVICIO = ["DOG", "Redes Compartidas", "METROLAN", "RBS", "IU"];

export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData, onSuccess }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState("RBS");
  const [proveedorOUMId, setProveedorOUMId] = React.useState("");
  const [proveedorNotFound, setProveedorNotFound] = React.useState(false); 
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showImageSection, setShowImageSection] = React.useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [ciudades, setCiudades] = React.useState<ConfiguracionInterface[]>([]);
  const [tipoClienteList, setTipoClienteList] = React.useState<ConfiguracionInterface[]>([]);
  const [proveedoresList, setProveedoresList] = React.useState<ConfiguracionInterface[]>([]);
  const [ultimaMillaList, setUltimaMillaList] = React.useState<ConfiguracionInterface[]>([]);
  
  const [isMiscLoaded, setIsMiscLoaded] = React.useState(false);

  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState<string>("");
  const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = React.useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<string>(''); // ✅ Estado para el producto
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [vlanValue, setVlanValue] = React.useState<string>("");

  const triggerNotification = React.useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  React.useEffect(() => {
    if (!isOpen || isMiscLoaded) return; 
    let isMounted = true;

    const cargarMiscellaneous = async () => {
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
          setIsMiscLoaded(true);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargarMiscellaneous();
    return () => { isMounted = false; };
  }, [isOpen, isMiscLoaded]);

  React.useEffect(() => {
    if (!isOpen) {
      setTipoServicio("RBS");
      setCiudadSeleccionada("");
      setTipoClienteSeleccionado("");
      setProductoSeleccionado("");
      setVlanValue("");
      setImagePreview(null);
      setShowImageSection(false);
      setProveedorOUMId("");
      setProveedorNotFound(false);
      return;
    }

    if (!initialData || !initialData._id) {
      setTipoServicio("RBS");
      setCiudadSeleccionada("");
      setTipoClienteSeleccionado("");
      setProductoSeleccionado("");
      setVlanValue("");
      setImagePreview(null);
      setShowImageSection(false);
      setProveedorOUMId("");
      setProveedorNotFound(false);
      return;
    }

    const currentTipo = initialData.tipoServicio || "RBS";
    setTipoServicio(currentTipo);
    
    const cityVal = typeof initialData.city === 'object' && initialData.city?.valor 
      ? initialData.city.valor 
      : (typeof initialData.city === 'string' ? initialData.city : "");
    setCiudadSeleccionada(cityVal);

    const tcId = typeof initialData.tipoCliente === 'object' ? initialData.tipoCliente?._id : initialData.tipoCliente;
    setTipoClienteSeleccionado(tcId ? String(tcId) : "");

    // ✅ Inicializar el producto directamente con el valor del registro
    setProductoSeleccionado(initialData.producto || "");

    setVlanValue(initialData.vlan ? String(initialData.vlan) : "");
    setImagePreview(initialData.diagramaRed || null);
    setShowImageSection(Boolean(initialData.diagramaRed));

    let rawValue = currentTipo === "METROLAN" 
      ? (initialData.ultimaMilla || initialData.proveedorUM) 
      : initialData.proveedorDelServicioCompartido;

    if (rawValue) {
      let idValue = typeof rawValue === 'object' && rawValue !== null 
        ? String(rawValue._id || rawValue.valor) 
        : String(rawValue);

      if (idValue) {
        const listToCheck = currentTipo === "METROLAN" ? ultimaMillaList : proveedoresList;
        const foundItem = listToCheck.find((item: any) => String(item._id) === idValue);
        
        if (foundItem) {
          setProveedorOUMId(idValue);
          setProveedorNotFound(false);
        } else {
          const altList = currentTipo === "METROLAN" ? proveedoresList : ultimaMillaList;
          const foundInAlt = altList.find((item: any) => String(item._id) === idValue);
          
          if (foundInAlt) {
            setProveedorOUMId(idValue);
            setProveedorNotFound(false);
          } else {
            setProveedorOUMId(idValue);
            setProveedorNotFound(true);
          }
        }
      }
    } else {
      setProveedorOUMId("");
      setProveedorNotFound(false);
    }

  }, [isOpen, initialData, ultimaMillaList, proveedoresList]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const labelStyle = React.useMemo(() => ({ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 } as const), []);
  const isMetrolan = tipoServicio === "METROLAN";
  const isEditMode = Boolean(initialData?._id);

  const handleImageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [triggerNotification]);

  const handleVlanChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVlanValue(e.target.value.replace(/[^0-9-]/g, ''));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!formRef.current || saving) return;
    
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries()) as any;
    const serviceId = initialData?._id;
    
    if (isEditMode && !serviceId) {
      triggerNotification("Error: No se encontró el ID del servicio", "error");
      return;
    }

    const parseNumberOrNull = (value: any) => {
      if (value === undefined || value === null || value === "") return null;
      const parsed = Number(value);
      return isNaN(parsed) ? null : parsed;
    };

    const idToSend = proveedorOUMId && proveedorOUMId.trim() !== "" ? proveedorOUMId : null;

    const payload: any = {
      tipoServicio,
      name: data.name || undefined,
      city: ciudadSeleccionada || undefined,
      tipoCliente: tipoClienteSeleccionado || undefined,
      diagramaRed: imagePreview || undefined,
      ipNetuno: data.ipNetuno || undefined,
      // ✅ Envía el producto seleccionado si es Redes Compartidas
      producto: tipoServicio === "Redes Compartidas" ? (productoSeleccionado || undefined) : undefined,
      id_circuito: data.id_circuito || undefined,
      id_netuno: data.id_netuno || undefined,
      idRBS: data.idRBS || undefined,
      idDOG: data.idDOG || undefined,
      nodoA: data.nodoA || undefined,
      nodoB: data.nodoB || undefined,
      nodoOLT: data.oltnode || undefined,
      vlan: vlanValue.trim() || undefined,
      contrato: parseNumberOrNull(data.contrato),
      serialONT: data.serialONT || undefined,
      proveedor: data.proveedor || undefined,
      status: initialData?.status || "Activo"
    };

    if (isMetrolan) {
      payload.ultimaMilla = idToSend;
      payload.proveedorUM = null;
      payload.proveedorDelServicioCompartido = null;
    } else {
      payload.proveedorDelServicioCompartido = idToSend;
      payload.ultimaMilla = null;
      payload.proveedorUM = null;
    }

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });

    try {
      setSaving(true);
      const response = isEditMode && serviceId 
        ? await updateService(payload, String(serviceId))
        : await createService(payload);

      if (response.status === 200 || response.status === 201) {
        triggerNotification(`Servicio ${isEditMode ? 'actualizado' : 'creado'} correctamente`, "success");
        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Error al guardar";
      triggerNotification(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage, "error");
    } finally {
      setSaving(false);
    }
  }, [saving, initialData, isEditMode, tipoServicio, ciudadSeleccionada, tipoClienteSeleccionado, productoSeleccionado, imagePreview, vlanValue, proveedorOUMId, isMetrolan, triggerNotification, onClose, onSuccess]);

  const listaBase = isMetrolan ? ultimaMillaList : proveedoresList;

  const opcionesParaRenderizar = React.useMemo(() => {
    if (proveedorNotFound && proveedorOUMId) {
      const yaExiste = listaBase.some((item: any) => String(item._id) === proveedorOUMId);
      if (!yaExiste) {
        return [
          ...listaBase,
          { _id: proveedorOUMId, valor: `ID: ${proveedorOUMId.substring(0, 8)}...`, esFallback: true }
        ];
      }
    }
    return listaBase;
  }, [listaBase, proveedorNotFound, proveedorOUMId]);

  const safeCiudadValue = React.useMemo(() => 
    ciudades.some(c => c.valor === ciudadSeleccionada) ? ciudadSeleccionada : ""
  , [ciudades, ciudadSeleccionada]);

  const safeTipoClienteValue = React.useMemo(() => 
    tipoClienteList.some(c => String(c._id) === tipoClienteSeleccionado) ? tipoClienteSeleccionado : ""
  , [tipoClienteList, tipoClienteSeleccionado]);

  return (
    <>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#1ccf46' : '#d32f2f' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'rgba(0, 0, 0, 0.9)', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
          <IconButton onClick={() => setIsImageModalOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }, zIndex: 10 }}>
            <CloseIcon />
          </IconButton>
          {imagePreview && <img src={imagePreview} alt="Diagrama" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />}
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
                    <Box onClick={() => imagePreview && setIsImageModalOpen(true)} sx={{ position: 'relative', cursor: imagePreview ? 'zoom-in' : 'default', transition: 'transform 0.2s ease', '&:hover': imagePreview ? { transform: 'scale(1.02)' } : {} }}>
                      <Avatar src={imagePreview || ""} variant="rounded" sx={{ width: '100%', height: 160, mb: 2, bgcolor: '#F8FAFC' }}>
                        {tipoServicio === "METROLAN" ? <DiagramIcon sx={{ fontSize: 40, color: '#94a3b8' }} /> : <PhotoCamera sx={{ fontSize: 40, color: '#94a3b8' }} />}
                      </Avatar>
                      {imagePreview && (
                        <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <TextField select fullWidth value={tipoServicio} onChange={(e) => { setTipoServicio(e.target.value); setProveedorOUMId(""); setProveedorNotFound(false); }} size="small">
                  {TIPOS_SERVICIO.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={labelStyle}>{tipoServicio === "IU" ? "Nombre del enlace" : "Nombre del Cliente"}</Typography>
                <TextField fullWidth name="name" defaultValue={initialData?.name ?? ""} size="small" />
              </Grid>

              <Grid size={6}>
                <Typography sx={labelStyle}>Ciudad</Typography>
                <TextField select fullWidth name="city" value={safeCiudadValue} onChange={(e) => setCiudadSeleccionada(e.target.value)} size="small">
                  <MenuItem value=""><em>Seleccione una ciudad</em></MenuItem>
                  {ciudades.map((c) => <MenuItem key={c._id || c.valor} value={c.valor}>{c.valor}</MenuItem>)}
                </TextField>
              </Grid>
              
              <Grid size={6}>
                <Typography sx={labelStyle}>{isMetrolan ? "Última Milla" : "Proveedor del servicio compartido"}</Typography>
                <FormControl fullWidth size="small" error={proveedorNotFound}>
                  <Select
                    name={isMetrolan ? "ultimaMilla" : "proveedorDelServicioCompartido"}
                    value={proveedorOUMId}
                    onChange={(e) => { setProveedorOUMId(e.target.value); setProveedorNotFound(false); }}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    {opcionesParaRenderizar.map((item: any) => (
                      <MenuItem key={item._id} value={String(item._id)} sx={item.esFallback ? { bgcolor: '#fff3cd', color: '#856404', fontStyle: 'italic', borderLeft: '4px solid #ffc107', '&:hover': { bgcolor: '#ffe69c' } } : {}}>
                        {item.esFallback && <WarningIcon sx={{ mr: 1, fontSize: '1rem' }} />}
                        {item.valor}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {proveedorNotFound && (
                  <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block', fontWeight: 600 }}>
                    ⚠️ El registro original fue eliminado. Por favor, seleccione uno nuevo.
                  </Typography>
                )}
              </Grid>
              
              <Grid size={6}>
                <Typography sx={labelStyle}>Tipo de cliente</Typography>
                <TextField select fullWidth name="tipoCliente" value={safeTipoClienteValue} onChange={(e) => setTipoClienteSeleccionado(e.target.value)} size="small">
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {tipoClienteList.map((c) => <MenuItem key={c._id} value={String(c._id)}>{c.valor}</MenuItem>)}
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
                  
                  {/* ✅ Campo Producto mapeando directamente la constante importada PRODUCTO */}
                  <Grid size={6}>
                    <TextField 
                      select 
                      fullWidth 
                      name="producto" 
                      label="Producto" 
                      size="small" 
                      value={productoSeleccionado} 
                      onChange={(e) => setProductoSeleccionado(e.target.value)}
                    >
                      <MenuItem value=""><em>Seleccione un producto</em></MenuItem>
                      {PRODUCTO.map((prodName) => (
                        <MenuItem value={prodName} key={prodName}>{prodName}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
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