import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { ReportePreview } from 'app/utils/types';

interface TiempoPorServicioRow {
  title: string;
  value: number;
}

interface FallaRecurrenteRow {
  servicio: string;
  causaRaiz: string;
  cantidad: number;
}

interface GrupoBReportPreview extends ReportePreview {
  fallasRecurrentes?: FallaRecurrenteRow[];
  tiempoPorServicio?: TiempoPorServicioRow[];
}

interface Props { reportPreview: ReportePreview; }

export const GrupoB = ({ reportPreview }: Props) => {
  const { fallasRecurrentes = [], tiempoPorServicio = [] } = reportPreview as GrupoBReportPreview;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
        Tiempo Promedio de Afectación por Servicio
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><b>Servicio</b></TableCell>
              <TableCell align="right"><b>MTTR Promedio (h)</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiempoPorServicio.map((row: TiempoPorServicioRow, i: number) => (
              <TableRow key={i}>
                <TableCell>{row.title}</TableCell>
                <TableCell align="right">{row.value} h</TableCell>
              </TableRow>
            ))}
            {tiempoPorServicio.length === 0 && <TableRow><TableCell colSpan={2}>Sin datos</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
        Fallas Recurrentes
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><b>Servicio</b></TableCell>
              <TableCell><b>Causa Raíz</b></TableCell>
              <TableCell align="right"><b>Cantidad</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fallasRecurrentes.map((row: FallaRecurrenteRow, i: number) => (
              <TableRow key={i}>
                <TableCell>{row.servicio}</TableCell>
                <TableCell>{row.causaRaiz}</TableCell>
                <TableCell align="right">{row.cantidad}</TableCell>
              </TableRow>
            ))}
            {fallasRecurrentes.length === 0 && <TableRow><TableCell colSpan={3}>Sin fallas recurrentes</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
        Tasa de incidentes recurrentes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><b>Servicio</b></TableCell>
              <TableCell><b>Causa Raíz</b></TableCell>
              <TableCell align="right"><b>Cantidad</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fallasRecurrentes.map((row: FallaRecurrenteRow, i: number) => (
              <TableRow key={i}>
                <TableCell>{row.servicio}</TableCell>
                <TableCell>{row.causaRaiz}</TableCell>
                <TableCell align="right">{row.cantidad}</TableCell>
              </TableRow>
            ))}
            {fallasRecurrentes.length === 0 && <TableRow><TableCell colSpan={3}>Sin fallas recurrentes</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};