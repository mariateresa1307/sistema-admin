import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid } from '@mui/material';
import { ReportePreview } from 'app/utils/types';

interface Props { reportPreview: ReportePreview; }

export const GrupoC = ({ reportPreview }: Props) => {
  const { ticketsPorOperador = [], promedioPorOperador = 0, cantidadOperadores = 0 } = reportPreview as any;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: '#e3f2fd', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Operadores en turno</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2' }}>{cantidadOperadores}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: '#e8f5e9', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Promedio tickets por operador</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2e7d32' }}>{promedioPorOperador}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
        Tickets Cerrados por Operador
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><b>Operador</b></TableCell>
              <TableCell align="right"><b>Tickets Cerrados</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ticketsPorOperador.map((row: any, i) => (
              <TableRow key={i}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="right">{row.cantidad}</TableCell>
              </TableRow>
            ))}
            {ticketsPorOperador.length === 0 && <TableRow><TableCell colSpan={2}>Sin datos</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};