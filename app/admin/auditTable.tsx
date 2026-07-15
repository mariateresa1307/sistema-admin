// app/admin/auditTable.tsx
'use client';
import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Typography, Box, TablePagination, Skeleton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import { AuditLog } from '@/lib/types/audit';
import { AuditDetailModal } from './auditDetailModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface Props {
  data: AuditLog[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

// ✅ Configuración visual por acción
const ACTION_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default'; icon: React.ElementType }> = {
  LOGIN: { label: 'Login', color: 'success', icon: LoginIcon },
  LOGOUT: { label: 'Logout', color: 'default', icon: LogoutIcon },
  LOGIN_FAILED: { label: 'Login fallido', color: 'error', icon: ErrorIcon },
  CREATE: { label: 'Crear', color: 'info', icon: AddCircleIcon },
  UPDATE: { label: 'Actualizar', color: 'warning', icon: EditIcon },
  DELETE: { label: 'Eliminar', color: 'error', icon: DeleteIcon },
  EXPORT: { label: 'Exportar', color: 'info', icon: HistoryIcon },
};

// ✅ Función para formatear módulo
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
    AUTH: 'Autenticación',
  };
  
  return modules[moduleId.toUpperCase()] || moduleId;
};

export default function AuditTable({ data, loading, total, page, limit, onPageChange }: Props) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleRowClick = (log: AuditLog) => {
    console.log('🔍 [AuditTable] Log seleccionado completo:', log);
    console.log('🔍 [AuditTable] eventDate:', (log as any).eventDate);
    console.log('🔍 [AuditTable] createdAt:', (log as any).createdAt);
    console.log('🔍 [AuditTable] moduleId:', (log as any).moduleId);
    console.log('🔍 [AuditTable] module:', (log as any).module);
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  // Skeleton loading
  if (loading && data.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} height={50} />)}
      </Box>
    );
  }

  // Estado vacío
  if (data.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center', py: 5 }}>
        <Typography color="text.secondary">No se encontraron registros</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#080769' }}>
              {['Fecha / Hora', 'Usuario', 'Acción', 'Módulo', 'IP', 'Detalles'].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((log) => {
              const config = ACTION_CONFIG[log.action] || {
                label: log.action,
                color: 'default' as const,
                icon: HistoryIcon,
              };
              const IconComponent = config.icon;
              
              // ✅ Extraer fecha de forma robusta (intenta múltiples campos)
              const dateValue = (log as any).eventDate || (log as any).createdAt || (log as any).timestamp;
              const eventDate = dateValue ? dayjs(dateValue) : null;
              
              // ✅ Extraer módulo de forma robusta
              const moduleId = (log as any).moduleId || (log as any).module;
              const moduleName = formatModuleName(moduleId);

              return (
                <TableRow
                  key={log._id}
                  hover
                  onClick={() => handleRowClick(log)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Fecha y Hora */}
                  <TableCell>
                    {eventDate ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {eventDate.format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {eventDate.format('HH:mm:ss')}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* Usuario */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {log.userEmail || '—'}
                    </Typography>
                  </TableCell>

                  {/* Acción con ícono */}
                  <TableCell>
                    <Chip
                      icon={<IconComponent sx={{ fontSize: 16 }} />}
                      label={config.label}
                      size="small"
                      color={config.color}
                      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>

                  {/* Módulo */}
                  <TableCell>
                    {moduleName !== '—' ? (
                      <Chip
                        label={moduleName}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.72rem',
                          borderColor: '#e2e8f0',
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* IP */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        color: '#475569',
                        bgcolor: '#f1f5f9',
                        px: 1,
                        py: 0.3,
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}
                    >
                      {log.ipAddress || '—'}
                    </Typography>
                  </TableCell>

                  {/* Detalles */}
                  <TableCell>
                    <Tooltip title={log.details || ''}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8rem',
                          color: '#64748b',
                        }}
                      >
                        {log.details || '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={() => {}}
        rowsPerPageOptions={[limit]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          '& .MuiTablePagination-toolbar': {
            fontSize: '0.85rem',
          },
        }}
      />

      {/* Modal de detalle */}
      <AuditDetailModal
        open={!!selectedLog}
        onClose={handleCloseModal}
        log={selectedLog}
      />
    </Box>
  );
}