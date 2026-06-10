'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, Autocomplete, TextField, Button, Chip, Grid, MenuItem,
  Divider, IconButton, Stack,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

import Switch, { SwitchProps } from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from '@mui/icons-material/Person';
import { FormStepper } from '../components/formStepper';
import saveTicket from '@/lib/api';
import ElementoModal from '../components/elementoTicketModal';
import AddIcon from '@mui/icons-material/Add';



// --- FUNCIONES AUXILIARES  ---
const getLocalDateTimeString = (date = new Date()) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};


const formatToHumanDate = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const [datePart, timePart] = dateTimeStr.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year} ${timePart}`;
};

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: 1050 },
  maxHeight: '92vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4.5,
  borderRadius: 3,
  overflowY: 'auto',
};

const USUARIO_LOGUEADO = "NOC_User";

const estructuraJerarquica: Record<string, { estado: string, localidades: string[] }> = {
  "CARACAS": { estado: "DISTRITO CAPITAL", localidades: ["Head End Los Narajos", "Parque Central", "Torre Credi Card", "Cubo Negro", "Parque Cristal", "La Urbina", "El encantado", "Caricuao", "El Valle", "Manzanares", "Santa Mónica", "San Bernandino", "Mariches", "Valle Arriba", "El Paraíso", "Plaza las Américas"] },
  "ARAIRA": { estado: "MIRANDA", localidades: ["HUB Araira"] },
  "GUARENAS / GUARENAS": { estado: "MIRANDA", localidades: ["Head End Guatire", "CC Buena Aventura"] },
  "VALENCIA": { estado: "CARABOBO", localidades: ["Head End Valencia", "Flor Amarillo", "San Diego", "Naguanagua", "Sambil"] },
  "PUERTO CABELLO": { estado: "CARABOBO", localidades: ["Head End Puerto Cabello"] },
  "MARACAIBO": { estado: "ZULIA", localidades: ["Head End Maracaibo", "El Dividive"] },
  "SAN CRISTOBAL": { estado: "TACHIRA", localidades: ["Head End San Cristobal", "Las Vegas"] },
  "MARACAY": { estado: "ARAGUA", localidades: ["HUB Site Maracay"] },
  "LA VICTORIA": { estado: "ARAGUA", localidades: ["Hub La Victoria"] },
  "CARRIZAL": { estado: "ALTOS MIRANDINOS", localidades: ["HUB Carrizal"] }
};
const listaGenericaMantenimiento = ["SIN GESTION", "RECURSOS", "SUMINISTRO ELECTRICO", "CONFIGURACION", "EQUIPO AVERIADO"];

const subcategoriasPorServicio: Record<string, string[]> = {
  SIN_AFECTACION: ["SOPORTE PREVENTIVO", "MONITOREO DE RUTINA", "SIN ALARMAS ACTIVA"],
  INTERNET: ["ALTA LATENCIA", "INCONSISTENCIAS EN RECURSOS ASIGNADOS ", "CONEXIÓN INTERMITENTE", "NO ALCANZA EL ANCHO DE BANDA", "PÉRDIDA DE PAQUETES", "SIN CONEXIÓN"],
  TELEFONIA: ["INCIDENCIA EN LLAMADAS ENTRANTES", "INCIDENCIA EN LLAMADAS SALIENTES", "INTERFERENCIAS", "SEÑALIZACION ", "TONO OCUPADO", "SIN TONO"],
  DATOS: ["CONEXIÓN INTERMITENTE", "MONITOREO", "PÉRDIDA DE PAQUETES", "NO ALCANZA LA CAPACIDAD DE TRANSPORTE", "SIN CONEXIÓN"],
  TELEVISION_OTT: ["NO VE ALGUNOS CANALES", "PIXELACIÓN DE IMAGEN", "PROBLEMAS DE AUDIO", "ELIMINACIÓN DE CORREOS DE LA PLATAFORMA OTT", "SIN ACCESO"],
  MANTENIMIENTO: ["PROGRAMADA", "URGENTE", "PREVENTIVA", "CORRECTIVA"]
};

const plataformasPorCategoria: Record<string, string[]> = {
  CORE: ["ENLACE INTERNACIONAL", "ROUTER CORE", "CGNAT", "CDN", "FIREWALL", "DNS", "CORE OTT", "CORE TELEFONIA"],
  TRANSPORTE: ["ROUTER DE DISTRIBUCION", "ENLACE INTERURBANO", "ROUTER AAA", "SWITCH"],
  ACCESO: ["ONT", " IAD", " GATEWAY", " SWICTH"],
  INFRAESTRUCTURA: ["ELECTRICA", "REFRIGERACION"],
  COMPONENTES: ["DWDM", "MODULOS", "FIBRA OPTICA", "TARJETA", "PUERTO"],
  IT: ["SISTEMAS IT INTERNAL", "BASE DE DATOS", "SERVIDORES", "DNS"]
};

const serviciosPorPlataforma: Record<string, string[]> = {
  "ENLACE INTERNACIONAL": ["VTAL-DOWN", "VTAL-INTERMITENCIAS", "VTAL-SATURACION", "CIRION-DOWN", "CIRION-INTERMITENCIAS", "CIRION-SATURACION"],
  "ROUTER CORE": listaGenericaMantenimiento,
  "CGNAT": listaGenericaMantenimiento,
  "CDN": listaGenericaMantenimiento,
  "FIREWALL": listaGenericaMantenimiento,
  "CORE OTT": listaGenericaMantenimiento,
  "CORE TELEFONIA": listaGenericaMantenimiento,
  "ENLACE INTERURBANO": ["VNET - CAIDA", "VNET- INTERMITENCIAS", "VNET- SATURACION", "INTER- CAIDA", "INTER- INTERMITENCIAS", "INTER- SATURACION", "DIGITEL- CAIDA", "DIGITEL- INTERMITENCIAS", "DIGITEL- SATURACION"],
  "ROUTER DE DISTRIBUCION": listaGenericaMantenimiento,
  "ROUTER AAA": listaGenericaMantenimiento,
  "SWITCH": listaGenericaMantenimiento,
  "ONT": listaGenericaMantenimiento,
  " IAD": listaGenericaMantenimiento,
  " GATEWAY": listaGenericaMantenimiento,
  " SWICTH": listaGenericaMantenimiento,
  "ELECTRICA": ["RED PUBLICA", "INVERSOR", "BREAKER", "RECTIFICADOR", "UPS", "PLANTA ELECTRICA"],
  "REFRIGERACION": ["TEMPRATURA ALTA", "SUMINISTRO ELECTRICO", "FALLA EN EQUIPO DE REFRIGERACION"],
  "DWDM": ["CORTE DE FIBRA", "MODULO", "TARJETA", "PATCHCORD", "PIGTAIL", "CONFIGURACION", "ATENUACION", "INTERMITENCIAS"],
  "MODULOS": ["TRANCEIVER", "SFP", "PIGTAIL", "QSFP"],
  "FIBRA OPTICA": ["CORTE DE FIBRA", "ATNUACION", "FIBRA DAÑADA", "CONEXION SUELTA"],
  "TARJETA": ["FALLA EN TARJETA", "TARJETA NO RECONOCIDA", "TARJETA CON ERRORES"],
  "PUERTO": ["PUERTO CAIDO", "PUERTO CON ERRORES", "PUERTO NO RECONOCIDO", "PUERTO DAÑADO"],
  "SISTEMAS IT INTERNAL": ["FALLA EN APLICACION", "FALLA EN SISTEMA OPERATIVO", "FALLA EN BASE DE DATOS", "FALLA EN SERVIDOR", "FALLA EN DNS"],
  "BASE DE DATOS": ["FALLA EN CONSULTAS", "FALLA EN RESPALDOS", "FALLA EN REPLICACION"],
  "SERVIDORES": ["CAIDA DEL SERVIDOR", "INTERMITENCIA DEL SERVIDOR", "RENDIMIENTO LENTO"],
  "DNS": ["RESOLUCION LENTA", "FALLA EN RESOLUCION", "CONFIGURACION INCORRECTA"]
};

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}

export default function TicketModal({ open, onClose, onSave }: TicketModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const label = { slotProps: { input: { 'aria-label': 'Color switch demo' } } };

  const [form, setForm] = useState({
    numeroTicket: '', tipoIncidencia: 'INCIDENCIA PUNTUAL', asunto: '', categoria: '', plataforma: '', detalle: '',
    tipoCliente: '', tiposervicio: '', subcategoria: '', estado: '', municipio: '', ciudad: '', localidad: '',
    nodo: '', abonado: '', nombreCliente: '', operatorResponsable: USUARIO_LOGUEADO, ttZoho: '', ttClienteProveedor: '',
    horaInicioFalla: '', horaDeteccionNoc: '', horaInicioAtencion: '', horaEscalamiento: '', serviciosAfectados: [] as string[],
    horaFinAfectacion: '', horaCierreFalla: '', requiereEscalamiento: 'NO', escaladoA: '',
    causaRaiz: '', SolucionCaso: '', estatus: 'PRELIMINAR', descripcion: '', tDeteccion: 0, tAtencion: 0,
    tEscalado: 0, cCierreSoporte: 0, mttrTotal: 0, turnoAsignado: 'DIURNO'
  });

  const [preSaved, setPreSaved] = useState<boolean>(false);
  const pasos = ['Clasificación e Infraestructura', 'Tiempos y Cierre Operativo'];

  const [seleccionados, setSeleccionados] = useState<string[]>([]);


  
  useEffect(() => {
    if (form.ciudad && estructuraJerarquica[form.ciudad]) {
      setForm(prev => ({
        ...prev,
        estado: estructuraJerarquica[form.ciudad].estado,

      }));
    } else {
      setForm(prev => ({ ...prev, estado: '' }));
    }
  }, [form.ciudad]);

useEffect(() => {
  if (form.serviciosAfectados.length > 0) {
    const servicios = form.serviciosAfectados.join(' | ');
    setForm(prev => ({
      ...prev,
      asunto: `${servicios.toUpperCase()} || FALLA`
    }));
  }
}, [form.subcategoria]);

  useEffect(() => {
    setForm(prev => ({ ...prev, detalle: '' }));
  }, [form.subcategoria]);


  useEffect(() => {
    if (form.tipoCliente !== 'RESIDENCIAL') {
      setForm(prev => ({
        ...prev,
        nodo: '',
        abonado: '',
        nombreCliente: ''
      }));
    }
  }, [form.tipoCliente]);

  useEffect(() => {
    if (open) {
      const ahora = getLocalDateTimeString();
      setForm(prev => ({
        ...prev,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
        operatorResponsable: USUARIO_LOGUEADO,
      }));
      setActiveStep(0);
      setPreSaved(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const ahora = getLocalDateTimeString();
      const fechaFormateadaNoc = formatToHumanDate(ahora);
      const fechaFormateadaInicioFalla = form.horaInicioFalla ? formatToHumanDate(form.horaInicioFalla) : '';
      const fechaFormateadaFinAfectacion = form.horaFinAfectacion ? formatToHumanDate(form.horaFinAfectacion) : '';


      const plantillaDescripcion =
        `Fecha y Hora apertura Ticket: ${fechaFormateadaNoc}\n` +
        `Fecha y Hora Inicio Afectación: ${fechaFormateadaInicioFalla}\n` +
        `Fecha y hora de fin de Afectación: ${fechaFormateadaFinAfectacion}\n` +
        `Causa:\n` +
        `Solución:`;

      setForm(prev => ({
        ...prev,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
        operatorResponsable: USUARIO_LOGUEADO,
        descripcion: plantillaDescripcion

      }));
      setActiveStep(0);
      setPreSaved(false);
    }
  }, [open]);

  useEffect(() => { setForm(prev => ({ ...prev, plataforma: '', subcategoria: '' })); }, [form.categoria]);
  useEffect(() => { if (form.plataforma.includes("METROETHERNET")) { if (form.tipoCliente !== "INTERNET" && form.tipoCliente !== "DATOS" && form.tipoCliente !== "SIN_AFECTACION") { setForm(prev => ({ ...prev, tipoCliente: '', subcategoria: '' })); } } }, [form.plataforma]);
  useEffect(() => { if (form.categoria) { const prefijo = form.categoria.substring(0, 4).toUpperCase(); if (!form.numeroTicket || !form.numeroTicket.startsWith(prefijo)) { setForm(prev => ({ ...prev, numeroTicket: `${prefijo}-${Math.floor(100000 + Math.random() * 900000)}` })); } } }, [form.categoria]);
  useEffect(() => { if (form.tipoIncidencia === 'INCIDENCIA MASIVA') { setForm(prev => ({ ...prev, tiposervicio: '', subcategoria: '' })); } }, [form.tipoIncidencia]);
  useEffect(() => { if (form.escaladoA === 'SI') { setForm(prev => ({ ...prev, requiereEscalamiento: '' })); } }, [form.escaladoA]);
  useEffect(() => { if (form.tipoCliente === 'RESIDENCIAL') {setForm(prev => ({...prev, serviciosAfectados: [] }));} }, [form.tipoCliente]);
  
  useEffect(() => {
    if (activeStep > 0 && !preSaved) {
      const handleSaveTicket = async () => {
        await saveTicket({
          method: 'post',
          data: {
            caseNumber: form.numeroTicket,
            incidentType: form.tipoIncidencia,
            subject: form.asunto,
            networkCategory: form.categoria,
            description: form.descripcion,
            status: "presaved",
          },
        });
        setPreSaved(true);
        console.log("Saved! ")
      }
      handleSaveTicket();
    }
  }, [activeStep, setPreSaved, preSaved])

  useEffect(() => {
    const diffMin = (start: string, end: string) => { if (!start || !end) return 0; const diff = new Date(end).getTime() - new Date(start).getTime(); return diff > 0 ? Math.round(diff / 1000 / 60) : 0; };
    let turno = 'DIURNO';
    if (form.horaDeteccionNoc) { const horaNoc = new Date(form.horaDeteccionNoc).getHours(); if (horaNoc >= 19 || horaNoc < 7) turno = 'NOCTURNO'; }
    setForm(prev => ({ ...prev, tDeteccion: diffMin(form.horaInicioFalla, form.horaDeteccionNoc), tAtencion: diffMin(form.horaDeteccionNoc, form.horaInicioAtencion), tEscalado: form.requiereEscalamiento === 'SI' ? diffMin(form.horaInicioFalla, form.horaEscalamiento) : 0, cCierreSoporte: diffMin(form.horaInicioAtencion, form.horaCierreFalla), mttrTotal: diffMin(form.horaInicioFalla, form.horaCierreFalla), turnoAsignado: turno }));
  }, [form.horaInicioFalla, form.horaDeteccionNoc, form.horaInicioAtencion, form.horaEscalamiento, form.horaCierreFalla, form.requiereEscalamiento]);

  useEffect(() => {
    if (form.horaDeteccionNoc) {
      const t1Formateado = formatToHumanDate(form.horaDeteccionNoc);
      const t0Formateado = form.horaInicioFalla ? formatToHumanDate(form.horaInicioFalla) : '';
      const finAfectacionFormateado = form.horaFinAfectacion ? formatToHumanDate(form.horaFinAfectacion) : '';
      setForm(prev => {
        if (!prev.descripcion || prev.descripcion.startsWith("Fecha y Hora apertura Ticket:")) {
          const lineas = prev.descripcion.split('\n');
          lineas[0] = `Fecha y Hora apertura Ticket: ${t1Formateado}`;
          lineas[1] = `Fecha y Hora Inicio Afectación: ${t0Formateado}`;
          lineas[2] = `Fecha y hora de fin de Afectación: ${finAfectacionFormateado}`;
          if (lineas.length > 3) lineas[3] = `Causa: ${prev.causaRaiz || ''}`;
          if (lineas.length > 4) lineas[4] = `Solución: ${prev.SolucionCaso || ''}`;


          return { ...prev, descripcion: lineas.join('\n') };
        } return prev;
      });
    }


  }, [form.horaDeteccionNoc, form.horaInicioFalla, form.horaFinAfectacion]);
  useEffect(() => {
    if (form.descripcion) {
      const lineas = form.descripcion.split('\n');
      if (lineas.length > 3) {
        lineas[3] = `Causa: ${form.causaRaiz}`;
      }
      if (lineas.length > 4) {
        lineas[4] = `Solución: ${form.SolucionCaso}`;
      }
      setForm(prev => ({ ...prev, descripcion: lineas.join('\n') }));
    }
  }, [form.causaRaiz, form.SolucionCaso]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleDateTimeClick = (e: React.MouseEvent<HTMLInputElement>) => { try { (e.target as any).showPicker(); } catch (err) { } };
  const [contratos, setContratos] = useState(['GPON', 'ONT', 'IAD']);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaHoraCierreActual = getLocalDateTimeString();
    const cierreFormateado = formatToHumanDate(fechaHoraCierreActual);
    const diffMin = (start: string, end: string) => { if (!start || !end) return 0; const diff = new Date(end).getTime() - new Date(start).getTime(); return diff > 0 ? Math.round(diff / 1000 / 60) : 0; };
    let descripcionFinal = form.descripcion;
    const lineas = descripcionFinal.split('\n');
    if (lineas.length >= 2 && lineas[1].trim() === "Fecha y hora de fin de Afectación:") { lineas[1] = `Fecha y hora de fin de Afectación: ${cierreFormateado}`; descripcionFinal = lineas.join('\n'); }
    const finalFormData = { ...form, horaCierreFalla: fechaHoraCierreActual, descripcion: descripcionFinal, cCierreSoporte: diffMin(form.horaInicioAtencion, fechaHoraCierreActual), mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreActual), estatus: 'CERRADO' };
    onSave(finalFormData);
    setActiveStep(0);
    onClose();
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ color: '#000027', fontWeight: 600 }}>Apertura y Tipificación - NOC</Typography>
          <IconButton onClick={onClose} edge="end"><CloseIcon /></IconButton>
        </Box>
        <FormStepper activeStep={activeStep} steps={pasos} />
        <Divider sx={{ mb: 3 }} />
        {activeStep === 0 ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth disabled label="Número de Caso (Auto)" name="numeroTicket" value={form.numeroTicket} size="small" InputProps={{ startAdornment: <ConfirmationNumberIcon sx={{ color: '#000027', mr: 1, fontSize: '1.1rem' }} /> }} sx={{ bgcolor: '#f0f4f8' }} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField select fullWidth required label="Tipo de Incidencia" name="tipoIncidencia" value={form.tipoIncidencia} onChange={handleChange} size="small"><MenuItem value="INCIDENCIA PUNTUAL">INCIDENCIA PUNTUAL</MenuItem><MenuItem value="INCIDENCIA MASIVA">INCIDENCIA MASIVA</MenuItem><MenuItem value="VENTANA DE MANTENIMIENTO">VENTANA DE MANTENIMIENTO</MenuItem></TextField></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth required label="Asunto del Caso" name="asunto" value={form.asunto} onChange={handleChange} placeholder="CCS || SERVICIO || VLAN CLIENTE || FALLA" size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select fullWidth required label="Categoría de Red" name="categoria" value={form.categoria} onChange={handleChange} size="small">{Object.keys(plataformasPorCategoria).filter(cat => {
              if (form.tipoIncidencia === 'INCIDENCIA PUNTUAL') { return cat !== 'CORE' && cat !== 'TRANSPORTE'; } return true;
            })
              .map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))
            }</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select fullWidth required label="SubCategoría" name="plataforma" value={form.plataforma} onChange={handleChange} size="small" disabled={!form.categoria}>{(plataformasPorCategoria[form.categoria] || []).map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth required label="Detalle" name="detalle" value={form.detalle} onChange={handleChange} size="small" disabled={!form.categoria}> {(subcategoriasPorServicio[form.subcategoria] || []).map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
              </TextField>
            </Grid>


            {form.tipoIncidencia !== 'INCIDENCIA MASIVA' && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}><TextField select fullWidth required label="Tipo de cliente"
                  name="tipoCliente" value={form.tipoCliente} onChange={handleChange} size="small">
                  <MenuItem value="BANCA">BANCA</MenuItem>
                  <MenuItem value="CARRIER">CARRIER</MenuItem>
                  <MenuItem value="RESIDENCIAL">RESIDENCIAL</MenuItem>
                  <MenuItem value="CORPORATIVO">CORPORATIVO</MenuItem></TextField></Grid>
              </>
            )}

            {form.tipoIncidencia !== 'INCIDENCIA MASIVA' && form.tipoCliente !== 'RESIDENCIAL' && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
        multiple
        options={contratos}
        value={form.serviciosAfectados}
        onChange={(e, newValue) => setForm(prev => ({ ...prev, serviciosAfectados: newValue }))}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Servicios afectados"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <IconButton onClick={() => setOpenModal(true)} size="small">
                    <AddIcon />
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
        onAdd={(nuevo) => setContratos([...contratos, nuevo])}
      />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth required label="Ciudad" name="ciudad" value={form.ciudad}
                onChange={(e) => setForm(prev => ({ ...prev, ciudad: e.target.value, estado: '', localidad: '' }))}
                size="small"> {Object.keys(estructuraJerarquica).map((ciu) => (<MenuItem key={ciu} value={ciu}>{ciu}</MenuItem>))}
              </TextField>
            </Grid>
            {form.ciudad && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth disabled label="Estado" value={form.estado}
                  size="small" /></Grid>

                <Grid size={{ xs: 12, sm: 4 }}><TextField select fullWidth required label="Localidad" name="localidad"
                  value={form.localidad} onChange={handleChange} size="small">
                  {(estructuraJerarquica[form.ciudad]?.localidades || []).map((loc) => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </TextField>
                </Grid>
              </>
            )}


            {form.tipoCliente === 'RESIDENCIAL' && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Nodo Afectado" name="nodo" value={form.nodo} onChange={handleChange} size="small" /> </Grid>
                <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Abonado" name="abonado" value={form.abonado} onChange={handleChange} size="small" /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth required label="Nombre del Cliente" name="nombreCliente" value={form.nombreCliente} onChange={handleChange} size="small" /></Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>< TextField fullWidth id="outlined-multiline-flexible" label="Bitacora" multiline maxRows={4} /></Grid>
            <Grid size={{ xs: 4 }}><Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Switch {...label}  /><Typography>Afectacion</Typography></Stack></Grid>
          </Grid>

        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }} sx={{ mb: -1 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333' }}>3. Tiempos de Ciclo de Falla</Typography></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth required type="datetime-local" label="t0: Inicio Falla *" name="horaInicioFalla" value={form.horaInicioFalla} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' } }} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth disabled type="datetime-local" label="t1: Apertura NOC (Auto)" name="horaDeteccionNoc" value={form.horaDeteccionNoc} size="small" InputLabelProps={{ shrink: true }} sx={{ bgcolor: '#f0f4f8' }} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth required type="datetime-local" label="t2: Inicio Atención *" name="horaInicioAtencion" value={form.horaInicioAtencion} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' } }} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth type="datetime-local" label="t3: Escalamiento" name="horaEscalamiento" value={form.horaEscalamiento} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} disabled={form.requiereEscalamiento === 'NO'} required={form.requiereEscalamiento === 'SI'} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' } }} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth type="datetime-local" label="Fin Afectación" name="horaFinAfectacion" value={form.horaFinAfectacion} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' } }} /></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField fullWidth disabled label="t4: Cierre Falla (Auto)" value="Al guardar..." size="small" sx={{ bgcolor: '#f0f4f8' }} /></Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ bgcolor: '#b4baff', color: '#000', p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, px: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Detección:</strong> {form.tDeteccion} min</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Atención:</strong> {form.tAtencion} min</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Escalado:</strong> {form.tEscalado} min</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>Cierre Soporte:</strong> (Se calcula al guardar)</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select fullWidth label="¿Escalar a Especialistas?" name="requiereEscalamiento" value={form.requiereEscalamiento} onChange={handleChange} size="small"><MenuItem value="NO">No</MenuItem><MenuItem value="SI">Sí</MenuItem></TextField></Grid>
            {form.requiereEscalamiento !== 'NO' && (<Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Grupo Destino" name="escaladoA" value={form.escaladoA} onChange={handleChange} size="small" /></Grid>)}
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Causa Raíz" name="causaRaiz" value={form.causaRaiz} onChange={handleChange} size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Solucion Caso" name="SolucionCaso" value={form.SolucionCaso} onChange={handleChange} size="small" /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth disabled label="Turno" value={form.turnoAsignado} size="small" sx={{ bgcolor: '#f0f4f8' }} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="TT-ZOHO" name="ttZoho" value={form.ttZoho} onChange={handleChange} size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="TT-CLIENTE" name="ttClienteProveedor" value={form.ttClienteProveedor} onChange={handleChange} size="small" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth disabled label="Operador" name="operatorResponsable" value={form.operatorResponsable} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ color: '#000027', mr: 1, fontSize: '1.1rem' }} /> }} sx={{ bgcolor: '#f0f4f8' }} /></Grid>
            <Grid size={{ xs: 12, sm: 12 }}><TextField fullWidth multiline rows={7} required label="Detalles del incidente" name="descripcion" value={form.descripcion} onChange={handleChange} size="small" /></Grid>
          </Grid>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button variant="outlined" color="error" onClick={onClose} sx={{ borderRadius: '50px', px: 3, fontWeight: 600, textTransform: 'none' }}>Descartar</Button>
          {activeStep > 0 && <Button variant="outlined" startIcon={<NavigateBeforeIcon />} onClick={handleBack} sx={{ borderRadius: '50px', px: 3, fontWeight: 600, textTransform: 'none', color: '#000027', borderColor: '#000027' }}>Atrás</Button>}
          {activeStep < pasos.length - 1 ? (
            <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={handleNext} sx={{ bgcolor: '#000027', borderRadius: '50px', px: 4, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#000045' } }}>Continuar</Button>
          ) : (
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: '#2e7d32', borderRadius: '50px', px: 4, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#1b5e20' } }}>Guardar e Insertar</Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

