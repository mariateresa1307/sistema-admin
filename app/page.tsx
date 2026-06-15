"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation'; 
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Link,
  InputAdornment,
} from '@mui/material';
import { Mail, Lock, Hub as HubIcon } from '@mui/icons-material';
import { motion, Variants } from 'motion/react';
import api from '@/../src/lib/api';

const glassColors = {
  fondoGradiente: 'linear-gradient(135deg, #1a0033 0%, #000000 100%)',
  panelVidrio: 'rgb(255 255 255 / 64%)', 
  burbujaPrimaria: '#ffffff',
  burbujaSecundaria: '#6d00fc',
  burbujaTercera: '#6d00fc',
  textoSuave: 'rgba(255, 255, 255, 0.6)',
};

const containerVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

const bounceVariants: Variants = {
  animate: () => ({
    x: [Math.random() * 100 - 50, Math.random() * 200 - 100, Math.random() * -200 + 100, 0],
    y: [Math.random() * 100 - 50, Math.random() * 300 - 150, Math.random() * -300 + 150, 0],
    transition: {
      duration: 4 + Math.random() * 2, 
      repeat: Infinity,
      repeatType: "reverse",
      ease: "linear",
    }
  })
};

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await api.post('/auth/login', {
        email: email,
        clave: password,
      });

      if (response.data) {
        // ✅ Guardar token
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
        }
        
        // ✅ Guardar usuario COMPLETO
        if (response.data.user) {
          const userData = response.data.user;
          
          // ✅ CORREGIDO: Normalizar roles a español (consistente con AuthContext)
          const roleMap: Record<string, string> = {
            'administrador': 'admin',
            'admin': 'admin',
            'operador': 'operador',      // ← CAMBIADO: era 'operator'
            'operator': 'operador',      // ← CAMBIADO: era 'operator'
            'editor': 'editor',          // ← CAMBIADO: era 'operator_edit'
            'operator_edit': 'editor',   // ← CAMBIADO: era 'operator_edit'
            'operator editor': 'editor', // ← NUEVO
            'operador editor': 'editor', // ← NUEVO
          };
          
          userData.role = roleMap[userData.role?.toLowerCase()] || 'operador';
          
          console.log("✅ Usuario guardado con role:", userData.role);
          console.log("✅ Usuario completo:", userData);
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        window.location.href = '/home';
      }
    } catch (error: any) {
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Credenciales incorrectas'}`);
      } else {
        alert("Error de conexión. Verifica que el Backend esté activo.");
      }
    }
  };

  const burbujas = [
    { s: 350, t: '10%', l: '5%', c: glassColors.burbujaSecundaria },
    { s: 250, t: '70%', l: '15%', c: glassColors.burbujaPrimaria },
    { s: 280, t: '50%', l: '75%', c: glassColors.burbujaPrimaria },
    { s: 400, t: '-5%', l: '45%', c: glassColors.burbujaPrimaria },
    { s: 320, t: '20%', l: '85%', c: glassColors.burbujaTercera },
  ];

  return (
    <Box sx={{ 
      height: '100vh', width: '100vw', display: 'flex', 
      alignItems: 'center', justifyContent: 'center',
      background: glassColors.fondoGradiente, overflow: 'hidden', position: 'relative'
    }}>
      <CssBaseline />

      {burbujas.map((b, i) => (
        <motion.div
          key={i}
          variants={bounceVariants}
          animate="animate"
          style={{
            position: 'absolute', width: b.s, height: b.s, top: b.t, left: b.l,
            borderRadius: '50%', background: b.c, filter: 'blur(90px)',
            opacity: 0.25, zIndex: 0
          }}
        />
      ))}

      <motion.div variants={containerVariants} initial="initial" animate="animate" style={{ zIndex: 1 }}>
        <Box sx={{
          width: { xs: '90vw', md: '550px' },
          p: { xs: 4, md: 6 },
          borderRadius: '30px',
          backgroundColor: glassColors.panelVidrio,
          backdropFilter: 'blur(30px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <HubIcon sx={{ fontSize: 50, color: 'white' }} />
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, letterSpacing: '1px' }}>
              NOC HELPDESK
            </Typography>
            <Typography sx={{ color: glassColors.textoSuave, mt: 0.5, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Gestión de Servicios
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth variant="standard" placeholder="Email" name="email" margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Mail sx={{ color: 'white', opacity: 0.7 }} /></InputAdornment>,
                style: { color: 'white', fontSize: '1.1rem', paddingBottom: '10px' }
              }}
              sx={{ '& .MuiInput-underlined:after': { borderBottomColor: glassColors.burbujaSecundaria }, mb: 3 }}
            />

            <TextField
              fullWidth variant="standard" placeholder="Password" name="password" type="password" margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'white', opacity: 0.7 }} /></InputAdornment>,
                style: { color: 'white', fontSize: '1.1rem', paddingBottom: '10px' }
              }}
              sx={{ '& .MuiInput-underlined:after': { borderBottomColor: glassColors.burbujaSecundaria }, mb: 5 }}
            />

            <Button 
              fullWidth type="submit"
              sx={{ 
                bgcolor: glassColors.burbujaSecundaria, color: 'white', py: 1.8,
                borderRadius: '30px', textTransform: 'none', fontWeight: 'bold',
                fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(109, 0, 252, 0.4)',
                '&:hover': { bgcolor: '#5a00d1', transform: 'translateY(-2px)' },
                transition: 'all 0.3s'
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}