// app/home/hooks/useTicketForm.ts
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

  const handleCategoriaChange = useCallback(
    (categoria: ConfiguracionInterface, numeroTicketActual: string) => {
      const prefijo = categoria.valor.substring(0, 4).toUpperCase();
      const numeroTicket = generarNumeroTicket(prefijo, numeroTicketActual);

      setForm((prev) => ({
        ...prev,
        categoria: categoria._id,
        subcategoria: '',
        numeroTicket,
      }));
    },
    []
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
    if (lineas.length >= 2 && lineas[1].trim() === 'Fecha y hora de fin de Afectación:') {
      lineas[1] = `Fecha y hora de fin de Afectación: ${cierreFormateado}`;
      descripcionFinal = lineas.join('\n');
    }

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