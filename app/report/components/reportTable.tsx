'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, TablePagination, Box, TextField, MenuItem, Stack,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IncidenciaPorServicio } from '../hooks/useIncidenciasData';

interface Props {
  data: IncidenciaPorServicio[];
  loading: boolean;
  onRowClick: (row: IncidenciaPorServicio) => void;
}

const HEADERS = [
  { key: 'tipoServicio', label: 'Tipo de Servicio', align: 'left' as const },
  { key: 'totalIncidencias', label: 'Total', align: 'center' as const },
  { key: 'abiertas', label: 'Abiertas', align: 'center' as const },
  { key: 'cerradas', label: 'Cerradas', align: 'center' as const },
  { key: 'ultimaIncidencia', label: 'Última Incidencia', align: 'center' as const },
];

const SEARCH_FIELDS = [
  { value: 'tipoServicio', label: 'Tipo de Servicio' },
  { value: 'caseNumber', label: 'Número de Caso' },
];

export const ReportTable = ({ data, loading, onRowClick }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchField, setSearchField] = useState('tipoServicio');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔍 LOG DE DIAGNÓSTICO: muestra la estructura real de los datos
  useEffect(() => {
    if (data && data.length > 0) {
      console.log('📊 [ReportTable] Estructura de datos recibida:', data[0]);
      console.log('📊 [ReportTable] Todos los registros:', data);
    }
  }, [data]);

  // ✅ Normalización defensiva: maneja múltiples formatos posibles del backend
const normalizedData = useMemo(() => {
  return data.map((row, index) => ({
    ...row,
    tipoServicio: row.tipoServicio || 'Sin Tipo',
    _key: `${row.tipoServicio}-${index}`, // ✅ índice garantiza unicidad
  }));
}, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return normalizedData;
    const term = searchTerm.toLowerCase().trim();

    return normalizedData.filter((row) => {
      switch (searchField) {
        case 'tipoServicio':
          return row.tipoServicio.toLowerCase().includes(term);
        case 'caseNumber':
          return row.tickets?.some((ticket) =>
            ticket.caseNumber.toLowerCase().includes(term)
          ) ?? false;
        default:
          return true;
      }
    });
  }, [normalizedData, searchField, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0);
  }, []);

  const handleSearchFieldChange = useCallback((value: string) => {
    setSearchField(value);
    setSearchTerm('');
    setPage(0);
  }, []);

  const formatDate = (date: string | Date | null): string => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      {/* Barra de búsqueda */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Buscar por"
            value={searchField}
            onChange={(e) => handleSearchFieldChange(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            {SEARCH_FIELDS.map((field) => (
              <MenuItem key={field.value} value={field.value}>
                {field.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />,
            }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Box>

      {/* Tabla */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#080769' }}>
              {HEADERS.map((header) => (
                <TableCell
                  key={header.key}
                  align={header.align}
                  sx={{
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    py: 2,
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 6 }}>
                  <Stack alignItems="center" spacing={1}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary">Cargando datos...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay datos disponibles'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={`${row.tipoServicio}-${index}`}   // ✅ único siempre
                  hover
                  onClick={() => onRowClick(row)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Tipo de Servicio */}
                  <TableCell>
                    <Chip
                      label={row.tipoServicio}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderColor: '#080769',
                        color: '#080769'
                      }}
                    />
                  </TableCell>

                  {/* Total */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#080769' }}>
                      {row.totalIncidencias}
                    </Typography>
                  </TableCell>

                  {/* Abiertas */}
                  <TableCell align="center">
                    <Chip
                      label={row.abiertas}
                      size="small"
                      sx={{
                        bgcolor: '#ffebee',
                        color: '#c62828',
                        fontWeight: 700,
                        minWidth: 40
                      }}
                    />
                  </TableCell>

                  {/* Cerradas */}
                  <TableCell align="center">
                    <Chip
                      label={row.cerradas}
                      size="small"
                      sx={{
                        bgcolor: '#e8f5e9',
                        color: '#2e7d32',
                        fontWeight: 700,
                        minWidth: 40
                      }}
                    />
                  </TableCell>

                  {/* Última Incidencia */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {formatDate(row.ultimaIncidencia)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': { fontSize: '0.85rem' }
        }}
      />
    </Paper>
  );
};