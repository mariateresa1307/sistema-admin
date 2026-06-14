"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Grid,
  MenuItem,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

import Switch, { SwitchProps } from "@mui/material/Switch";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonIcon from "@mui/icons-material/Person";
import { FormStepper } from "../components/formStepper";
import { saveTicket } from "@/lib/api";
import ElementoModal from "../components/elementoTicketModal";
import AddIcon from "@mui/icons-material/Add";
import { getMiscellaneous } from "@/lib/api";
import { TICKET_STATUS, TIPO_INCIDENCIA } from "app/utils/constants";
import {
  TipoIncidenciaKey,
  SimpleConfigOpt,
  ConfiguracionInterface,
  TicketModalProps,
} from "../utils/types";

// --- FUNCIONES AUXILIARES ---
const getLocalDateTimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formatToHumanDate = (dateTimeStr: string) => {
  if (!dateTimeStr) return "";
  const [datePart, timePart] = dateTimeStr.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year} ${timePart}`;
};

const diffMin = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return diff > 0 ? Math.round(diff / 1000 / 60) : 0;
};

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: 1050 },
  maxHeight: "92vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4.5,
  borderRadius: 3,
  overflowY: "auto",
};

const USUARIO_LOGUEADO = "NOC_User";

const estructuraJerarquica: Record<
  string,
  { estado: string; localidades: string[] }
> = {
  CARACAS: {
    estado: "DISTRITO CAPITAL",
    localidades: [
      "Head End Los Narajos",
      "Parque Central",
      "Torre Credi Card",
      "Cubo Negro",
      "Parque Cristal",
      "La Urbina",
      "El encantado",
      "Caricuao",
      "El Valle",
      "Manzanares",
      "Santa Mónica",
      "San Bernandino",
      "Mariches",
      "Valle Arriba",
      "El Paraíso",
      "Plaza las Américas",
    ],
  },
  ARAIRA: { estado: "MIRANDA", localidades: ["HUB Araira"] },
  "GUARENAS / GUARENAS": {
    estado: "MIRANDA",
    localidades: ["Head End Guatire", "CC Buena Aventura"],
  },
  VALENCIA: {
    estado: "CARABOBO",
    localidades: [
      "Head End Valencia",
      "Flor Amarillo",
      "San Diego",
      "Naguanagua",
      "Sambil",
    ],
  },
  "PUERTO CABELLO": {
    estado: "CARABOBO",
    localidades: ["Head End Puerto Cabello"],
  },
  MARACAIBO: {
    estado: "ZULIA",
    localidades: ["Head End Maracaibo", "El Dividive"],
  },
  "SAN CRISTOBAL": {
    estado: "TACHIRA",
    localidades: ["Head End San Cristobal", "Las Vegas"],
  },
  MARACAY: { estado: "ARAGUA", localidades: ["HUB Site Maracay"] },
  "LA VICTORIA": { estado: "ARAGUA", localidades: ["Hub La Victoria"] },
  CARRIZAL: { estado: "ALTOS MIRANDINOS", localidades: ["HUB Carrizal"] },
};

const listaGenericaMantenimiento = [
  "SIN GESTION",
  "RECURSOS",
  "SUMINISTRO ELECTRICO",
  "CONFIGURACION",
  "EQUIPO AVERIADO",
];

const subcategoriasPorServicio: Record<string, string[]> = {
  SIN_AFECTACION: [
    "SOPORTE PREVENTIVO",
    "MONITOREO DE RUTINA",
    "SIN ALARMAS ACTIVA",
  ],
  INTERNET: [
    "ALTA LATENCIA",
    "INCONSISTENCIAS EN RECURSOS ASIGNADOS ",
    "CONEXIÓN INTERMITENTE",
    "NO ALCANZA EL ANCHO DE BANDA",
    "PÉRDIDA DE PAQUETES",
    "SIN CONEXIÓN",
  ],
  TELEFONIA: [
    "INCIDENCIA EN LLAMADAS ENTRANTES",
    "INCIDENCIA EN LLAMADAS SALIENTES",
    "INTERFERENCIAS",
    "SEÑALIZACION ",
    "TONO OCUPADO",
    "SIN TONO",
  ],
  DATOS: [
    "CONEXIÓN INTERMITENTE",
    "MONITOREO",
    "PÉRDIDA DE PAQUETES",
    "NO ALCANZA LA CAPACIDAD DE TRANSPORTE",
    "SIN CONEXIÓN",
  ],
  TELEVISION_OTT: [
    "NO VE ALGUNOS CANALES",
    "PIXELACIÓN DE IMAGEN",
    "PROBLEMAS DE AUDIO",
    "ELIMINACIÓN DE CORREOS DE LA PLATAFORMA OTT",
    "SIN ACCESO",
  ],
  MANTENIMIENTO: ["PROGRAMADA", "URGENTE", "PREVENTIVA", "CORRECTIVA"],
};

const plataformasPorCategoria: Record<string, string[]> = {
  CORE: [
    "ENLACE INTERNACIONAL",
    "ROUTER CORE",
    "CGNAT",
    "CDN",
    "FIREWALL",
    "DNS",
    "CORE OTT",
    "CORE TELEFONIA",
  ],
  TRANSPORTE: [
    "ROUTER DE DISTRIBUCION",
    "ENLACE INTERURBANO",
    "ROUTER AAA",
    "SWITCH",
  ],
  ACCESO: ["ONT", " IAD", " GATEWAY", " SWICTH"],
  INFRAESTRUCTURA: ["ELECTRICA", "REFRIGERACION"],
  COMPONENTES: ["DWDM", "MODULOS", "FIBRA OPTICA", "TARJETA", "PUERTO"],
  IT: ["SISTEMAS IT INTERNAL", "BASE DE DATOS", "SERVIDORES", "DNS"],
};

const serviciosPorPlataforma: Record<string, string[]> = {
  "ENLACE INTERNACIONAL": [
    "VTAL-DOWN",
    "VTAL-INTERMITENCIAS",
    "VTAL-SATURACION",
    "CIRION-DOWN",
    "CIRION-INTERMITENCIAS",
    "CIRION-SATURACION",
  ],
  "ROUTER CORE": listaGenericaMantenimiento,
  CGNAT: listaGenericaMantenimiento,
  CDN: listaGenericaMantenimiento,
  FIREWALL: listaGenericaMantenimiento,
  "CORE OTT": listaGenericaMantenimiento,
  "CORE TELEFONIA": listaGenericaMantenimiento,
  "ENLACE INTERURBANO": [
    "VNET - CAIDA",
    "VNET- INTERMITENCIAS",
    "VNET- SATURACION",
    "INTER- CAIDA",
    "INTER- INTERMITENCIAS",
    "INTER- SATURACION",
    "DIGITEL- CAIDA",
    "DIGITEL- INTERMITENCIAS",
    "DIGITEL- SATURACION",
  ],
  "ROUTER DE DISTRIBUCION": listaGenericaMantenimiento,
  "ROUTER AAA": listaGenericaMantenimiento,
  SWITCH: listaGenericaMantenimiento,
  ONT: listaGenericaMantenimiento,
  " IAD": listaGenericaMantenimiento,
  " GATEWAY": listaGenericaMantenimiento,
  " SWICTH": listaGenericaMantenimiento,
  ELECTRICA: [
    "RED PUBLICA",
    "INVERSOR",
    "BREAKER",
    "RECTIFICADOR",
    "UPS",
    "PLANTA ELECTRICA",
  ],
  REFRIGERACION: [
    "TEMPRATURA ALTA",
    "SUMINISTRO ELECTRICO",
    "FALLA EN EQUIPO DE REFRIGERACION",
  ],
  DWDM: [
    "CORTE DE FIBRA",
    "MODULO",
    "TARJETA",
    "PATCHCORD",
    "PIGTAIL",
    "CONFIGURACION",
    "ATENUACION",
    "INTERMITENCIAS",
  ],
  MODULOS: ["TRANCEIVER", "SFP", "PIGTAIL", "QSFP"],
  "FIBRA OPTICA": [
    "CORTE DE FIBRA",
    "ATNUACION",
    "FIBRA DAÑADA",
    "CONEXION SUELTA",
  ],
  TARJETA: ["FALLA EN TARJETA", "TARJETA NO RECONOCIDA", "TARJETA CON ERRORES"],
  PUERTO: [
    "PUERTO CAIDO",
    "PUERTO CON ERRORES",
    "PUERTO NO RECONOCIDO",
    "PUERTO DAÑADO",
  ],
  "SISTEMAS IT INTERNAL": [
    "FALLA EN APLICACION",
    "FALLA EN SISTEMA OPERATIVO",
    "FALLA EN BASE DE DATOS",
    "FALLA EN SERVIDOR",
    "FALLA EN DNS",
  ],
  "BASE DE DATOS": [
    "FALLA EN CONSULTAS",
    "FALLA EN RESPALDOS",
    "FALLA EN REPLICACION",
  ],
  SERVIDORES: [
    "CAIDA DEL SERVIDOR",
    "INTERMITENCIA DEL SERVIDOR",
    "RENDIMIENTO LENTO",
  ],
  DNS: ["RESOLUCION LENTA", "FALLA EN RESOLUCION", "CONFIGURACION INCORRECTA"],
};

const initialFormState = {
  numeroTicket: "",
  tipoIncidencia: "",
  asunto: "",
  categoria: "",
  subcategoria: "",
  detalle: "",
  tipoCliente: "",
  tiposervicio: "",
  estado: "",
  municipio: "",
  ciudad: "",
  localidad: "",
  nodo: "",
  abonado: "",
  nombreCliente: "",
  operatorResponsable: USUARIO_LOGUEADO,
  ttZoho: "",
  ttClienteProveedor: "",
  horaInicioFalla: "",
  horaDeteccionNoc: "",
  horaInicioAtencion: "",
  horaEscalamiento: "",
  serviciosAfectados: [] as string[],
  horaFinAfectacion: "",
  horaCierreFalla: "",
  requiereEscalamiento: "NO",
  escaladoA: "",
  causaRaiz: "",
  SolucionCaso: "",
  estatus: "PRELIMINAR",
  descripcion: "",
  turnoAsignado: "DIURNO",
};

export default function TicketModal({
  open,
  onClose,
  onSave,
}: TicketModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [serviciosAdfectados, setServiciosAfectados] = useState([
    "GPON",
    "ONT",
    "IAD",
  ]);
  const [preSaved, setPreSaved] = useState<string | null>(null);
  const label = { slotProps: { input: { "aria-label": "Color switch demo" } } };
  const pasos = [
    "Clasificación e Infraestructura",
    "Tiempos y Cierre Operativo",
  ];
  const [categoriaRed, setCategoriaRed] = useState<
    Array<ConfiguracionInterface>
  >([]);
  const [subcategorias, setSubcategorias] = useState<
    Array<ConfiguracionInterface>
  >([]);
  const [detalle, setDetalle] = useState<Array<ConfiguracionInterface>>([]);
  const [tipoCliente, setTipoCliente] = useState<Array<ConfiguracionInterface>>(
    [],
  );
  const [form, setForm] = useState(initialFormState);

  const showTipoClienteInput =
    form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA;

  const tiemposCalculados = useMemo(() => {
    let turno = "DIURNO";
    if (form.horaDeteccionNoc) {
      const horaNoc = new Date(form.horaDeteccionNoc).getHours();
      if (horaNoc >= 19 || horaNoc < 7) turno = "NOCTURNO";
    }

    return {
      tDeteccion: diffMin(form.horaInicioFalla, form.horaDeteccionNoc),
      tAtencion: diffMin(form.horaDeteccionNoc, form.horaInicioAtencion),
      tEscalado:
        form.requiereEscalamiento === "SI"
          ? diffMin(form.horaInicioFalla, form.horaEscalamiento)
          : 0,
      cCierreSoporte: diffMin(form.horaInicioAtencion, form.horaCierreFalla),
      mttrTotal: diffMin(form.horaInicioFalla, form.horaCierreFalla),
      turnoAsignado: turno,
    };
  }, [
    form.horaInicioFalla,
    form.horaDeteccionNoc,
    form.horaInicioAtencion,
    form.horaEscalamiento,
    form.horaCierreFalla,
    form.requiereEscalamiento,
  ]);

  // plantilla de descripción
  const generarDescripcion = useCallback((formData: typeof form) => {
    const fechaFormateadaNoc = formatToHumanDate(formData.horaDeteccionNoc);
    const fechaFormateadaInicioFalla = formData.horaInicioFalla
      ? formatToHumanDate(formData.horaInicioFalla)
      : "";
    const fechaFormateadaFinAfectacion = formData.horaFinAfectacion
      ? formatToHumanDate(formData.horaFinAfectacion)
      : "";

    return (
      `Fecha y Hora apertura Ticket: ${fechaFormateadaNoc}\n` +
      `Fecha y Hora Inicio Afectación: ${fechaFormateadaInicioFalla}\n` +
      `Fecha y hora de fin de Afectación: ${fechaFormateadaFinAfectacion}\n` +
      `Causa: ${formData.causaRaiz}\n` +
      `Solución: ${formData.SolucionCaso}`
    );
  }, []);

  // Actualizar descripción
  useEffect(() => {
    if (open && !form.descripcion) {
      const ahora = getLocalDateTimeString();
      const nuevaDescripcion = generarDescripcion({
        ...form,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
      });

      setForm((prev) => ({
        ...prev,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
        operatorResponsable: USUARIO_LOGUEADO,
        descripcion: nuevaDescripcion,
      }));
      setActiveStep(0);
      setPreSaved(null);
    }
  }, [open]);

  useEffect(() => {
    if (form.tipoIncidencia) {
      getMiscellaneous({
        categoria: "CATEGORIA_RED",
        tipoIncidencia: form.tipoIncidencia,
      }).then((data) => {
        setCategoriaRed(data.data);
        setSubcategorias([]);
        setDetalle([]);
        if (data.data.length === 0) {
          setForm((prevState) => ({ ...prevState, categoria: "" }));
        }
      });
    }
  }, [getMiscellaneous, form.tipoIncidencia]);

  // Actualiza descripción causa o solución
  useEffect(() => {
    if (form.descripcion && (form.causaRaiz || form.SolucionCaso)) {
      const lineas = form.descripcion.split("\n");
      if (lineas.length > 3) lineas[3] = `Causa: ${form.causaRaiz}`;
      if (lineas.length > 4) lineas[4] = `Solución: ${form.SolucionCaso}`;

      const nuevaDescripcion = lineas.join("\n");
      if (nuevaDescripcion !== form.descripcion) {
        setForm((prev) => ({ ...prev, descripcion: nuevaDescripcion }));
      }
    }
  }, [form.causaRaiz, form.SolucionCaso]);

  // Actualiza fechas en la descripción
  useEffect(() => {
    if (form.horaDeteccionNoc && form.descripcion) {
      const t1Formateado = formatToHumanDate(form.horaDeteccionNoc);
      const t0Formateado = form.horaInicioFalla
        ? formatToHumanDate(form.horaInicioFalla)
        : "";
      const finAfectacionFormateado = form.horaFinAfectacion
        ? formatToHumanDate(form.horaFinAfectacion)
        : "";

      const lineas = form.descripcion.split("\n");
      if (lineas.length > 0)
        lineas[0] = `Fecha y Hora apertura Ticket: ${t1Formateado}`;
      if (lineas.length > 1)
        lineas[1] = `Fecha y Hora Inicio Afectación: ${t0Formateado}`;
      if (lineas.length > 2)
        lineas[2] = `Fecha y hora de fin de Afectación: ${finAfectacionFormateado}`;

      const nuevaDescripcion = lineas.join("\n");
      if (nuevaDescripcion !== form.descripcion) {
        setForm((prev) => ({ ...prev, descripcion: nuevaDescripcion }));
      }
    }
  }, [form.horaDeteccionNoc, form.horaInicioFalla, form.horaFinAfectacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (showTipoClienteInput) {
      getMiscellaneous({ categoria: "TIPO_CLIENTE" }).then((tipoCliente) => {
        setTipoCliente(tipoCliente.data);
      });
    }
  };

  const handleCiudadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const ciudad = e.target.value;
      const estado =
        ciudad && estructuraJerarquica[ciudad]
          ? estructuraJerarquica[ciudad].estado
          : "";
      setForm((prev) => ({ ...prev, ciudad, estado, localidad: "" }));
    },
    [],
  );

  const handleCategoriaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const categoria = categoriaRed.find(
        (categoria) => categoria._id === e.target.value,
      );
      if (!categoria) throw new Error("Categoria no encontrada");
      const prefijo = categoria.valor.substring(0, 4).toUpperCase();
      const numeroTicket =
        !form.numeroTicket || !form.numeroTicket.startsWith(prefijo)
          ? `${prefijo}-${Math.floor(100000 + Math.random() * 900000)}`
          : form.numeroTicket;

      setForm((prev) => ({
        ...prev,
        categoria: categoria._id,
        subcategoria: "",
        numeroTicket,
      }));

      getMiscellaneous({
        categoria: "SUBCATEGORIA",
        padreId: categoria._id,
      }).then((subcategoriaResponse) => {
        setSubcategorias(subcategoriaResponse.data);
      });
    },
    [form.numeroTicket, categoriaRed],
  );

  const handleTipoClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tipoCliente = e.target.value;
    const updates: any = { tipoCliente };

    if (tipoCliente !== "RESIDENCIAL") {
      updates.nodo = "";
      updates.abonado = "";
      updates.nombreCliente = "";
    } else {
      updates.serviciosAfectados = [];
    }

    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleServiciosAfectadosChange = useCallback((newValue: string[]) => {
    const servicios = newValue.length > 0 ? newValue.join(" | ") : "";
    //const asunto = servicios ? `${servicios.toUpperCase()} || FALLA` : '';

    setForm((prev) => ({
      ...prev,
      serviciosAfectados: newValue,
      // asunto
    }));
  }, []);

  const handleNext = useCallback(() => setActiveStep((prev) => prev + 1), []);
  const handleBack = useCallback(() => setActiveStep((prev) => prev - 1), []);
  const handleDateTimeClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      try {
        (e.target as any).showPicker();
      } catch (err) {}
    },
    [],
  );

  const customClose = useCallback(() => {
    setActiveStep(0);
    setOpenModal(false);
    setServiciosAfectados(["GPON", "ONT", "IAD"]);
    setPreSaved(null);
    setCategoriaRed([]);
    setSubcategorias([]);
    setForm(initialFormState);

    // close form
    onClose();
  }, [onClose]);

  // Guardar ticket pre-saved
  useEffect(() => {
    if (activeStep > 0 && !preSaved) {
      const handleSaveTicket = async () => {
        const result = await saveTicket({
          caseNumber: form.numeroTicket,
          incidentType: form.tipoIncidencia,
          subject: form.asunto,
          networkCategory: form.categoria,
          description: form.descripcion,
          status: TICKET_STATUS.EN_GESTION,
        });
        setPreSaved(result.data._id);
      };
      handleSaveTicket();
    }
  }, [
    activeStep,
    preSaved,
    form.numeroTicket,
    form.tipoIncidencia,
    form.asunto,
    form.categoria,
    form.descripcion,
  ]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const fechaHoraCierreActual = getLocalDateTimeString();
      const cierreFormateado = formatToHumanDate(fechaHoraCierreActual);

      let descripcionFinal = form.descripcion;
      const lineas = descripcionFinal.split("\n");
      if (
        lineas.length >= 2 &&
        lineas[1].trim() === "Fecha y hora de fin de Afectación:"
      ) {
        lineas[1] = `Fecha y hora de fin de Afectación: ${cierreFormateado}`;
        descripcionFinal = lineas.join("\n");
      }

      const finalFormData = {
        ...form,
        ...tiemposCalculados,
        horaCierreFalla: fechaHoraCierreActual,
        descripcion: descripcionFinal,
        cCierreSoporte: diffMin(form.horaInicioAtencion, fechaHoraCierreActual),
        mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreActual),
        estatus: "CERRADO",
      };

      onSave(finalFormData);
      setActiveStep(0);
      customClose();
    },
    [form, tiemposCalculados, onSave, customClose],
  );

  const handleChangeSubcategoria = (e: React.ChangeEvent<HTMLInputElement>) => {
    getMiscellaneous({ categoria: "DETALLE", padreId: e.target.value }).then(
      (detalleResponse) => {
        setDetalle(detalleResponse.data);
        handleChange(e);
      },
    );
  };

  return (
    <Modal open={open} onClose={customClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h5" sx={{ color: "#000027", fontWeight: 600 }}>
            Apertura y Tipificación - NOC
          </Typography>
          <IconButton onClick={customClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        <FormStepper activeStep={activeStep} steps={pasos} />
        <Divider sx={{ mb: 3 }} />
        {activeStep === 0 ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                disabled
                label="Número de Caso (Auto)"
                name="numeroTicket"
                value={form.numeroTicket}
                size="small"
                InputProps={{
                  startAdornment: (
                    <ConfirmationNumberIcon
                      sx={{ color: "#000027", mr: 1, fontSize: "1.1rem" }}
                    />
                  ),
                }}
                sx={{ bgcolor: "#f0f4f8" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                fullWidth
                required
                label="Tipo de Incidencia"
                name="tipoIncidencia"
                value={form.tipoIncidencia}
                onChange={handleChange}
                size="small"
              >
                {(Object.keys(TIPO_INCIDENCIA) as TipoIncidenciaKey[]).map(
                  (tipoIncidenciaKey) => {
                    const value = TIPO_INCIDENCIA[tipoIncidenciaKey];
                    return (
                      <MenuItem key={tipoIncidenciaKey} value={value}>
                        {value}
                      </MenuItem>
                    );
                  },
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Asunto del Caso"
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                placeholder="CCS || SERVICIO || VLAN CLIENTE || FALLA"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Categoría de Red"
                name="categoria"
                value={
                  categoriaRed.find(
                    (innerCatRed) => innerCatRed._id === form.categoria,
                  )?._id || ""
                }
                onChange={handleCategoriaChange}
                size="small"
              >
                {categoriaRed.map((categoria: SimpleConfigOpt) => (
                  <MenuItem key={categoria._id} value={categoria._id}>
                    {categoria.valor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Subcategoría"
                name="subcategoria"
                value={
                  subcategorias.find(
                    (innerSubCat) => innerSubCat._id === form.subcategoria,
                  )?._id || ""
                }
                onChange={handleChangeSubcategoria}
                size="small"
                disabled={!form.categoria}
              >
                {subcategorias.map((p: SimpleConfigOpt) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.valor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Detalle"
                name="detalle"
                value={
                  detalle.find(
                    (innerdetalle) => innerdetalle._id === form.detalle,
                  )?._id || ""
                }
                onChange={handleChange}
                size="small"
                disabled={!form.categoria}
              >
                {detalle.map((v: SimpleConfigOpt) => (
                  <MenuItem key={v._id} value={v._id}>
                    {v.valor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {showTipoClienteInput && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Tipo de cliente"
                    name="tipoCliente"
                    value={
                      tipoCliente.find((TC) => TC._id === form.tipoCliente)
                        ?._id || ""
                    }
                    onChange={handleTipoClienteChange}
                    size="small"
                  >
                    {tipoCliente.map((tipoClienteValue) => {
                      return (
                        <MenuItem
                          key={tipoClienteValue._id}
                          value={tipoClienteValue._id}
                        >
                          {tipoClienteValue.valor}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Grid>
              </>
            )}

            {form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA &&
              tipoCliente.find((TC) => TC._id === form.tipoCliente)?.valor !==
                "RESIDENCIAL" && (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Autocomplete
                      multiple
                      size="small"
                      options={serviciosAdfectados}
                      value={form.serviciosAfectados}
                      onChange={(e, newValue) =>
                        handleServiciosAfectadosChange(newValue)
                      }
                      ChipProps={{ size: "small", sx: { height: 24, m: 0.25 } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          padding: "2px 8px !important",
                          minHeight: "40px",
                          alignItems: "center",
                        },
                        "& .MuiAutocomplete-inputRoot": {
                          padding: "2px 8px !important",
                        },
                        "& .MuiAutocomplete-input": {
                          padding: "4px 4px !important",
                          fontSize: "0.875rem",
                        },
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Servicios afectados"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <IconButton
                                  onClick={() => setOpenModal(true)}
                                  size="small"
                                  sx={{ p: 0.5 }}
                                >
                                  {/*}   <AddIcon fontSize="small" />*/}
                                </IconButton>
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    <ElementoModal
                      open={openModal}
                      onClose={() => setOpenModal(false)}
                      onAdd={(nuevo) =>
                        setServiciosAfectados([...serviciosAdfectados, nuevo])
                      }
                    />
                  </Grid>
                </>
              )}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={handleCiudadChange}
                size="small"
              >
                {Object.keys(estructuraJerarquica).map((ciu) => (
                  <MenuItem key={ciu} value={ciu}>
                    {ciu}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {form.ciudad && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    disabled
                    label="Estado"
                    value={form.estado}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Localidad"
                    name="localidad"
                    value={form.localidad}
                    onChange={handleChange}
                    size="small"
                  >
                    {(estructuraJerarquica[form.ciudad]?.localidades || []).map(
                      (loc) => (
                        <MenuItem key={loc} value={loc}>
                          {loc}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Grid>
              </>
            )}

            {form.tipoCliente === "RESIDENCIAL" && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nodo Afectado"
                    name="nodo"
                    value={form.nodo}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    label="Abonado"
                    name="abonado"
                    value={form.abonado}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    required
                    label="Nombre del Cliente"
                    name="nombreCliente"
                    value={form.nombreCliente}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="outlined-multiline-flexible"
                label="Bitacora"
                multiline
                maxRows={4}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Switch {...label} />
                <Typography>Afectacion</Typography>
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }} sx={{ mb: -1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#333" }}
              >
                3. Tiempos de Ciclo de Falla
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="t0: Inicio Falla *"
                name="horaInicioFalla"
                value={form.horaInicioFalla}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ onClick: handleDateTimeClick }}
                sx={{ "& input": { cursor: "pointer" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                disabled
                type="datetime-local"
                label="t1: Apertura NOC (Auto)"
                name="horaDeteccionNoc"
                value={form.horaDeteccionNoc}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: "#f0f4f8" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                required
                type="datetime-local"
                label="t2: Inicio Atención *"
                name="horaInicioAtencion"
                value={form.horaInicioAtencion}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ onClick: handleDateTimeClick }}
                sx={{ "& input": { cursor: "pointer" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="t3: Escalamiento"
                name="horaEscalamiento"
                value={form.horaEscalamiento}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                disabled={form.requiereEscalamiento === "NO"}
                required={form.requiereEscalamiento === "SI"}
                inputProps={{ onClick: handleDateTimeClick }}
                sx={{ "& input": { cursor: "pointer" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Fin Afectación"
                name="horaFinAfectacion"
                value={form.horaFinAfectacion}
                onChange={handleChange}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ onClick: handleDateTimeClick }}
                sx={{ "& input": { cursor: "pointer" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                disabled
                label="t4: Cierre Falla (Auto)"
                value="Al guardar..."
                size="small"
                sx={{ bgcolor: "#f0f4f8" }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  bgcolor: "#b4baff",
                  color: "#000",
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  px: 3,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  <strong>T. Detección:</strong> {tiemposCalculados.tDeteccion}{" "}
                  min
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  <strong>T. Atención:</strong> {tiemposCalculados.tAtencion}{" "}
                  min
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  <strong>T. Escalado:</strong> {tiemposCalculados.tEscalado}{" "}
                  min
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  <strong>Cierre Soporte:</strong> (Se calcula al guardar)
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="¿Escalar a Especialistas?"
                name="requiereEscalamiento"
                value={form.requiereEscalamiento}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="NO">No</MenuItem>
                <MenuItem value="SI">Sí</MenuItem>
              </TextField>
            </Grid>
            {form.requiereEscalamiento !== "NO" && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Grupo Destino"
                  name="escaladoA"
                  value={form.escaladoA}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Causa Raíz"
                name="causaRaiz"
                value={form.causaRaiz}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Solucion Caso"
                name="SolucionCaso"
                value={form.SolucionCaso}
                onChange={handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                disabled
                label="Turno"
                value={tiemposCalculados.turnoAsignado}
                size="small"
                sx={{ bgcolor: "#f0f4f8" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="TT-ZOHO"
                name="ttZoho"
                value={form.ttZoho}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="TT-CLIENTE"
                name="ttClienteProveedor"
                value={form.ttClienteProveedor}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                disabled
                label="Operador"
                name="operatorResponsable"
                value={form.operatorResponsable}
                size="small"
                InputProps={{
                  startAdornment: (
                    <PersonIcon
                      sx={{ color: "#000027", mr: 1, fontSize: "1.1rem" }}
                    />
                  ),
                }}
                sx={{ bgcolor: "#f0f4f8" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={7}
                required
                label="Detalles del incidente"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                size="small"
              />
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  disabled
                  label="Operador"
                  name="operatorResponsable"
                  value={form.operatorResponsable}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <PersonIcon
                        sx={{ color: "#000027", mr: 1, fontSize: "1.1rem" }}
                      />
                    ),
                  }}
                  sx={{ bgcolor: "#f0f4f8" }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                {/* ES un select option, solo aparece al momento de editar */}
                <TextField
                  fullWidth
                  multiline
                  rows={7}
                  required
                  label="Severidad"
                  name="severidad"
                  value={""}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                {/*  ES un select option, solo aparece al momento de editar */}
                <TextField
                  fullWidth
                  multiline
                  rows={7}
                  required
                  label="Imputable a"
                  name="Imputable"
                  value={""}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={customClose}
            sx={{
              borderRadius: "50px",
              px: 3,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Descartar
          </Button>
          {activeStep > 0 && (
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={handleBack}
              sx={{
                borderRadius: "50px",
                px: 3,
                fontWeight: 600,
                textTransform: "none",
                color: "#000027",
                borderColor: "#000027",
              }}
            >
              Atrás
            </Button>
          )}
          {activeStep < pasos.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<NavigateNextIcon />}
              onClick={handleNext}
              sx={{
                bgcolor: "#000027",
                borderRadius: "50px",
                px: 4,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#000045" },
              }}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: "#2e7d32",
                borderRadius: "50px",
                px: 4,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#1b5e20" },
              }}
            >
              Guardar e Insertar
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
