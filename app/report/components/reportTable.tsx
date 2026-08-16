'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, TablePagination, Box, TextField, MenuItem, Stack
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IncidenciaPorServicio } from '../hooks/useIncidenciasData';

interface Props {
  data: IncidenciaPorServicio[];
  loading: boolean;
  onRowClick: (row: IncidenciaPorServicio) => void;
}

// ✅ Columnas actualizadas: Tipo - Total - Abiertas - Cerradas - Última Incidencia
const HEADERS = [
  { key: 'tipoServicio', label: 'Tipo' },
  { key: 'abiertas', label: 'Abiertas' },
  { key: 'cerradas', label: 'Cerradas' },
  { key: 'totalIncidencias', label: 'Total' },
  { key: 'ultimaIncidencia', label: 'Última Incidencia' },
];

// ✅ Eliminada búsqueda por nombre de servicio
const SEARCH_FIELDS = [
  { value: 'caseNumber', label: 'Número de Caso' },
];

export const ReportTable = ({ data, loading, onRowClick }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchField, setSearchField] = useState('tipoServicio');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      switch (searchField) {
        case 'tipoServicio':
          return row.tipoServicio.toLowerCase().includes(term);
        case 'caseNumber':
          return row.tickets.some((ticket) =>
            ticket.caseNumber.toLowerCase().includes(term)
          );
        default:
          return true;
      }
    });
  }, [data, searchField, searchTerm]);

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

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#080769' }}>
              {HEADERS.map((header) => (
                <TableCell
                  key={header.key}
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
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Cargando datos...</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No se encontraron resultados para la búsqueda' : 'No hay datos disponibles'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={`${row.tipoServicio}-${row.ultimaIncidencia}`}
                  hover
                  onClick={() => onRowClick(row)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell>
                    <Chip
                      label={row.tipoServicio}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                
                  <TableCell>
                    <Chip
                      label={row.abiertas}
                      size="small"
                      sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.cerradas}
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }}
                    />
                  </TableCell>

                    <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#080769' }}>
                      {row.totalIncidencias}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {dayjs(row.ultimaIncidencia).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
        sx={{ borderTop: '1px solid', borderColor: 'divider', '& .MuiTablePagination-toolbar': { fontSize: '0.85rem' } }}
      />
    </Paper>
  );
};