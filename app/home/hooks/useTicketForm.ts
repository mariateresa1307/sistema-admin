import { useState, useCallback, useMemo } from 'react';
import { TIPO_CLIENTE, TIPO_INCIDENCIA, TICKET_STATUS } from 'app/utils/constants';
import {
  TicketFormData,
  initialFormState,
  getLocalDateTimeString,
  generarDescripcion,
  generarNumeroTicket,
  calcularTiempos,
  formatToHumanDate,
  diffMin,
  ServicioAfectado,
} from '../../utils/ticketHelpers';
import { ConfiguracionInterface } from '../../utils/types';

interface UseTicketFormProps {
  sessionOperatorId: string;
}

export const useTicketForm = ({ sessionOperatorId }: UseTicketFormProps) => {
  const [form, setForm] = useState<TicketFormData>({
    ...initialFormState,
    operatorResponsable: sessionOperatorId,
  });
  const [activeStep, setActiveStep] = useState(0);
  const [preSaved, setPreSaved] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ Memoizaciones
  const showTipoClienteInput = useMemo(
    () => form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA,
    [form.tipoIncidencia]
  );

  const selectedTipoClienteValor = useMemo(
    () => form.tipoCliente,
    [form.tipoCliente]
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

  // ✅ Handlers
  const updateField = useCallback((name: keyof TicketFormData, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTipoIncidenciaChange = useCallback(
    (tipoIncidencia: string) => {
      const ahora = getLocalDateTimeString();
      setForm({
        ...initialFormState,
        tipoIncidencia,
        operatorResponsable: sessionOperatorId,
        horaDeteccionNoc: ahora,
        horaInicioAtencion: ahora,
        descripcion: generarDescripcion({ horaDeteccionNoc: ahora, horaInicioAtencion: ahora }),
      });
      setActiveStep(0);
      setPreSaved(null);
      setIsEditMode(false);
    },
    [sessionOperatorId]
  );

  // ✅ CORREGIDO: Lógica diferenciada para modo creación y modo edición
  const handleCategoriaChange = useCallback(
    (categoria: ConfiguracionInterface, numeroTicketActual: string) => {
      setForm((prev) => {
        const nuevoPrefijo = categoria.valor.substring(0, 4).toUpperCase();
        
        if (isEditMode) {
          // MODO EDICIÓN: Mantener el número correlativo existente, solo actualizar el prefijo
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
          // MODO CREACIÓN: Generar un nuevo número si no existe o si el prefijo es diferente
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
    [isEditMode] // ✅ isEditMode debe estar en las dependencias
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
    setForm((prev) => ({ ...prev, causaRaiz, SolucionCaso: '' }));
  }, []);

  const handleServiciosAfectadosChange = useCallback((servicios: ServicioAfectado[]) => {
    setForm((prev) => ({ ...prev, serviciosAfectados: servicios }));
  }, []);

  // ✅ Función para avanzar de paso con auto-captura de horaDeteccionNoc
  const advanceStep = useCallback(() => {
    setActiveStep((prevStep) => {
      const newStep = prevStep + 1;
      
      // Si vamos al Step 2 (índice 1) y horaDeteccionNoc está vacía, capturar hora actual
      if (newStep === 1 && (!form.horaDeteccionNoc || form.horaDeteccionNoc.trim() === '')) {
        const ahora = getLocalDateTimeString();
        setForm((prev) => ({
          ...prev,
          horaDeteccionNoc: ahora,
        }));
        console.log('✅ [useTicketForm] Hora de apertura NOC capturada automáticamente:', ahora);
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
    const fechaHoraCierreActual = getLocalDateTimeString();
    const cierreFormateado = formatToHumanDate(fechaHoraCierreActual);

    let descripcionFinal = form.descripcion;
    const lineas = descripcionFinal.split('\n');

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
      lineas[index] = `Fecha y hora de cierre ticket: ${cierreFormateado}`;
    }
    if (linea.startsWith('Causa:')) {
      lineas[index] = `Causa: ${form.causaRaiz || ''}`;
    }
    if (linea.startsWith('Solución:')) {
      lineas[index] = `Solución: ${form.SolucionCaso || ''}`;
    }
  });
  descripcionFinal = lineas.join('\n');


    const tiempos = calcularTiempos({ ...form, horaCierreFalla: fechaHoraCierreActual });

    return {
      ...form,
      ...tiempos,
      horaCierreFalla: fechaHoraCierreActual,
      descripcion: descripcionFinal,
      cCierreSoporte: diffMin(form.horaInicioAtencion, fechaHoraCierreActual),
      mttrTotal: diffMin(form.horaInicioFalla, fechaHoraCierreActual),
      estatus: 'CERRADO',
    };
  }, [form]);

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