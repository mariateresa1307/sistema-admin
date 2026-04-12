'use client';
import DashboardLayout from '../components/DashboardLayout';
import { Box, Typography } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Image src="/NETUNO_logo.png" alt="Logo" width={300} height={100} priority />
          </Box>
          <Typography variant="h3" align="center" sx={{ color: '#000027', fontWeight: 600 }}>
            Bienvenido al Sistema
          </Typography>
        </motion.div>
      </Box>
    </DashboardLayout>
  );
}