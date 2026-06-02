'use client';
import React from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

// 1. DEFINICIÓN DE LA INTERFAZ
interface ServiceData {
 _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipo_cliente: string;
  idNetuno: string;
  idRBS?: string; 
  idDOG?: string;
  idServicio?: string;
  serialONT?: string;
  nodeA?: string;
  nodeB?: string;
  oltnode?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
   instalado?: boolean;
}

// 2. LA INTERFAZ QUE EL COMPONENTE USA
interface CardSeeServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: ServiceData | null;
  onEditClick?: () => void;
}


export const CardSeeServiceModal = ({ open, onClose, service, onEditClick }: CardSeeServiceModalProps) => {
  
  if (!service) return null;

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            style={{ width: '100%', maxWidth: '600px', outline: 'none' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4, borderRadius: '18px', border: '1px solid #eaedf1',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.06)',
                bgcolor: '#ffffff', position: 'relative', overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                bgcolor: service.instalado ? '#22c55e' : '#f59e0b'
              }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SettingsEthernetIcon sx={{ color: '#080769', fontSize: '1.5rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Detalles del Servicio
                  </Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
              </Box>

              <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>ID NETUNO</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5' }}>{service.idNetuno}</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>ESTADO</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={service.instalado ? "Instalado" : "Pendiente"} size="small" />
                  </Box>
                </Grid>
                
               
              </Grid>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};