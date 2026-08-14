'use client';
import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { Modal, Box, Divider } from '@mui/material';
import { FormStepper } from '../components/formStepper';
import { saveTicket, updateTicket, closeTicket, reopenTicket } from '@/lib/api';
import { TICKET_STATUS, TIPO_INCIDENCIA } from 'app/utils/constants';
import { TicketModalProps } from '../utils/types';
import { isEditTicket, mapTicketToFormData, mapFormToUpdatePayload } from '../utils/ticketHelpers';
import { useTicketData } from './hooks/useTicketData';
import { useTicketForm } from './hooks/useTicketForm';
import { TicketHeader } from '../components/ticketHeader';
import { TicketStep1 } from '../components/ticketStep1';
import { TicketStep2 } from '../components/ticketStep2';
import { TicketActions } from '../components/ticketActions';
import { ConfirmDialog } from '../components/confirmDialog';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: 1050 },
  maxHeight: '92vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4.5,
  borderRadius: 3,
  overflow: 'hidden',
  overflowY: 'auto',
};

const PASOS = ['Clasificación e Infraestructura', 'Tiempos y Cierre Operativo'];

export default function TicketModal({ open, onClose, onSave, ticketToEdit }: TicketModalProps) {
  const sessionOperatorId = useRef('');
  const isSaving = useRef(false);
  const localidadCargadaRef = useRef<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'info' as 'warning' | 'info' | 'success',
  });

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) return;
    try {
      const userData = JSON.parse(stored);
      if (userData._id) sessionOperatorId.current = userData._id;
    } catch (err) {
      console.error('Error parsing userData:', err);
    }
  }, []);

  const ticketData = useTicketData(open);
  const ticketForm = useTicketForm({
    sessionOperatorId: sessionOperatorId.current,
    causasRaiz: ticketData.causasRaiz || [],
    solucionesCaso: ticketData.solucionesCaso || []
  });

  useEffect(() => {
    if (!open) return;
    const tipoCliente = ticketForm.form.tipoCliente;

    if (!tipoCliente) {
      ticketData.clearServiciosAfectados();
      return;
    }

    if (ticketData.tipoCliente.length === 0) return;

    const selectedTipoCliente = ticketData.tipoCliente.find(tc => tc._id === tipoCliente);
    const valorTipoCliente = selectedTipoCliente?.valor?.toUpperCase() || '';

    if (valorTipoCliente === 'RESIDENCIAL') {
      ticketData.clearServiciosAfectados();
      return;
    }

    if (tipoCliente) {
      ticketData.loadServiciosAfectados(tipoCliente);
    } else {
      ticketData.clearServiciosAfectados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticketForm.form.tipoCliente, ticketData.tipoCliente.length]);

  useEffect(() => {
    if (open && !isEditTicket(ticketToEdit)) {
      ticketData.loadInitialData();
      const descripcionInicial = [
        'Fecha y Hora apertura Ticket: ',
        'Fecha y Hora Inicio Afectación: ',
        'Fecha y hora de fin de Afectación: ',
        'Fecha y hora de cierre ticket: ',
        'Causa: ',
        'Solución: ',
      ].join('\n');
      ticketForm.updateField('descripcion', descripcionInicial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ticketToEdit?._id]);

  useEffect(() => {
    if (!open || !isEditTicket(ticketToEdit)) return;

    let isMounted = true;

    const initEditMode = async () => {
      try {
        await ticketData.loadInitialData();
        const formData = mapTicketToFormData(ticketToEdit, sessionOperatorId.current, sessionOperatorId.current);
        ticketForm.loadFromTicket(formData, ticketToEdit._id);

        const { tipoIncidencia, categoria, subcategoria, causaRaiz } = formData;

        if (tipoIncidencia) {
          await ticketData.loadCategoriasRed(tipoIncidencia);
          if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) {
            await ticketData.loadTipoCliente();
          }
        }
        if (categoria) await ticketData.loadSubcategorias(categoria);
        if (subcategoria) await ticketData.loadDetalle(subcategoria);

        // ✅ Localidad: se carga vía effect separado (ver abajo) para evitar race conditions
        if (causaRaiz) {
          await ticketData.loadCausasRaiz();
          await ticketData.loadSolucionesCaso(causaRaiz);
        } else {
          await ticketData.loadCausasRaiz();
        }

        await ticketData.loadGrupoDestino();
      } catch (error) {
        console.error("Error initializing edit mode:", error);
      }
    };

    if (isMounted) {
      initEditMode();
    }

    return () => {
      isMounted = false;
    };
  }, [open, ticketToEdit?._id]);

  // ✅ FIX LOCALIDAD: fuente única de verdad para carga de localidades
  //    - Solo corre en modo edición
  //    - Espera a que el catálogo de ciudades esté listo
  //    - Deduplica con useRef para evitar re-ejecuciones redundantes
  //    - Resetea el ref al cerrar el modal
  useEffect(() => {
    if (!open || !ticketForm.isEditMode) {
      localidadCargadaRef.current = null;
      return;
    }

    const ciudad = ticketForm.form.ciudad;
    const ciudadesListas = ticketData.ciudadesOptions.length > 0;

    if (!ciudad || !ciudadesListas) return;

    // Guard de deduplicación: mismo par ciudad+ciudades no recarga
    const cacheKey = `${ciudad}|${ticketData.ciudadesOptions.length}`;
    if (localidadCargadaRef.current === cacheKey) return;

    localidadCargadaRef.current = cacheKey;
    ticketData.loadLocalidades(ciudad);
  }, [open, ticketForm.isEditMode, ticketForm.form.ciudad, ticketData.ciudadesOptions.length, ticketData]);

  useEffect(() => {
    if (ticketForm.isEditMode) return;
    if (ticketForm.activeStep > 0 && !ticketForm.preSaved && !isSaving.current) {
      if (!ticketForm.form.tipoIncidencia || !ticketForm.form.asunto?.trim()) return;

      const executePreSave = async () => {
        isSaving.current = true;
        try {
          const payload = {
            caseNumber: ticketForm.form.numeroTicket,
            incidentType: ticketForm.form.tipoIncidencia,
            subject: ticketForm.form.asunto,
            networkCategory: ticketForm.form.categoria,
            status: TICKET_STATUS.EN_GESTION,
            subcategoria: ticketForm.form.subcategoria,
            detalle: ticketForm.form.detalle,
            tipoCliente: ticketForm.form.tipoCliente,
            serviciosAfectados: (ticketForm.form.serviciosAfectados || []).map((sa: any) => sa._id),
            ciudad: ticketForm.form.ciudad,
            estado: ticketForm.form.estado,
            localidad: ticketForm.form.localidad,
            bitacora: ticketForm.form.bitacora,
            nodo: ticketForm.form.nodo,
            abonado: ticketForm.form.abonado,
            nombreCliente: ticketForm.form.nombreCliente,
            afectacion: ticketForm.form.afectacion,
          };

          const result = await saveTicket(payload);
          ticketForm.setPreSaved(result.data._id);

          if (result.data.caseNumber && result.data.caseNumber !== ticketForm.form.numeroTicket) {
            ticketForm.updateField('numeroTicket', result.data.caseNumber);
          }

          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket creado exitosamente en gestión', severity: 'success' } }));
        } catch (err: any) {
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err?.response?.data?.message || 'Error al crear el ticket', severity: 'error' } }));
        } finally {
          isSaving.current = false;
        }
      };

      executePreSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ticketForm.activeStep,
    ticketForm.preSaved,
    ticketForm.isEditMode,
    ticketForm.form.tipoIncidencia,
    ticketForm.form.asunto
  ]);

  const handleTipoIncidenciaChange = useCallback(async (tipoIncidencia: string) => {
    ticketForm.handleTipoIncidenciaChange(tipoIncidencia);
    ticketData.clearCategoriaRed();
    ticketData.clearSubcategorias();
    ticketData.clearDetalle();
    ticketData.clearLocalidades();
    ticketData.clearServiciosAfectados();

    if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) {
      await ticketData.loadTipoCliente();
    } else {
      ticketData.clearTipoCliente();
    }

    if (tipoIncidencia) {
      await ticketData.loadCategoriasRed(tipoIncidencia);
    }
  }, [ticketForm, ticketData]);

  const handleCategoriaChange = useCallback(async (categoriaId: string) => {
    const categoria = ticketData.categoriaRed.find((c) => c._id === categoriaId);
    if (!categoria) return;
    ticketForm.handleCategoriaChange(categoria, ticketForm.form.numeroTicket);
    ticketData.clearSubcategorias();
    ticketData.clearDetalle();
    if (categoriaId) {
      await ticketData.loadSubcategorias(categoriaId);
    }
  }, [ticketForm, ticketData]);

  const handleSubcategoriaChange = useCallback(async (subcategoriaId: string) => {
    ticketForm.updateField('subcategoria', subcategoriaId);
    ticketData.clearDetalle();
    if (subcategoriaId) {
      await ticketData.loadDetalle(subcategoriaId);
    }
  }, [ticketForm, ticketData]);

  const handleTipoClienteChange = useCallback(async (tipoClienteId: string) => {
    ticketForm.handleTipoClienteChange(tipoClienteId, ticketData.tipoCliente);
  }, [ticketForm, ticketData.tipoCliente]);

  const handleCiudadChange = useCallback(async (ciudadValue: string) => {
    ticketData.clearLocalidades();
    localidadCargadaRef.current = null; // Reset para permitir recarga
    const selected = ticketData.ciudadesOptions.find((c: any) => c.valor === ciudadValue || c._id === ciudadValue);
    ticketForm.handleCiudadChange(selected?.valor || ciudadValue, selected?.padreNombre || '');

    if (ciudadValue) {
      await ticketData.loadLocalidades(ciudadValue);
    }
  }, [ticketForm, ticketData.ciudadesOptions, ticketData]);

  const handleCausaRaizChange = useCallback(async (causaRaizValue: string) => {
    ticketForm.updateField('causaRaiz', causaRaizValue);
    if (causaRaizValue) {
      await ticketData.loadSolucionesCaso(causaRaizValue);
    }
  }, [ticketForm, ticketData]);

  const handleFullSave = useCallback(async () => {
    if (!ticketForm.preSaved) return;
    try {
      const finalData = ticketForm.prepareFinalData();
      await updateTicket(ticketForm.preSaved, mapFormToUpdatePayload(finalData));

      window.dispatchEvent(new CustomEvent('app-notification', {
        detail: {
          message: ticketForm.isEditMode
            ? 'Ticket actualizado exitosamente'
            : 'Ticket guardado exitosamente',
          severity: 'success',
        },
      }));
      
      onSave(finalData);
      ticketForm.resetForm();
      onClose();
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err?.response?.data?.message || 'Error al guardar', severity: 'error' } }));
    }
  }, [ticketForm, onSave, onClose]);

  const handleNext = useCallback(() => {
    if (ticketForm.activeStep === 0 && !ticketForm.isStep0Complete) {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Completa todos los campos requeridos', severity: 'warning' } }));
      return;
    }
    ticketForm.advanceStep();
  }, [ticketForm]);

  const handleBack = useCallback(() => ticketForm.setActiveStep((prev) => prev - 1), [ticketForm]);
  const handleClose = useCallback(() => {
    localidadCargadaRef.current = null; // Reset al cerrar
    ticketForm.resetForm();
    onClose();
  }, [ticketForm, onClose]);

  const requestCloseTicket = useCallback(() => {
    if (!ticketForm.preSaved) return;

    const camposFaltantes: string[] = [];
    if (!ticketForm.form.horaInicioFalla || String(ticketForm.form.horaInicioFalla).trim() === '') camposFaltantes.push('Hora de Inicio de Falla');
    if (!ticketForm.form.horaInicioAtencion || String(ticketForm.form.horaInicioAtencion).trim() === '') camposFaltantes.push('Hora de Inicio de Atención');
    if (!ticketForm.form.horaFinAfectacion || String(ticketForm.form.horaFinAfectacion).trim() === '') camposFaltantes.push('Hora de Fin de Afectación');
    if (!ticketForm.form.causaRaiz || String(ticketForm.form.causaRaiz).trim() === '') camposFaltantes.push('Causa Raíz');
    if (!ticketForm.form.SolucionCaso || String(ticketForm.form.SolucionCaso).trim() === '') camposFaltantes.push('Solución al Caso');

    if (camposFaltantes.length > 0) {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: `No se puede cerrar el ticket. Debe completar: ${camposFaltantes.join(', ')}`, severity: 'warning' } }));
      return;
    }

    setConfirmDialog({
      open: true,
      title: 'Cerrar Ticket',
      message: '¿Estás seguro de que deseas guardar los cambios y cerrar este ticket? Esta acción cambiará su estado a CERRADO y registrará la hora de cierre.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));

        if (isSaving.current) return;
        isSaving.current = true;

        try {
          const ahora = new Date().toISOString();
          ticketForm.updateField('horaCierreFalla', ahora);

          await new Promise(resolve => setTimeout(resolve, 100));
          const finalData = ticketForm.prepareFinalData();
          await updateTicket(ticketForm.preSaved!, mapFormToUpdatePayload(finalData));

          const result = await closeTicket(ticketForm.preSaved!);

          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket guardado y cerrado exitosamente', severity: 'success' } }));
          onSave(result.data);
          ticketForm.resetForm();
          onClose();
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || 'Error al guardar y cerrar el ticket';
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: errorMsg, severity: 'error' } }));
        } finally {
          isSaving.current = false;
        }
      }
    });
  }, [ticketForm.preSaved, ticketForm.form, ticketForm.prepareFinalData, ticketForm.updateField, onSave, onClose]);

  const requestReopenTicket = useCallback(() => {
    if (!ticketForm.preSaved) return;
    setConfirmDialog({
      open: true, title: 'Reabrir Ticket', message: '¿Estás seguro de que deseas reabrir este ticket? Su estado volverá a ACTIVO.', type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          const result = await reopenTicket(ticketForm.preSaved!);
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket reabierto exitosamente', severity: 'success' } }));
          onSave(result.data);
          ticketForm.resetForm();
          onClose();
        } catch (err: any) {
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err.response?.data?.message || 'Error al reabrir', severity: 'error' } }));
        }
      }
    });
  }, [ticketForm.preSaved, onSave, onClose]);

  const isAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      return user.role === 'admin';
    } catch {
      return false;
    }
  }, []);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <TicketHeader severidad={ticketForm.form.severidad} isEditMode={ticketForm.isEditMode} onClose={handleClose} numeroTicket={ticketForm.form.numeroTicket} />
          <FormStepper activeStep={ticketForm.activeStep} steps={PASOS} />
          <Divider sx={{ mb: 3 }} />

          {ticketForm.activeStep === 0 ? (
            <TicketStep1
              form={ticketForm.form}
              data={ticketData}
              operatorDisplayName=""
              onFieldChange={ticketForm.updateField}
              onTipoIncidenciaChange={handleTipoIncidenciaChange}
              onCategoriaChange={handleCategoriaChange}
              onSubcategoriaChange={handleSubcategoriaChange}
              onTipoClienteChange={handleTipoClienteChange}
              onCiudadChange={handleCiudadChange}
              onServiciosAfectadosChange={ticketForm.handleServiciosAfectadosChange}
            />
          ) : (
            <TicketStep2
              form={ticketForm.form}
              tiempos={ticketForm.tiemposCalculados}
              operadores={ticketData.operadores}
              causasRaiz={ticketData.causasRaiz}
              solucionesCaso={ticketData.solucionesCaso}
              grupoDestino={ticketData.grupoDestino || []}
              onFieldChange={ticketForm.updateField}
              onCausaRaizChange={handleCausaRaizChange}
            />
          )}

          <TicketActions
            activeStep={ticketForm.activeStep}
            totalSteps={PASOS.length}
            isStep0Complete={ticketForm.isStep0Complete}
            onBack={handleBack}
            onNext={handleNext}
            onClose={handleClose}
            onSave={handleFullSave}
            onCloseTicket={requestCloseTicket}
            onReopenTicket={requestReopenTicket}
            isEditMode={ticketForm.isEditMode}
            ticketStatus={ticketForm.form.estatus}
            isAdmin={isAdmin}
          />
        </Box>
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        confirmText={confirmDialog.type === 'warning' ? 'Sí, guardar y cerrar' : 'Sí, reabrir'}
        cancelText="Cancelar"
      />
    </>
  );
}