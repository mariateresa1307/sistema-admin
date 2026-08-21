'use client';
import React, { useMemo } from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Grid } from '@mui/material';
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
import { useIdResolver } from '../hooks/useIdResolver';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface AuditDetailModalProps {
  open: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const ACTION_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  borderColor: string;
}> = {
  LOGIN: { label: 'Inicio de Sesión', color: '#2e7d32', bgColor: '#e8f5e9', icon: LoginIcon, borderColor: '#22c55e' },
  LOGOUT: { label: 'Cierre de Sesión', color: '#616161', bgColor: '#f5f5f5', icon: LogoutIcon, borderColor: '#9e9e9e' },
  LOGIN_FAILED: { label: 'Login Fallido', color: '#c62828', bgColor: '#ffebee', icon: ErrorIcon, borderColor: '#ef4444' },
  CREATE: { label: 'Creación', color: '#1565c0', bgColor: '#e3f2fd', icon: AddCircleIcon, borderColor: '#2196f3' },
  UPDATE: { label: 'Actualización', color: '#ef6c00', bgColor: '#fff3e0', icon: EditIcon, borderColor: '#f59e0b' },
  DELETE: { label: 'Eliminación', color: '#c62828', bgColor: '#ffebee', icon: DeleteIcon, borderColor: '#ef4444' },
  EXPORT: { label: 'Exportación', color: '#6a1b9a', bgColor: '#f3e5f5', icon: HistoryIcon, borderColor: '#9c27b0' },
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
    TICKET: 'Tickets', TICKETS: 'Tickets', MISCELLANEOUS: 'Miscellaneous',
    SERVICE: 'Servicios', SERVICES: 'Servicios', USER: 'Usuarios', USERS: 'Usuarios',
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

const getChangedKeys = (oldObj: any, newObj: any): Set<string> => {
  const changed = new Set<string>();
  if (!newObj || typeof newObj !== 'object' || Array.isArray(newObj)) return changed;

  const oldSafe = oldObj && typeof oldObj === 'object' && !Array.isArray(oldObj) ? oldObj : {};

  Object.keys(newObj).forEach((key) => {
    if (JSON.stringify(oldSafe[key]) !== JSON.stringify(newObj[key])) {
      changed.add(key);
    }
  });

  return changed;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const extractDateFromLog = (log: AuditLog): Date | null => {
  const possibleDateFields = [
    (log as any).eventDate, (log as any).createdAt, (log as any).timestamp,
    (log as any).date, (log as any).actionDate, (log as any).fecha,
  ];
  for (const dateValue of possibleDateFields) {
    if (dateValue) {
      const parsed = dayjs(dateValue);
      if (parsed.isValid()) return parsed.toDate();
    }
  }
  return null;
};

const extractIpFromLog = (log: AuditLog): string | null => {
  const possibleIpFields = [
    (log as any).ipAddress, (log as any).ip, (log as any).userId,
    (log as any).clientIp, (log as any).remoteAddress, (log as any).ipAddressClient,
  ];
  for (const ipValue of possibleIpFields) {
    if (ipValue && typeof ipValue === 'string' && ipValue.trim() !== '') return ipValue;
  }
  return null;
};

const extractRecordNameFromOldValue = (oldValue: any): string => {
  if (!oldValue) return '—';
  const name = oldValue.valor || oldValue.name || oldValue.nombre || oldValue.title || oldValue.label;
  return name || '—';
};

const JsonViewer = ({
  data,
  title,
  showLabel = true,
  highlightKeys,
}: {
  data: any;
  title: string;
  showLabel?: boolean;
  highlightKeys?: Set<string>;
}) => {
  if (!data) {
    return (
      <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
        Sin datos
      </Typography>
    );
  }

  const isPlainObject = typeof data === 'object' && !Array.isArray(data);

  return (
    <Box>
      {showLabel && (
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          p: 1.5,
          maxHeight: 300,
          overflow: 'auto',
        }}
      >
        {isPlainObject ? (
          Object.entries(data).map(([key, value]) => {
            const isChanged = highlightKeys?.has(key) ?? false;
            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  mb: 0.25,
                  borderRadius: '4px',
                  alignItems: 'baseline',
                  bgcolor: isChanged ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  borderLeft: isChanged ? '3px solid #f59e0b' : '3px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, minWidth: 130, flexShrink: 0 }}
                >
                  {key}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    wordBreak: 'break-word',
                    color: isChanged ? '#b45309' : '#334155',
                    fontWeight: isChanged ? 700 : 400,
                  }}
                >
                  {formatValue(value)}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#334155',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              p: 1,
            }}
          >
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export const AuditDetailModal = ({ open, onClose, log }: AuditDetailModalProps) => {
  const { lookupMap, resolveAuditJson, ready, resolveText } = useIdResolver();

  React.useEffect(() => {
    if (log) {
      console.log('🔍 [AuditDetailModal] Log completo:', log);
      console.log('🔍 [AuditDetailModal] oldValue:', log.oldValue);
    }
  }, [log]);

  const config = useMemo(() => {
    if (!log) return DEFAULT_CONFIG;
    return ACTION_CONFIG[log.action] || DEFAULT_CONFIG;
  }, [log]);

  const oldValueParsed = useMemo(() => {
    if (!log?.oldValue) return null;
    return ready ? resolveAuditJson(log.oldValue) : parseJsonSafely(log.oldValue);
  }, [log?.oldValue, ready, resolveAuditJson]);

  const newValueParsed = useMemo(() => {
    if (!log?.newValue) return null;
    return ready ? resolveAuditJson(log.newValue) : parseJsonSafely(log.newValue);
  }, [log?.newValue, ready, resolveAuditJson]);

  const changedKeys = useMemo(
    () => getChangedKeys(oldValueParsed, newValueParsed),
    [oldValueParsed, newValueParsed],
  );

  const eventDate = useMemo(() => {
    if (!log) return null;
    const date = extractDateFromLog(log);
    return date ? dayjs(date) : null;
  }, [log]);

  const deletedRecordName = useMemo(() => {
    if (log?.action === 'DELETE') {
      return extractRecordNameFromOldValue(oldValueParsed);
    }
    return null;
  }, [log?.action, oldValueParsed]);

  const isSessionAction = useMemo(() => {
    if (!log?.action) return false;
    const a = String(log.action).toUpperCase();
    return a === 'LOGIN' || a === 'LOGOUT' || a === 'LOGIN_FAILED';
  }, [log?.action]);

  if (!log) return null;

  const IconComponent = config.icon;

  const renderChangesSection = () => {
    if (!log.action) return null;

    const action = log.action.toUpperCase();

    if (action === 'CREATE') {
      return (
        <Grid size={12}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#1565c0', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
            Registro Creado
          </Typography>
          <JsonViewer data={newValueParsed} title="" showLabel={false} />
        </Grid>
      );
    }

    if (action === 'UPDATE') {
      return (
        <>
          <Grid size={12}>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontStyle: 'italic',
                display: 'block',
                textAlign: 'center',
                mb: 1,
              }}
            >
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#ef6c00', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
              Valor Anterior
            </Typography>
            <JsonViewer data={oldValueParsed} title="" showLabel={false} highlightKeys={changedKeys} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#2e7d32', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
              Valor Actual
            </Typography>
            <JsonViewer data={newValueParsed} title="" showLabel={false} highlightKeys={changedKeys} />
          </Grid>
        </>
      );
    }

    if (action === 'DELETE') {
      if (!oldValueParsed || typeof oldValueParsed !== 'object' || Array.isArray(oldValueParsed)) {
        return (
          <Grid size={12}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#c62828', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
              Registro Eliminado
            </Typography>
            <JsonViewer data={oldValueParsed} title="" showLabel={false} />
          </Grid>
        );
      }

      const recordName =
        oldValueParsed.name ||
        oldValueParsed.valor ||
        oldValueParsed.nombre ||
        oldValueParsed.subject ||
        oldValueParsed.caseNumber ||
        oldValueParsed.email ||
        oldValueParsed.id_circuito ||
        log.recordId ||
        'Registro sin nombre';

      const primaryIdentifier =
        oldValueParsed.caseNumber ||
        oldValueParsed.id_circuito ||
        oldValueParsed.id_netuno ||
        oldValueParsed.idRBS ||
        oldValueParsed.idDOG ||
        (typeof log.recordId === 'string' && log.recordId) ||
        null;

      const excludeKeys = new Set(['_id', 'name', 'valor', 'nombre', 'createdAt', 'updatedAt']);

      const detailEntries = Object.entries(oldValueParsed).filter(
        ([key, val]) => !excludeKeys.has(key) && val !== null && val !== undefined && val !== '',
      );

      return (
        <Grid size={12}>
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: '10px',
              bgcolor: '#ffebee',
              border: '1px solid #ef9a9a',
              borderLeft: '4px solid #c62828',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DeleteIcon sx={{ color: '#c62828', fontSize: 20 }} />
              <Typography
                variant="caption"
                sx={{ textTransform: 'uppercase', color: '#c62828', fontWeight: 700, letterSpacing: '0.5px' }}
              >
                Registro Eliminado
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#7f1d1d', lineHeight: 1.3, wordBreak: 'break-word' }}>
              {recordName}
            </Typography>

            {primaryIdentifier && primaryIdentifier !== recordName && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: '#b91c1c',
                  bgcolor: 'rgba(255,255,255,0.6)',
                  px: 1,
                  py: 0.3,
                  borderRadius: '4px',
                  display: 'inline-block',
                  mt: 0.5,
                }}
              >
                {primaryIdentifier}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              p: 2,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="caption"
              sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 1 }}
            >
              Datos del Registro ({detailEntries.length} campos)
            </Typography>

            <Grid container spacing={1}>
              {detailEntries.map(([key, value]) => {
                const displayValue = formatValue(value);
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: '6px',
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: 'uppercase',
                          color: '#64748b',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 0.25,
                        }}
                      >
                        {key}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#0f172a',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {displayValue}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}

              {detailEntries.length === 0 && (
                <Grid size={12}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                    No hay datos adicionales registrados
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      );
    }

    return null;
  };

  const getActionDividerConfig = (action: string, changesCount = 0) => {
    switch (action.toUpperCase()) {
      case 'DELETE':
        return { label: 'Datos Eliminados', icon: <DeleteIcon sx={{ fontSize: 16 }} />, bgcolor: '#ffebee', color: '#c62828' };
      case 'CREATE':
        return { label: 'Datos Creados', icon: <AddCircleIcon sx={{ fontSize: 16 }} />, bgcolor: '#e3f2fd', color: '#1565c0' };
      case 'UPDATE':
      default:
        return {
          label: changesCount > 0
            ? `${changesCount} ${changesCount === 1 ? 'Cambio Realizado' : 'Cambios Realizados'}`
            : 'Sin Cambios Detectados',
          icon: <CompareArrowsIcon sx={{ fontSize: 16 }} />,
          bgcolor: changesCount > 0 ? '#fff3e0' : '#f1f5f9',
          color: changesCount > 0 ? '#ef6c00' : '#64748b'
        };
    }
  };

  const dividerConfig = getActionDividerConfig(log.action, changedKeys.size);

  return (
    <AnimatePresence>
      {open && log && (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
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
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', bgcolor: config.borderColor }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: config.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent sx={{ fontSize: 28, color: config.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                      Detalle de Auditoría
                    </Typography>
                    <Chip label={config.label} size="small" sx={{ bgcolor: config.bgColor, color: config.color, fontWeight: 700, fontSize: '0.72rem', mt: 0.5 }} />
                  </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#f1f5f9' }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <FingerprintIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
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
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Dirección IP
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace', bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: '6px', display: 'inline-block' }}>
                    {extractIpFromLog(log) || '—'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Módulo
                    </Typography>
                  </Box>
                  <Chip label={formatModuleName(log.module || (log as any).module || (log as any).moduleId)} size="small" sx={{ bgcolor: '#e8eaf6', color: '#000027', fontWeight: 600, fontSize: '0.75rem' }} />
                </Grid>

                {log.recordId && (
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                      ID del Registro
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569', bgcolor: '#f8fafc', px: 1.5, py: 0.5, borderRadius: '6px', display: 'inline-block' }}>
                      {lookupMap.get(String(log.recordId)) || log.recordId}
                    </Typography>
                  </Grid>
                )}

                {log.details && (
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                      Detalles
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                      {resolveText(log.details)}
                    </Typography>
                  </Grid>
                )}

                {/* ✅ Oculto en LOGIN/LOGOUT/LOGIN_FAILED */}
                {(oldValueParsed || newValueParsed) && !isSessionAction && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }}>
                        <Chip
                          icon={dividerConfig.icon}
                          label={dividerConfig.label}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: dividerConfig.bgcolor, color: dividerConfig.color }}
                        />
                      </Divider>
                    </Grid>
                    {renderChangesSection()}
                  </>
                )}

                {log.userAgent && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'block', mb: 0.5 }}>
                        Navegador / Dispositivo
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {log.userAgent}
                      </Typography>
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};