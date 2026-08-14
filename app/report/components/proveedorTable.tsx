'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Chip, TablePagination, Box, TextField, Stack
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { IncidenciaPorProveedor } from '../hooks/useIncidenciasData';

interface Props {
  data: IncidenciaPorProveedor[];
  loading: boolean;
}

const HEADERS = [
  { key: 'caseNumber', label: 'N° Ticket' },
  { key: 'servicioNombre', label: 'Servicio' },
  { key: 'horaInicioFalla', label: 'Inicio Falla' },
  { key: 'horaFinAfectacion', label: 'Fin Afectación' }, 
  { key: 'duracionAfectacion', label: 'Duración Total' },
  { key: 'causaRaiz', label: 'Causa Raíz' },
  { key: 'solucionCaso', label: 'Solución' },
  { key: 'status', label: 'Estado' },
];

export const ProveedorTable = ({ data, loading }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

   const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) =>
      row.caseNumber.toLowerCase().includes(term) ||
      row.servicioNombre.toLowerCase().includes(term) ||
      row.causaRaiz?.toLowerCase().includes(term) ||
      row.solucionCaso?.toLowerCase().includes(term) ||
      row.status.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => setPage(newPage), []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr === 'N/A' || timeStr === 'Sin especificar') return 'N/A';
    return dayjs(timeStr).format('DD/MM/YYYY HH:mm');
  };


  const formatStatus = (status: string) => {
  const statusUpper = status.toUpperCase().trim();
  
  if (statusUpper === 'EN_GESTION' || statusUpper === 'EN GESTIÓN') {
    return 'EN GESTIÓN';
  }
  if (statusUpper === 'ACTIVO') {
    return 'ACTIVO';
  }
  if (statusUpper === 'CERRADO') {
    return 'CERRADO';
  }
  
  return statusUpper;
};

  // ✅ Función para obtener el estilo del Chip (Idéntico al diseño de la app)
  const getStatusStyle = (status: string) => {
    const statusUpper = status.toUpperCase().trim();
    
    if (statusUpper === 'CERRADO') {
      return { bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' };
    }
    if (statusUpper === 'ACTIVO') {
      return { bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' };
    }
    if (statusUpper === 'EN GESTIÓN' || statusUpper === 'EN_GESTION') {
      return { bgcolor: '#fff9c4', color: '#f57f17', border: '1px solid #ffecb3' };
    }
    
    // Fallback para cualquier otro estado
    return { bgcolor: '#f5f5f5', color: '#616161', border: '1px solid #e0e0e0' };
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', marginBottom: 2, borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      
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
                    whiteSpace: 'nowrap',
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
                    {searchTerm ? 'No se encontraron resultados' : 'No hay incidencias para este proveedor'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow
                    key={`${row.ticketId}-${index}`}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#080769' }}>
                        {row.caseNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {row.servicioNombre}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        {row.tipoServicio}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: row.horaInicioFalla === 'N/A' ? '#94a3b8' : '#090909'
                        
                        }}>
                        {formatTime(row.horaInicioFalla)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" 
                      sx={{ 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                          color: row.horaFinAfectacion === 'N/A' ? '#94a3b8' : '#090909'
                    
                      }}>
                        {formatTime(row.horaFinAfectacion)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          color: row.duracionAfectacion === 'N/A' ? '#94a3b8' : '#cf5252'
                        }}
                      >
                        {row.duracionAfectacion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" 
                      sx={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          color: row.causaRaiz === 'Sin especificar' ? '#94a3b8' : '#080769'
                        }}>
                        {row.causaRaiz}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" 
                      sx={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 600,
                          color: row.solucionCaso === 'Sin especificar' ? '#94a3b8' : '#3e5f40'
                        }}>
                        {row.solucionCaso}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                         label={formatStatus(row.status)}  
                        size="small"
                        sx={{
                          ...statusStyle,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: '24px',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
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
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
    </Paper>
  );
};