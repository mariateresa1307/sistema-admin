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
import { PRODUCTO, TIPO_SERVICIO } from "app/utils/constants";

// ✅ 1. CONFIGURACIÓN CENTRALIZADA: ENLACE ahora requiere AMBOS campos también
const TIPOS_CON_ULTIMA_MILLA = ["METROLAN", "FTTO", "RBS", "DOG", "ENLACE"];
const TIPOS_CON_PROVEEDOR_COMPARTIDO = ["METROLAN", "FTTO", "ENLACE"];

export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData, onSuccess }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState("RBS");

  const [proveedorOUMId, setProveedorOUMId] = React.useState("");
  const [proveedorCompartidoId, setProveedorCompartidoId] = React.useState("");
  const [proveedorNotFound, setProveedorNotFound] = React.useState(false);
  const [proveedorCompartidoNotFound, setProveedorCompartidoNotFound] = React.useState(false);

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [showImageSection, setShowImageSection] = React.useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, boolean>>({});
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [ciudades, setCiudades] = React.useState<ConfiguracionInterface[]>([]);
  const [tipoClienteList, setTipoClienteList] = React.useState<ConfiguracionInterface[]>([]);
  const [proveedoresList, setProveedoresList] = React.useState<ConfiguracionInterface[]>([]);
  const [ultimaMillaList, setUltimaMillaList] = React.useState<ConfiguracionInterface[]>([]);
  const [estadosList, setEstadosList] = React.useState<ConfiguracionInterface[]>([]);
  const [isMiscLoaded, setIsMiscLoaded] = React.useState(false);

  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState<string>("");
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState<string>("");
  const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = React.useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<string>('');
  const [vlanValue, setVlanValue] = React.useState<string>("");
  const [contratoValue, setContratoValue] = React.useState<string>("");
  const [ipNetuno, setIpNetuno] = React.useState<string>("");
  const [nameValue, setNameValue] = React.useState<string>("");
  const [idCircuitoValue, setIdCircuitoValue] = React.useState<string>("");
  const [idNetunoValue, setIdNetunoValue] = React.useState<string>("");
  const [idRBSValue, setIdRBSValue] = React.useState<string>("");
  const [idDOGValue, setIdDOGValue] = React.useState<string>("");
  const [nodoAValue, setNodoAValue] = React.useState<string>("");
  const [nodoBValue, setNodoBValue] = React.useState<string>("");
  const [nodoOLTValue, setNodoOLTValue] = React.useState<string>("");
  const [serialONTValue, setSerialONTValue] = React.useState<string>("");
  const [proveedorValue, setProveedorValue] = React.useState<string>("");

  const triggerNotification = React.useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  const normalizeToArray = React.useCallback((response: any): ConfiguracionInterface[] => {
    if (!response?.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.results)) return response.data.results;
    return [];
  }, []);

  React.useEffect(() => {
    if (!isOpen || isMiscLoaded) return;
    let isMounted = true;

    const cargarMiscellaneous = async () => {
      try {
        const [resCiudades, resTiposCliente, resProveedores, resUltimaMilla, resEstados] = await Promise.all([
          getMiscellaneous({ categoria: 'CIUDAD', limit: 9999 }),
          getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 9999 }),
          getMiscellaneous({ categoria: 'PROVEEDOR', limit: 9999 }),
          getMiscellaneous({ categoria: 'ULTIMA_MILLA', limit: 9999 }),
          getMiscellaneous({ categoria: 'ESTADO', limit: 9999 }),
        ]);

        if (isMounted) {
          setCiudades(normalizeToArray(resCiudades));
          setTipoClienteList(normalizeToArray(resTiposCliente));
          setProveedoresList(normalizeToArray(resProveedores));
          setUltimaMillaList(normalizeToArray(resUltimaMilla));
          setEstadosList(normalizeToArray(resEstados));
          setIsMiscLoaded(true);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        if (isMounted) setIsMiscLoaded(true);
      }
    };

    cargarMiscellaneous();
    return () => { isMounted = false; };
  }, [isOpen, isMiscLoaded, normalizeToArray]);

  const isInitialLoad = React.useRef(true);

  React.useEffect(() => {
    if (!isOpen) {
      isInitialLoad.current = true;
      return;
    }

    const resetForm = () => {
      setTipoServicio("RBS");
      setCiudadSeleccionada(""); setEstadoSeleccionado(""); setTipoClienteSeleccionado("");
      setProductoSeleccionado(""); setVlanValue(""); setContratoValue(""); setIpNetuno("");
      setNameValue(""); setIdCircuitoValue(""); setIdNetunoValue(""); setIdRBSValue("");
      setIdDOGValue(""); setNodoAValue(""); setNodoBValue(""); setNodoOLTValue("");
      setSerialONTValue(""); setProveedorValue(""); setImagePreview(null);
      setShowImageSection(false); setProveedorOUMId(""); setProveedorCompartidoId("");
      setProveedorNotFound(false); setProveedorCompartidoNotFound(false); setFieldErrors({});
    };

    if (!initialData || !initialData._id) {
      resetForm();
      isInitialLoad.current = true;
      return;
    }

    const currentTipo = initialData.tipoServicio || "RBS";
    setTipoServicio(currentTipo);

    let estadoVal = typeof initialData.estado === 'object' ? initialData.estado?.valor : initialData.estado;
    let cityVal = typeof initialData.city === 'object' ? initialData.city?.valor : initialData.city;

    if (cityVal && ciudades.length > 0) {
      const ciudadObj = ciudades.find((c: any) => (c.valor || '').toString().trim().toUpperCase() === cityVal.trim().toUpperCase());
      if (ciudadObj) cityVal = ciudadObj.valor;
    }
    if (!estadoVal && cityVal && ciudades.length > 0) {
      const ciudadObj = ciudades.find((c: any) => (c.valor || '').toString().trim().toUpperCase() === cityVal.trim().toUpperCase());
      if (ciudadObj?.padreNombre) estadoVal = ciudadObj.padreNombre;
    }

    setEstadoSeleccionado(estadoVal || "");
    setCiudadSeleccionada(cityVal || "");
    setTipoClienteSeleccionado(typeof initialData.tipoCliente === 'object' ? String(initialData.tipoCliente?._id || "") : String(initialData.tipoCliente || ""));
    setProductoSeleccionado(initialData.producto || "");
    setVlanValue(initialData.vlan ? String(initialData.vlan) : "");
    setContratoValue(initialData.contrato != null ? String(initialData.contrato) : "");
    setIpNetuno(initialData.ipNetuno || "");
    setNameValue(initialData.name || "");
    setIdCircuitoValue(initialData.id_circuito || "");
    setIdNetunoValue(initialData.id_netuno || "");
    setIdRBSValue(initialData.idRBS || "");
    setIdDOGValue(initialData.idDOG || "");
    setNodoAValue(initialData.nodoA || "");
    setNodoBValue(initialData.nodoB || "");
    setNodoOLTValue(initialData.nodoOLT || "");
    setSerialONTValue(initialData.serialONT || "");
    setProveedorValue(initialData.proveedor || "");
    setImagePreview(initialData.diagramaRed || null);
    setShowImageSection(Boolean(initialData.diagramaRed));

    const extractId = (raw: any): string => raw ? (typeof raw === 'object' ? String(raw._id || raw.valor || '') : String(raw)) : "";
    const findInList = (idValue: string, list: ConfiguracionInterface[]) => list.some((item: any) => String(item._id) === idValue);

    // ✅ 2. LÓGICA DE INICIALIZACIÓN INDEPENDIENTE Y LIMPIA
    const requiereUM = TIPOS_CON_ULTIMA_MILLA.includes(currentTipo);
    const requierePC = TIPOS_CON_PROVEEDOR_COMPARTIDO.includes(currentTipo);

    // Cargar Última Milla
    if (requiereUM) {
      const umId = extractId(initialData.ultimaMilla || initialData.proveedorUM);
      setProveedorOUMId(umId);
      setProveedorNotFound(umId ? !findInList(umId, ultimaMillaList) : false);
    } else {
      setProveedorOUMId("");
      setProveedorNotFound(false);
    }

    // Cargar Proveedor Compartido
    if (requierePC) {
      const pcId = extractId(initialData.proveedorDelServicioCompartido);
      setProveedorCompartidoId(pcId);
      setProveedorCompartidoNotFound(pcId ? !findInList(pcId, proveedoresList) : false);
    } else {
      setProveedorCompartidoId("");
      setProveedorCompartidoNotFound(false);
    }

    setFieldErrors({});
    isInitialLoad.current = true;
    const timer = setTimeout(() => { isInitialLoad.current = false; }, 200);
    return () => clearTimeout(timer);
  }, [isOpen, initialData, ultimaMillaList, proveedoresList, ciudades]);

  const labelStyle = React.useMemo(() => ({ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 } as const), []);

  const requiereUltimaMilla = TIPOS_CON_ULTIMA_MILLA.includes(tipoServicio);
  const requiereProveedorCompartido = TIPOS_CON_PROVEEDOR_COMPARTIDO.includes(tipoServicio);

  const validateForm = React.useCallback((): boolean => {
    const errors: Record<string, boolean> = {};
    const camposFaltantes: string[] = [];

    const check = (value: any, field: string, label: string) => {
      if (value === undefined || value === null || String(value).trim() === "") {
        errors[field] = true; camposFaltantes.push(label);
      } else {
        errors[field] = false;
      }
    };

    check(nameValue, "name", "Nombre");
    check(estadoSeleccionado, "estado", "Estado");
    check(ciudadSeleccionada, "city", "Ciudad");
    check(tipoClienteSeleccionado, "tipoCliente", "Tipo de Cliente");

    if (requiereUltimaMilla) check(proveedorOUMId, "proveedor", "Última Milla");
    if (requiereProveedorCompartido) check(proveedorCompartidoId, "proveedorCompartido", "Proveedor Compartido");

    if (tipoServicio === "METROLAN") {
      check(idCircuitoValue, "id_circuito", "ID Circuito");
      check(nodoAValue, "nodoA", "Nodo A");
      check(nodoBValue, "nodoB", "Nodo B");
      check(vlanValue, "vlan", "VLAN");
    } else if (tipoServicio === "RBS") {
      check(idCircuitoValue, "id_circuito", "ID Circuito");
      check(idRBSValue, "idRBS", "ID RBS");
      check(nodoAValue, "nodoA", "Nodo A");
      check(nodoBValue, "nodoB", "Nodo B");
      check(nodoOLTValue, "nodoOLT", "Nodo OLT");
    } else if (tipoServicio === "ENLACE") {
      check(idCircuitoValue, "id_circuito", "ID Circuito");
      check(vlanValue, "vlan", "VLAN");
      check(nodoAValue, "nodoA", "Nodo A");
      check(nodoBValue, "nodoB", "Nodo B");
    } else if (tipoServicio === "DOG") {
      check(idNetunoValue, "id_netuno", "ID Netuno");
      check(idCircuitoValue, "id_circuito", "ID Circuito");
      check(vlanValue, "vlan", "VLAN");
      check(nodoAValue, "nodoA", "Nodo A");
      check(nodoBValue, "nodoB", "Nodo B");
      check(nodoOLTValue, "nodoOLT", "Nodo OLT");
    } else if (tipoServicio === "FTTO") {
      check(nodoOLTValue, "nodoOLT", "Nodo OLT");
      check(vlanValue, "vlan", "VLAN");
      check(productoSeleccionado, "producto", "Producto");
    }

    setFieldErrors(errors);
    if (camposFaltantes.length > 0) {
      triggerNotification(`⚠️ Campos obligatorios: ${camposFaltantes.join(", ")}`, "error");
      return false;
    }
    return true;
  }, [tipoServicio, nameValue, estadoSeleccionado, ciudadSeleccionada, tipoClienteSeleccionado,
    proveedorOUMId, proveedorCompartidoId, idCircuitoValue, nodoAValue, nodoBValue, vlanValue,
    idRBSValue, nodoOLTValue, idNetunoValue, ipNetuno, productoSeleccionado, triggerNotification,
    requiereUltimaMilla, requiereProveedorCompartido]);

  const handleGenericChange = React.useCallback((setter: React.Dispatch<React.SetStateAction<any>>, field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }, []);

  const handleEstadoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoEstado = e.target.value;
    setEstadoSeleccionado(nuevoEstado);
    setFieldErrors(prev => ({ ...prev, estado: false }));
    if (isInitialLoad.current) return;

    if (!nuevoEstado) { setCiudadSeleccionada(""); return; }
    const ciudadesDelEstado = ciudades.filter((c: any) => (c.padreNombre || '').toString().trim().toUpperCase() === nuevoEstado.trim().toUpperCase());
    setCiudadSeleccionada(ciudadesDelEstado.length === 1 ? ciudadesDelEstado[0].valor : "");
    setFieldErrors(prev => ({ ...prev, city: false }));
  }, [ciudades]);

  const handleSave = React.useCallback(async () => {
    if (saving || !validateForm()) return;
    const serviceId = initialData?._id;
    if (Boolean(initialData) && !serviceId) return triggerNotification("Error: ID no encontrado", "error");

    const parseNum = (v: any) => (v == null || v === "" ? null : (isNaN(Number(v)) ? null : Number(v)));

    const payload: any = {
      tipoServicio, name: nameValue.trim() || undefined, estado: estadoSeleccionado || undefined,
      city: ciudadSeleccionada || undefined, tipoCliente: tipoClienteSeleccionado || undefined,
      diagramaRed: imagePreview || undefined, ipNetuno: ipNetuno.trim() || undefined,
      producto: tipoServicio === "FTTO" ? (productoSeleccionado || undefined) : undefined,
      id_circuito: idCircuitoValue.trim() || undefined, id_netuno: idNetunoValue.trim() || undefined,
      idRBS: idRBSValue.trim() || undefined, idDOG: idDOGValue.trim() || undefined,
      nodoA: nodoAValue.trim() || undefined, nodoB: nodoBValue.trim() || undefined,
      nodoOLT: nodoOLTValue.trim() || undefined, vlan: vlanValue.trim() || undefined,
      contrato: parseNum(contratoValue),
      serialONT: serialONTValue.trim() === "" ? null : serialONTValue.trim(),
      status: initialData?.status || "Activo"
    };

    // ✅ 3. LÓGICA DE GUARDADO: METROLAN, FTTO y ENLACE guardan AMBOS campos por separado
    if (tipoServicio === "METROLAN" || tipoServicio === "FTTO" || tipoServicio === "ENLACE") {
      payload.ultimaMilla = proveedorOUMId?.trim() || null;
      payload.proveedorDelServicioCompartido = proveedorCompartidoId?.trim() || null;
      payload.proveedorUM = null;
    } else if (requiereUltimaMilla) { // RBS, DOG
      payload.ultimaMilla = proveedorOUMId?.trim() || null;
      payload.proveedorDelServicioCompartido = null;
      payload.proveedorUM = null;
    } else { // Otros tipos legacy
      payload.proveedorDelServicioCompartido = proveedorOUMId?.trim() || null;
      payload.ultimaMilla = null;
      payload.proveedorUM = null;
    }

    Object.keys(payload).forEach(key => { if (payload[key] === undefined) delete payload[key]; });

    try {
      setSaving(true);
      const response = Boolean(initialData) && serviceId
        ? await updateService(payload, String(serviceId))
        : await createService(payload);

      if (response.status === 200 || response.status === 201) {
        triggerNotification(`Servicio ${Boolean(initialData) ? 'actualizado' : 'creado'} correctamente`, "success");
        onClose(); onSuccess?.();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Error al guardar";
      triggerNotification(Array.isArray(msg) ? msg.join(', ') : msg, "error");
    } finally {
      setSaving(false);
    }
  }, [saving, initialData, validateForm, tipoServicio, nameValue, estadoSeleccionado, ciudadSeleccionada,
    tipoClienteSeleccionado, imagePreview, ipNetuno, productoSeleccionado, idCircuitoValue, idNetunoValue,
    idRBSValue, idDOGValue, nodoAValue, nodoBValue, nodoOLTValue, vlanValue, contratoValue, serialONTValue,
    proveedorOUMId, proveedorCompartidoId, requiereUltimaMilla, triggerNotification, onClose, onSuccess]);

  const listaBase = React.useMemo(() => (requiereUltimaMilla ? ultimaMillaList : proveedoresList), [requiereUltimaMilla, ultimaMillaList, proveedoresList]);

  const opcionesParaRenderizar = React.useMemo(() => {
    const base = Array.isArray(listaBase) ? listaBase : [];
    if (proveedorNotFound && proveedorOUMId && !base.some((item: any) => String(item._id) === proveedorOUMId)) {
      return [...base, { _id: proveedorOUMId, valor: `ID: ${proveedorOUMId.substring(0, 8)}...`, esFallback: true }];
    }
    return base;
  }, [listaBase, proveedorNotFound, proveedorOUMId]);

  const opcionesProveedorCompartido = React.useMemo(() => {
    const base = Array.isArray(proveedoresList) ? proveedoresList : [];
    if (proveedorCompartidoNotFound && proveedorCompartidoId && !base.some((item: any) => String(item._id) === proveedorCompartidoId)) {
      return [...base, { _id: proveedorCompartidoId, valor: `ID: ${proveedorCompartidoId.substring(0, 8)}...`, esFallback: true }];
    }
    return base;
  }, [proveedoresList, proveedorCompartidoNotFound, proveedorCompartidoId]);

  const ciudadesFiltradas = React.useMemo(() => {
    if (!estadoSeleccionado || !Array.isArray(ciudades)) return [];
    const normEstado = estadoSeleccionado.trim().toUpperCase();
    return ciudades.filter((c: any) => (c.padreNombre || '').toString().trim().toUpperCase() === normEstado);
  }, [ciudades, estadoSeleccionado]);

  const renderLabel = React.useCallback((text: string, isRequired: boolean = false) => (
    <Typography sx={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 0.3 }}>
      {text}{isRequired && <span style={{ color: '#d32f2f', fontWeight: 700 }}>*</span>}
    </Typography>
  ), [labelStyle]);

  const getErrorProp = React.useCallback((fieldName: string) => fieldErrors[fieldName] === true, [fieldErrors]);

  return (
    <>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={notification.severity} variant="filled" sx={{ width: '100%', bgcolor: notification.severity === 'success' ? '#1ccf46' : '#d32f2f' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: 'rgba(0, 0, 0, 0.9)', boxShadow: 'none' } }}>
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
          <IconButton onClick={() => setIsImageModalOpen(false)} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }, zIndex: 10 }}><CloseIcon /></IconButton>
          {imagePreview && <img src={imagePreview} alt="Diagrama" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />}
        </Box>
      </Dialog>

      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '18px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0, fontWeight: 700 }}>
          {title}
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} key={initialData?._id || 'new-service'}>
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
                      {imagePreview && <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomInIcon fontSize="small" /></Box>}
                    </Box>
                    <Button component="label" variant="text" startIcon={<UploadIcon />}>
                      {imagePreview ? "Cambiar archivo" : "Seleccionar imagen"}
                      <input type="file" hidden accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) return triggerNotification("La imagen no debe superar los 5MB", "error");
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </Button>
                  </Box>
                </Collapse>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderLabel("Tipo de Servicio")}
                <TextField select fullWidth value={tipoServicio} onChange={(e) => {
                  setTipoServicio(e.target.value);
                  setProveedorOUMId(""); setProveedorCompartidoId("");
                  setProveedorNotFound(false); setProveedorCompartidoNotFound(false);
                  setFieldErrors({});
                }} size="small">
                  {Object.values(TIPO_SERVICIO).map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderLabel(tipoServicio === "ENLACE" ? "Nombre del enlace" : "Nombre del Servicio", true)}
                <TextField fullWidth name="name" value={nameValue} onChange={handleGenericChange(setNameValue, "name")} size="small" error={getErrorProp("name")} helperText={getErrorProp("name") ? "Campo obligatorio" : ""} />
              </Grid>

              <Grid size={6}>
                {renderLabel("Estado", true)}
                <TextField select fullWidth name="estado" value={estadoSeleccionado} onChange={handleEstadoChange} size="small" error={getErrorProp("estado")} helperText={getErrorProp("estado") ? "Campo obligatorio" : ""}>
                  <MenuItem value=""><em>Seleccione un estado</em></MenuItem>
                  {(Array.isArray(estadosList) ? estadosList : []).map((e) => <MenuItem key={e._id || e.valor} value={e.valor}>{e.valor}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={6}>
                {renderLabel("Ciudad", true)}
                <TextField select fullWidth name="city" value={ciudadSeleccionada} onChange={handleGenericChange(setCiudadSeleccionada, "city")} size="small" disabled={!estadoSeleccionado} error={getErrorProp("city")}
                  helperText={getErrorProp("city") ? "Campo obligatorio" : !estadoSeleccionado ? "Seleccione primero un estado" : ciudadesFiltradas.length === 1 ? "  " : `🔽 ${ciudadesFiltradas.length} ciudades disponibles`}
                  sx={{ '& .MuiFormHelperText-root': { color: getErrorProp("city") ? '#d32f2f' : (estadoSeleccionado && ciudadesFiltradas.length > 1 ? '#2563eb' : '#64748b') } }}>
                  <MenuItem value=""><em>Seleccione una ciudad</em></MenuItem>
                  {ciudadesFiltradas.map((c) => <MenuItem key={c._id || c.valor} value={c.valor}>{c.valor}</MenuItem>)}
                </TextField>
              </Grid>

              {/* ✅ 4. RENDERIZADO INDEPENDIENTE DE AMBOS CAMPOS (Ahora incluye ENLACE) */}
              {requiereUltimaMilla && (
                <Grid size={6}>
                  {renderLabel("Última Milla", true)}
                  <FormControl fullWidth size="small" error={proveedorNotFound || getErrorProp("proveedor")}>
                    <Select name="ultimaMilla" value={proveedorOUMId} onChange={(e) => { setProveedorOUMId(e.target.value); setProveedorNotFound(false); setFieldErrors(prev => ({ ...prev, proveedor: false })); }} displayEmpty sx={{ bgcolor: 'white' }}>
                      <MenuItem value=""><em>Ninguno</em></MenuItem>
                      {opcionesParaRenderizar.map((item: any) => (
                        <MenuItem key={item._id} value={String(item._id)} sx={item.esFallback ? { bgcolor: '#fff3cd', color: '#856404', fontStyle: 'italic', borderLeft: '4px solid #ffc107' } : {}}>
                          {item.esFallback && <WarningIcon sx={{ mr: 1, fontSize: '1rem' }} />}
                          {item.valor}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {getErrorProp("proveedor") && !proveedorNotFound && <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block', fontWeight: 600 }}>Campo obligatorio</Typography>}
                  {proveedorNotFound && <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block', fontWeight: 600 }}>⚠️ Registro eliminado, seleccione uno nuevo.</Typography>}
                </Grid>
              )}

              {requiereProveedorCompartido && (
                <Grid size={6}>
                  {renderLabel("Proveedor de Servicio Compartido", true)}
                  <FormControl fullWidth size="small" error={proveedorCompartidoNotFound || getErrorProp("proveedorCompartido")}>
                    <Select name="proveedorCompartido" value={proveedorCompartidoId} onChange={(e) => { setProveedorCompartidoId(e.target.value); setProveedorCompartidoNotFound(false); setFieldErrors(prev => ({ ...prev, proveedorCompartido: false })); }} displayEmpty sx={{ bgcolor: 'white' }}>
                      <MenuItem value=""><em>Ninguno</em></MenuItem>
                      {opcionesProveedorCompartido.map((item: any) => (
                        <MenuItem key={item._id} value={String(item._id)} sx={item.esFallback ? { bgcolor: '#fff3cd', color: '#856404', fontStyle: 'italic', borderLeft: '4px solid #ffc107' } : {}}>
                          {item.esFallback && <WarningIcon sx={{ mr: 1, fontSize: '1rem' }} />}
                          {item.valor}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {getErrorProp("proveedorCompartido") && !proveedorCompartidoNotFound && <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block', fontWeight: 600 }}>Campo obligatorio</Typography>}
                  {proveedorCompartidoNotFound && <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block', fontWeight: 600 }}>⚠️ Registro eliminado, seleccione uno nuevo.</Typography>}
                </Grid>
              )}

              <Grid size={6}>
                {renderLabel("Tipo de cliente", true)}
                <TextField select fullWidth name="tipoCliente" value={tipoClienteSeleccionado} onChange={(e) => { setTipoClienteSeleccionado(e.target.value); setFieldErrors(prev => ({ ...prev, tipoCliente: false })); }} size="small" error={getErrorProp("tipoCliente")} helperText={getErrorProp("tipoCliente") ? "Campo obligatorio" : ""}>
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {(Array.isArray(tipoClienteList) ? tipoClienteList : []).map((c) => <MenuItem key={c._id} value={String(c._id)}>{c.valor}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

              {tipoServicio === "METROLAN" && (
                <>
                  <Grid size={6}>{renderLabel("ID Circuito", true)}<TextField name="id_circuito" fullWidth value={idCircuitoValue} onChange={handleGenericChange(setIdCircuitoValue, "id_circuito")} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("Contrato")}<TextField name="contrato" fullWidth value={contratoValue} onChange={handleGenericChange(setContratoValue, "contrato")} size="small" /></Grid>
                  <Grid size={6}>{renderLabel("NODO A", true)}<TextField name="nodoA" fullWidth value={nodoAValue} onChange={handleGenericChange(setNodoAValue, "nodoA")} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Obligatorio" : "💡 Preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                  <Grid size={6}>{renderLabel("NODO B", true)}<TextField name="nodoB" fullWidth value={nodoBValue} onChange={handleGenericChange(setNodoBValue, "nodoB")} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Obligatorio" : "💡 Preferiblemente equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                  <Grid size={6}>{renderLabel("IP NETUNO")}<TextField name="ipNetuno" fullWidth value={ipNetuno} onChange={handleGenericChange(setIpNetuno, "ipNetuno")} size="small" /></Grid>
                  <Grid size={6}>{renderLabel("VLAN", true)}<TextField name="vlan" fullWidth value={vlanValue} onChange={(e) => { setVlanValue(e.target.value.replace(/[^0-9-]/g, '')); setFieldErrors(prev => ({ ...prev, vlan: false })); }} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Obligatorio" : ""} /></Grid>
                </>
              )}

              {(tipoServicio === "RBS" || tipoServicio === "DOG") && (
                <>
                  {tipoServicio === "DOG" && (
                    <>
                      <Grid size={6}>{renderLabel("ID NETUNO", true)}
                        <TextField name="id_netuno" fullWidth value={idNetunoValue} onChange={handleGenericChange(setIdNetunoValue, "id_netuno")} size="small" error={getErrorProp("id_netuno")} helperText={getErrorProp("id_netuno") ? "Obligatorio" : ""} />
                      </Grid>
                      <Grid size={6}>{renderLabel("Contrato")}
                        <TextField name="contrato" fullWidth value={contratoValue} onChange={handleGenericChange(setContratoValue, "contrato")} size="small" />
                      </Grid>
                    </>
                  )}
                  <Grid size={6}>{renderLabel("ID Circuito", true)}
                    <TextField name="id_circuito" fullWidth value={idCircuitoValue} onChange={handleGenericChange(setIdCircuitoValue, "id_circuito")} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>{renderLabel("VLAN")}
                    <TextField name="vlan" fullWidth value={vlanValue} onChange={(e) => { setVlanValue(e.target.value.replace(/[^0-9-]/g, '')); setFieldErrors(prev => ({ ...prev, vlan: false })); }} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Obligatorio" : ""} />
                  </Grid>
                  {tipoServicio === "RBS" && (
                    <Grid size={6}>{renderLabel("ID RBS", true)}
                      <TextField name="idRBS" fullWidth value={idRBSValue} onChange={handleGenericChange(setIdRBSValue, "idRBS")} size="small" error={getErrorProp("idRBS")} helperText={getErrorProp("idRBS") ? "Obligatorio" : ""} />
                    </Grid>
                  )}
                  <Grid size={6}>{renderLabel("Nodo A", true)}
                    <TextField name="nodoA" fullWidth value={nodoAValue} onChange={handleGenericChange(setNodoAValue, "nodoA")} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Obligatorio" : "💡 Preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>{renderLabel("Nodo B", true)}
                    <TextField name="nodoB" fullWidth value={nodoBValue} onChange={handleGenericChange(setNodoBValue, "nodoB")} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Obligatorio" : "💡 Preferiblemente equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>{renderLabel("Nodo OLT", true)}
                    <TextField name="oltnode" fullWidth value={nodoOLTValue} onChange={handleGenericChange(setNodoOLTValue, "nodoOLT")} size="small" error={getErrorProp("nodoOLT")} helperText={getErrorProp("nodoOLT") ? "Obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>{renderLabel("Serial ONT")}
                    <TextField name="serialONT" fullWidth value={serialONTValue} onChange={handleGenericChange(setSerialONTValue, "serialONT")} size="small"  />
                  </Grid>
                </>
              )}

              {tipoServicio === "ENLACE" && (
                <>
                  <Grid size={6}>{renderLabel("ID Circuito", true)}<TextField name="id_circuito" fullWidth value={idCircuitoValue} onChange={handleGenericChange(setIdCircuitoValue, "id_circuito")} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("VLAN / Segmento", true)}<TextField name="vlan" fullWidth value={vlanValue} onChange={(e) => { setVlanValue(e.target.value.replace(/[^0-9-]/g, '')); setFieldErrors(prev => ({ ...prev, vlan: false })); }} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("Nodo A", true)}<TextField name="nodoA" fullWidth value={nodoAValue} onChange={handleGenericChange(setNodoAValue, "nodoA")} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Obligatorio" : "💡 Preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                  <Grid size={6}>{renderLabel("Nodo B", true)}<TextField name="nodoB" fullWidth value={nodoBValue} onChange={handleGenericChange(setNodoBValue, "nodoB")} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Obligatorio" : "💡 Preferiblemente equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                </>
              )}

              {tipoServicio === "FTTO" && (
                <>
                  <Grid size={6}>{renderLabel("IP NETUNO")}<TextField name="ipNetuno" fullWidth value={ipNetuno} onChange={handleGenericChange(setIpNetuno, "ipNetuno")} size="small" error={getErrorProp("ipNetuno")} helperText={getErrorProp("ipNetuno") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("Contrato")}<TextField name="contrato" fullWidth value={contratoValue} onChange={handleGenericChange(setContratoValue, "contrato")} size="small" /></Grid>
                  <Grid size={6}>{renderLabel("Nodo A")}<TextField name="nodoA" fullWidth value={nodoAValue} onChange={handleGenericChange(setNodoAValue, "nodoA")} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Obligatorio" : "💡 Preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                  <Grid size={6}>{renderLabel("Nodo B")}<TextField name="nodoB" fullWidth value={nodoBValue} onChange={handleGenericChange(setNodoBValue, "nodoB")} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Obligatorio" : "💡 Preferiblemente equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} /></Grid>
                  <Grid size={6}>{renderLabel("Nodo OLT", true)}<TextField name="oltnode" fullWidth value={nodoOLTValue} onChange={handleGenericChange(setNodoOLTValue, "nodoOLT")} size="small" error={getErrorProp("nodoOLT")} helperText={getErrorProp("nodoOLT") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("VLAN", true)}<TextField name="vlan" fullWidth value={vlanValue} onChange={(e) => { setVlanValue(e.target.value.replace(/[^0-9-]/g, '')); setFieldErrors(prev => ({ ...prev, vlan: false })); }} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Obligatorio" : ""} /></Grid>
                  <Grid size={6}>{renderLabel("Serial ONT")}<TextField name="serialONT" fullWidth value={serialONTValue} onChange={handleGenericChange(setSerialONTValue, "serialONT")} size="small" /></Grid>
                  <Grid size={6}>{renderLabel("Producto", true)}
                    <TextField select fullWidth name="producto" value={productoSeleccionado} onChange={(e) => { setProductoSeleccionado(e.target.value); setFieldErrors(prev => ({ ...prev, producto: false })); }} size="small" error={getErrorProp("producto")} helperText={getErrorProp("producto") ? "Obligatorio" : ""}>
                      <MenuItem value=""><em>Seleccione un producto</em></MenuItem>
                      {PRODUCTO.map((prodName) => <MenuItem value={prodName} key={prodName}>{prodName}</MenuItem>)}
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