'use client';
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// @ts-ignore: Suppress module not found / not a module TypeScript error for ticketModal
import  TicketModal  from '../components/ticketModal'; // Asegura ajustar la ruta de importación

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  // Esta función recibirá el payload final listo para enviar a MongoDB o tu API
  const handleSaveTicket = (nuevoTicket: any) => {
    console.log("Objeto estructurado para guardar en Base de Datos:", nuevoTicket);
    // Aquí puedes hacer tu: fetch('/api/tickets', { method: 'POST', body: JSON.stringify(nuevoTicket) })
    alert(`Ticket Guardado Exitosamente: ${nuevoTicket.ticketId}`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Image src="/NETUNO_logo.png" alt="Logo" width={300} height={100} priority />
        </Box>
       
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setModalOpen(true)}
            sx={{ bgcolor: '#000027', px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#000045' } }}
          >
            Agregar Incidencia (Ticket)
          </Button>
        </Box>
      </motion.div>

      {/* Llamada al componente Modal */}
      <TicketModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveTicket} 
      />
    </Box>
  );
}