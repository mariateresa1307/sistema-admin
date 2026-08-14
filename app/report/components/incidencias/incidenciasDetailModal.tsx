'use client';
import React from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import dayjs from 'dayjs';
import { IncidenciaPorServicio, TicketAsociado } from '../../hooks/useIncidenciasData';
import { useIdResolver } from '../../hooks/useIdResolver';

interface Props {
  open: boolean;
  onClose: () => void;
  incidencia: IncidenciaPorServicio | null;
}

// ✅ Normaliza el status a formato estándar del sistema
const formatStatus = (status: string): string => {
  const statusUpper = status.toUpperCase().trim();
  
  if (statusUpper === 'EN_GESTION' || statusUpper === 'EN GESTIÓN' || statusUpper === 'EN_GESTIÓN') {
    return 'EN GESTIÓN';
  }
  if (statusUpper === 'ACTIVO') {
    return 'ACTIVO';
  }
  if (statusUpper === 'CERRADO') {
    return 'CERRADO';
  }
  
  return statusUpper;
};

// ✅ Colores consistentes con el resto del sistema (assignedTicketsTab, etc.)
const getStatusChip = (status: string) => {
  const formatted = formatStatus(status);
  
  switch (formatted) {
    case 'ACTIVO':
      return { bgcolor: '#f0fdf4', color: '#166534', border: '#bbf7d0' };
    case 'EN GESTIÓN':
      return { bgcolor: '#fffbeb', color: '#92400e', border: '#fde68a' };
    case 'CERRADO':
      return { bgcolor: '#e8f5e9', color: '#2e7d32', border: '#86efac' };
    default:
      return { bgcolor: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  }
};

export const IncidenciasDetailModal = ({ open, onClose, incidencia }: Props) => {
  // ✅ Para resolver IDs de miscellaneous (proveedor, última milla) a nombres
  const { resolveValue } = useIdResolver();

  const ticketsOrdenados = React.useMemo(() => {
    if (!incidencia) return [];
    return [...incidencia.tickets].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
    );
  }, [incidencia]);

  // ✅ Campos técnicos según el tipo de servicio del ticket afectado
  const getDetallesTecnicos = React.useCallback((ticket: TicketAsociado) => {
    const detalles: { label: string; value: string }[] = [];

    const push = (label: string, value?: string | number | null) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        detalles.push({ label, value: String(value) });
      }
    };

    const tipo = String(ticket.tipoServicio || '').toUpperCase();

    switch (tipo) {
      case 'RBS':
        push('ID Circuito', ticket.id_circuito);
        push('Proveedor', resolveValue(ticket.proveedorDelServicioCompartido));
        break;
      case 'REDES COMPARTIDAS':
        push('Contrato', ticket.contrato);
        push('Proveedor', resolveValue(ticket.proveedorDelServicioCompartido));
        break;
      case 'METROLAN':
        push('Contrato', ticket.contrato);
        push('ID Circuito', ticket.id_circuito);
        push('Última Milla', resolveValue(ticket.ultimaMilla));
        break;
      case 'DOG':
        push('Contrato', ticket.contrato);
        push('ID Netuno', ticket.id_netuno);
        push('Circuito', ticket.id_circuito);
        push('Proveedor', resolveValue(ticket.proveedorDelServicioCompartido));
        break;
      default:
        push('ID Circuito', ticket.id_circuito);
        push('Contrato', ticket.contrato);
        break;
    }

    return detalles;
  }, [resolveValue]);

  return (
    <AnimatePresence>
      {open && incidencia && (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            style={{ width: '100%', maxWidth: '650px', outline: 'none' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '18px',
                border: '1px solid #eaedf1',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.06)',
                bgcolor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', bgcolor: '#080769' }} />

              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SettingsEthernetIcon sx={{ fontSize: 28, color: '#080769' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {incidencia.tipoServicio}
                    </Typography>
                    
                  </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Resumen */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Chip label={`Total: ${incidencia.totalIncidencias}`} size="small" sx={{ bgcolor: '#e8eaf6', color: '#080769', fontWeight: 700 }} />
                <Chip label={`Abiertas: ${incidencia.abiertas}`} size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
                <Chip label={`Cerradas: ${incidencia.cerradas}`} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
              </Stack>

              <Divider sx={{ mb: 2 }}>
                <Chip
                  icon={<ConfirmationNumberIcon sx={{ fontSize: 16 }} />}
                  label={`Tickets Asociados (${ticketsOrdenados.length})`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: '#f1f0fb', color: '#080769' }}
                />
              </Divider>

              {/* Lista de tickets */}
              {ticketsOrdenados.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
                  No hay tickets asociados en el período seleccionado
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {ticketsOrdenados.map((ticket) => {
                    const detalles = getDetallesTecnicos(ticket);
                    const statusColors = getStatusChip(ticket.status);
                    const statusLabel = formatStatus(ticket.status);

                    return (
                      <Box
                        key={`${ticket._id}-${ticket.servicioNombre}`}
                        sx={{
                          p: 2,
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#f8fafc',
                          transition: 'background-color 0.15s ease',
                          '&:hover': { bgcolor: '#f1f5f9' },
                        }}
                      >
                        {/* Fila principal: caso + estado */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#080769', fontFamily: 'monospace' }}>
                              {ticket.caseNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ticket.subject}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                              {ticket.servicioNombre} · {dayjs(ticket.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Typography>
                          </Box>
                          <Chip 
                            label={statusLabel} 
                            size="small" 
                            sx={{ 
                              bgcolor: statusColors.bgcolor,
                              color: statusColors.color,
                              border: `1px solid ${statusColors.border}`,
                              fontWeight: 700, 
                              flexShrink: 0,
                              fontSize: '0.72rem',
                              height: '26px',
                            }} 
                          />
                        </Box>

                        {/* ✅ Detalles técnicos según tipo de servicio */}
                        {detalles.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                            {detalles.map((detalle) => (
                              <Typography
                                key={detalle.label}
                                variant="caption"
                                sx={{
                                  bgcolor: '#e8eaf6',
                                  color: '#080769',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                }}
                              >
                                {detalle.label}: {detalle.value}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};