// app/home/utils/ticketHelpers.ts
import dayjs from 'dayjs';

export type ServicioAfectado = { _id: string; name: string };

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
  return `${prefijo}-${Math.floor(100000 + Math.random() * 900000)}`;
};

export const generarDescripcion = (formData: Partial<TicketFormData>): string => {
  const fechaNoc = formatToHumanDate(formData.horaDeteccionNoc || '');
  const fechaInicio = formData.horaInicioFalla ? formatToHumanDate(formData.horaInicioFalla) : '';
  const fechaFin = formData.horaFinAfectacion ? formatToHumanDate(formData.horaFinAfectacion) : '';

  return [
    `Fecha y Hora apertura Ticket: ${fechaNoc}`,
    `Fecha y Hora Inicio Afectación: ${fechaInicio}`,
    `Fecha y hora de fin de Afectación: ${fechaFin}`,
    `Causa: ${formData.causaRaiz || ''}`,
    `Solución: ${formData.SolucionCaso || ''}`,
  ].join('\n');
};

export const calcularTurno = (horaDeteccionNoc: string): 'DIURNO' | 'NOCTURNO' => {
  if (!horaDeteccionNoc) return 'DIURNO';
  const hora = new Date(horaDeteccionNoc).getHours();
  return hora >= 19 || hora < 7 ? 'NOCTURNO' : 'DIURNO';
};

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