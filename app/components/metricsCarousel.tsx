'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface MetricsCarouselProps {
  metrics: {
    total: number;
    preliminar: number;
    activo: number;
    cerrado: number;
  };
}

export function MetricsCarousel({ metrics }: MetricsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ right: 0, left: 0 });

  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setDragConstraints({ right: 0, left: offsetWidth - scrollWidth - 30 });
    }
  }, [metrics]);

  const cardsData = [
    { title: "Total Incidencias", count: metrics.total, color: "#4f46e5", icon: <AssessmentIcon sx={{ fontSize: '1.4rem', color: '#4f46e5' }} /> },
    { title: "Preliminares", count: metrics.preliminar, color: "#eab308", icon: <WarningAmberIcon sx={{ fontSize: '1.4rem', color: '#eab308' }} /> },
    { title: "Casos Activos", count: metrics.activo, color: "#22c55e", icon: <AssignmentIcon sx={{ fontSize: '1.4rem', color: '#22c55e' }} /> },
    { title: "Casos Cerrados", count: metrics.cerrado, color: "#ef4444", icon: <CheckCircleOutlineIcon sx={{ fontSize: '1.4rem', color: '#ef4444' }} /> },
  ];

  return (
    <Box 
      ref={carouselRef}
      sx={{ 
        mb: 4, width: '100%', overflow: 'hidden', cursor: 'grab', py: 1, px: 0.5,
        '&:active': { cursor: 'grabbing' },
        position: 'relative',
        '&::before, &::after': { content: '""', height: '100%', width: '40px', position: 'absolute', zIndex: 2, pointerEvents: 'none' },
        '&::before': { left: 0, top: 0, background: 'linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0) 100%)' },
        '&::after': { right: 0, top: 0, background: 'linear-gradient(to left, #ffffff 0%, rgba(255,255,255,0) 100%)' }
      }}
    >
      <motion.div
        drag="x" dragConstraints={dragConstraints} dragElastic={0.15}
        style={{ display: 'flex', gap: '20px', width: 'max-content' }}
      >
        {cardsData.map((card, index) => (
          <motion.div key={index} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <Paper
              elevation={0}
              sx={{
                width: '255px', p: '22px', borderRadius: '14px', bgcolor: '#ffffff', border: '1px solid #eaedf1',
                boxShadow: '0px 2px 6px rgba(0, 0, 20, 0.02), 0px 8px 24px rgba(0, 0, 30, 0.04)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', userSelect: 'none',
                '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${card.color} 0%, rgba(255,255,255,0) 100%)`, opacity: 0.85 }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: card.color, boxShadow: `0px 0px 6px ${card.color}` }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '0.68rem' }}>
                    {card.title}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: `${card.color}0a`, p: 0.8, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-1px', fontSize: '2.1rem' }}>{card.count}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>casos</Typography>
              </Box>
            </Paper>
          </motion.div>
        ))}
      </motion.div>
    </Box>
  );
}