// app/home/ticketModal.tsx
'use client';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Modal, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FormStepper } from '../components/formStepper';
import { saveTicket, updateTicket } from '@/lib/api';
import { TICKET_STATUS, TIPO_INCIDENCIA } from 'app/utils/constants';
import { getNivelSeveridadConfig } from 'app/utils/auxiliares';
import { TicketModalProps, ConfiguracionInterface } from '../utils/types';

import { useTicketData } from './hooks/useTicketData';
import { useTicketForm } from './hooks/useTicketForm';
import { TicketHeader } from '../components/ticketHeader';
import { TicketStep1 } from '../components/ticketStep1';
import { TicketStep2 } from '../components/ticketStep2';
import { TicketActions } from '../components/ticketActions';

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

export default function TicketModal({ open, onClose, onSave }: TicketModalProps) {
  const sessionOperatorId = useRef('');
  const [operatorDisplayName, setOperatorDisplayName] = useState('');

  // Cargar datos del usuario
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) return;
    try {
      const userData = JSON.parse(stored);
      if (userData._id) sessionOperatorId.current = userData._id;
      const nombre = [userData.primerNombre, userData.primerApellido]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (nombre) setOperatorDisplayName(nombre);
    } catch (err) {
      console.error('Error parsing userData:', err);
    }
  }, []);

  // Hooks personalizados
  const ticketData = useTicketData(open);
  const ticketForm = useTicketForm({ sessionOperatorId: sessionOperatorId.current });

  // ✅ Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      ticketData.loadInitialData();
    }
  }, [open]);

  // ✅ CRÍTICO: Cargar categorías cuando cambia tipoIncidencia
  useEffect(() => {
    console.log('🔄 [Modal] useEffect tipoIncidencia:', ticketForm.form.tipoIncidencia);
    
    if (ticketForm.form.tipoIncidencia) {
      ticketData.loadCategoriasRed(ticketForm.form.tipoIncidencia);
    } else {
      ticketData.clearCategoriaRed();
    }
  }, [ticketForm.form.tipoIncidencia]);

  // Cargar localidades cuando cambia la ciudad
  useEffect(() => {
    if (ticketForm.form.ciudad) {
      ticketData.loadLocalidades(ticketForm.form.ciudad);
    } else {
      ticketData.clearLocalidades();
    }
  }, [ticketForm.form.ciudad]);

  // ✅ Cargar servicios cuando cambia tipoCliente
useEffect(() => {
  if (ticketForm.form.tipoCliente) {
    console.log('🔄 [Modal] Cargando servicios para tipoCliente:', ticketForm.form.tipoCliente);
    ticketData.loadServiciosAfectados(ticketForm.form.tipoCliente);
  } else {
    ticketData.clearServiciosAfectados();
  }
}, [ticketForm.form.tipoCliente]);

  // Cargar soluciones cuando cambia la causa raíz
  useEffect(() => {
    ticketData.loadSolucionesCaso(ticketForm.form.causaRaiz);
  }, [ticketForm.form.causaRaiz]);

  // ✅ CRÍTICO: PRE-SAVE - Crear ticket con status "EN GESTIÓN" al pasar al paso 2
  useEffect(() => {
    const preSaveTicket = async () => {
      // Solo ejecutar cuando pasamos al paso 2 y aún no hay preSaved
      if (ticketForm.activeStep > 0 && !ticketForm.preSaved) {
        console.log('🔄 [Modal] Intentando pre-save del ticket...');
        console.log('📋 Datos del formulario:', ticketForm.form);
        
        // Validar datos mínimos antes de guardar
        if (!ticketForm.form.tipoIncidencia) {
          console.error('❌ [Modal] Falta tipoIncidencia');
          return;
        }
        
        if (!ticketForm.form.asunto?.trim()) {
          console.error('❌ [Modal] Falta asunto');
          return;
        }

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
            serviciosAfectados: (ticketForm.form.serviciosAfectados || []).map((sa) => sa._id),
            ciudad: ticketForm.form.ciudad,
            estado: ticketForm.form.estado,
            localidad: ticketForm.form.localidad,
            bitacora: ticketForm.form.bitacora,
            nodo: ticketForm.form.nodo,
            abonado: ticketForm.form.abonado,
            nombreCliente: ticketForm.form.nombreCliente,
            afectacion: ticketForm.form.afectacion,
           
          };

          console.log('📤 [Modal] Enviando payload:', payload);

          const result = await saveTicket(payload);
          
          console.log('✅ [Modal] Ticket pre-guardado:', result.data._id);
          ticketForm.setPreSaved(result.data._id);
          
          // Notificar al usuario
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-notification', {
              detail: { 
                message: 'Ticket creado exitosamente en gestión', 
                severity: 'success' 
              }
            }));
          }
        } catch (err: any) {
          console.error('❌ [Modal] Error guardando ticket:', err);
          console.error('❌ [Modal] Response:', err?.response?.data);
          
          const errorMessage = err?.response?.data?.message || 'Error al crear el ticket';
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-notification', {
              detail: { 
                message: errorMessage, 
                severity: 'error' 
              }
            }));
          }
        }
      }
    };

    preSaveTicket();
  }, [ticketForm.activeStep, ticketForm.preSaved]);

  // ✅ Handler crítico: Cambio de tipo de incidencia
  const handleTipoIncidenciaChange = useCallback(
    async (tipoIncidencia: string) => {
      console.log('🔄 [Modal] handleTipoIncidenciaChange:', tipoIncidencia);
      
      // 1. Actualizar el formulario (esto dispara el useEffect de categorías)
      ticketForm.handleTipoIncidenciaChange(tipoIncidencia);
      
      // 2. Limpiar campos dependientes
      ticketData.clearSubcategorias();
      ticketData.clearDetalle();
      ticketData.clearLocalidades();
      ticketData.clearServiciosAfectados();
      
      // 3. Cargar tipo de cliente si no es falla masiva
      if (tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA) {
        await ticketData.loadTipoCliente();
      } else {
        ticketData.clearTipoCliente();
      }
      
      // 4. Cargar categorías de red (explícito, no depender solo del useEffect)
      await ticketData.loadCategoriasRed(tipoIncidencia);
    },
    [ticketForm, ticketData]
  );

  const handleCategoriaChange = useCallback(
    async (categoriaId: string) => {
      console.log('🔄 [Modal] handleCategoriaChange:', categoriaId);
      
      const categoria = ticketData.categoriaRed.find((c) => c._id === categoriaId);
      if (!categoria) {
        console.error('❌ Categoría no encontrada:', categoriaId);
        return;
      }

      ticketForm.handleCategoriaChange(categoria, ticketForm.form.numeroTicket);
      ticketData.clearSubcategorias();
      ticketData.clearDetalle();
      await ticketData.loadSubcategorias(categoriaId);
    },
    [ticketForm, ticketData]
  );

  const handleSubcategoriaChange = useCallback(
    async (subcategoriaId: string) => {
      ticketForm.updateField('subcategoria', subcategoriaId);
      await ticketData.loadDetalle(subcategoriaId);
    },
    [ticketForm, ticketData]
  );

  const handleTipoClienteChange = useCallback(
    async (tipoClienteId: string) => {
      ticketForm.handleTipoClienteChange(tipoClienteId, ticketData.tipoCliente);
      ticketData.clearServiciosAfectados();
      await ticketData.loadServiciosAfectados(tipoClienteId);
    },
    [ticketForm, ticketData]
  );

  const handleCiudadChange = useCallback(
    (ciudadValue: string) => {
      const selected = ticketData.ciudadesOptions.find(
        (c: any) => c.valor === ciudadValue || c._id === ciudadValue
      );
      const estado = selected?.padreNombre || '';
      const ciudadName = selected?.valor || ciudadValue;
      ticketForm.handleCiudadChange(ciudadName, estado);
    },
    [ticketForm, ticketData.ciudadesOptions]
  );

  const handleFullSave = useCallback(async () => {
    if (!ticketForm.preSaved) {
      console.error('❌ [Modal] No hay ticket pre-guardado');
      return;
    }

    try {
      const finalData = ticketForm.prepareFinalData();
      const { estatus, ...updateData } = finalData;

      console.log('📤 [Modal] Actualizando ticket:', ticketForm.preSaved);

      await updateTicket(ticketForm.preSaved, {
        ...updateData,
        status: TICKET_STATUS.ACTIVO,
      });

      console.log('✅ [Modal] Ticket actualizado exitosamente');

      onSave(finalData);
      ticketForm.resetForm();
      onClose();
    } catch (err: any) {
      console.error('❌ [Modal] Error actualizando ticket:', err);
      console.error('❌ [Modal] Response:', err?.response?.data);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-notification', {
          detail: { 
            message: err?.response?.data?.message || 'Error al guardar el ticket', 
            severity: 'error' 
          }
        }));
      }
    }
  }, [ticketForm, onSave, onClose]);

  const handleNext = useCallback(() => {
    console.log('🔄 [Modal] handleNext - Paso actual:', ticketForm.activeStep);
    
    // Validar que el paso 1 esté completo antes de avanzar
    if (ticketForm.activeStep === 0 && !ticketForm.isStep0Complete) {
      console.warn('⚠️ [Modal] Paso 1 incompleto, no se puede avanzar');
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-notification', {
          detail: { 
            message: 'Completa todos los campos requeridos', 
            severity: 'warning' 
          }
        }));
      }
      return;
    }

    ticketForm.setActiveStep((prev) => prev + 1);
  }, [ticketForm]);

  const handleBack = useCallback(() => {
    ticketForm.setActiveStep((prev) => prev - 1);
  }, [ticketForm]);

  const handleClose = useCallback(() => {
    ticketForm.resetForm();
    onClose();
  }, [ticketForm, onClose]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <TicketHeader
          severidad={ticketForm.form.severidad}
          onClose={handleClose}
        />

        <FormStepper activeStep={ticketForm.activeStep} steps={PASOS} />
        <Divider sx={{ mb: 3 }} />

        {ticketForm.activeStep === 0 ? (
          <TicketStep1
            form={ticketForm.form}
            data={ticketData}
            operatorDisplayName={operatorDisplayName}
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
            onFieldChange={ticketForm.updateField}
            onCausaRaizChange={ticketForm.handleCausaRaizChange}
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
        />
      </Box>
    </Modal>
  );
}