"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { 
  Box, 
  Typography, 
  Button, 
  Container,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFoundPage() {
  const router = useRouter();

  // Variantes de animación para Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const floatVariants: Variants = {
    animate: {
    y: [0, -10, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut", // TypeScript lo ve como tipo 'string' genérico
    },
  },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "#eef0f8", // ✅ Fondo claro solicitado
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}
    >
      {/* Elementos decorativos flotantes de fondo (ajustados para fondo claro) */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.1)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(236, 72, 153, 0.1)",
          filter: "blur(50px)",
          animationDelay: "1s"
        }}
      />

      <Container maxWidth="md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: "center" }}
        >
          {/* Número 404 Gigante con efecto (Gradiente más oscuro para contraste) */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "8rem", md: "12rem" },
                fontWeight: 900,
                background: "linear-gradient(to right, #2563eb, #7c3aed, #db2777)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
                mb: 2,
                textShadow: "0 10px 30px rgba(37, 99, 235, 0.15)",
              }}
            >
              404
            </Typography>
          </motion.div>

          {/* Mensaje con personalidad (Colores oscuros para legibilidad) */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h4"
              sx={{
                color: "#0f172a",
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              La página que estás buscando no existe.

            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#475569",
                maxWidth: "500px",
                mx: "auto",
                mb: 4,
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
             La página que estás buscando no está disponible. Pero no te preocupes, estamos trabajando en ello con ElGe.
            </Typography>
          </motion.div>

          {/* Botones de acción (Ajustados para fondo claro) */}
          <motion.div 
            variants={itemVariants}
            style={{ 
              display: "flex", 
              gap: "16px", 
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/tickets")}
              startIcon={<HomeIcon />}
              sx={{
                bgcolor: "#2563eb",
                color: "white",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  boxShadow: "0 12px 25px rgba(37, 99, 235, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Volver al Inicio
            </Button>
        
          </motion.div>

          {/* Elemento decorativo inferior */}
          <motion.div 
            variants={itemVariants}
            style={{ marginTop: "60px", opacity: 0.5 }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 40, color: "#64748b" }} />
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}