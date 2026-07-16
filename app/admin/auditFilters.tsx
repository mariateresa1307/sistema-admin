'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, MenuItem, Button,
  Stack, CircularProgress, Alert, Chip,
} from '@mui/material';
import {
  FilterList as FilterIcon, RestartAlt as ResetIcon, Download as DownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { getAuditLogs, getUsers } from '@/lib/api';
import { AuditLog } from '@/lib/types/audit';
import AuditTable from './auditTable';

const ACTIONS = [
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'LOGIN_FAILED', label: 'Login fallido' },
  { value: 'CREATE', label: 'Crear' },
  { value: 'UPDATE', label: 'Actualizar' },
  { value: 'DELETE', label: 'Eliminar' },
];

export default function AuditFilters() {
  const [filters, setFilters] = useState({
    userId: '', action: '', startDate: null as Dayjs | null, endDate: null as Dayjs | null,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const loadUsers = useCallback(async () => {
    try {
      const result = await getUsers();
      setUsers(result.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      
      if (filters.startDate) {
        params.startDate = dayjs(filters.startDate).startOf('day').toISOString();
      }
      if (filters.endDate) {
        params.endDate = dayjs(filters.endDate).endOf('day').toISOString();
      }

      console.log('📡 [Frontend] Enviando params:', params);

      const response = await getAuditLogs(params);
      
      console.log('📥 [Frontend] Respuesta:', response.data);
      
      setLogs(response.data.data || []);
      setPagination((prev) => ({ 
        ...prev, 
        total: response.data.total || 0, 
        totalPages: response.data.totalPages || 0 
      }));
    } catch (err) {
      console.error('❌ [Frontend] Error:', err);
      setError('Error al cargar los registros de auditoría');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({ userId: '', action: '', startDate: null, endDate: null });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // ✅ NUEVO: Manejar cambio de registros por página
  const handleRowsPerPageChange = useCallback((newLimit: number) => {
    setPagination((prev) => ({ 
      ...prev, 
      limit: newLimit,
      page: 1 // Resetear a página 1 al cambiar el límite
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleExport = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.action) params.append('action', filters.action);
    if (filters.startDate) params.append('startDate', dayjs(filters.startDate).startOf('day').toISOString());
    if (filters.endDate) params.append('endDate', dayjs(filters.endDate).endOf('day').toISOString());

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/audit/export?${params.toString()}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `auditoria-${dayjs().format('YYYY-MM-DD')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch(() => setError('Error al exportar'));
  }, [filters]);

  const hasActiveFilters = useMemo(
    () => filters.userId || filters.action || filters.startDate || filters.endDate,
    [filters],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
            <FilterIcon sx={{ color: '#080769' }} fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#080769' }}>
              Filtros de Auditoría
            </Typography>
            {hasActiveFilters && (
              <Chip label="Filtros activos" size="small" color="primary" sx={{ ml: 'auto' }} />
            )}
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select fullWidth size="small" label="Usuario"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.primerNombre} {user.primerApellido}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select fullWidth size="small" label="Acción"
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {ACTIONS.map((action) => (
                  <MenuItem key={action.value} value={action.value}>{action.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Fecha de inicio" value={filters.startDate}
                onChange={(newValue) => handleFilterChange('startDate', newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Fecha final" value={filters.endDate}
                onChange={(newValue) => handleFilterChange('endDate', newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid size={12}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained" onClick={loadLogs} disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                  sx={{ bgcolor: '#080769', borderRadius: '8px', textTransform: 'none', fontWeight: 600, flex: 1 }}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined" color="inherit" onClick={handleReset}
                  startIcon={<ResetIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained" onClick={handleExport}
                  startIcon={<DownloadIcon />}
                  sx={{ bgcolor: '#2e7d32', borderRadius: '8px', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1b5e20' } }}
                >
                  Descargar Excel
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <AuditTable
            data={logs}
            loading={loading}
            total={pagination.total}
            page={pagination.page}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange} 
          />
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}