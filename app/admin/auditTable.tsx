"use client";
import React, { useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Typography, Box, TablePagination, Skeleton, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AuditLog } from '@/lib/types/audit';
import dayjs from 'dayjs';

interface Props {
  data: AuditLog[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const ACTION_CONFIG: Record<string, { label: string; color: 'default' | 'success' | 'error' | 'warning' | 'info' }> = {
  LOGIN: { label: 'Login', color: 'success' },
  LOGOUT: { label: 'Logout', color: 'default' },
  LOGIN_FAILED: { label: 'Login fallido', color: 'error' },
  CREATE: { label: 'Crear', color: 'info' },
  UPDATE: { label: 'Actualizar', color: 'warning' },
  DELETE: { label: 'Eliminar', color: 'error' },
  EXPORT: { label: 'Exportar', color: 'info' },
};

export default function AuditTable({ data, loading, total, page, limit, onPageChange }: Props) {
  // ✅ State para el log seleccionado
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // ✅ Función CORREGIDA (línea 50)
  const handleCloseDetail = useCallback(() => {
    setSelectedLog(null);
  }, []);

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
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#080769' }}>
              {/* ✅ Headers únicos (sin duplicar "Acción") */}
              {['Fecha', 'Usuario', 'Tipo', 'Módulo', 'IP', 'Detalles', 'Ver'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#fff' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((log) => {
              const config = ACTION_CONFIG[log.action] || { label: log.action, color: 'default' as const };
              return (
                <TableRow key={log._id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography variant="body2">
                      {log.eventDate ? dayjs(log.eventDate).format('DD/MM/YYYY HH:mm') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.userEmail || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={config.label} size="small" color={config.color} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{log.module || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {log.ipAddress || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => setSelectedLog(log)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
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
      />

      {/* ✅ Modal de detalle */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onClose={handleCloseDetail} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#080769', color: 'white' }}>Detalle del Log</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
              {Object.entries({
                'Fecha': selectedLog.eventDate ? dayjs(selectedLog.eventDate).format('DD/MM/YYYY HH:mm:ss') : '-',
                'Usuario': selectedLog.userEmail,
                'Acción': selectedLog.action,
                'Módulo': selectedLog.module,
                'IP': selectedLog.ipAddress,
                'Record ID': selectedLog.recordId,
                'Detalles': selectedLog.details,
                'Valor anterior': selectedLog.oldValue ? <pre style={{ fontSize: '0.75rem' }}>{selectedLog.oldValue}</pre> : '-',
                'Valor nuevo': selectedLog.newValue ? <pre style={{ fontSize: '0.75rem' }}>{selectedLog.newValue}</pre> : '-',
                'User Agent': selectedLog.userAgent,
              }).map(([key, value]) => (
                <Box 
                  key={key} 
                  sx={{ 
                    gridColumn: ['Detalles', 'Valor anterior', 'Valor nuevo', 'User Agent'].includes(key) ? 'span 2' : 'auto' 
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{value || '-'}</Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetail}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}