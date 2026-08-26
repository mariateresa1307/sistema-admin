import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid } from '@mui/material';
import { ReportePreview } from 'app/utils/types';

interface Props { reportPreview: ReportePreview; }

export const GrupoD = ({ reportPreview }: Props) => {
  const { incidentesMayoresPorMes = [], tiempoEscalamientoHoras = 0, rankingServicios = [] } = reportPreview as any;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#ffebee', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Tiempo prom. escalamiento</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#c62828' }}>{tiempoEscalamientoHoras} h</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
            Incidentes Mayores por Mes
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><b>Mes</b></TableCell>
                  <TableCell align="right"><b>Cantidad</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incidentesMayoresPorMes.map((row: any, i: any) => (
                  <TableRow key={i}>
                    <TableCell>{row.mes}</TableCell>
                    <TableCell align="right">{row.cantidad}</TableCell>
                  </TableRow>
                ))}
                {incidentesMayoresPorMes.length === 0 && <TableRow><TableCell colSpan={2}>Sin incidentes mayores</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#080769' }}>
            Ranking de Servicios (Volumen)
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><b>Servicio</b></TableCell>
                  <TableCell align="right"><b>Tickets</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankingServicios.map((row: any, i: any) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.cantidad}</TableCell>
                  </TableRow>
                ))}
                {rankingServicios.length === 0 && <TableRow><TableCell colSpan={2}>Sin datos</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};