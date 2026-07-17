// app/home/utils/ticketHelpers.ts
import dayjs from 'dayjs';

export type ServicioAfectado = { _id: string; name: string };

export type OperatorField =
  | { _id?: string; primerNombre?: string; primerApellido?: string; username?: string; email?: string }
  | string
  | null
  | undefined;

export interface TicketRecord {
  _id?: string;
  caseNumber?: string;
  incidentType?: string | string[];
  subject?: string;
  networkCategory?: string;
  subcategoria?: string;
  detalle?: string;
  tipoCliente?: string;
  serviciosAfectados?: string[] | ServicioAfectado[];
  ciudad?: string;
  estado?: string;
  localidad?: string;
  bitacora?: string;
  nodo?: string;
  abonado?: string;
  nombreCliente?: string;
  afectacion?: boolean;
  horaInicioFalla?: string;
  horaDeteccionNoc?: string;
  horaInicioAtencion?: string;
  horaEscalamiento?: string;
  horaFinAfectacion?: string;
  horaCierreFalla?: string;
  horaCierre?: string;
  requiereEscalamiento?: string;
  escaladoA?: string;
  causaRaiz?: string;
  SolucionCaso?: string;
  turnoAsignado?: string;
  ttZoho?: string;
  ttClienteProveedor?: string;
  operatorResponsable?: OperatorField;
  operatorAsignado?: OperatorField;
  operador?: string;
  severidad?: string;
  nivelSeveridad?: string;
  imputable?: string;
  description?: string;
  status?: string;
  email?: string;
}

export interface TicketFormData {
  numeroTicket: string;
  tipoIncidencia: string;
  asunto: string;
  categoria: string;
  subcategoria: string;
  detalle: string;
  tipoCliente: string;
  tiposervicio: string;
  estado: string;
  municipio: string;
  ciudad: string;
  localidad: string;
  nodo: string;
  abonado: string;
  nombreCliente: string;
  operatorResponsable: string;
  operatorAsignado: string;
  ttZoho: string;
  ttClienteProveedor: string;
  horaInicioFalla: string;
  horaDeteccionNoc: string;
  horaInicioAtencion: string;
  horaEscalamiento: string;
  serviciosAfectados: ServicioAfectado[];
  horaFinAfectacion: string;
  horaCierreFalla: string;
  requiereEscalamiento: 'SI' | 'NO';
  escaladoA: string;
  causaRaiz: string;
  SolucionCaso: string;
  estatus: string;
  descripcion: string;
  turnoAsignado: 'DIURNO' | 'NOCTURNO';
  bitacora: string;
  operador: string;
  severidad: string;
  imputable: string;
  afectacion: boolean;
}

export const initialFormState: TicketFormData = {
  numeroTicket: '',
  tipoIncidencia: '',
  asunto: '',
  categoria: '',
  subcategoria: '',
  detalle: '',
  tipoCliente: '',
  tiposervicio: '',
  estado: '',
  municipio: '',
  ciudad: '',
  localidad: '',
  nodo: '',
  abonado: '',
  nombreCliente: '',
  operatorResponsable: '',
  operatorAsignado: '',
  ttZoho: '',
  ttClienteProveedor: '',
  horaInicioFalla: '',
  horaDeteccionNoc: '',
  horaInicioAtencion: '',
  horaEscalamiento: '',
  serviciosAfectados: [],
  horaFinAfectacion: '',
  horaCierreFalla: '',
  requiereEscalamiento: 'NO',
  escaladoA: '',
  causaRaiz: '',
  SolucionCaso: '',
  estatus: 'PRELIMINAR',
  descripcion: '',
  turnoAsignado: 'DIURNO',
  bitacora: '',
  operador: '',
  severidad: '',
  imputable: '',
  afectacion: false,
};

// ✅ Funciones puras (fáciles de testear)
export const getLocalDateTimeString = (date = new Date()): string => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const formatToHumanDate = (dateTimeStr: string): string => {
  if (!dateTimeStr) return '';
  const [datePart, timePart] = dateTimeStr.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year} ${timePart}`;
};

export const diffMin = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return diff > 0 ? Math.round(diff / 1000 / 60) : 0;
};

export const generarNumeroTicket = (prefijo: string, actual?: string): string => {
  if (actual && actual.startsWith(prefijo)) return actual;
    const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
  return `${prefijo}-${numeroAleatorio}`;
};

export const generarDescripcion = (formData: Partial<TicketFormData>): string => {
  const fechaNoc = formData.horaDeteccionNoc ? formatToHumanDate(formData.horaDeteccionNoc) : '';
  const fechaInicio = formData.horaInicioFalla ? formatToHumanDate(formData.horaInicioFalla) : '';
  const fechaFin = formData.horaFinAfectacion ? formatToHumanDate(formData.horaFinAfectacion) : '';
  const fechaCierre = formData.horaCierreFalla ? formatToHumanDate(formData.horaCierreFalla) : '';

  return [
    `Fecha y Hora apertura Ticket: ${fechaNoc}`,
    `Fecha y Hora Inicio Afectación: ${fechaInicio}`,
    `Fecha y hora de fin de Afectación: ${fechaFin}`,
    `Fecha y hora de cierre ticket: ${fechaCierre}`,
    `Causa: ${formData.causaRaiz || ''}`,
    `Solución: ${formData.SolucionCaso || ''}`,
  ].join('\n');
};

export const calcularTurno = (horaDeteccionNoc: string): 'DIURNO' | 'NOCTURNO' => {
  if (!horaDeteccionNoc) return 'DIURNO';
  const hora = new Date(horaDeteccionNoc).getHours();
  return hora >= 19 || hora < 7 ? 'NOCTURNO' : 'DIURNO';
};

export const isEditTicket = (
  ticket?: TicketRecord | null
): ticket is TicketRecord & { _id: string } => Boolean(ticket?._id);

const extractOperatorId = (field: OperatorField): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field._id || '';
};

const toDateTimeLocal = (value?: string): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return getLocalDateTimeString(date);
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      return value.slice(0, 16);
    }
  } catch {
    return value;
  }
  return value;
};

const normalizeIncidentType = (value?: string | string[]): string => {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
};

const normalizeServiciosAfectados = (
  value?: string[] | ServicioAfectado[]
): ServicioAfectado[] => {
  if (!value?.length) return [];
  if (typeof value[0] === 'string') {
    return (value as string[]).map((id) => ({ _id: id, name: id }));
  }
  return value as ServicioAfectado[];
};

export const mapTicketToFormData = (
  ticket: TicketRecord,
  sessionOperatorId = '',
  currentUserId: string
): TicketFormData => {
  const tipoIncidencia = normalizeIncidentType(ticket.incidentType);
  const horaCierre = ticket.horaCierreFalla || ticket.horaCierre;

  return {
    ...initialFormState,
    numeroTicket: ticket.caseNumber || '',
    tipoIncidencia,
    asunto: ticket.subject || '',
    categoria: ticket.networkCategory || '',
    subcategoria: ticket.subcategoria || '',
    detalle: ticket.detalle || '',
    tipoCliente: ticket.tipoCliente || '',
    ciudad: ticket.ciudad || '',
    estado: ticket.estado || '',
    localidad: ticket.localidad || '',
    nodo: ticket.nodo || '',
    abonado: ticket.abonado || '',
    nombreCliente: ticket.nombreCliente || '',
    bitacora: ticket.bitacora || '',
    afectacion: ticket.afectacion ?? false,
      serviciosAfectados: ticket.serviciosAfectados?.map((sa: any) => ({
      _id: sa._id || sa,
      name: sa.name || sa.valor || '',
    })) || [],
    operatorResponsable: extractOperatorId(ticket.operatorResponsable) || sessionOperatorId,
    operatorAsignado: extractOperatorId(ticket.operatorAsignado),
    ttZoho: ticket.ttZoho || '',
    ttClienteProveedor: ticket.ttClienteProveedor || '',
    horaInicioFalla: toDateTimeLocal(ticket.horaInicioFalla),
    horaDeteccionNoc: toDateTimeLocal(ticket.horaDeteccionNoc),
    horaInicioAtencion: toDateTimeLocal(ticket.horaInicioAtencion),
    horaEscalamiento: toDateTimeLocal(ticket.horaEscalamiento),
    horaFinAfectacion: toDateTimeLocal(ticket.horaFinAfectacion),
    horaCierreFalla: toDateTimeLocal(horaCierre),
    requiereEscalamiento: ticket.requiereEscalamiento === 'SI' ? 'SI' : 'NO',
    escaladoA: ticket.escaladoA || '',
    causaRaiz: ticket.causaRaiz || '',
    SolucionCaso: ticket.SolucionCaso || '',
    severidad: ticket.severidad || ticket.nivelSeveridad || '',
    imputable: ticket.imputable || '',
    descripcion: ticket.description || '',
    estatus: ticket.status || '',
    turnoAsignado: ticket.turnoAsignado === 'NOCTURNO' ? 'NOCTURNO' : 'DIURNO',
    operador: ticket.operador || '',
  };
};

export const mapFormToUpdatePayload = (form: TicketFormData & Record<string, unknown>) => ({
  caseNumber: form.numeroTicket,
  incidentType: form.tipoIncidencia,
  subject: form.asunto,
  networkCategory: form.categoria,
  description: form.descripcion,
  subcategoria: form.subcategoria,
  detalle: form.detalle,
  tipoCliente: form.tipoCliente,
  serviciosAfectados: (form.serviciosAfectados || []).map((sa) => sa._id),
  ciudad: form.ciudad,
  estado: form.estado,
  localidad: form.localidad,
  bitacora: form.bitacora,
  nodo: form.nodo,
  abonado: form.abonado,
  nombreCliente: form.nombreCliente,
  afectacion: form.afectacion,
  horaInicioFalla: form.horaInicioFalla,
  horaDeteccionNoc: form.horaDeteccionNoc,
  horaInicioAtencion: form.horaInicioAtencion,
  horaEscalamiento: form.horaEscalamiento,
  horaFinAfectacion: form.horaFinAfectacion,
  horaCierreFalla: form.horaCierreFalla,
  requiereEscalamiento: form.requiereEscalamiento,
  escaladoA: form.escaladoA,
  causaRaiz: form.causaRaiz,
  SolucionCaso: form.SolucionCaso,
  turnoAsignado: form.turnoAsignado,
  ttZoho: form.ttZoho,
  ttClienteProveedor: form.ttClienteProveedor,
  operatorResponsable: form.operatorResponsable,
  operatorAsignado: form.operatorAsignado,
  operador: form.operador,
  severidad: form.severidad,
  imputable: form.imputable,
  tDeteccion: form.tDeteccion as number | undefined,
  tAtencion: form.tAtencion as number | undefined,
  tEscalado: form.tEscalado as number | undefined,
  cCierreSoporte: form.cCierreSoporte as number | undefined,
  mttrTotal: form.mttrTotal as number | undefined,
});

export const calcularTiempos = (form: TicketFormData) => {
  const ahora = getLocalDateTimeString();
  const cierreFalla = form.horaCierreFalla || ahora;

  return {
    tDeteccion: diffMin(form.horaInicioFalla, form.horaDeteccionNoc),
    tAtencion: diffMin(form.horaDeteccionNoc, form.horaInicioAtencion),
    tEscalado: form.requiereEscalamiento === 'SI' ? diffMin(form.horaInicioFalla, form.horaEscalamiento) : 0,
    cCierreSoporte: diffMin(form.horaInicioAtencion, cierreFalla),
    mttrTotal: diffMin(form.horaInicioFalla, cierreFalla),
    turnoAsignado: calcularTurno(form.horaDeteccionNoc),
  };
};