// app/admin/auditDetailModal.tsx
'use client';
import React, { useMemo } from 'react';
import {
  Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import BusinessIcon from '@mui/icons-material/Business';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { AuditLog } from '@/lib/types/audit';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface AuditDetailModalProps {
  open: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

// ✅ Configuración visual por tipo de acción
const ACTION_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  borderColor: string;
}> = {
  LOGIN: {
    label: 'Inicio de Sesión',
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    icon: LoginIcon,
    borderColor: '#22c55e',
  },
  LOGOUT: {
    label: 'Cierre de Sesión',
    color: '#616161',
    bgColor: '#f5f5f5',
    icon: LogoutIcon,
    borderColor: '#9e9e9e',
  },
  LOGIN_FAILED: {
    label: 'Login Fallido',
    color: '#c62828',
    bgColor: '#ffebee',
    icon: ErrorIcon,
    borderColor: '#ef4444',
  },
  CREATE: {
    label: 'Creación',
    color: '#1565c0',
    bgColor: '#e3f2fd',
    icon: AddCircleIcon,
    borderColor: '#2196f3',
  },
  UPDATE: {
    label: 'Actualización',
    color: '#ef6c00',
    bgColor: '#fff3e0',
    icon: EditIcon,
    borderColor: '#f59e0b',
  },
  DELETE: {
    label: 'Eliminación',
    color: '#c62828',
    bgColor: '#ffebee',
    icon: DeleteIcon,
    borderColor: '#ef4444',
  },
  EXPORT: {
    label: 'Exportación',
    color: '#6a1b9a',
    bgColor: '#f3e5f5',
    icon: HistoryIcon,
    borderColor: '#9c27b0',
  },
};

const DEFAULT_CONFIG = {
  label: 'Acción',
  color: '#000027',
  bgColor: '#f1f0fb',
  icon: HistoryIcon,
  borderColor: '#080769',
};

const formatModuleName = (moduleId: string | undefined | null): string => {
  if (!moduleId) return '—';
  
  const modules: Record<string, string> = {
    TICKET: 'Tickets',
    TICKETS: 'Tickets',
    MISCELLANEOUS: 'Miscellaneous',
    SERVICE: 'Servicios',
    SERVICES: 'Servicios',
    USER: 'Usuarios',
    USERS: 'Usuarios',
    AUDIT: 'Auditoría',
  };
  
  return modules[moduleId.toUpperCase()] || moduleId;
};

const parseJsonSafely = (value: string | undefined | null): any => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const extractDateFromLog = (log: AuditLog): Date | null => {
  const possibleDateFields = [
    (log as any).eventDate,
    (log as any).createdAt,
    (log as any).timestamp,
    (log as any).date,
    (log as any).actionDate,
    (log as any).fecha,
  ];

  for (const dateValue of possibleDateFields) {
    if (dateValue) {
      const parsed = dayjs(dateValue);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
  }

  return null;
};

const extractIpFromLog = (log: AuditLog): string | null => {
  const possibleIpFields = [
    (log as any).ipAddress,
    (log as any).ip,
    (log as any).userId,
    (log as any).clientIp,
    (log as any).remoteAddress,
    (log as any).ipAddressClient,
  ];

  for (const ipValue of possibleIpFields) {
    if (ipValue && typeof ipValue === 'string' && ipValue.trim() !== '') {
      return ipValue;
    }
  }

  return null;
};
const JsonViewer = ({ data, title, showLabel = true }: { data: any; title: string; showLabel?: boolean }) => {
  if (!data) {
    return (
      <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
        Sin datos
      </Typography>
    );
  }

  const formattedData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <Box>
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.5px',
            display: 'block',
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          p: 2,
          maxHeight: 300,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: '#334155',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {formattedData}
      </Box>
    </Box>
  );
};

export const AuditDetailModal = ({ open, onClose, log }: AuditDetailModalProps) => {

   React.useEffect(() => {
    if (log) {
      console.log('🔍 [AuditDetailModal] Log completo:', log);
      console.log(' [AuditDetailModal] moduleId:', log.module);
      console.log('🔍 [AuditDetailModal] module:', (log as any).module);
      console.log('🔍 [AuditDetailModal] Todos los campos:', Object.keys(log));
    }
  }, [log]);

  const config = useMemo(() => {
    if (!log) return DEFAULT_CONFIG;
    return ACTION_CONFIG[log.action] || DEFAULT_CONFIG;
  }, [log]);

  const oldValueParsed = useMemo(() => parseJsonSafely(log?.oldValue), [log?.oldValue]);
  const newValueParsed = useMemo(() => parseJsonSafely(log?.newValue), [log?.newValue]);
  const eventDate = useMemo(() => {
    if (!log) return null;
    const date = extractDateFromLog(log);
    return date ? dayjs(date) : null;
  }, [log]);

  if (!log) return null;

  const IconComponent = config.icon;
  const renderChangesSection = () => {
    if (!log.action) return null;

    const action = log.action.toUpperCase();

    if (action === 'CREATE') {
      return (
        <Grid size={12}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              color: '#1565c0',
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: 'block',
              mb: 0.5,
            }}
          >
            Registro Creado
          </Typography>
          <JsonViewer data={newValueParsed} title="" showLabel={false} />
        </Grid>
      );
    }

    if (action === 'UPDATE') {
      return (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                color: '#ef6c00',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Valor Anterior
            </Typography>
            <JsonViewer data={oldValueParsed} title="" showLabel={false} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                color: '#2e7d32',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Valor Actual
            </Typography>
            <JsonViewer data={newValueParsed} title="" showLabel={false} />
          </Grid>
        </>
      );
    }

    if (action === 'DELETE') {
      return (
        <Grid size={12}>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              color: '#c62828',
              fontWeight: 700,
              letterSpacing: '0.5px',
              display: 'block',
              mb: 0.5,
            }}
          >
            Registro Eliminado
          </Typography>
          <JsonViewer data={oldValueParsed} title="" showLabel={false} />
        </Grid>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {open && log && (
        <Modal
          open={open}
          onClose={onClose}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            style={{ width: '100%', maxWidth: '750px', outline: 'none' }}
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
              {/* Barra superior con color según acción */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  bgcolor: config.borderColor,
                }}
              />

              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: config.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 28, color: config.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                      Detalle de Auditoría
                    </Typography>
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{
                        bgcolor: config.bgColor,
                        color: config.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        mt: 0.5,
                      }}
                    />
                  </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />

              {/* Información principal */}
              <Grid container spacing={3}>
                {/* Fecha y Hora */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      Fecha y Hora
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {eventDate ? eventDate.format('DD/MM/YYYY HH:mm:ss') : '—'}
                  </Typography>
                  {eventDate && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                      {eventDate.fromNow()}
                    </Typography>
                  )}
                </Grid>

                {/* Usuario */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <FingerprintIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      Usuario
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {log.userEmail || '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      Dirección IP
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      fontFamily: 'monospace',
                      bgcolor: '#f1f5f9',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '6px',
                      display: 'inline-block',
                    }}
                  >
                    {extractIpFromLog(log) || '—'}
                  </Typography>
                </Grid>

                {/* Módulo */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}
                    >
                      Módulo
                    </Typography>
                  </Box>
                  <Chip
                        label={formatModuleName(log.module || (log as any).module || (log as any).moduleId)}
                    size="small"
                    sx={{
                      bgcolor: '#e8eaf6',
                      color: '#000027',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Grid>

                {/* Record ID */}
                {log.recordId && (
                  <Grid size={12}>
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}
                    >
                      ID del Registro
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        color: '#475569',
                        bgcolor: '#f8fafc',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      {log.recordId}
                    </Typography>
                  </Grid>
                )}

                {/* Detalles */}
                {log.details && (
                  <Grid size={12}>
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}
                    >
                      Detalles
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                      {log.details}
                    </Typography>
                  </Grid>
                )}

                {/* User Agent */}
                {log.userAgent && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>

                  <Grid size={12}>
                    <Typography
                      variant="caption"
                      sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}
                      >
                      Navegador / Dispositivo
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {log.userAgent}
                    </Typography>
                  </Grid>
                      </Box>
                )}

                {(oldValueParsed || newValueParsed) && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip
                          icon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
                          label="Cambios Realizados"
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: '#fff3e0', color: '#ef6c00' }}
                        />
                      </Divider>
                    </Grid>
                    {renderChangesSection()}
                  </>
                )}
              </Grid>

            
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};