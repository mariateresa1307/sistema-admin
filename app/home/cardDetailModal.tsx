'use client';
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import SettingsEthernet from '@mui/icons-material/SettingsEthernet';
import { TicketRecord, formatTTZoho } from "app/utils/ticketHelpers";
import { getNivelSeveridadConfig } from "app/utils/auxiliares";
import { getUsers, getMiscellaneous } from "@/lib/api";

type OperatorInfo = {
  _id?: string;
  primerNombre?: string;
  primerApellido?: string;
  username?: string;
  email?: string;
};

type OperatorField = OperatorInfo | string | null | undefined;

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: TicketRecord | null;
  onEditClick?: (ticket: TicketRecord) => void;
}

type NodoInfo = {
  valor: string;
  origen: 'nodo' | 'nodoOLT' | 'nodoA' | 'nodoB';
};

const TICKET_THEMES = {
  ACTIVO: {
    primary: '#22c55e', light: '#e8f5e9', dark: '#2e7d32', border: '#c8e6c9',
    label: 'ACTIVO', icon: <CheckCircleIcon fontSize="small" />,
  },
  EN_GESTION: {
    primary: '#eab308', light: '#fff9c4', dark: '#f57f17', border: '#ffecb3',
    label: 'EN GESTIÓN', icon: <AccessTimeIcon fontSize="small" />,
  },
  CERRADO: {
    primary: '#ef4444', light: '#ffebee', dark: '#c62828', border: '#ffcdd2',
    label: 'CERRADO', icon: <CloseIcon fontSize="small" />,
  },
} as const;

type ThemeKey = keyof typeof TICKET_THEMES;

const getTheme = (status: string) => {
  const key = status?.toUpperCase().replace(' ', '_') as ThemeKey;
  return TICKET_THEMES[key] || TICKET_THEMES.EN_GESTION;
};

const formatDateTime = (value?: string): string => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString('es-VE', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const getColorByTipoIncidencia = (tipoIncidencia: string): string => {
  const tipoUpper = (tipoIncidencia || '').toUpperCase();
  if (tipoUpper.includes('PUNTUAL')) return '#67a6d9';
  if (tipoUpper.includes('MASIVA')) return '#b52323';
  if (tipoUpper.includes('MANTENIMIENTO')) return '#1565c0';
  return '#1976d2';
};

const getSeveridadValue = (ticket: NonNullable<TicketDetailModalProps['ticket']>): string => {
  return ticket?.nivelSeveridad || ticket?.severidad || '';
};

const formatOperatorName = (operador: OperatorField): string => {
  if (!operador) return '-';
  if (typeof operador === 'string') return operador || '-';
  const nombre = [operador.primerNombre, operador.primerApellido].filter(Boolean).join(' ').trim();
  return nombre || operador.username || operador.email || '-';
};

const SectionCard = ({ title, icon, children, noBorder = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; noBorder?: boolean }) => (
  <Box sx={{ mb: 2, pb: 2, borderBottom: noBorder ? 'none' : '1px solid #f1f5f9' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
      <Box sx={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Typography sx={{ fontWeight: 600, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <Box>
    <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.4 }}>
      {icon}{label}
    </Typography>
    <Box>{value}</Box>
  </Box>
);

const extractData = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && Array.isArray(response.data.data)) return response.data.data;
  return [];
};

export function TicketDetailModal({ open, onClose, ticket, onEditClick }: TicketDetailModalProps) {
  const [operadores, setOperadores] = useState<Array<OperatorInfo & { _id: string }>>([]);
  const [causasRaizList, setCausasRaizList] = useState<any[]>([]);
  const [solucionesCasoList, setSolucionesCasoList] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getUsers(),
      getMiscellaneous({ categoria: 'CAUSA_RAIZ', limit: 999 }),
      getMiscellaneous({ categoria: 'SOLUCION_CASO', limit: 999 })
    ]).then(([usersRes, causasRes, solucionesRes]) => {
      const data = Array.isArray(usersRes.data) ? usersRes.data : [];
      setOperadores(data.filter((u: any) => u.isActive !== false).map((u: any) => ({
        _id: u._id, primerNombre: u.primerNombre, primerApellido: u.primerApellido, username: u.username, email: u.email,
      })));

      setCausasRaizList(extractData(causasRes));
      setSolucionesCasoList(extractData(solucionesRes));
    }).catch((err) => console.error("❌ Error al obtener datos para el modal:", err));
  }, [open]);

  // ✅ LÓGICA CORREGIDA: Recopila TODOS los nodos existentes (OLT, A, B) sin excluirse entre sí.
  const nodosUnicos = useMemo((): NodoInfo[] => {
    if (!ticket) return [];
    const todosLosNodos: NodoInfo[] = [];

    // 1. Nodo directo del ticket
    if (ticket.nodo && String(ticket.nodo).trim() !== '') {
      todosLosNodos.push({ valor: String(ticket.nodo).trim(), origen: 'nodo' });
    }

    // 2. Procesar todos los servicios afectados
    if (Array.isArray(ticket.serviciosAfectados) && ticket.serviciosAfectados.length > 0) {
      const serviciosValidos = ticket.serviciosAfectados.filter(
        (s: any) => s !== null && s !== undefined && typeof s === 'object'
      );

      serviciosValidos.forEach((s: any) => {
        // Agregar OLT si existe
        if (s.nodoOLT && String(s.nodoOLT).trim() !== '') {
          todosLosNodos.push({ valor: String(s.nodoOLT).trim(), origen: 'nodoOLT' });
        }
        // Agregar A si existe (INDEPENDIENTEMENTE de si hay OLT)
        if (s.nodoA && String(s.nodoA).trim() !== '') {
          todosLosNodos.push({ valor: String(s.nodoA).trim(), origen: 'nodoA' });
        }
        // Agregar B si existe (INDEPENDIENTEMENTE de si hay OLT)
        if (s.nodoB && String(s.nodoB).trim() !== '') {
          todosLosNodos.push({ valor: String(s.nodoB).trim(), origen: 'nodoB' });
        }
        // Fallback a nodo genérico solo si no hay ninguno de los anteriores
        if (!s.nodoOLT && !s.nodoA && !s.nodoB && s.nodo && String(s.nodo).trim() !== '') {
          todosLosNodos.push({ valor: String(s.nodo).trim(), origen: 'nodo' });
        }
      });
    }

    // Eliminar duplicados manteniendo el orden
    const seen = new Set<string>();
    return todosLosNodos.filter(n => {
      if (seen.has(n.valor)) return false;
      seen.add(n.valor);
      return true;
    });
  }, [ticket?.nodo, ticket?.serviciosAfectados]);

  if (!ticket) return null;

  const theme = getTheme(ticket.status || '');
  const severidadValue = getSeveridadValue(ticket);
  const nivelSeveridadConfig = (() => {
    try {
      const config = getNivelSeveridadConfig(severidadValue);
      if (config && config.label && config.label !== '-') return config;
    } catch (error) { console.warn('Error al obtener config de severidad:', error); }
    return { icon: '', label: severidadValue || '-', bgcolor: '#f1f5f9', color: '#64748b' };
  })();

  const incidentTypes = Array.isArray(ticket.incidentType) ? ticket.incidentType : (ticket.incidentType ? [ticket.incidentType] : []);
  const operatorAsignadoName = formatOperatorName(ticket.operatorAsignado);
  const operatorResponsableName = formatOperatorName(ticket.operatorResponsable);


  const getValorFromId = (idOrObj: any, lista: any[]) => {
    if (!idOrObj) return 'Sin especificar';
    if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.valor || idOrObj.name || idOrObj.nombre || idOrObj._id || 'Sin especificar';

    if (!Array.isArray(lista)) {
      console.warn('⚠️ [getValorFromId] lista no es un array:', lista);
      return idOrObj;
    }

    const encontrado = lista.find((item: any) => String(item._id) === String(idOrObj));
    return encontrado ? encontrado.valor : idOrObj;
  };

  const causaRaizValor = getValorFromId(ticket.causaRaiz, causasRaizList);
  const solucionCasoRaw = (ticket as any).SolucionCaso || (ticket as any).solucionCaso || '';
  const solucionCasoValor = getValorFromId(solucionCasoRaw, solucionesCasoList);

  const tieneCausaRaiz = causaRaizValor && causaRaizValor !== 'Sin especificar';
  const tieneSolucion = solucionCasoValor && solucionCasoValor !== 'Sin especificar';
  const mostrarNodos = nodosUnicos.length > 0;
  const isClosed = (ticket.status || '').toUpperCase() === 'CERRADO';

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            style={{ width: '100%', maxWidth: '850px', maxHeight: 'calc(100vh - 40px)', outline: 'none', display: 'flex' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0px 8px 30px rgba(0,0,0,0.08)',
                bgcolor: '#ffffff', position: 'relative', overflow: 'hidden', maxHeight: '100%', width: '100%', display: 'flex', flexDirection: 'column',
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', bgcolor: theme.primary }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ bgcolor: theme.light, p: 0.75, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <ConfirmationNumberIcon sx={{ color: theme.dark, fontSize: '1.1rem' }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                      Ficha Técnica del Caso
                    </Typography>

                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1.25,
                      py: 0.3,
                      borderRadius: '6px',
                      bgcolor: theme.light,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <Typography sx={{
                        fontWeight: 700,
                        color: theme.dark,
                        fontSize: '0.85rem',
                        letterSpacing: '0.03em'
                      }}>
                        {ticket.caseNumber}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEditClick?.(ticket)} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: theme.light, color: theme.dark } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={onClose} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#e2e8f0', flexShrink: 0 }} />

              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>

                <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px', mb: 0.5 }}>Asunto de Caso</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4, fontSize: '1rem' }}>{ticket.subject}</Typography>
                </Box>

                <Grid container spacing={2.5}>

                  {/* COLUMNA IZQUIERDA */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Información General" icon={<ConfirmationNumberIcon sx={{ fontSize: '0.95rem' }} />}>
                      <Grid container spacing={1.5}>
                        <Grid size={6}>
                          <InfoItem label="Estado" value={<Chip icon={theme.icon} label={theme.label} size="small" sx={{ fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '22px', bgcolor: theme.light, color: theme.dark }} />} />
                        </Grid>
                        <Grid size={6}>
                          <InfoItem label="Afectación" value={<Chip label={ticket.afectacion === true ? 'Sí' : 'No'} size="small" sx={{ fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '22px', bgcolor: ticket.afectacion === true ? '#e8f5e9' : '#ffebee', color: ticket.afectacion === true ? '#2e7d32' : '#c62828' }} />} />
                        </Grid>
                        <Grid size={6}>
                          <InfoItem label="Localidad" icon={<LocationOnIcon sx={{ fontSize: 12 }} />} value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '12px' }}>{ticket.localidad || '-'}</Typography>} />
                        </Grid>
                        {ticket.ttZoho && (
                          <Grid size={6}>
                            <InfoItem label="TT Zoho" value={<Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{formatTTZoho(ticket.ttZoho)}</Typography>} />
                          </Grid>
                        )}
                        {ticket.ttClienteProveedor && (
                          <Grid size={6}>
                            <InfoItem label="TT Cliente" value={<Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{ticket.ttClienteProveedor}</Typography>} />
                          </Grid>
                        )}
                      </Grid>
                    </SectionCard>

                    {!isClosed && (
                      <SectionCard title="Timeline" icon={<ScheduleIcon sx={{ fontSize: '0.95rem' }} />}>
                        <Grid container spacing={1.5}>
                          <Grid size={6}><InfoItem label="Inicio Falla" value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>{formatDateTime(ticket.horaInicioFalla)}</Typography>} /></Grid>
                          <Grid size={6}><InfoItem label="Apertura NOC" value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>{formatDateTime(ticket.horaDeteccionNoc)}</Typography>} /></Grid>
                          <Grid size={6}><InfoItem label="Inicio Atención" value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>{formatDateTime(ticket.horaInicioAtencion)}</Typography>} /></Grid>
                          <Grid size={6}><InfoItem label="Fin Afectación" value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>{formatDateTime(ticket.horaFinAfectacion)}</Typography>} /></Grid>
                        </Grid>
                      </SectionCard>
                    )}

                    <SectionCard title="Análisis y Solución" icon={<BuildIcon sx={{ fontSize: '0.95rem' }} />} noBorder>
                      <Grid container spacing={1.5}>
                        <Grid size={12}>
                          <InfoItem label="Causa Raíz" icon={<ReportProblemIcon sx={{ fontSize: 15, color: '#dc5353' }} />} value={<Typography sx={{ fontWeight: 'bold', color: tieneCausaRaiz ? '#0a0909' : '#94a3b8', fontSize: '12px' }}>{causaRaizValor}</Typography>} />
                        </Grid>
                        <Grid size={12}>
                          <InfoItem label="Solución" icon={<CheckIcon sx={{ fontSize: 15, color: '#2e7d32' }} />} value={<Typography sx={{ fontWeight: 'bold', color: tieneSolucion ? '#0a0909' : '#94a3b8', fontSize: '12px' }}>{solucionCasoValor}</Typography>} />
                        </Grid>
                      </Grid>
                    </SectionCard>

                    <Divider sx={{ mb: 2, borderColor: '#f5f6f7', flexShrink: 0 }} />
                    <SectionCard title="Operadores" icon={<PersonIcon sx={{ fontSize: '0.95rem' }} />} noBorder>
                      <Grid container spacing={1.5}>
                        {/* Operador Responsable - Siempre se muestra */}
                        {ticket.operatorResponsable && (
                          <Grid size={ticket.operatorAsignado && ticket.operatorAsignado !== ticket.operatorResponsable ? 6 : 12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ bgcolor: '#f0fdf4', p: 0.6, borderRadius: '50%' }}>
                                <PersonIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                  Responsable
                                </Typography>
                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                                  {operatorResponsableName}
                                </Typography>
                                {ticket.fechaCreacion && (
                                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.2 }}>
                                    {formatDateTime(ticket.fechaCreacion)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        )}

                        {/* Operador Asignado - Solo si existe y es diferente del responsable */}
                        {ticket.operatorAsignado && ticket.operatorAsignado !== ticket.operatorResponsable && (
                          <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ bgcolor: '#eef2ff', p: 0.6, borderRadius: '50%' }}>
                                <PersonIcon sx={{ color: '#4f46e5', fontSize: '1rem' }} />
                              </Box>
                              <Box>
                                <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>
                                  Asignado
                                </Typography>
                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                                  {operatorAsignadoName}
                                </Typography>
                                {/* Fecha de asignación */}
                                {ticket.fechaAsignacionOpA && (
                                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.2 }}>
                                    Asignado: {formatDateTime(ticket.fechaAsignacionOpA)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </SectionCard>

                    <SectionCard title={isClosed ? 'Detalles' : 'Bitácora'} icon={<DescriptionIcon sx={{ fontSize: '0.95rem', color: isClosed ? '#c62828' : '#64748b' }} />} noBorder>
                      <Box sx={{ p: 1.25, bgcolor: isClosed ? '#f8fafc' : '#fafbfc', borderRadius: '6px', border: `1px solid ${isClosed ? '#e2e8f0' : '#f1f5f9'}`, maxHeight: '200px', overflowY: 'auto' }}>
                        <Typography sx={{ color: isClosed ? '#334155' : '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                          {isClosed ? (ticket.description || 'Sin detalles') : (ticket.bitacora || '-')}
                        </Typography>
                      </Box>
                    </SectionCard>

                  </Grid>

                  {/* COLUMNA DERECHA */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Infraestructura" icon={<NetworkCheckIcon sx={{ fontSize: '0.95rem' }} />}>
                      <Grid container spacing={1.5}>
                        <Grid size={12}>
                          <InfoItem label="Severidad" value={<Chip label={`${nivelSeveridadConfig.icon ? nivelSeveridadConfig.icon + ' ' : ''}${nivelSeveridadConfig.label}`} size="small" sx={{ fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '22px', bgcolor: nivelSeveridadConfig.bgcolor, color: nivelSeveridadConfig.color }} />} />
                        </Grid>
                        <Grid size={12}>
                          <InfoItem label="Tipo de Incidencia" value={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.3 }}>
                              {incidentTypes.length > 0 ? incidentTypes.map((tipo) => (<Chip key={tipo} label={tipo} size="small" sx={{ bgcolor: getColorByTipoIncidencia(tipo), color: 'white', fontWeight: 600, borderRadius: '6px', fontSize: '0.68rem', height: '22px' }} />)) : <Typography sx={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.8rem' }}>-</Typography>}
                            </Box>
                          } />
                        </Grid>

                        {/* ✅ NODOS AFECTADOS: Renderizado independiente por tipo de nodo */}
                        {ticket.afectacion === true && mostrarNodos && (
                          <Grid size={12}>
                            <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>
                              Nodos Afectados
                            </Typography>
                            <Grid container spacing={1.5}>

                              {/* SECCIÓN OLT (Se muestra si existe al menos un nodo OLT) */}
                              {nodosUnicos.some(n => n.origen === 'nodoOLT') && (
                                <Grid size={12}>
                                  <Box sx={{ p: 1.25, bgcolor: '#fafbfc', borderRadius: '8px', border: '1px solid #f5f8fb', minHeight: '60px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>OLT</Box>
                                      <Typography sx={{ color: '#075985', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Nodo OLT</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {nodosUnicos.filter(n => n.origen === 'nodoOLT').map((nodoInfo, index) => (
                                        <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#ffffff', color: '#000', fontWeight: 600, borderRadius: '6px', fontSize: '0.75rem', height: '26px', border: '1px solid #fafbfc', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                              )}

                              {/* SECCIÓN NODO A (Se muestra si existe al menos un nodo A) */}
                              {nodosUnicos.some(n => n.origen === 'nodoA') && (
                                <Grid size={12}>
                                  <Box sx={{ p: 1.25, bgcolor: '#fafbfc', borderRadius: '8px', border: '1px solid #fafbfc', minHeight: '60px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#67a6d9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>A</Box>
                                      <Typography sx={{ color: '#566375', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Nodo A (Origen)</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {nodosUnicos.filter(n => n.origen === 'nodoA').map((nodoInfo, index) => (
                                        <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#fafbfc', color: '#000', fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '24px', border: '1px solid #fafbfc', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                              )}

                              {/* SECCIÓN NODO B (Se muestra si existe al menos un nodo B) */}
                              {nodosUnicos.some(n => n.origen === 'nodoB') && (
                                <Grid size={6}>
                                  <Box sx={{ p: 1.25, bgcolor: '#fafbfc', borderRadius: '8px', border: '1px solid #e9eef3', minHeight: '60px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#322ba4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>B</Box>
                                      <Typography sx={{ color: '#566375', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Nodo B (Destino)</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {nodosUnicos.filter(n => n.origen === 'nodoB').map((nodoInfo, index) => (
                                        <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '24px', border: '1px solid #e9d5ff', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                              )}

                              {/* SECCIÓN NODO GENÉRICO (Fallback si no hay A, B ni OLT) */}
                              {nodosUnicos.some(n => n.origen === 'nodo') && (
                                <Grid size={12}>
                                  <Box sx={{ p: 1.25, bgcolor: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0', minHeight: '60px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#166534', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>N</Box>
                                      <Typography sx={{ color: '#166534', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Nodo General</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {nodosUnicos.filter(n => n.origen === 'nodo').map((nodoInfo, index) => (
                                        <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#ffffff', color: '#166534', fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '24px', border: '1px solid #bbf7d0', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                      ))}
                                    </Box>
                                  </Box>
                                </Grid>
                              )}

                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </SectionCard>

                    {/*  SERVICIOS AFECTADOS */}
                    {/* ✅ SECCIÓN: SERVICIOS AFECTADOS CON SCROLL */}
                    {Array.isArray(ticket.serviciosAfectados) && ticket.serviciosAfectados.length > 0 && (
                      <SectionCard title="Servicios Afectados" icon={<SettingsEthernet sx={{ fontSize: '0.95rem' }} />} noBorder>
                        <Box
                          sx={{
                            maxHeight: '220px', // Altura máxima antes de activar el scroll
                            overflowY: 'auto',
                            pr: 0.5, // Espacio para que el scroll no tape el contenido
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            // ✅ Estilos personalizados para el scrollbar (Webkit)
                            '&::-webkit-scrollbar': {
                              width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: '#f1f5f9',
                              borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: '#cbd5e1',
                              borderRadius: '3px',
                              '&:hover': {
                                background: '#94a3b8',
                              },
                            },
                          }}
                        >
                          {ticket.serviciosAfectados.map((servicio: any, index: number) => {
                            const nombre = typeof servicio === 'object' ? (servicio.name || servicio.id_circuito || 'Servicio sin nombre') : String(servicio);
                            const tipo = typeof servicio === 'object' ? (servicio.tipoServicio || 'N/A') : 'N/A';
                            const circuito = typeof servicio === 'object' ? (servicio.id_circuito || '') : '';

                            return (
                              <Box
                                key={typeof servicio === 'object' ? servicio._id : index}
                                sx={{
                                  p: 1.25,
                                  bgcolor: '#ffffff',
                                  borderRadius: '6px',
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    borderColor: '#080769',
                                    boxShadow: '0 1px 4px rgba(8, 7, 105, 0.08)'
                                  }
                                }}
                              >
                                <Box sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '6px',
                                  bgcolor: '#e0e7ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <SettingsEthernet sx={{ fontSize: '0.9rem', color: '#080769' }} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.15 }}>
                                  <Typography
                                    sx={{
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: '#0f172a',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {nombre}
                                  </Typography>
                                  {circuito && (
                                    <Typography
                                      sx={{
                                        fontSize: '0.7rem',
                                        color: '#64748b',
                                        fontWeight: 500
                                      }}
                                    >
                                      {circuito}
                                    </Typography>
                                  )}
                                </Box>

                                <Chip
                                  label={tipo}
                                  size="small"
                                  sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    height: '20px',
                                    bgcolor: '#f8fafc',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    flexShrink: 0,
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </SectionCard>
                    )}






                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2, borderColor: '#f5f6f7', flexShrink: 0 }} />
                <Box sx={{ mt: 1 }}>
                  <SectionCard title="Registro" icon={<AccessTimeIcon sx={{ fontSize: '0.95rem' }} />} noBorder>
                    <Grid container spacing={1.5}>
                      <Grid size={6}>
                        <Box sx={{ p: 1.25, bgcolor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.4 }}>
                            <AccessTimeIcon sx={{ fontSize: '0.9rem', color: '#94a3b8' }} />
                            <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase' }}>Creado</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </Typography>
                          {ticket.createdAt && (
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.1 }}>
                              {new Date(ticket.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ p: 1.25, bgcolor: '#f0f9ff', borderRadius: '6px', border: '1px solid #e0f2fe', textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.4 }}>
                            <AccessTimeIcon sx={{ fontSize: '0.9rem', color: '#0284c7' }} />
                            <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase' }}>Actualizado</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                            {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </Typography>
                          {ticket.updatedAt && (
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', mt: 0.1 }}>
                              {new Date(ticket.updatedAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </SectionCard>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}