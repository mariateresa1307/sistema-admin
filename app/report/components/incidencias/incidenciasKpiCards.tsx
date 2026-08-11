'use client';
import React from 'react';
import { Paper, Typography, Box, Grid, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { IncidenciaTotales } from '../../hooks/useIncidenciasData';

interface KpiItemProps {
  title: string;
  count: number;
  suffix: string;
  color: string;
  icon: React.ReactElement<{ sx?: any }>;
}

const KpiItem = ({ title, count, suffix, color, icon }: KpiItemProps) => (
  <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: '24px',
        borderRadius: '10px',
        bgcolor: '#ffffff',
        border: `1px solid ${alpha(color, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 12px 24px -8px ${alpha(color, 0.3)}`,
          borderColor: alpha(color, 0.4),
        },
      }}
    >
      {/* Background accent */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: alpha(color, 0.06),
          transition: '0.3s',
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#64748b',
            backgroundColor: alpha(color, 0.1),
            px: 2,
            py: 1,
            borderRadius: '9999px',
          }}
        >
          {title}
        </Typography>
        <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { sx: { fontSize: '1.2rem' } })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {count.toLocaleString('es-VE')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#8fa6c7', fontWeight: 500 }}>
          {suffix}
        </Typography>
      </Box>
    </Paper>
  </motion.div>
);

export const IncidenciasKpiCards = ({ totales }: { totales: IncidenciaTotales }) => {
  const cardsData: KpiItemProps[] = [
    {
      title: 'Total Incidencias',
      count: totales.total,
      suffix: 'casos',
      color: '#4f46e5',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Abiertas',
      count: totales.abiertas,
      suffix: 'casos',
      color: '#f59e0b',
      icon: <WarningAmberIcon />,
    },
    {
      title: 'Cerradas',
      count: totales.cerradas,
      suffix: 'casos',
      color: '#10b981',
      icon: <CheckCircleOutlineIcon />,
    },
    {
      title: 'Servicios Afectados',
      count: totales.servicios,
      suffix: 'servicios',
      color: '#ef4444',
      icon: <SettingsEthernetIcon />,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cardsData.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
          <KpiItem {...card} />
        </Grid>
      ))}
    </Grid>
  );
};