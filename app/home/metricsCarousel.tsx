'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getTicketsStats } from '@/lib/api';
import { useHomeRefresh } from '../context/homeRefreshContext';

interface MetricsState {
    totalIncidencias: number;
    enGestion: number;
    casosActivos: number;
    casosCerrados: number;
}

export function MetricsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });
  const { refreshKey } = useHomeRefresh();
  const [ state, setState] = useState<MetricsState>({
    totalIncidencias: 0 , enGestion: 0, casosActivos: 0, casosCerrados: 0
  })


  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setDragConstraints({ right: 0, left: offsetWidth - scrollWidth - 30 });
    }
  }, [carouselRef]);

  useEffect(() => {
    getTicketsStats().then(ticketsStats => {
      setState(ticketsStats.data)
    })
  }, [refreshKey])

  const cardsData: { title: string; count: number; color: string; icon: React.ReactElement<{ sx?: any }> }[] = [
    { title: "Total Incidencias", count: state.totalIncidencias, color: "#4f46e5", icon: <AssessmentIcon /> },
    { title: "En gestión", count: state.enGestion, color: "#f59e0b", icon: <WarningAmberIcon /> },
    { title: "Casos Activos", count: state.casosActivos, color: "#10b981", icon: <AssignmentIcon /> },
    { title: "Casos Cerrados", count: state.casosCerrados, color: "#ef4444", icon: <CheckCircleOutlineIcon /> },
  ];

  return (
    <Box 
      ref={carouselRef}
      sx={{ 
        mb: 5, width: '100%', overflow: 'hidden', cursor: 'grab', py: 2,
        '&:active': { cursor: 'grabbing' }
      }}
    >
      <motion.div
        drag="x" dragConstraints={dragConstraints} dragElastic={0.1}
        style={{ display: 'flex', gap: '24px', width: 'max-content' }}
      >
        {cardsData.map((card, index) => (
          <motion.div key={index} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Paper
              elevation={0}
              sx={{
                width: '260px',
                p: '24px',
                borderRadius: '10px',
                bgcolor: '#f4f6f9',
                border: `1px solid ${alpha(card.color, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 12px 24px -8px ${alpha(card.color, 0.3)}`,
                  borderColor: alpha(card.color, 0.4)
                }
              }}
            >
              {/* Background accent */}
              <Box sx={{ 
                position: 'absolute', top: -20, right: -20, width: 80, height: 80, 
                borderRadius: '50%', bgcolor: alpha(card.color, 0.06), transition: '0.3s' 
              }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', backgroundColor: alpha(card.color, 0.1), px: 2, py: 1, borderRadius: '9999px' }}>
                  {card.title}
                </Typography>
                <Box sx={{ color: card.color, display: 'flex', alignItems: 'center' }}>
                  {React.cloneElement(card.icon , { sx: { fontSize: '1.2rem' } })}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {card.count}
                </Typography>
                <Typography variant="body2" sx={{ color: '#8fa6c7', fontWeight: 500 }}>casos</Typography>
              </Box>
            </Paper>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}