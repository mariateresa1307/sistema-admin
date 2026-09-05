"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
} from "@mui/material";
import { 
  Close as CloseIcon, 
  Visibility, 
  VisibilityOff,
  LockOutlined, 
  Security, 
  CheckCircleOutline 
} from "@mui/icons-material";
import { changePassword } from '@/lib/api';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return setError("Todos los campos son obligatorios");
    }
    if (formData.newPassword.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Las contraseñas nuevas no coinciden");
    }
    if (formData.currentPassword === formData.newPassword) {
      return setError("La nueva contraseña debe ser diferente a la actual");
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setSuccess("✅ Contraseña actualizada correctamente");
      setTimeout(() => {
        onClose();
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } 
      }}
    >
      <DialogTitle 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          bgcolor: '#080769',
          color: "white",
          p: 3,
          borderRadius: '16px 16px 0 0',
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
            <Security sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              Cambiar Contraseña
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
              Actualiza tus credenciales de acceso
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ color: "white", bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555', marginTop: '10px' }}>Contraseña Actual</Typography>
            <TextField
              required fullWidth name="currentPassword"
              type={showPwd.current ? "text" : "password"} value={formData.currentPassword} onChange={handleChange}
              placeholder="Ingresa tu contraseña actual" 
              helperText="Ingresa tu contraseña actual para verificar tu identidad"
              autoComplete="current-password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#080769' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })} edge="end" sx={{ color: '#999' }}>
                      {showPwd.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3, bgcolor: '#f8f9ff',
                  '&:hover': { bgcolor: '#f0f2ff' },
                  '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 0 0 3px rgba(8, 7, 105, 0.1)' },
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>Nueva Contraseña</Typography>
            <TextField
              required fullWidth name="newPassword"
              type={showPwd.new ? "text" : "password"} value={formData.newPassword} onChange={handleChange}
              placeholder="Mínimo 6 caracteres" helperText="Debe tener al menos 6 caracteres" autoComplete="new-password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Security sx={{ color: '#764ba2' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })} edge="end" sx={{ color: '#999' }}>
                      {showPwd.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3, bgcolor: '#f8f9ff',
                  '&:hover': { bgcolor: '#f0f2ff' },
                  '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 0 0 3px rgba(118, 75, 162, 0.1)' },
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>Confirmar Nueva Contraseña</Typography>
            <TextField
              required fullWidth name="confirmPassword"
              type={showPwd.confirm ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirma tu nueva contraseña" autoComplete="new-password"
              InputProps={{
                startAdornment: <InputAdornment position="start"><CheckCircleOutline sx={{ color: '#48bb78' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} edge="end" sx={{ color: '#999' }}>
                      {showPwd.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3, bgcolor: '#f8f9ff',
                  '&:hover': { bgcolor: '#f0f2ff' },
                  '&.Mui-focused': { bgcolor: '#fff', boxShadow: '0 0 0 3px rgba(72, 187, 120, 0.1)' },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
        <Button 
          onClick={onClose} variant="outlined" disabled={loading}
          sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 600, textTransform: 'none', fontSize: '0.95rem', borderColor: '#ddd', color: '#666', '&:hover': { borderColor: '#999', bgcolor: '#f5f5f5' } }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit} variant="contained" disabled={loading}
          startIcon={loading ? null : <Security />}
          sx={{
            px: 4, py: 1.5, borderRadius: 3, fontWeight: 600, textTransform: 'none', fontSize: '0.95rem',
            bgcolor: '#080769',
            '&:hover': { bgcolor: '#060550', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(8, 7, 105, 0.4)' },
            '&:disabled': { bgcolor: '#ccc', boxShadow: 'none' },
          }}
        >
          {loading ? "Cambiando..." : "Cambiar Contraseña"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};