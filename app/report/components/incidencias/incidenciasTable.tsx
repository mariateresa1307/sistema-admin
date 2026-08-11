'use client';
import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, CircularProgress,
} from '@mui/material';
import dayjs from 'dayjs';
import { IncidenciaPorServicio } from '../../hooks/useIncidenciasData';

interface Props {
  data: IncidenciaPorServicio[];
  loading: boolean;
}

const HEADERS = ['Servicio', 'Tipo', 'Total', 'Abiertas', 'Cerradas', 'Última Incidencia'];

export const IncidenciasTable = ({ data, loading }: Props) => {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#080769' }}>
              {HEADERS.map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 700,
                    color: '#fff',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    py: 2,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={HEADERS.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No se encontraron incidencias para los filtros seleccionados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.servicioId}
                  hover
                  sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: 'background-color 0.15s ease' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.servicioNombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.tipoServicio} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#080769' }}>
                      {row.totalIncidencias}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.abiertas} size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.cerradas} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
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
    </Paper>
  );
};