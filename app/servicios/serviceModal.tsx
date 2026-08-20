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
import Autocomplete from '@mui/material/Autocomplete';


export const FullScreenServiceDialog = ({ isOpen, onClose, title = "Nuevo Servicio", initialData, onSuccess }: any) => {
  const [tipoServicio, setTipoServicio] = React.useState("DOG");
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
  const [estadosList, setEstadosList] = React.useState<ConfiguracionInterface[]>([]);
  const [isMiscLoaded, setIsMiscLoaded] = React.useState(false);
  const [ciudadSeleccionada, setCiudadSeleccionada] = React.useState<string>("");
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState<string>("");
  const [tipoClienteSeleccionado, setTipoClienteSeleccionado] = React.useState<string>('');
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<string>('');
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
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
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, boolean>>({});

  const triggerNotification = React.useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({ open: true, message, severity });
  }, []);

  const normalizeToArray = (response: any): ConfiguracionInterface[] => {
    if (!response?.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.results)) return response.data.results;
    return [];
  };

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
        if (isMounted) {
          setCiudades([]);
          setTipoClienteList([]);
          setProveedoresList([]);
          setUltimaMillaList([]);
          setEstadosList([]);
          setIsMiscLoaded(true);
        }
      }
    };

    cargarMiscellaneous();
    return () => { isMounted = false; };
  }, [isOpen, isMiscLoaded]);

  React.useEffect(() => {
    if (!isOpen || !initialData || !initialData._id) {
      setTipoServicio("RBS");
      setCiudadSeleccionada("");
      setEstadoSeleccionado("");
      setTipoClienteSeleccionado("");
      setProductoSeleccionado("");
      setVlanValue("");
      setContratoValue("");
      setIpNetuno("");
      setNameValue("");
      setIdCircuitoValue("");
      setIdNetunoValue("");
      setIdRBSValue("");
      setIdDOGValue("");
      setNodoAValue("");
      setNodoBValue("");
      setNodoOLTValue("");
      setSerialONTValue("");
      setProveedorValue("");
      setImagePreview(null);
      setShowImageSection(false);
      setProveedorOUMId("");
      setProveedorNotFound(false);
      setFieldErrors({});
      return;
    }

    const currentTipo = initialData.tipoServicio || "RBS";
    setTipoServicio(currentTipo);

    const estadoVal = typeof initialData.estado === 'object' && initialData.estado?.valor
      ? initialData.estado.valor
      : (typeof initialData.estado === 'string' ? initialData.estado : "");
    setEstadoSeleccionado(estadoVal);

    const cityVal = typeof initialData.city === 'object' && initialData.city?.valor
      ? initialData.city.valor
      : (typeof initialData.city === 'string' ? initialData.city : "");
    setCiudadSeleccionada(cityVal);

    const tcId = typeof initialData.tipoCliente === 'object' ? initialData.tipoCliente?._id : initialData.tipoCliente;
    setTipoClienteSeleccionado(tcId ? String(tcId) : "");

    setProductoSeleccionado(initialData.producto || "");
    setVlanValue(initialData.vlan ? String(initialData.vlan) : "");
    setContratoValue(initialData.contrato !== null && initialData.contrato !== undefined ? String(initialData.contrato) : "");
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

    setFieldErrors({});
  }, [isOpen, initialData, ultimaMillaList, proveedoresList]);

  const formRef = React.useRef<HTMLFormElement>(null);
  const labelStyle = React.useMemo(() => ({ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 } as const), []);
  const isMetrolan = tipoServicio === "METROLAN";
  const isEditMode = Boolean(initialData?._id);

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    const camposFaltantes: string[] = [];

    const checkRequired = (value: any, fieldName: string, label: string) => {
      const isEmpty = value === undefined || value === null || String(value).trim() === "";
      if (isEmpty) {
        errors[fieldName] = true;
        camposFaltantes.push(label);
      } else {
        errors[fieldName] = false;
      }
    };

    checkRequired(nameValue, "name", "Nombre");
    checkRequired(estadoSeleccionado, "estado", "Estado");
    checkRequired(ciudadSeleccionada, "city", "Ciudad");
    checkRequired(tipoClienteSeleccionado, "tipoCliente", "Tipo de Cliente");
    checkRequired(proveedorOUMId, "proveedor", isMetrolan ? "Última Milla" : "Proveedor");

    if (tipoServicio === "METROLAN") {
      checkRequired(idCircuitoValue, "id_circuito", "ID Circuito");
      checkRequired(contratoValue, "contrato", "Contrato");
      checkRequired(nodoAValue, "nodoA", "Nodo A");
      checkRequired(nodoBValue, "nodoB", "Nodo B");
      checkRequired(ipNetuno, "ipNetuno", "IP Netuno");
      checkRequired(vlanValue, "vlan", "VLAN");
    } else if (tipoServicio === "RBS") {
      checkRequired(idCircuitoValue, "id_circuito", "ID Circuito");
      checkRequired(idRBSValue, "idRBS", "ID RBS");
      checkRequired(serialONTValue, "serialONT", "Serial ONT");
      checkRequired(nodoAValue, "nodoA", "Nodo A");
      checkRequired(nodoBValue, "nodoB", "Nodo B");
      checkRequired(nodoOLTValue, "nodoOLT", "Nodo OLT");
    } else if (tipoServicio === "ENLACE") {
      checkRequired(idCircuitoValue, "id_circuito", "ID Circuito");
      checkRequired(vlanValue, "vlan", "VLAN");
      checkRequired(nodoAValue, "nodoA", "Nodo A");
      checkRequired(nodoBValue, "nodoB", "Nodo B");
    } else if (tipoServicio === "DOG") {
      checkRequired(idNetunoValue, "id_netuno", "ID Netuno");
      checkRequired(contratoValue, "contrato", "Contrato");
      checkRequired(idCircuitoValue, "id_circuito", "ID Circuito");
      checkRequired(vlanValue, "vlan", "VLAN");
      checkRequired(nodoAValue, "nodoA", "Nodo A");
      checkRequired(nodoBValue, "nodoB", "Nodo B");
      checkRequired(nodoOLTValue, "nodoOLT", "Nodo OLT");
      checkRequired(serialONTValue, "serialONT", "Serial ONT");
    } else if (tipoServicio === "REDES COMPARTIDAS") {
      checkRequired(ipNetuno, "ipNetuno", "IP Netuno");
      checkRequired(contratoValue, "contrato", "Contrato");
      checkRequired(nodoAValue, "nodoA", "Nodo A");
      checkRequired(vlanValue, "vlan", "VLAN");
      checkRequired(productoSeleccionado, "producto", "Producto");
    }

    setFieldErrors(errors);

    if (camposFaltantes.length > 0) {
      triggerNotification(
        `⚠️ Campos obligatorios faltantes: ${camposFaltantes.join(", ")}`,
        "error"
      );
      return false;
    }

    return true;
  };

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
    setFieldErrors(prev => ({ ...prev, vlan: false }));
  }, []);

  const handleIpChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIpNetuno(e.target.value.replace(/[^0-9.]/g, ''));
    setFieldErrors(prev => ({ ...prev, ipNetuno: false }));
  }, []);

  const handleContratoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContratoValue(e.target.value.replace(/[^0-9]/g, ''));
    setFieldErrors(prev => ({ ...prev, contrato: false }));
  }, []);

  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, name: false }));
  }, []);

  const handleEstadoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoEstado = e.target.value;
    setEstadoSeleccionado(nuevoEstado);
    setFieldErrors(prev => ({ ...prev, estado: false }));

    // Sin estado → limpiar ciudad
    if (!nuevoEstado) {
      setCiudadSeleccionada("");
      return;
    }

    // Filtrar ciudades del nuevo estado
    const ciudadesDelEstado = ciudades.filter((c: any) => {
      const padreNombre = (c.padreNombre || '').toString().trim().toUpperCase();
      return padreNombre === nuevoEstado.trim().toUpperCase();
    });

    if (ciudadesDelEstado.length === 1) {
      // ✅ UNA sola ciudad: cargarla automáticamente
      setCiudadSeleccionada(ciudadesDelEstado[0].valor);
      setFieldErrors(prev => ({ ...prev, city: false }));
    } else {
      // ✅ VARIAS ciudades (o ninguna): el usuario debe seleccionar
      setCiudadSeleccionada("");
    }
  }, [ciudades]);

  // ✅ NUEVO: handler para cambio de ciudad
  const handleCiudadChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCiudadSeleccionada(e.target.value);
    setFieldErrors(prev => ({ ...prev, city: false }));
  }, []);

  const handleIdCircuitoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIdCircuitoValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, id_circuito: false }));
  }, []);

  const handleIdNetunoChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIdNetunoValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, id_netuno: false }));
  }, []);

  const handleIdRBSChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIdRBSValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, idRBS: false }));
  }, []);

  const handleIdDOGChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIdDOGValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, idDOG: false }));
  }, []);

  const handleNodoAChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodoAValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, nodoA: false }));
  }, []);

  const handleNodoBChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodoBValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, nodoB: false }));
  }, []);

  const handleNodoOLTChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodoOLTValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, nodoOLT: false }));
  }, []);

  const handleSerialONTChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSerialONTValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, serialONT: false }));
  }, []);

  const handleProveedorChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProveedorValue(e.target.value);
    setFieldErrors(prev => ({ ...prev, proveedor: false }));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (saving) return;

    if (!validateForm()) return;

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
      name: nameValue.trim() || undefined,
      estado: estadoSeleccionado || undefined,
      city: ciudadSeleccionada || undefined,
      tipoCliente: tipoClienteSeleccionado || undefined,
      diagramaRed: imagePreview || undefined,
      ipNetuno: ipNetuno.trim() || undefined,
      producto: tipoServicio === "REDES COMPARTIDAS" ? (productoSeleccionado || undefined) : undefined,
      id_circuito: idCircuitoValue.trim() || undefined,
      id_netuno: idNetunoValue.trim() || undefined,
      idRBS: idRBSValue.trim() || undefined,
      idDOG: idDOGValue.trim() || undefined,
      nodoA: nodoAValue.trim() || undefined,
      nodoB: nodoBValue.trim() || undefined,
      nodoOLT: nodoOLTValue.trim() || undefined,
      vlan: vlanValue.trim() || undefined,
      contrato: parseNumberOrNull(contratoValue),
      serialONT: serialONTValue.trim() || undefined,
      proveedor: proveedorValue.trim() || undefined,
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
  }, [
    saving, initialData, isEditMode, tipoServicio, ciudadSeleccionada,
    estadoSeleccionado, tipoClienteSeleccionado, productoSeleccionado, imagePreview, vlanValue,
    ipNetuno, contratoValue, proveedorOUMId, isMetrolan, triggerNotification,
    onClose, onSuccess, nameValue, idCircuitoValue, idNetunoValue, idRBSValue,
    idDOGValue, nodoAValue, nodoBValue, nodoOLTValue, serialONTValue, proveedorValue
  ]);

  const listaBase = isMetrolan ? ultimaMillaList : proveedoresList;

  const opcionesParaRenderizar = React.useMemo(() => {
    const base = Array.isArray(listaBase) ? listaBase : [];
    if (proveedorNotFound && proveedorOUMId) {
      const yaExiste = base.some((item: any) => String(item._id) === proveedorOUMId);
      if (!yaExiste) {
        return [
          ...base,
          { _id: proveedorOUMId, valor: `ID: ${proveedorOUMId.substring(0, 8)}...`, esFallback: true }
        ];
      }
    }
    return base;
  }, [listaBase, proveedorNotFound, proveedorOUMId]);

  // ✅ CORREGIDO: filtra ciudades por padreNombre (campo real en la BD)
  const ciudadesFiltradas = React.useMemo(() => {
    const lista = Array.isArray(ciudades) ? ciudades : [];
    if (!estadoSeleccionado) return [];

    return lista.filter((c: any) => {
      const padreNombre = (c.padreNombre || '').toString().trim().toUpperCase();
      return padreNombre === estadoSeleccionado.trim().toUpperCase();
    });
  }, [ciudades, estadoSeleccionado]);

  const safeEstadoValue = React.useMemo(() => {
    const lista = Array.isArray(estadosList) ? estadosList : [];
    return lista.some(e => e.valor === estadoSeleccionado) ? estadoSeleccionado : "";
  }, [estadosList, estadoSeleccionado]);

  const safeCiudadValue = React.useMemo(() => {
    if (!ciudadSeleccionada) return "";
    const existe = ciudadesFiltradas.some(c => c.valor === ciudadSeleccionada) ||
      ciudades.some(c => c.valor === ciudadSeleccionada);
    return existe ? ciudadSeleccionada : "";
  }, [ciudadesFiltradas, ciudadSeleccionada, ciudades]);

  const safeTipoClienteValue = React.useMemo(() => {
    const lista = Array.isArray(tipoClienteList) ? tipoClienteList : [];
    return lista.some(c => String(c._id) === tipoClienteSeleccionado) ? tipoClienteSeleccionado : "";
  }, [tipoClienteList, tipoClienteSeleccionado]);

  const renderLabel = (text: string, isRequired: boolean = false) => (
    <Typography sx={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 0.3 }}>
      {text}
      {isRequired && <span style={{ color: '#d32f2f', fontWeight: 700 }}>*</span>}
    </Typography>
  );

  const getErrorProp = (fieldName: string) => fieldErrors[fieldName] === true;

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
                {renderLabel("Tipo de Servicio")}
                <TextField select fullWidth value={tipoServicio} onChange={(e) => { setTipoServicio(e.target.value); setProveedorOUMId(""); setProveedorNotFound(false); setFieldErrors({}); }} size="small">
                  {Object.values(TIPO_SERVICIO).map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {renderLabel(tipoServicio === "ENLACE" ? "Nombre del enlace" : "Nombre del Servicio", true)}
                <TextField
                  fullWidth
                  name="name"
                  value={nameValue}
                  onChange={handleNameChange}
                  size="small"
                  error={getErrorProp("name")}
                  helperText={getErrorProp("name") ? "Campo obligatorio" : ""}
                />
              </Grid>

              <Grid size={6}>
                {renderLabel("Estado", true)}
                <TextField
                  select
                  fullWidth
                  name="estado"
                  value={safeEstadoValue}
                  onChange={handleEstadoChange}
                  size="small"
                  error={getErrorProp("estado")}
                  helperText={getErrorProp("estado") ? "Campo obligatorio" : ""}
                >
                  <MenuItem value=""><em>Seleccione un estado</em></MenuItem>
                  {(Array.isArray(estadosList) ? estadosList : []).map((e) => (
                    <MenuItem key={e._id || e.valor} value={e.valor}>{e.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* ✅ CAMBIADO: Ciudad ahora es un SELECT con las ciudades del estado seleccionado */}
              <Grid size={6}>
                {renderLabel("Ciudad", true)}
                <TextField
                  select
                  fullWidth
                  name="city"
                  value={safeCiudadValue}
                  onChange={handleCiudadChange}
                  size="small"
                  disabled={!estadoSeleccionado}
                  error={getErrorProp("city")}
                  helperText={
                    getErrorProp("city")
                      ? "Campo obligatorio"
                      : !estadoSeleccionado
                        ? "Seleccione primero un estado"
                        : ciudadesFiltradas.length === 1
                          ? "  "
                          : `🔽 ${ciudadesFiltradas.length} ciudades disponibles, seleccione una`
                  }
                  sx={{
                    // ✅ Estilos condicionales para el helperText
                    '& .MuiFormHelperText-root': {
                      // Color por defecto (gris)
                      color: '#64748b',
                      // Si hay error, usar color rojo (MUI lo maneja automáticamente)
                      // Si hay ciudades disponibles, usar azul
                      ...((!getErrorProp("city") && estadoSeleccionado && ciudadesFiltradas.length > 1) && {
                        color: '#2563eb',
                        fontWeight: 500,
                      }),
                      // Si no hay estado seleccionado, usar naranja
                      ...((!getErrorProp("city") && !estadoSeleccionado) && {
                        color: '#d97706',
                        fontStyle: 'italic',
                      }),
                    },
                  }}
                >
                  <MenuItem value=""><em>Seleccione una ciudad</em></MenuItem>
                  {ciudadesFiltradas.map((c) => (
                    <MenuItem key={c._id || c.valor} value={c.valor}>{c.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={6}>
                {renderLabel(isMetrolan ? "Última Milla" : "Proveedor del servicio compartido", true)}
                <FormControl fullWidth size="small" error={proveedorNotFound || getErrorProp("proveedor")}>
                  <Select
                    name={isMetrolan ? "ultimaMilla" : "proveedorDelServicioCompartido"}
                    value={proveedorOUMId}
                    onChange={(e) => { setProveedorOUMId(e.target.value); setProveedorNotFound(false); setFieldErrors(prev => ({ ...prev, proveedor: false })); }}
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
                {getErrorProp("proveedor") && !proveedorNotFound && (
                  <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, display: 'block', fontWeight: 600 }}>
                    Campo obligatorio
                  </Typography>
                )}
                {proveedorNotFound && (
                  <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block', fontWeight: 600 }}>
                    ⚠️ El registro original fue eliminado. Por favor, seleccione uno nuevo.
                  </Typography>
                )}
              </Grid>

              <Grid size={6}>
                {renderLabel("Tipo de cliente", true)}
                <TextField select fullWidth name="tipoCliente" value={safeTipoClienteValue} onChange={(e) => { setTipoClienteSeleccionado(e.target.value); setFieldErrors(prev => ({ ...prev, tipoCliente: false })); }} size="small" error={getErrorProp("tipoCliente")} helperText={getErrorProp("tipoCliente") ? "Campo obligatorio" : ""}>
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {(Array.isArray(tipoClienteList) ? tipoClienteList : []).map((c) => (
                    <MenuItem key={c._id} value={String(c._id)}>{c.valor}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>

              {tipoServicio === "METROLAN" && (
                <>
                  <Grid size={6}>
                    {renderLabel("ID Circuito", true)}
                    <TextField name="id_circuito" label="" fullWidth value={idCircuitoValue} onChange={handleIdCircuitoChange} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Contrato", true)}
                    <TextField name="contrato" label="" fullWidth value={contratoValue} onChange={handleContratoChange} size="small" error={getErrorProp("contrato")} helperText={getErrorProp("contrato") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("NODO A", true)}
                    <TextField name="nodoA" label="" fullWidth value={nodoAValue} onChange={handleNodoAChange} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Campo obligatorio" : "💡 Registrar preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("NODO B", true)}
                    <TextField name="nodoB" label="" fullWidth value={nodoBValue} onChange={handleNodoBChange} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Campo obligatorio" : "💡 Registrar preferiblemente el equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("IP NETUNO", true)}
                    <TextField name="ipNetuno" label="" fullWidth value={ipNetuno} onChange={handleIpChange} size="small" error={getErrorProp("ipNetuno")} helperText={getErrorProp("ipNetuno") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("VLAN", true)}
                    <TextField name="vlan" label="" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Campo obligatorio" : ""} />
                  </Grid>
                </>
              )}

              {tipoServicio === "RBS" && (
                <>
                  <Grid size={6}>
                    {renderLabel("ID Circuito", true)}
                    <TextField name="id_circuito" label="" fullWidth value={idCircuitoValue} onChange={handleIdCircuitoChange} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("ID RBS", true)}
                    <TextField name="idRBS" label="" fullWidth value={idRBSValue} onChange={handleIdRBSChange} size="small" error={getErrorProp("idRBS")} helperText={getErrorProp("idRBS") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Serial ONT", true)}
                    <TextField name="serialONT" label="" fullWidth value={serialONTValue} onChange={handleSerialONTChange} size="small" error={getErrorProp("serialONT")} helperText={getErrorProp("serialONT") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo A", true)}
                    <TextField name="nodoA" label="" fullWidth value={nodoAValue} onChange={handleNodoAChange} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Campo obligatorio" : "💡 Registrar preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo B", true)}
                    <TextField name="nodoB" label="" fullWidth value={nodoBValue} onChange={handleNodoBChange} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Campo obligatorio" : "💡 Registrar preferiblemente el equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo OLT", true)}
                    <TextField name="oltnode" label="" fullWidth value={nodoOLTValue} onChange={handleNodoOLTChange} size="small" error={getErrorProp("nodoOLT")} helperText={getErrorProp("nodoOLT") ? "Campo obligatorio" : ""} />
                  </Grid>
                </>
              )}

              {tipoServicio === "ENLACE" && (
                <>
                  <Grid size={6}>
                    {renderLabel("ID Circuito", true)}
                    <TextField name="id_circuito" label="" fullWidth value={idCircuitoValue} onChange={handleIdCircuitoChange} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("VLAN / Segmento", true)}
                    <TextField name="vlan" label="" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo A ", true)}
                    <TextField name="nodoA" label="" fullWidth value={nodoAValue} onChange={handleNodoAChange} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Campo obligatorio" : "💡 Registrar preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />

                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo B", true)}
                    <TextField name="nodoB" label="" fullWidth value={nodoBValue} onChange={handleNodoBChange} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Campo obligatorio" : "💡 Registrar preferiblemente el equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                </>
              )}

              {tipoServicio === "DOG" && (
                <>
                  <Grid size={6}>
                    {renderLabel("ID NETUNO", true)}
                    <TextField name="id_netuno" label="" fullWidth value={idNetunoValue} onChange={handleIdNetunoChange} size="small" error={getErrorProp("id_netuno")} helperText={getErrorProp("id_netuno") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Contrato", true)}
                    <TextField name="contrato" label="" fullWidth value={contratoValue} onChange={handleContratoChange} size="small" error={getErrorProp("contrato")} helperText={getErrorProp("contrato") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Circuito", true)}
                    <TextField name="id_circuito" label="" fullWidth value={idCircuitoValue} onChange={handleIdCircuitoChange} size="small" error={getErrorProp("id_circuito")} helperText={getErrorProp("id_circuito") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("VLAN", true)}
                    <TextField name="vlan" label="" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo A", true)}
                    <TextField name="nodoA" label="" fullWidth value={nodoAValue} onChange={handleNodoAChange} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Campo obligatorio" : "💡 Registrar preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo B", true)}
                    <TextField name="nodoB" label="" fullWidth value={nodoBValue} onChange={handleNodoBChange} size="small" error={getErrorProp("nodoB")} helperText={getErrorProp("nodoB") ? "Campo obligatorio" : "💡 Registrar preferiblemente el equipo de entrega"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#fffb001c', color: '#979090', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo OLT", true)}
                    <TextField name="oltnode" label="" fullWidth value={nodoOLTValue} onChange={handleNodoOLTChange} size="small" error={getErrorProp("nodoOLT")} helperText={getErrorProp("nodoOLT") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Serial ONT", true)}
                    <TextField name="serialONT" label="" fullWidth value={serialONTValue} onChange={handleSerialONTChange} size="small" error={getErrorProp("serialONT")} helperText={getErrorProp("serialONT") ? "Campo obligatorio" : ""} />
                  </Grid>
                </>
              )}

              {tipoServicio === "REDES COMPARTIDAS" && (
                <>
                  <Grid size={6}>
                    {renderLabel("IP NETUNO", true)}
                    <TextField name="ipNetuno" label="" fullWidth value={ipNetuno} onChange={handleIpChange} size="small" error={getErrorProp("ipNetuno")} helperText={getErrorProp("ipNetuno") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Contrato", true)}
                    <TextField name="contrato" label="" fullWidth value={contratoValue} onChange={handleContratoChange} size="small" error={getErrorProp("contrato")} helperText={getErrorProp("contrato") ? "Campo obligatorio" : ""} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("Nodo A", true)}
                    <TextField name="nodoA" label="" fullWidth value={nodoAValue} onChange={handleNodoAChange} size="small" error={getErrorProp("nodoA")} helperText={getErrorProp("nodoA") ? "Campo obligatorio" : "💡 Registrar preferiblemente la troncal"} sx={{ '& .MuiFormHelperText-root:not(.Mui-error)': { bgcolor: '#f0f9ff', color: '#0369a1', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.72rem', fontWeight: 500, mt: 0.5 } }} />
                  </Grid>
                  <Grid size={6}>
                    {renderLabel("VLAN", true)}
                    <TextField name="vlan" label="" fullWidth value={vlanValue} onChange={handleVlanChange} size="small" inputProps={{ maxLength: 20 }} error={getErrorProp("vlan")} helperText={getErrorProp("vlan") ? "Campo obligatorio" : ""} />
                  </Grid>

                  <Grid size={6}>
                    {renderLabel("Producto", true)}
                    <TextField
                      select
                      fullWidth
                      name="producto"
                      label=""
                      size="small"
                      value={productoSeleccionado}
                      onChange={(e) => { setProductoSeleccionado(e.target.value); setFieldErrors(prev => ({ ...prev, producto: false })); }}
                      error={getErrorProp("producto")}
                      helperText={getErrorProp("producto") ? "Campo obligatorio" : ""}
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