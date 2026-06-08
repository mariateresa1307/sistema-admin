'use client';
import React from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid'; 
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

interface ServiceData {
  _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipo_cliente: string;
  ipNetuno: string;
  id_netuno: string;
  idRBS?: string; 
  id_circuito?: string;
  idServicio?: string;
  serialONT?: string;
  nodoA?: string;
  nodoB?: string;
  nodoOLT?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
  instalado?: boolean;
}

interface CardSeeServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: ServiceData | null;
  onEditClick?: () => void;
}

export const CardSeeServiceModal = ({ open, onClose, service, onEditClick }: CardSeeServiceModalProps) => {
  
  if (!service) return null;

  // Función para obtener campos dinámicos según el tipo de servicio
  const getDynamicFields = (s: ServiceData) => {
    switch (s.tipoServicio) {
      case "METROLAN":
        return [
          { label: "NOMBRE CLIENTE ", value: s.name },
           { label: "ID SERVICIO", value: s.id_circuito },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
           { label: "IP NETUNO", value: s.ipNetuno },
          { label: "VLAN", value: s.vlan }
        ];
      case "RBS":
        return [
          { label: "ID NETUNO", value: s.id_netuno },
          { label: "ID RBS", value: s.idRBS },
          { label: "SERIAL ONT", value: s.serialONT },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
          { label: "NODO OLT", value: s.nodoOLT }
        ];
      case "IU":
        return [
          { label: "NOMBRE DE ENLACE", value: s.name },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB }
        ];
      case "DOG":
        return [
          { label: "CONTRATO", value: s.contrato },
          { label: "ID DOG", value: s.id_circuito },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
          { label: "NODO OLT", value: s.nodoOLT },
          { label: "SERIAL ONT", value: s.serialONT }
        ];
      case "Redes Compartidas":
        return [
          {label: "NOMBRE CLIENTE", value: s.name },
          { label: "CONTRATO", value: s.contrato },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "IP NETUNO", value: s.ipNetuno },
        ];
      default:
        return [];
    }
  };

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
                bgcolor: service.status === "Activo" ? '#22c55e' : '#f59e0b'
              }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SettingsEthernetIcon sx={{ color: '#080769', fontSize: '1.5rem' }} />
                  <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Detalles del Servicio
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {onEditClick && (
                    <Tooltip title="Editar">
                      <IconButton onClick={onEditClick} size="small"><EditIcon /></IconButton>
                    </Tooltip>
                  )}
                  <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

              <Grid container spacing={3}>
             
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block' }}>ESTADO</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={service.status === "Activo" ? "Activo" : "Inactivo"} 
                      size="small" 
                      color={service.status === "Activo" ? "success" : "warning"}
                    />
                  </Box>
                </Grid>

                {getDynamicFields(service).map((field, idx) => (
                  <Grid key={idx} size={{ xs: 12, sm: 5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block' }}>{field.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{field.value || '—'}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};