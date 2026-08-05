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
import { TicketRecord, formatTTZoho } from "app/utils/ticketHelpers";
import { getNivelSeveridadConfig } from "app/utils/auxiliares";
import { getUsers, getMiscellaneous } from "@/lib/api";
import { Height } from "@mui/icons-material";

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

const getNodoLabel = (nodoInfo: NodoInfo): string => {
  switch (nodoInfo.origen) {
    case 'nodoOLT': return `NODO OLT: ${nodoInfo.valor}`;
    case 'nodoA': return `NODO A: ${nodoInfo.valor}`;
    case 'nodoB': return `NODO B: ${nodoInfo.valor}`;
    default: return nodoInfo.valor;
  }
};

const getNodoColorByOrigen = (origen: string): { bgcolor: string; color: string; border: string } => {
  switch (origen) {
    case 'nodoOLT': return { bgcolor: '#e0f2fe', color: '#075985', border: '#bae6fd' };
    case 'nodoA': return { bgcolor: '#fafbfc', color: '#9a3412', border: '#f4f7fa' };
    case 'nodoB': return { bgcolor: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
    default: return { bgcolor: '#dcfce7', color: '#166534', border: '#bbf7d0' };
  }
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

// ✅ FUNCIÓN AUXILIAR: Extrae array de respuesta paginada o directa
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
      
      // ✅ EXTRAER correctamente los arrays de las respuestas paginadas
      setCausasRaizList(extractData(causasRes));
      setSolucionesCasoList(extractData(solucionesRes));
      
      console.log(' [TicketDetailModal] Datos cargados:', {
        causasRaiz: extractData(causasRes).length,
        solucionesCaso: extractData(solucionesRes).length,
      });
    }).catch((err) => console.error("❌ Error al obtener datos para el modal:", err));
  }, [open]);

  useEffect(() => {
    if (ticket  && open ) {
      console.log(' [Ticket Data]',
         { createdAt: ticket.createdAt,
           updatedAt: ticket.updatedAt, 
           fullTicket: ticket });
    }
  }, [ticket, open]);

  const nodosUnicos = useMemo((): NodoInfo[] => {
    if (!ticket) return [];
    if (ticket.nodo && String(ticket.nodo).trim() !== '') return [{ valor: String(ticket.nodo).trim(), origen: 'nodo' }];
    if (!Array.isArray(ticket.serviciosAfectados) || ticket.serviciosAfectados.length === 0) return [];

    const serviciosValidos = ticket.serviciosAfectados.filter((s: any) => s !== null && s !== undefined && typeof s === 'object');
    if (serviciosValidos.length === 0) return [];

    const nodoOLTValidos = serviciosValidos.filter((s: any) => s.nodoOLT && String(s.nodoOLT).trim() !== '').map((s: any) => ({ valor: String(s.nodoOLT).trim(), origen: 'nodoOLT' as const }));
    if (nodoOLTValidos.length > 0) {
      const seen = new Set<string>();
      return nodoOLTValidos.filter(n => { if (seen.has(n.valor)) return false; seen.add(n.valor); return true; });
    }

    const nodoAyB: NodoInfo[] = [];
    serviciosValidos.forEach((s: any) => {
      if (s.nodoA && String(s.nodoA).trim() !== '') nodoAyB.push({ valor: String(s.nodoA).trim(), origen: 'nodoA' });
      if (s.nodoB && String(s.nodoB).trim() !== '') nodoAyB.push({ valor: String(s.nodoB).trim(), origen: 'nodoB' });
    });
    if (nodoAyB.length > 0) {
      const seen = new Set<string>();
      return nodoAyB.filter(n => { if (seen.has(n.valor)) return false; seen.add(n.valor); return true; });
    }

    const nodoDeServicios = serviciosValidos.filter((s: any) => s.nodo && String(s.nodo).trim() !== '').map((s: any) => ({ valor: String(s.nodo).trim(), origen: 'nodo' as const }));
    if (nodoDeServicios.length > 0) {
      const seen = new Set<string>();
      return nodoDeServicios.filter(n => { if (seen.has(n.valor)) return false; seen.add(n.valor); return true; });
    }
    return [];
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
    
    // ✅ VERIFICAR que lista sea un array antes de usar .find()
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

              {/* ✅ HEADER MEJORADO: Título y Case Number en la misma línea */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ bgcolor: theme.light, p: 0.75, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <ConfirmationNumberIcon sx={{ color: theme.dark, fontSize: '1.1rem' }} />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                      Ficha Técnica del Caso
                    </Typography>
                    
                    {/* Case Number destacado sutilmente al lado */}
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

              {/* Contenido Scrollable */}
              <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, pr: 0.5 }}>

                {/* Asunto */}
                <Box sx={{ mb: 2.5, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px', mb: 0.5 }}>Asunto de Caso</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4, fontSize: '1rem' }}>{ticket.subject}</Typography>
                </Box>

                {/* Grid Principal de 2 Columnas */}
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
                          <InfoItem label="Localidad" icon={<LocationOnIcon sx={{ fontSize: 12 }} />} value={<Typography sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{ticket.localidad || '-'}</Typography>} />
                        </Grid>
                        {ticket.ttZoho && (
                          <Grid size={6}>
                            <InfoItem label="TT Zoho" value={
                              <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                                {formatTTZoho(ticket.ttZoho)} 
                                </Typography>} />
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
                          <InfoItem label="Causa Raíz" icon={<ReportProblemIcon sx={{ fontSize: 12, color: '#f59e0b' }} />} value={<Typography sx={{ fontWeight: 600, color: tieneCausaRaiz ? '#c62828' : '#94a3b8', fontSize: '0.85rem' }}>{causaRaizValor}</Typography>} />
                        </Grid>
                        <Grid size={12}>
                          <InfoItem label="Solución" icon={<CheckIcon sx={{ fontSize: 12, color: '#2e7d32' }} />} value={<Typography sx={{ fontWeight: 600, color: tieneSolucion ? '#2e7d32' : '#94a3b8', fontSize: '0.85rem' }}>{solucionCasoValor}</Typography>} />
                        </Grid>
                      </Grid>
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
                        
                        {/* ✅ NODOS AFECTADOS - Layout mejorado con A y B separados */}
                        {ticket.afectacion === true && mostrarNodos && (
                          <Grid size={12}>
                            <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.75 }}>
                              Nodos Afectados
                            </Typography>
                            <Grid container spacing={1.5}>
                              {/* Columna Izquierda - Nodos A */}
                              <Grid size={6}>
                                <Box sx={{ p: 1.25, bgcolor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', minHeight: '60px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>A</Box>
                                    <Typography sx={{ color: '#c2410c', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Origen</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {nodosUnicos.filter(n => n.origen === 'nodoA').map((nodoInfo, index) => (
                                      <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#ffedd5', color: '#9a3412', fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '24px', border: '1px solid #fed7aa', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                    ))}
                                    {nodosUnicos.filter(n => n.origen === 'nodoA').length === 0 && (
                                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>Sin nodos A</Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Grid>

                              {/* Columna Derecha - Nodos B */}
                              <Grid size={6}>
                                <Box sx={{ p: 1.25, bgcolor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff', minHeight: '60px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#9333ea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>B</Box>
                                    <Typography sx={{ color: '#6b21a8', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>Destino</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {nodosUnicos.filter(n => n.origen === 'nodoB').map((nodoInfo, index) => (
                                      <Chip key={index} label={nodoInfo.valor} size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', height: '24px', border: '1px solid #e9d5ff', justifyContent: 'flex-start', '& .MuiChip-label': { pl: 1, pr: 1 } }} />
                                    ))}
                                    {nodosUnicos.filter(n => n.origen === 'nodoB').length === 0 && (
                                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>Sin nodos B</Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    </SectionCard>

                    <SectionCard title={isClosed ? 'Detalles' : 'Bitácora'} icon={<DescriptionIcon sx={{ fontSize: '0.95rem', color: isClosed ? '#c62828' : '#64748b' }} />}>
                      <Box sx={{ p: 1.25, bgcolor: isClosed ? '#f8fafc' : '#fafbfc', borderRadius: '6px', border: `1px solid ${isClosed ? '#e2e8f0' : '#f1f5f9'}`, maxHeight: '100px', overflowY: 'auto' }}>
                        <Typography sx={{ color: isClosed ? '#334155' : '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                          {isClosed ? (ticket.description || 'Sin detalles') : (ticket.bitacora || '-')}
                        </Typography>
                      </Box>
                    </SectionCard>

                    <SectionCard title="Operadores" icon={<PersonIcon sx={{ fontSize: '0.95rem' }} />} noBorder>
                      <Grid container spacing={1.5}>
                        {ticket.operatorResponsable && (
                          <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ bgcolor: '#f0fdf4', p: 0.6, borderRadius: '50%' }}><PersonIcon sx={{ color: '#059669', fontSize: '1rem' }} /></Box>
                              <Box>
                                <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>Responsable</Typography>
                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>{operatorResponsableName}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        )}
                        <Grid size={ticket.operatorResponsable ? 6 : 12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ bgcolor: '#eef2ff', p: 0.6, borderRadius: '50%' }}><PersonIcon sx={{ color: '#4f46e5', fontSize: '1rem' }} /></Box>
                            <Box>
                              <Typography sx={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>Asignado</Typography>
                              <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>{operatorAsignadoName}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </SectionCard>
                  </Grid>
                </Grid>

                {/* SECCIÓN DE REGISTRO (Fuera del grid de 2 columnas para que ocupe todo el ancho inferior) */}
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