import { useState, useCallback, useMemo } from 'react';
import { TIPO_CLIENTE, TIPO_INCIDENCIA, TICKET_STATUS } from 'app/utils/constants';
import {
  TicketFormData,
  initialFormState,
  getLocalDateTimeString,
  generarNumeroTicket,
  calcularTiempos,
  formatToHumanDate,
  diffMin,
  ServicioAfectado,
} from '../../utils/ticketHelpers';
import { ConfiguracionInterface } from '../../utils/types';

interface UseTicketFormProps {
  sessionOperatorId: string;
  causasRaiz?: ConfiguracionInterface[];
  solucionesCaso?: ConfiguracionInterface[];
}

export const useTicketForm = ({ sessionOperatorId, causasRaiz = [], solucionesCaso = [] }: UseTicketFormProps) => {
  const [form, setForm] = useState<TicketFormData>({
    ...initialFormState,
    operatorResponsable: sessionOperatorId,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [preSaved, setPreSaved] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const showTipoClienteInput = useMemo(
    () => form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA,
    [form.tipoIncidencia]
  );

  const tiemposCalculados = useMemo(() => calcularTiempos(form), [form]);

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

    return true;
  }, [form, showTipoClienteInput]);

  const getNombreFromId = useCallback((id: string, lista: ConfiguracionInterface[]) => {
    const item = lista.find(item => item._id === id);
    return item?.valor || id;
  }, []);

  const updateField = useCallback((name: keyof TicketFormData, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      if (name === 'causaRaiz' || name === 'SolucionCaso') {
        const formForDescription = name === 'causaRaiz' 
          ? { ...newForm, SolucionCaso: '' } 
          : newForm;
          
        const causaNombre = getNombreFromId(formForDescription.causaRaiz, causasRaiz);
        const solucionNombre = getNombreFromId(formForDescription.SolucionCaso, solucionesCaso);
        
        // ✅ NUEVA LÓGICA: Solo mostrar la fecha de cierre si el estatus es CERRADO
        const isClosed = formForDescription.estatus === TICKET_STATUS.CERRADO || formForDescription.estatus === 'CERRADO';
        const fechaCierreTexto = isClosed && formForDescription.horaCierreFalla 
          ? formatToHumanDate(formForDescription.horaCierreFalla) 
          : ''; // Si no está cerrado, se deja vacío

        const descripcionGenerada = [
          `Fecha y Hora apertura Ticket: ${formForDescription.horaDeteccionNoc ? formatToHumanDate(formForDescription.horaDeteccionNoc) : ''}`,
          `Fecha y Hora Inicio Afectación: ${formForDescription.horaInicioFalla ? formatToHumanDate(formForDescription.horaInicioFalla) : ''}`,
          `Fecha y hora de fin de Afectación: ${formForDescription.horaFinAfectacion ? formatToHumanDate(formForDescription.horaFinAfectacion) : ''}`,
          `Fecha y hora de cierre ticket: ${fechaCierreTexto}`,
          `Causa: ${causaNombre}`,
          `Solución: ${solucionNombre}`,
        ].join('\n');
        
        return {
          ...formForDescription,
          descripcion: descripcionGenerada,
        };
      }
      
      return newForm;
    });
  }, [causasRaiz, solucionesCaso, getNombreFromId]);

  const handleTipoIncidenciaChange = useCallback(
    (tipoIncidencia: string) => {
      const ahora = getLocalDateTimeString();
      setForm({
        ...initialFormState,
        tipoIncidencia,
        operatorResponsable: sessionOperatorId,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
        descripcion: `Fecha y Hora apertura Ticket: ${formatToHumanDate(ahora)}\nFecha y Hora Inicio Afectación: \nFecha y hora de fin de Afectación: \nFecha y hora de cierre ticket: \nCausa: \nSolución: `,
      });
      setActiveStep(0);
      setPreSaved(null);
      setIsEditMode(false);
    },
    [sessionOperatorId]
  );

  const handleCategoriaChange = useCallback(
    (categoria: ConfiguracionInterface, numeroTicketActual: string) => {
      setForm((prev) => {
        const nuevoPrefijo = categoria.valor.substring(0, 4).toUpperCase();
        
        if (isEditMode) {
          const numeroCorrelativo = numeroTicketActual.includes('-') 
            ? numeroTicketActual.split('-')[1] 
            : numeroTicketActual;
          const nuevoNumeroTicket = `${nuevoPrefijo}-${numeroCorrelativo}`;
          
          return {
            ...prev,
            categoria: categoria._id,
            subcategoria: '',
            numeroTicket: nuevoNumeroTicket,
          };
        } else {
          let numeroGenerado = numeroTicketActual;
          if (!numeroGenerado || !numeroGenerado.startsWith(nuevoPrefijo)) {
            numeroGenerado = generarNumeroTicket(nuevoPrefijo, numeroTicketActual);
          }
          
          return {
            ...prev,
            categoria: categoria._id,
            subcategoria: '',
            numeroTicket: numeroGenerado,
          };
        }
      });
    },
    [isEditMode]
  );

  const handleTipoClienteChange = useCallback(
    (tipoClienteId: string, tipoClienteOptions: ConfiguracionInterface[]) => {
      const selected = tipoClienteOptions.find((tc) => tc._id === tipoClienteId);
      const updates: Partial<TicketFormData> = { tipoCliente: tipoClienteId };

      updates.severidad = selected?.nivelSeveridad?.trim() || '';

      if (selected?.valor !== TIPO_CLIENTE.RESIDENCIAL) {
        updates.nodo = '';
        updates.abonado = '';
        updates.nombreCliente = '';
      } else {
        updates.serviciosAfectados = [];
      }

      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleCiudadChange = useCallback(
    (ciudadName: string, estado: string) => {
      setForm((prev) => ({ ...prev, ciudad: ciudadName, estado, localidad: '' }));
    },
    []
  );

  const handleCausaRaizChange = useCallback((causaRaiz: string) => {
    updateField('causaRaiz', causaRaiz);
  }, [updateField]);

  const handleServiciosAfectadosChange = useCallback((servicios: ServicioAfectado[]) => {
    setForm((prev) => ({ ...prev, serviciosAfectados: servicios }));
  }, []);

  const advanceStep = useCallback(() => {
    setActiveStep((prevStep) => {
      const newStep = prevStep + 1;
      
      if (newStep === 1 && (!form.horaDeteccionNoc || form.horaDeteccionNoc.trim() === '')) {
        const ahora = getLocalDateTimeString();
        setForm((prev) => ({
          ...prev,
          horaDeteccionNoc: ahora,
        }));
      }
      
      return newStep;
    });
  }, [form.horaDeteccionNoc]);

  const loadFromTicket = useCallback((formData: TicketFormData, ticketId: string) => {
    setForm(formData);
    setActiveStep(0);
    setPreSaved(ticketId);
    setIsEditMode(true);
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...initialFormState, operatorResponsable: sessionOperatorId });
    setActiveStep(0);
    setPreSaved(null);
    setIsEditMode(false);
  }, [sessionOperatorId]);

    const prepareFinalData = useCallback(() => {
    // ✅ Usar horaCierreFalla del form si existe, si no, generar la actual
    const fechaHoraCierreFinal = form.horaCierreFalla || getLocalDateTimeString();
    const cierreFormateado = formatToHumanDate(fechaHoraCierreFinal);

    let descripcionFinal = form.descripcion;
    const lineas = descripcionFinal.split('\n');

    const isClosed = form.estatus === TICKET_STATUS.CERRADO || form.estatus === 'CERRADO';

    lineas.forEach((linea, index) => {
      if (linea.startsWith('Fecha y Hora apertura Ticket:')) {
        const fechaNoc = form.horaDeteccionNoc ? formatToHumanDate(form.horaDeteccionNoc) : '';
        lineas[index] = `Fecha y Hora apertura Ticket: ${fechaNoc}`;
      }
      if (linea.startsWith('Fecha y Hora Inicio Afectación:')) {
        const fechaInicio = form.horaInicioFalla ? formatToHumanDate(form.horaInicioFalla) : '';
        lineas[index] = `Fecha y Hora Inicio Afectación: ${fechaInicio}`;
      }
      if (linea.startsWith('Fecha y hora de fin de Afectación:')) {
        const fechaFin = form.horaFinAfectacion ? formatToHumanDate(form.horaFinAfectacion) : '';
        lineas[index] = `Fecha y hora de fin de Afectación: ${fechaFin}`;
      }
      if (linea.startsWith('Fecha y hora de cierre ticket:')) {
        // ✅ Solo muestra la fecha si está cerrado Y existe horaCierreFalla
        if (isClosed && form.horaCierreFalla) {
          lineas[index] = `Fecha y hora de cierre ticket: ${formatToHumanDate(form.horaCierreFalla)}`;
        } else {
          lineas[index] = `Fecha y hora de cierre ticket: `;
        }
      }
      if (linea.startsWith('Causa:')) {
        const causaNombre = getNombreFromId(form.causaRaiz, causasRaiz);
        lineas[index] = `Causa: ${causaNombre}`;
      }
      if (linea.startsWith('Solución:')) {
        const solucionNombre = getNombreFromId(form.SolucionCaso, solucionesCaso);
        lineas[index] = `Solución: ${solucionNombre}`;
      }
    });
    descripcionFinal = lineas.join('\n');

    const tiempos = calcularTiempos({ ...form, horaCierreFalla: fechaHoraCierreFinal });

    return {
      ...form,
      ...tiempos,
      horaCierreFalla: fechaHoraCierreFinal,
      descripcion: descripcionFinal,
      cCierreSoporte: diffMin(form.horaInicioAtencion, fechaHoraCierreFinal),
      mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreFinal),
      estatus: isClosed ? 'CERRADO' : form.estatus,
    };
  }, [form, causasRaiz, solucionesCaso, getNombreFromId]);

  return {
    form,
    setForm,
    activeStep,
    setActiveStep,
    advanceStep,
    preSaved,
    setPreSaved,
    isEditMode,
    loadFromTicket,
    showTipoClienteInput,
    tiemposCalculados,
    isStep0Complete,
    updateField,
    handleTipoIncidenciaChange,
    handleCategoriaChange,
    handleTipoClienteChange,
    handleCiudadChange,
    handleCausaRaizChange,
    handleServiciosAfectadosChange,
    resetForm,
    prepareFinalData,
  };
};