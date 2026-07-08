'use client';
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip, MenuItem, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { getNivelSeveridadConfig } from "app/utils/auxiliares";
import { getUsers } from "@/lib/api";

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: {
    caseNumber: string;
    subject: string;
    email: string;
    status: string;
    operatorAsignado: string;
    operatorResponsable?: string;
    afectacion?: boolean;
    bitacora?: string;
    ttZoho?: string;
    nodo?: string;
    localidad?: string;
    nivelSeveridad?: string;
    severidad?: string;
    requiereEscalamiento?: string;
    incidentType?: string | string[];
    horaInicioAtencion?: string;
    horaInicioFalla?: string;
    horaFinAfectacion?: string;
    horadeescalamiento?: string;
    horaCierre?: string;
  } | null;
  onEditClick?: () => void;
}

const TICKET_THEMES = {
  ACTIVO: {
    primary: '#22c55e',
    light: '#e8f5e9',
    dark: '#2e7d32',
    border: '#c8e6c9',
    label: 'ACTIVO',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  EN_GESTION: {
    primary: '#eab308',
    light: '#fff9c4',
    dark: '#f57f17',
    border: '#ffecb3',
    label: 'EN GESTIÓN',
    icon: <AccessTimeIcon fontSize="small" />,
  },
  CERRADO: {
    primary: '#ef4444',
    light: '#ffebee',
    dark: '#c62828',
    border: '#ffcdd2',
    label: 'CERRADO',
    icon: <CloseIcon fontSize="small" />,
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
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
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
  return ticket.nivelSeveridad || ticket.severidad || '';
};

const formatOperatorName = (operador: any): string => {
  if (!operador) return '-';
  const nombre = [operador.primerNombre, operador.primerApellido]
    .filter(Boolean)
    .join(' ')
    .trim();
  return nombre || operador.username || '-';
};

export function TicketDetailModal({ open, onClose, ticket, onEditClick }: TicketDetailModalProps) {
  const [operadores, setOperadores] = useState<Array<{
    _id: string;
    primerNombre: string;
    primerApellido: string;
    username?: string;
  }>>([]);

  useEffect(() => {
    if (!open) return;
    
    getUsers()
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setOperadores(
          data
            .filter((u: any) => u.isActive !== false)
            .map((u: any) => ({
              _id: u._id,
              primerNombre: u.primerNombre,
              primerApellido: u.primerApellido,
              username: u.username,
            }))
        );
      })
      .catch((err) => {
        console.error("Error al obtener operadores:", err);
        setOperadores([]);
      });
  }, [open]);

  if (!ticket) return null;

  const theme = getTheme(ticket.status);
  const severidadValue = getSeveridadValue(ticket);
  const nivelSeveridadConfig = (() => {
    try {
      const config = getNivelSeveridadConfig(severidadValue);
      if (config && config.label && config.label !== '-') return config;
    } catch (error) {
      console.warn('Error al obtener config de severidad:', error);
    }
    return {
      icon: '',
      label: severidadValue || '-',
      bgcolor: '#f1f5f9',
      color: '#64748b',
    };
  })();

  
  const incidentTypes = Array.isArray(ticket.incidentType)
    ? ticket.incidentType
    : ticket.incidentType
      ? [ticket.incidentType]
      : [];

  // RESOLVER NOMBRES DE OPERADORES
  const operatorAsignadoName = useMemo(() => {
    if (!ticket.operatorAsignado) return '-';
    
    // Si ya es un nombre (no es ObjectId), devolverlo tal cual
    if (!/^[0-9a-fA-F]{24}$/.test(ticket.operatorAsignado)) {
      return ticket.operatorAsignado;
    }
    
    // Buscar en el array de operadores
    const operador = operadores.find(op => op._id === ticket.operatorAsignado);
    return formatOperatorName(operador);
  }, [ticket.operatorAsignado, operadores]);

  const operatorResponsableName = useMemo(() => {
    if (!ticket.operatorResponsable) return '-';
    
    if (!/^[0-9a-fA-F]{24}$/.test(ticket.operatorResponsable)) {
      return ticket.operatorResponsable;
    }
    
    const operador = operadores.find(op => op._id === ticket.operatorResponsable);
    return formatOperatorName(operador);
  }, [ticket.operatorResponsable, operadores]);

  return (
    <AnimatePresence>
      {open && (
        console.log("Ticket Detail:", ticket),
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
                border: `2px solid ${theme.border}`,
                boxShadow: '0px 10px 40px rgba(0,0,0,0.08)',
                bgcolor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', bgcolor: theme.primary }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ bgcolor: theme.light, p: 1, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                    <ConfirmationNumberIcon sx={{ color: theme.dark, fontSize: '1.3rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.dark }}>
                    Ficha Técnica del Caso
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Editar Registro">
                    <IconButton onClick={onEditClick} size="small" sx={{ color: theme.dark, '&:hover': { bgcolor: `${theme.primary}15` } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 3.5, borderColor: theme.border }} />

              <Grid container spacing={3}>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Asunto de Caso
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
                    {ticket.subject}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Número de Caso
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5, fontWeight: 700, color: theme.dark, bgcolor: theme.light,
                      px: 1, py: 0.4, borderRadius: '6px', display: 'inline-block',
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {ticket.caseNumber}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Posee Afectación
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={ticket.afectacion === true ? 'Sí' : 'No'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        bgcolor: ticket.afectacion === true ? '#e8f5e9' : '#ffebee',
                        color: ticket.afectacion === true ? '#2e7d32' : '#c62828',
                        border: `1px solid ${ticket.afectacion === true ? '#22c55e' : '#ef4444'}`,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Estado
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={theme.icon}
                      label={theme.label}
                      size="small"
                      sx={{
                        mt: 0.5, fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem',
                        bgcolor: theme.light, color: theme.dark, border: `1px solid ${theme.primary}`,
                        '& .MuiChip-icon': { color: theme.dark },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Localidad
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                    {ticket.localidad || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Nodo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                    {ticket.nodo || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Nivel de Severidad
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={`${nivelSeveridadConfig.icon ? nivelSeveridadConfig.icon + ' ' : ''}${nivelSeveridadConfig.label}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        px: 1,
                        bgcolor: nivelSeveridadConfig.bgcolor,
                        color: nivelSeveridadConfig.color,
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Tipo de Incidencia
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {incidentTypes.length > 0 ? (
                      incidentTypes.map((tipo) => (
                        <Chip
                          key={tipo}
                          label={tipo}
                          size="small"
                          sx={{
                            bgcolor: getColorByTipoIncidencia(tipo),
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            px: 1,
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                        -
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Hora de Inicio de Falla
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                    {formatDateTime(ticket.horaInicioFalla)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Hora de Inicio de Atención
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                    {formatDateTime(ticket.horaInicioAtencion)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Hora de Fin de Afectación
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                    {formatDateTime(ticket.horaFinAfectacion)}
                  </Typography>
                </Grid>

                {ticket.status === 'CERRADO' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      Hora de Cierre
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                      {formatDateTime(ticket.horaCierre)}
                    </Typography>
                  </Grid>
                )}

                {ticket.ttZoho && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      TT Zoho
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8 }}>
                      {ticket.ttZoho}
                    </Typography>
                  </Grid>
                )}

                <Grid size={12}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                    Bitácora
                  </Typography>
                  <Box sx={{ mt: 0.5, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '150px', overflowY: 'auto' }}>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {ticket.bitacora || '-'}
                    </Typography>
                  </Box>
                </Grid>

              
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: '#4f46e5', fontSize: '2rem', bgcolor: '#ffffff', p: 0.8, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} />
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                        Operador Asignado
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {operatorAsignadoName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

             
                {ticket.operatorResponsable && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon sx={{ color: '#059669', fontSize: '2rem', bgcolor: '#ffffff', p: 0.8, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} />
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                          Operador Responsable
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {operatorResponsableName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}