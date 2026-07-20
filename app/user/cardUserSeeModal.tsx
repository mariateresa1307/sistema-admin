'use client';
import React, { useMemo } from 'react';
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip, Button, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface UsuarioData {
  _id?: string;
  username: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  role: string;
  isActive: boolean; 
  updatedAt?: string | Date; // ✅ Agregado para calcular los 30 días
}

interface CardSeeModalProps {
  open: boolean;
  onClose: () => void;
  user: UsuarioData | null;
  onEditClick?: () => void;
  onDeleteClick?: () => void; // ✅ Agregado para manejar la eliminación desde el padre
}

export function CardSeeModal({ open, onClose, user, onEditClick, onDeleteClick }: CardSeeModalProps) {
  
  React.useEffect(() => {
    if (open) {
      console.log("Data que llegó a CardSeeModal:", user);
    }
  }, [open, user]);

  const nombreCompleto = user 
    ? `${user.primerNombre || ""} ${user.segundoNombre || ""} ${user.primerApellido || ""} ${user.segundoApellido || ""}`.replace(/\s+/g, ' ').trim()
    : '';

  // Función para obtener la configuración visual del rol
  const getRoleConfig = (role: string) => {
    const roleConfigs: Record<string, { label: string; bgcolor: string; color: string; icon: string }> = {
      admin: { label: 'Administrador', bgcolor: '#e3f2fd', color: '#1565c0', icon: '👑' },
      operador: { label: 'Operador', bgcolor: '#fff3e0', color: '#e65100', icon: '⚙️' },
      editor: { label: 'Operator Editor', bgcolor: '#f3e5f5', color: '#6a1b9a', icon: '👨‍💻' },
    };
    return roleConfigs[role] || { label: role, bgcolor: '#f5f5f5', color: '#616161', icon: '👤' };
  };

  const roleConfig = user ? getRoleConfig(user.role || 'editor') : null;

  // ✅ LÓGICA: Verificar si el usuario lleva más de 30 días inactivo
  const canDeleteUser = useMemo(() => {
    if (!user || user.isActive) return false; // Si está activo, no se puede eliminar
    
    const fechaReferencia = new Date(user.updatedAt || Date.now());
    const hoy = new Date();
    
    const diferenciaMs = Math.abs(hoy.getTime() - fechaReferencia.getTime());
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    
    return diferenciaDias > 30;
  }, [user]);

  return (
    <AnimatePresence>
      {open && user && (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35 }}
            style={{ width: '100%', maxWidth: '550px', outline: 'none' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4, borderRadius: '18px', border: '1px solid #eaedf1',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.06), 0px 20px 70px rgba(0,0,20,0.04)',
                bgcolor: '#ffffff', position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Barra superior de estado */}
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                bgcolor: user.isActive ? '#22c55e' : '#ef4444'
              }} />

              {/* Cabecera */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountCircleIcon sx={{ color: '#080769', fontSize: '1.5rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Detalles de Usuario
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {onEditClick && (
                    <Tooltip title="Editar Usuario">
                      <IconButton 
                        onClick={onEditClick} 
                        size="small" 
                        sx={{ color: '#080769', '&:hover': { bgcolor: '#0807690a' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

              <Grid container spacing={3}>
                {/* Usuario */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Usuario
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#4f46e5', bgcolor: '#4f46e50d', px: 1, py: 0.4, borderRadius: '6px', display: 'inline-block' }}>
                      @{user.username || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Estado */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Estado
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={user.isActive ? "Activo" : "Inactivo"} 
                      size="small"
                      sx={{ 
                        fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1,
                        bgcolor: user.isActive ? '#e8f5e9' : '#ffebee',
                        color: user.isActive ? '#2e7d32' : '#c62828'
                      }} 
                    />
                  </Box>
                </Grid>

                {/* Nombre y Apellido */}
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Nombre y Apellido
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', mt: 0.5 }}>
                    {nombreCompleto || '—'}
                  </Typography>
                </Grid>

                {/* Rol de Usuario */}
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Rol de Usuario
                  </Typography>
                  <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip 
                      icon={
                        <Box component="span" sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
                          {roleConfig?.icon}
                        </Box>
                      }
                      label={roleConfig?.label || 'N/A'} 
                      size="small"
                      sx={{ 
                        fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1,
                        bgcolor: roleConfig?.bgcolor || '#f5f5f5',
                        color: roleConfig?.color || '#616161',
                        '& .MuiChip-icon': { color: roleConfig?.color || '#616161', ml: '6px' }
                      }} 
                    />
                  </Box>
                </Grid>

                {/* Correo */}
                <Grid size={12}>
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mt: 0.5, wordBreak: 'break-all' }}>
                    {user.email || '—'}
                  </Typography>
                </Grid>
              </Grid>

              {/* ✅ SECCIÓN DE ELIMINACIÓN CONDICIONAL (Solo si está inactivo) */}
              {!user.isActive && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                  {canDeleteUser ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Alert severity="warning" sx={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                        Este usuario lleva <strong>más de 30 días</strong> inactivo en el sistema.
                      </Alert>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={onDeleteClick}
                        fullWidth
                        sx={{ 
                          borderRadius: '8px', 
                          textTransform: 'none', 
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                          '&:hover': { boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)' }
                        }}
                      >
                        Eliminar Usuario Permanentemente
                      </Button>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: '8px', fontSize: '0.85rem', bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                      ℹ️ El usuario debe permanecer inactivo por más de 30 días antes de poder ser eliminado del sistema.
                    </Alert>
                  )}
                </Box>
                )}

            </Paper>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}