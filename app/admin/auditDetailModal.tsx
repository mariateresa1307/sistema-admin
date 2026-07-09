'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Paper, Box, Typography, IconButton, Chip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getAuditLogs } from '@/lib/api';
import { AuditLog } from '@/lib/types/audit';
import AuditTable from '../admin/auditTable';

const ACTION_MAP: Record<string, string[]> = {
  ediciones: ['CREATE', 'UPDATE'],
  eliminados: ['DELETE'],
  usuarios: ['LOGIN', 'LOGOUT'],
  incidentes: ['LOGIN_FAILED'],
  historial: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'EXPORT'],
};

interface Props {
  open: boolean;
  onClose: () => void;
  actionFilter?: string;
}

export default function AuditDetailModal({ open, onClose, actionFilter }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const loadLogs = useCallback(async () => {
    if (!open || !actionFilter) return;
    setLoading(true);
    try {
      const actions = ACTION_MAP[actionFilter] || [];
      // Fetch para cada acción en paralelo
      const promises = actions.map((action) =>
        getAuditLogs({ action, page: pagination.page, limit: pagination.limit }).then((r) => r.data),
      );
      const results = await Promise.all(promises);

      const allLogs = results.flatMap((r) => r.data || []);
      const sorted = allLogs.sort((a, b) => new Date(b.eventDate || '').getTime() - new Date(a.eventDate || '').getTime());
      const total = results.reduce((acc, r) => acc + (r.total || 0), 0);

      setLogs(sorted);
      setPagination((prev) => ({ ...prev, total }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [open, actionFilter, pagination.page, pagination.limit]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => {
    if (!open) {
      setPagination({ page: 1, limit: 20, total: 0 });
      setLogs([]);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: 1100, maxHeight: '85vh', overflow: 'auto',
      }}>
        <Paper sx={{ p: 3, borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#080769' }}>
              Detalle: {actionFilter?.toUpperCase()}
            </Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>
          {loading ? <CircularProgress /> : (
            <AuditTable
              data={logs}
              loading={loading}
              total={pagination.total}
              page={pagination.page}
              limit={pagination.limit}
              onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
            />
          )}
        </Paper>
      </Box>
    </Modal>
  );
}