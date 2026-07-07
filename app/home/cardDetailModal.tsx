'use client';
import React from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';

interface TicketDetailModalProps {
  open: boolean;
  onClose: () => void;
  ticket: {
    caseNumber: string;
    subject: string;
    email: string;
    status: string; // 'ACTIVO' | 'PRELIMINAR' | 'CERRADO'
    responsable: string; // Nombre completo mapeado externamente
    detallesAdicionales?: string;
  } | null;
  onEditClick?: () => void;
}

export function TicketDetailModal({ open, onClose, ticket, onEditClick }: TicketDetailModalProps) {
  return (
    <AnimatePresence>
      {open && ticket && (
        console.log("Ticket Detail:", ticket),
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
                boxShadow: '0px 10px 40px rgba(0,0,0,0.06), 0px 20px 70px rgba(0,0,20,0.04)',
                bgcolor: '#ffffff', position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Barra de estado estética superior */}
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                bgcolor: ticket.status === 'ACTIVO' ? '#22c55e' : ticket.status === 'PRELIMINAR' ? '#eab308' : '#ef4444'
              }} />

              {/* Cabecera */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ConfirmationNumberIcon sx={{ color: '#080769', fontSize: '1.3rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Ficha Técnica del Caso
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                
                    <Tooltip title="Editar Registro">
                      <IconButton 
                        onClick={onEditClick} 
                        size="small" 
                        sx={{ color: '#080769', '&:hover': { bgcolor: '#0807690a' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                
                  <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

              {/* Grid de Información Genérica */}
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Asunto de Caso 
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5, lineHeight: 1.4 }}>
                    {ticket.subject}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Número de Caso
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5', bgcolor: '#4f46e50d', px: 1, py: 0.4, borderRadius: '6px', display: 'inline-block' }}>
                      {ticket.caseNumber}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                   Posee afectacion
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.8, wordBreak: 'break-all' }}>
                    {ticket.caseNumber || "-"}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Estado
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={ticket.status} 
                      size="small"
                      sx={{ 
                        fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 0.5,
                        bgcolor: ticket.status === 'ACTIVO' ? '#e8f5e9' : ticket.status === 'PRELIMINAR' ? '#fff9c4' : '#ffebee',
                        color: ticket.status === 'ACTIVO' ? '#2e7d32' : ticket.status === 'PRELIMINAR' ? '#f57f17' : '#c62828'
                      }} 
                    />
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Box sx={{ bgcolor: '#f8fafc', p: 2.5, borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: '#4f46e5', fontSize: '2rem', bgcolor: '#ffffff', p: 0.8, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} />
                    <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                        Responsable Asignado
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      
                        {ticket.responsable || "-"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}