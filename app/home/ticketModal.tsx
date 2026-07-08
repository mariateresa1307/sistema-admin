"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { getService, saveTicket, updateTicket, getUsers, getMiscellaneous } from "@/lib/api";
import ElementoModal from "../components/elementoTicketModal";
import AddIcon from "@mui/icons-material/Add";
import { TICKET_STATUS, TIPO_CLIENTE, TIPO_INCIDENCIA, NIVEL_SEVERIDAD, IMPUTABLE, CATEGORIA } from "app/utils/constants";
import { getNivelSeveridadConfig } from "app/utils/auxiliares";
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
  overflow: "hidden",
  overflowY: "auto",
};


// Ciudades y localidades se cargan dinámicamente desde la API (declaradas dentro del componente)





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
  operatorResponsable: "",
  operatorAsignado: "",
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
  bitacora: '',
  operador: '',
  severidad: '',
  imputable: '',
  afectacion: false
};

export default function TicketModal({
  open,
  onClose,
  onSave,
}: TicketModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [serviciosAdfectados, setServiciosAfectados] = useState([]);
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
  const [causasRaiz, setCausasRaiz] = useState<Array<ConfiguracionInterface>>(
    [],
  );
  const [solucionesCaso, setSolucionesCaso] = useState<
    Array<ConfiguracionInterface>
  >([]);
  const [ciudadesOptions, setCiudadesOptions] = useState<Array<any>>([]);
  const [localidadesOptions, setLocalidadesOptions] = useState<Array<any>>([]);
  const [form, setForm] = useState(initialFormState);
  const sessionOperatorId = useRef("");
  const [operatorDisplayName, setOperatorDisplayName] = useState("");
  const [operadores, setOperadores] = useState<
    Array<{ _id: string; primerNombre: string; primerApellido: string; username?: string }>
  >([]);

  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (!stored) return;
    try {
      const userData = JSON.parse(stored);
      if (userData._id) {
        sessionOperatorId.current = userData._id;
        setForm((prev) => ({ ...prev, operatorResponsable: userData._id }));
      }
      const nombre = [userData.primerNombre, userData.primerApellido]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (nombre) setOperatorDisplayName(nombre);
    } catch (err) {
      console.error("Error parsing userData:", err);
    }
  }, []);

  useEffect(() => {
    getUsers()
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setOperadores(
          data
            .filter((u: { isActive?: boolean }) => u.isActive !== false)
            .map((u: {
              _id: string;
              primerNombre: string;
              primerApellido: string;
              username?: string;
            }) => ({
              _id: u._id,
              primerNombre: u.primerNombre,
              primerApellido: u.primerApellido,
              username: u.username,
            })),
        );
      })
      .catch((err) => {
        console.error("Error al obtener operadores:", err);
        setOperadores([]);
      });
  }, []);

  const showTipoClienteInput =
    form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA;

  const selectedTipoClienteValor = useMemo(
    () => tipoCliente.find((tc) => tc._id === form.tipoCliente)?.valor,
    [tipoCliente, form.tipoCliente],
  );

  const isStep0Complete = useMemo(() => {
    const hasBaseFields =
      !!form.tipoIncidencia &&
      !!form.asunto.trim() &&
      !!form.categoria &&
      !!form.subcategoria &&
      !!form.detalle &&
      !!form.ciudad &&
      !!form.localidad;

    if (!hasBaseFields) return false;

    if (showTipoClienteInput && !form.tipoCliente) return false;

    if (selectedTipoClienteValor === TIPO_CLIENTE.RESIDENCIAL) {
      return !!(
        form.nodo.trim() &&
        form.abonado.trim() &&
        form.nombreCliente.trim()
      );
    }

    return true;
  }, [
    form.tipoIncidencia,
    form.asunto,
    form.categoria,
    form.subcategoria,
    form.detalle,
    form.ciudad,
    form.localidad,
    form.tipoCliente,
    form.nodo,
    form.abonado,
    form.nombreCliente,
    showTipoClienteInput,
    selectedTipoClienteValor,
  ]);

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
        descripcion: nuevaDescripcion,
      }));
      setActiveStep(0);
      setPreSaved(null);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      getMiscellaneous({ categoria: CATEGORIA.CAUSA_RAIZ }).then((res) => {
        setCausasRaiz(res.data || []);
      });
    }
  }, [open]);

  useEffect(() => {
    if (form.causaRaiz) {
      getMiscellaneous({
        categoria: CATEGORIA.SOLUCION_CASO,
        padreId: form.causaRaiz,
      }).then((res) => {
        setSolucionesCaso(res.data || []);
      });
    } else {
      setSolucionesCaso([]);
    }
  }, [form.causaRaiz]);

  // Cargar lista de ciudades al montar
  useEffect(() => {
    getMiscellaneous({ categoria: "CIUDAD" }).then((res) => {
      const ciudades = res.data || [];
      setCiudadesOptions(ciudades);

      // Si el formulario trae una ciudad por _id en modo edición antiguo, convertirla a su nombre
      if (form.ciudad) {
        const byId = ciudades.find((c: any) => c._id === form.ciudad);
        if (byId) {
          setForm((prev) => ({ ...prev, ciudad: byId.valor, estado: byId.padreNombre || prev.estado }));
        }
      }
    });
  }, [getMiscellaneous]);

  // Si se establece una ciudad (por edición), cargar sus localidades
  useEffect(() => {
    if (form.ciudad) {
      getMiscellaneous({ categoria: "LOCALIDAD", padreNombre: form.ciudad }).then((res) => {
        setLocalidadesOptions(res.data || []);
      });
    } else {
      setLocalidadesOptions([]);
    }
  }, [form.ciudad, getMiscellaneous]);

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
      const causaRaizText =
        causasRaiz.find((c) => c._id === form.causaRaiz)?.valor || form.causaRaiz;
      const solucionCasoText =
        solucionesCaso.find((s) => s._id === form.SolucionCaso)?.valor ||
        form.SolucionCaso;
      const lineas = form.descripcion.split("\n");
      if (lineas.length > 3) lineas[3] = `Causa: ${causaRaizText}`;
      if (lineas.length > 4) lineas[4] = `Solución: ${solucionCasoText}`;

      const nuevaDescripcion = lineas.join("\n");
      if (nuevaDescripcion !== form.descripcion) {
        setForm((prev) => ({ ...prev, descripcion: nuevaDescripcion }));
      }
    }
  }, [form.causaRaiz, form.SolucionCaso, causasRaiz, solucionesCaso]);

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

  const handleTipoIncidenciaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const tipoIncidencia = e.target.value;
      const ahora = getLocalDateTimeString();
      const baseForm = {
        ...initialFormState,
        tipoIncidencia,
        operatorResponsable: sessionOperatorId.current,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
      };

      setForm({
        ...baseForm,
        descripcion: generarDescripcion(baseForm),
      });
      setServiciosAfectados([]);
      setSubcategorias([]);
      setDetalle([]);
      setPreSaved(null);
      setTipoCliente([]);
      setLocalidadesOptions([]);
      setActiveStep(0);

      if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) {
        getMiscellaneous({ categoria: "TIPO_CLIENTE" }).then((tipoClienteRes) => {
          setTipoCliente(tipoClienteRes.data);
        });
      }
    },
    [generarDescripcion],
  );

  const handleCausaRaizChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        causaRaiz: e.target.value,
        SolucionCaso: "",
      }));
    },
    [],
  );

  const handleCiudadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const ciudadValue = e.target.value;
      const selected = ciudadesOptions.find((c: any) => c.valor === ciudadValue) || ciudadesOptions.find((c: any) => c._id === ciudadValue);
      const estado = selected?.padreNombre || "";
      const ciudadName = selected?.valor || ciudadValue;

      setForm((prev) => ({ ...prev, ciudad: ciudadName, estado, localidad: "" }));

      // Cargar localidades asociadas a la ciudad seleccionada por padreNombre
      getMiscellaneous({ categoria: "LOCALIDAD", padreNombre: ciudadName }).then((res) => {
        setLocalidadesOptions(res.data || []);
      });
    },
    [ciudadesOptions, getMiscellaneous],
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
    const tipoClienteId = e.target.value;
    const updates: Record<string, unknown> = { tipoCliente: tipoClienteId };

    const selectedTipoCliente = tipoCliente.find((tc) => tc._id === tipoClienteId);
    updates.severidad = selectedTipoCliente?.nivelSeveridad?.trim() || "";

    if (selectedTipoCliente?.valor !== TIPO_CLIENTE.RESIDENCIAL) {
      updates.nodo = "";
      updates.abonado = "";
      updates.nombreCliente = "";
    } else {
      updates.serviciosAfectados = [];
    }

    getService({ tipoCliente: tipoClienteId }).then((services) => {
      setServiciosAfectados(services.data);
    })
    setForm((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (!form.tipoCliente || form.severidad) return;
    const selected = tipoCliente.find((tc) => tc._id === form.tipoCliente);
    if (selected?.nivelSeveridad) {
      setForm((prev) => ({
        ...prev,
        severidad: selected.nivelSeveridad!.trim(),
      }));
    }
  }, [form.tipoCliente, form.severidad, tipoCliente]);

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
      } catch (err) { }
    },
    [],
  );

  const customClose = useCallback(() => {
    setActiveStep(0);
    setOpenModal(false);
    setServiciosAfectados([]);
    setPreSaved(null);
    setCategoriaRed([]);
    setSubcategorias([]);
    setForm({
      ...initialFormState,
      operatorResponsable: sessionOperatorId.current,
    });

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
          status: TICKET_STATUS.EN_GESTION,
          subcategoria: form.subcategoria,
          detalle: form.detalle,
          tipoCliente: form.tipoCliente,
          serviciosAfectados: form.serviciosAfectados.map((sa) => sa._id),
          ciudad: form.ciudad,
          estado: form.estado,
          localidad: form.localidad,
          bitacora: form.bitacora,
          nodo: form.nodo,
          abonado: form.abonado,
          nombreCliente: form.nombreCliente,
          afectacion: form.afectacion
        });
        setPreSaved(result.data._id);
      };
      handleSaveTicket();
    }

    // Necesita actualizar el preguardado
    if (preSaved && activeStep === 0) {
      console.log("updated")
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

  const handleFullSave = useCallback(async () => {
    if (!preSaved) return;

    const fechaHoraCierreActual = getLocalDateTimeString();
    let descripcionFinal = form.descripcion;
    const lineas = descripcionFinal.split("\n");
    if (
      lineas.length >= 2 &&
      lineas[1].trim() === "Fecha y hora de fin de Afectación:"
    ) {
      lineas[1] = `Fecha y hora de fin de Afectación: ${formatToHumanDate(fechaHoraCierreActual)}`;
      descripcionFinal = lineas.join("\n");
    }

    await updateTicket(preSaved, {
      horaInicioFalla: form.horaInicioFalla,
      horaDeteccionNoc: form.horaDeteccionNoc,
      horaInicioAtencion: form.horaInicioAtencion,
      horaEscalamiento: form.horaEscalamiento,
      horaFinAfectacion: form.horaFinAfectacion,
      horaCierreFalla: fechaHoraCierreActual,
      requiereEscalamiento: form.requiereEscalamiento,
      escaladoA: form.escaladoA,
      causaRaiz: form.causaRaiz,
      SolucionCaso: form.SolucionCaso,
      turnoAsignado: tiemposCalculados.turnoAsignado,
      ttZoho: form.ttZoho,
      ttClienteProveedor: form.ttClienteProveedor,
      operatorResponsable: form.operatorResponsable,
      operatorAsignado: form.operatorAsignado,
      operador: form.operador,
      severidad: form.severidad,
      imputable: form.imputable,
      description: descripcionFinal,
      tDeteccion: tiemposCalculados.tDeteccion,
      tAtencion: tiemposCalculados.tAtencion,
      tEscalado: tiemposCalculados.tEscalado,
      cCierreSoporte: diffMin(form.horaInicioAtencion, fechaHoraCierreActual),
      mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreActual),
      status: TICKET_STATUS.PENDIENTE
    });

    onSave({
      ...form,
      ...tiemposCalculados,
      horaCierreFalla: fechaHoraCierreActual,
      descripcion: descripcionFinal,
    });
    customClose();
  }, [preSaved, form, tiemposCalculados, onSave, customClose]);

  return (
    <Modal open={open} onClose={customClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            background: getNivelSeveridadConfig(form.severidad).bgcolor,
            height: 30,
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <Box
          sx={{
            zIndex: 1,
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
                onChange={handleTipoIncidenciaChange}
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
              TIPO_CLIENTE.RESIDENCIAL && (
                <>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Autocomplete
                      multiple
                      size="small"
                      options={serviciosAdfectados}
                      value={form.serviciosAfectados}
                      onChange={(e, newValue) => {

                        handleServiciosAfectadosChange(newValue)
                      }}
                      getOptionKey={(option) => option._id}
                      getOptionLabel={(option) => option.name}
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
                {ciudadesOptions.map((c: any) => (
                  <MenuItem key={c._id || c.valor} value={c.valor}>
                    {c.valor}
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
                    name="estado"
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
                    {localidadesOptions.map((loc: any) => (
                      <MenuItem key={loc._id || loc.valor} value={loc.valor}>
                        {loc.valor}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            {
              tipoCliente.find((TC) => TC._id === form.tipoCliente)?.valor ===
              TIPO_CLIENTE.RESIDENCIAL && (
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
                name="bitacora"
                multiline
                maxRows={4}
                onChange={handleChange}
              >{form.bitacora}</TextField>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Switch {...label} name="afectacion" onChange={e => {

                  setForm(pv => ({ ...pv, afectacion: e.target.checked }))
                }} />
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
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
                select
                fullWidth
                label="Causa Raíz"
                name="causaRaiz"
                value={form.causaRaiz}
                onChange={handleCausaRaizChange}
                size="small"
              >
                <MenuItem value="">
                  <em>Seleccionar...</em>
                </MenuItem>
                {causasRaiz.map((causa) => (
                  <MenuItem key={causa._id} value={causa._id}>
                    {causa.valor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Solucion Caso"
                name="SolucionCaso"
                value={form.SolucionCaso}
                onChange={handleChange}
                size="small"
                disabled={!form.causaRaiz}
              >
                <MenuItem value="">
                  <em>
                    {form.causaRaiz
                      ? "Seleccionar..."
                      : "Seleccione una causa raíz"}
                  </em>
                </MenuItem>
                {solucionesCaso.map((solucion) => (
                  <MenuItem key={solucion._id} value={solucion._id}>
                    {solucion.valor}
                  </MenuItem>
                ))}
              </TextField>
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
                value={operatorDisplayName}
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="Operador asignado"
                name="operatorAsignado"
                value={form.operatorAsignado}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <PersonIcon
                      sx={{ color: "#000027", mr: 1, fontSize: "1.1rem" }}
                    />
                  ),
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar operador</em>
                </MenuItem>
                {operadores.map((operador) => (
                  <MenuItem key={operador._id} value={operador._id}>
                    {[operador.primerNombre, operador.primerApellido]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || operador.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Severidad"
                name="severidad"
                value={form.severidad}
                onChange={handleChange}
                size="small"
                SelectProps={{
                  renderValue: (selected) => {
                    const config = getNivelSeveridadConfig(selected as string);
                    return (
                      <Chip
                        label={`${config.icon} ${config.label}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          px: 1,
                          bgcolor: config.bgcolor,
                          color: config.color,
                          width: "100%"
                        }}
                      />
                    );
                  },
                }}
              >
                {NIVEL_SEVERIDAD.map((nivel) => (
                  <MenuItem key={nivel.value} value={nivel.value}>
                    <Chip
                      label={`${nivel.icon} ${nivel.label}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        px: 1,
                        bgcolor: nivel.bgcolor,
                        color: nivel.color,
                        width: "100%"
                      }}
                    />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Imputable a"
                name="imputable"
                value={form.imputable}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">
                  <em>Seleccionar</em>
                </MenuItem>
                {Object.values(IMPUTABLE).map((opcion) => (
                  <MenuItem key={opcion} value={opcion}>
                    {opcion}
                  </MenuItem>
                ))}
              </TextField>
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
              disabled={activeStep === 0 && !isStep0Complete}
              sx={{
                bgcolor: "#000027",
                borderRadius: "50px",
                px: 4,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: "#000045" },
                "&.Mui-disabled": {
                  bgcolor: "#ccc",
                  color: "#666",
                },
              }}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFullSave}
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
