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
    if (!id) return '';
    const item = lista.find(item => item._id === id);
    return item?.valor || id;
  }, []);

  // ✅ CORREGIDO: Ahora acepta 'solucionCaso' (minúscula) que es lo que envía el formulario
  const updateField = useCallback((name: keyof TicketFormData, value: any) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Verificamos ambas posibilidades por si acaso, pero 'solucionCaso' es la correcta
      if (name === 'causaRaiz' || name === 'SolucionCaso' ) {
        
        // Normalizamos la lectura de los IDs para evitar errores de undefined
        const causaId = newForm.causaRaiz;
        const solucionId = (newForm as any).SolucionCaso || (newForm as any).SolucionCaso;
        
        const causaNombre = getNombreFromId(causaId, causasRaiz);
        const solucionNombre = getNombreFromId(solucionId, solucionesCaso);
        
        const isClosed = newForm.estatus === TICKET_STATUS.CERRADO || newForm.estatus === 'CERRADO';
        const fechaCierreTexto = isClosed && newForm.horaCierreFalla 
          ? formatToHumanDate(newForm.horaCierreFalla) 
          : '';

        const descripcionGenerada = [
          `Fecha y Hora apertura Ticket: ${newForm.horaDeteccionNoc ? formatToHumanDate(newForm.horaDeteccionNoc) : ''}`,
          `Fecha y Hora Inicio Afectación: ${newForm.horaInicioFalla ? formatToHumanDate(newForm.horaInicioFalla) : ''}`,
          `Fecha y hora de fin de Afectación: ${newForm.horaFinAfectacion ? formatToHumanDate(newForm.horaFinAfectacion) : ''}`,
          `Fecha y hora de cierre ticket: ${fechaCierreTexto}`,
          `Causa: ${causaNombre}`,
          `Solución: ${solucionNombre}`,
        ].join('\n');
        
        return {
          ...newForm,
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
    const fechaHoraCierreFinal = form.horaCierreFalla || getLocalDateTimeString();
    
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
      // ✅ CORREGIDO: Buscar el valor independientemente de si está en mayúscula o minúscula
      if (linea.startsWith('Solución:')) {
        const solucionId = (form as any).solucionCaso || (form as any).SolucionCaso;
        const solucionNombre = getNombreFromId(solucionId, solucionesCaso);
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
      mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreFinal), // MTTR (Mean Time To Repair) del ticket: el tiempo total de resolución, expresado en minutos. = horaInicioFalla  - horaCierreFalla
      estatus: isClosed ? TICKET_STATUS.CERRADO : TICKET_STATUS.ACTIVO,
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