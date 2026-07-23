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
    if (open && !isEditTicket(ticketToEdit)) 
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


  }, [open, ticketToEdit?._id]);

  useEffect(() => {
    if (!open || !isEditTicket(ticketToEdit)) return;
    const initEditMode = async () => {
      await ticketData.loadInitialData();
      const formData = mapTicketToFormData(ticketToEdit, sessionOperatorId.current, sessionOperatorId.current);
      ticketForm.loadFromTicket(formData, ticketToEdit._id);
      const { tipoIncidencia, categoria, subcategoria, ciudad, tipoCliente, causaRaiz } = formData;
      
      if (tipoIncidencia) {
        await ticketData.loadCategoriasRed(tipoIncidencia);
        if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) {
          await ticketData.loadTipoCliente();
          if (formData.tipoCliente) await ticketData.loadServiciosAfectados(formData.tipoCliente);
        }
      }
      if (categoria) await ticketData.loadSubcategorias(categoria);
      if (subcategoria) await ticketData.loadDetalle(subcategoria);
      if (ciudad) await ticketData.loadLocalidades(ciudad);
      if (tipoCliente) await ticketData.loadServiciosAfectados(tipoCliente);
      
      if (causaRaiz) {
        await ticketData.loadCausasRaiz();
        await ticketData.loadSolucionesCaso(causaRaiz);
      } else {
        await ticketData.loadCausasRaiz();
      }
      
      // ✅ DIAGNÓSTICO: Verificar escaladoA (Grupo Destino)
      console.log('🔍 [Modal] Valor de escaladoA en BD:', ticketToEdit.escaladoA);
      console.log('🔍 [Modal] Valor de escaladoA en formData:', formData.escaladoA);
      console.log('🔍 [Modal] Opciones de grupoDestino cargadas:', ticketData.grupoDestino);
      
      await ticketData.loadGrupoDestino();
    };
    initEditMode();
  }, [open, ticketToEdit?._id]);

  useEffect(() => {
    if (ticketForm.form.tipoIncidencia) ticketData.loadCategoriasRed(ticketForm.form.tipoIncidencia);
    else ticketData.clearCategoriaRed();
  }, [ticketForm.form.tipoIncidencia]);

  useEffect(() => {
    if (ticketForm.form.ciudad) ticketData.loadLocalidades(ticketForm.form.ciudad);
    else ticketData.clearLocalidades();
  }, [ticketForm.form.ciudad]);

  useEffect(() => {
    if (ticketForm.form.tipoCliente) ticketData.loadServiciosAfectados(ticketForm.form.tipoCliente);
    else ticketData.clearServiciosAfectados();
  }, [ticketForm.form.tipoCliente]);

  useEffect(() => {
    if (ticketForm.form.causaRaiz) ticketData.loadSolucionesCaso(ticketForm.form.causaRaiz);
  }, [ticketForm.form.causaRaiz]);

  useEffect(() => {
    const preSaveTicket = async () => {
      if (ticketForm.isEditMode) return;
      if (ticketForm.activeStep > 0 && !ticketForm.preSaved) {
        if (!ticketForm.form.tipoIncidencia || !ticketForm.form.asunto?.trim()) return;
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
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket creado exitosamente en gestión', severity: 'success' } }));
        } catch (err: any) {
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err?.response?.data?.message || 'Error al crear el ticket', severity: 'error' } }));
        }
      }
    };
    preSaveTicket();
  }, [ticketForm.activeStep, ticketForm.preSaved]);

  const handleTipoIncidenciaChange = useCallback(async (tipoIncidencia: string) => {
    ticketForm.handleTipoIncidenciaChange(tipoIncidencia);
    ticketData.clearSubcategorias(); ticketData.clearDetalle(); ticketData.clearLocalidades(); ticketData.clearServiciosAfectados();
    if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) await ticketData.loadTipoCliente();
    else ticketData.clearTipoCliente();
    await ticketData.loadCategoriasRed(tipoIncidencia);
  }, [ticketForm, ticketData]);

  const handleCategoriaChange = useCallback(async (categoriaId: string) => {
    const categoria = ticketData.categoriaRed.find((c) => c._id === categoriaId);
    if (!categoria) return;
    ticketForm.handleCategoriaChange(categoria, ticketForm.form.numeroTicket);
    ticketData.clearSubcategorias(); ticketData.clearDetalle();
    await ticketData.loadSubcategorias(categoriaId);
  }, [ticketForm, ticketData]);

  const handleSubcategoriaChange = useCallback(async (subcategoriaId: string) => {
    ticketForm.updateField('subcategoria', subcategoriaId);
    await ticketData.loadDetalle(subcategoriaId);
  }, [ticketForm, ticketData]);

  const handleTipoClienteChange = useCallback(async (tipoClienteId: string) => {
    ticketForm.handleTipoClienteChange(tipoClienteId, ticketData.tipoCliente);
    ticketData.clearServiciosAfectados();
    await ticketData.loadServiciosAfectados(tipoClienteId);
  }, [ticketForm, ticketData]);

  const handleCiudadChange = useCallback((ciudadValue: string) => {
    const selected = ticketData.ciudadesOptions.find((c: any) => c.valor === ciudadValue || c._id === ciudadValue);
    ticketForm.handleCiudadChange(selected?.valor || ciudadValue, selected?.padreNombre || '');
  }, [ticketForm, ticketData.ciudadesOptions]);

  const handleFullSave = useCallback(async () => {
    if (!ticketForm.preSaved) return;
    try {
      const finalData = ticketForm.prepareFinalData();
      await updateTicket(ticketForm.preSaved, mapFormToUpdatePayload(finalData));
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
  const handleClose = useCallback(() => { ticketForm.resetForm(); onClose(); }, [ticketForm, onClose]);

  const requestCloseTicket = useCallback(() => {
    if (!ticketForm.preSaved) return;
    setConfirmDialog({
      open: true, title: 'Cerrar Ticket', message: '¿Estás seguro de que deseas cerrar este ticket? Esta acción cambiará su estado a CERRADO y registrará la hora de cierre.', type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          const result = await closeTicket(ticketForm.preSaved!);
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket cerrado exitosamente', severity: 'success' } }));
          onSave(result.data); ticketForm.resetForm(); onClose();
        } catch (err: any) {
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err.response?.data?.message || 'Error al cerrar el ticket', severity: 'error' } }));
        }
      }
    });
  }, [ticketForm.preSaved, onSave, onClose]);

  const requestReopenTicket = useCallback(() => {
    if (!ticketForm.preSaved) return;
    setConfirmDialog({
      open: true, title: 'Reabrir Ticket', message: '¿Estás seguro de que deseas reabrir este ticket? Su estado volverá a ACTIVO.', type: 'info',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        try {
          const result = await reopenTicket(ticketForm.preSaved!);
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Ticket reabierto exitosamente', severity: 'success' } }));
          onSave(result.data); ticketForm.resetForm(); onClose();
        } catch (err: any) {
          window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: err.response?.data?.message || 'Error al reabrir el ticket', severity: 'error' } }));
        }
      }
    });
  }, [ticketForm.preSaved, onSave, onClose]);

  const isAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    try {
      const user = JSON.parse(userData);
      return user.role === 'admin';
    } catch {
      return false;
    }
  }, []);

  // ✅ LOGS DE DIAGNÓSTICO ACTUALIZADOS
  useEffect(() => {
    console.log('🔍 [DIAGNÓSTICO] Form completo:', {
      requiereEscalamiento: ticketForm.form.requiereEscalamiento,
      escaladoA: ticketForm.form.escaladoA, // ✅ Campo correcto
      estatus: ticketForm.form.estatus,
   
    });
    
    console.log('🔍 [DIAGNÓSTICO] Grupo destino data (opciones):', {
      totalOpciones: ticketData.grupoDestino?.length || 0,
      opciones: ticketData.grupoDestino,
    });
  }, [ticketForm.form.requiereEscalamiento, ticketForm.form.escaladoA, ticketData.grupoDestino]);

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <TicketHeader 
          severidad={ticketForm.form.severidad}
          isEditMode={ticketForm.isEditMode} 
          onClose={handleClose}
           numeroTicket={ticketForm.form.numeroTicket} />
           
          <FormStepper activeStep={ticketForm.activeStep} steps={PASOS} />
          <Divider sx={{ mb: 3 }} />

          {ticketForm.activeStep === 0 ? (
            <TicketStep1
              form={ticketForm.form} data={ticketData} operatorDisplayName=""
              onFieldChange={ticketForm.updateField} onTipoIncidenciaChange={handleTipoIncidenciaChange}
              onCategoriaChange={handleCategoriaChange} onSubcategoriaChange={handleSubcategoriaChange}
              onTipoClienteChange={handleTipoClienteChange} onCiudadChange={handleCiudadChange}
              onServiciosAfectadosChange={ticketForm.handleServiciosAfectadosChange}
            />
          ) : (
            <TicketStep2
              form={ticketForm.form} tiempos={ticketForm.tiemposCalculados} operadores={ticketData.operadores}
              causasRaiz={ticketData.causasRaiz} solucionesCaso={ticketData.solucionesCaso}
              grupoDestino={ticketData.grupoDestino || []}
              onFieldChange={ticketForm.updateField} onCausaRaizChange={ticketForm.handleCausaRaizChange}
            />
          )}

          <TicketActions
            activeStep={ticketForm.activeStep} totalSteps={PASOS.length} isStep0Complete={ticketForm.isStep0Complete}
            onBack={handleBack} onNext={handleNext} onClose={handleClose} onSave={handleFullSave}
            onCloseTicket={requestCloseTicket} onReopenTicket={requestReopenTicket}
            isEditMode={ticketForm.isEditMode}
            ticketStatus={ticketForm.form.estatus } // ✅ CORREGIDO: estatus || status
            isAdmin={isAdmin}
          />
        </Box>
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message}
        type={confirmDialog.type} onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        confirmText={confirmDialog.type === 'warning' ? 'Sí, cerrar' : 'Sí, reabrir'}
        cancelText="Cancelar"
      />
    </>
  );
}