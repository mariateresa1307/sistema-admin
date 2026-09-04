"use client";
import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ReportePreview } from "app/utils/types";

interface IncidenteMayorPorMes {
  mes: string;
  cantidad: number;
  masivas: number;
  banca: number;
  carrier: number;
  corporativo: number;
  otros: number;
  tickets: string;
}

interface Props {
  reportPreview: ReportePreview;
}

const COLORS = {
  primary: "#1976d2",
  primaryLight: "#64b5f6",
  primaryBg: "#e3f2fd",
  incident: "#ef5350",
  incidentLight: "#ffcdd2",
  incidentBg: "#ffebee",
  escalation: "#ffa726",
  escalationLight: "#ffe0b2",
  escalationBg: "#fff3e0",
  documented: "#66bb6a",
  documentedLight: "#c8e6c9",
  documentedBg: "#e8f5e9",
  demand: "#42a5f5",
  demandLight: "#bbdefb",
  //demandBg: "#e3f2fd",
  // 🎨 Colores pastel para la gráfica
  masivasPastel: "#ffcdd2", // Rojo pastel suave
  bancaPastel: "#bbdefb", // Azul pastel suave
  carrierPastel: "#ffe0b2", // Naranja pastel suave
  corporativoPastel: "#c8e6c9", // Verde pastel suave
  otrosPastel: "#e1bee7", // Morado pastel suave
  text: "#334155",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  background: "#f8fafc",
  white: "#ffffff",
};

export const GrupoD = ({ reportPreview }: Props) => {
  const {
    incidentesMayoresPorMes = [],
    tiempoEscalamientoHoras = 0,
    rankingServicios = [],
    casoMasDemandante = null,
  } = reportPreview as any;

  // Calcular estadísticas totales
  const totalIncidentes = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + item.cantidad,
    0,
  );
  const totalMasivas = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + (item.masivas || 0),
    0,
  );
  const totalBanca = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + (item.banca || 0),
    0,
  );
  const totalCarrier = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + (item.carrier || 0),
    0,
  );
  const totalCorporativo = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + (item.corporativo || 0),
    0,
  );
  const totalOtros = incidentesMayoresPorMes.reduce(
    (sum: number, item: IncidenteMayorPorMes) => sum + (item.otros || 0),
    0,
  );

  // Formatear datos para la gráfica
  const chartData = incidentesMayoresPorMes.map((row: IncidenteMayorPorMes) => {
    const [year, month] = row.mes.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);

    return {
      mes: date.toLocaleDateString("es-ES", {
        month: "short",
        year: "2-digit",
      }),
      mesCompleto: date.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      }),
      cantidad: row.cantidad,
      masivas: row.masivas || 0,
      banca: row.banca || 0,
      carrier: row.carrier || 0,
      corporativo: row.corporativo || 0,
      otros: row.otros || 0,
      tickets: row.tickets,
    };
  });

  // Tooltip personalizado enriquecido
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: COLORS.white,
            p: 2,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: COLORS.text, mb: 1 }}
          >
            {data.mesCompleto}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: COLORS.incident }}>
              <strong>Total:</strong> {data.cantidad}
            </Typography>
            <Typography variant="body2" sx={{ color: "#c62828" }}>
              <strong>Masivas:</strong> {data.masivas}
            </Typography>
            <Typography variant="body2" sx={{ color: "#1976d2" }}>
              <strong>Banca:</strong> {data.banca}
            </Typography>
            <Typography variant="body2" sx={{ color: "#f57c00" }}>
              <strong>Carrier:</strong> {data.carrier}
            </Typography>
            <Typography variant="body2" sx={{ color: "#2e7d32" }}>
              <strong>Corporativo:</strong> {data.corporativo}
            </Typography>
            <Typography variant="body2" sx={{ color: "#7b1fa2" }}>
              <strong>Otros:</strong> {data.otros}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: COLORS.textSecondary, mt: 1, fontSize: "0.75rem" }}
            >
              Tickets: {data.tickets}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* ==========================================
            GRÁFICA: Tendencia de Incidentes por Mes
        ========================================== */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: `1px solid ${COLORS.border}`,
              height: "100%",
              bgcolor: COLORS.white,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 1, color: COLORS.text }}
            >
              1. Tendencia de Incidentes por Mes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Desglose por tipo de servicio y criticidad
            </Typography>

            {/* Estadísticas rápidas con colores pastel */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
              <Chip
                label={`Total: ${totalIncidentes}`}
                sx={{
                  bgcolor: COLORS.incidentBg,
                  color: "#c62828",
                  fontWeight: 600,
                  border: "1px solid #ffcdd2",
                }}
              />
              <Chip
                label={`Masivas: ${totalMasivas}`}
                sx={{
                  bgcolor: COLORS.masivasPastel,
                  color: "#c62828",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Banca: ${totalBanca}`}
                sx={{
                  bgcolor: COLORS.bancaPastel,
                  color: "#1976d2",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Carrier: ${totalCarrier}`}
                sx={{
                  bgcolor: COLORS.carrierPastel,
                  color: "#f57c00",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Corporativo: ${totalCorporativo}`}
                sx={{
                  bgcolor: COLORS.corporativoPastel,
                  color: "#2e7d32",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Otros: ${totalOtros}`}
                sx={{
                  bgcolor: COLORS.otrosPastel,
                  color: "#7b1fa2",
                  fontWeight: 600,
                }}
              />
            </Box>

            {chartData.length > 0 ? (
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 12, fill: COLORS.textSecondary }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: COLORS.textSecondary }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      formatter={(value) => (
                        <span style={{ color: COLORS.textSecondary }}>
                          {value}
                        </span>
                      )}
                    />
                    {/* Barras apiladas con colores pastel */}
                    <Bar
                      dataKey="masivas"
                      name="Fallas Masivas"
                      stackId="a"
                      fill={COLORS.masivasPastel}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="banca"
                      name="Banca"
                      stackId="a"
                      fill={COLORS.bancaPastel}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="carrier"
                      name="Carrier"
                      stackId="a"
                      fill={COLORS.carrierPastel}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="corporativo"
                      name="Corporativo"
                      stackId="a"
                      fill={COLORS.corporativoPastel}
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="otros"
                      name="Otros"
                      stackId="a"
                      fill={COLORS.otrosPastel}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: COLORS.background,
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary">
                  Sin incidentes registrados en el período
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

      {/* ==========================================
    TABLA: Ranking de Servicios
========================================== */}
<Grid size={{ xs: 12, md: 5 }}>
  <Paper sx={{ 
    p: 3, 
    borderRadius: 3, 
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
    border: `1px solid ${COLORS.border}`, 
    height: '100%',
    bgcolor: COLORS.white
  }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: COLORS.text }}>
      2. Caso Más Demandante por Servicio
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Top servicios con mayor volumen de tickets
    </Typography>
    
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ 
            bgcolor: COLORS.primaryBg,
            borderBottom: `2px solid ${COLORS.primary}`
          }}>
            <TableCell sx={{ 
              fontWeight: 800, 
              color: COLORS.primary,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              py: 2
            }}>
              #
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 800, 
              color: COLORS.primary,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              py: 2
            }}>
              Servicio
            </TableCell>
            <TableCell align="right" sx={{ 
              fontWeight: 800, 
              color: COLORS.primary,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              py: 2
            }}>
              Tickets
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rankingServicios.slice(0, 10).map((row: any, i: number) => {
            const getPositionColor = (index: number) => {
              if (index === 0) return { bg: '#fff9c4', text: '#f9a825', border: '#fdd835' };
              if (index === 1) return { bg: '#f5f5f5', text: '#757575', border: '#e0e0e0' };
              if (index === 2) return { bg: '#ffe0b2', text: '#fb8c00', border: '#ffcc80' };
              return { bg: COLORS.primaryBg, text: COLORS.primary, border: COLORS.primaryLight };
            };
            
            const positionStyle = getPositionColor(i);

            return (
              <TableRow 
                key={i} 
                hover 
                sx={{ 
                  bgcolor: i % 2 === 0 ? COLORS.white : '#fafbfc',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: COLORS.primaryBg,
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <TableCell sx={{ py: 2, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: positionStyle.bg,
                    color: positionStyle.text,
                    border: `2px solid ${positionStyle.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: i < 3 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {i + 1}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  py: 2, 
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontWeight: 600, 
                  color: COLORS.text,
                  fontSize: '0.95rem'
                }}>
                  {row.name}
                </TableCell>
                <TableCell align="right" sx={{ 
                  py: 2, 
                  borderBottom: `1px solid ${COLORS.border}`
                }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: 0.5,
                    borderRadius: '9999px',
                    bgcolor: i === 0 ? COLORS.incidentBg : COLORS.primaryBg,
                    color: i === 0 ? '#c62828' : COLORS.primary,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    minWidth: 48
                  }}>
                    {row.cantidad}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
          {rankingServicios.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 6, bgcolor: COLORS.background }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Sin datos de servicios
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No hay tickets registrados en el período seleccionado
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
</Grid>
      </Grid>
    </Box>
  );
};
