"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Paper, Chip, Avatar, IconButton,
  ToggleButtonGroup, ToggleButton
} from "@mui/material";
import {
  WbSunny, NightsStay, WbTwilight, Refresh,
  Leaderboard, Assignment, Person, WarningAmber,
  ArrowUpward, ArrowDownward, Remove
} from "@mui/icons-material";
import { motion } from "framer-motion";

//  PALETA CORPORATIVA NETUNO - EDICIÓN ÉPICA
const COLORS = {
  primary: "#080769",
  primaryDark: "#050548",
  primaryLight: "#1a1a8f",
  bg: "#ffffff",
  surface: "#fafbfc",
  border: "#e8ecf1",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#000000",
  success: "#10b981",
  successBg: "#ecfdf5",
  warning: "#f59e0b",
  warningBg: "#fffbeb",
  error: "#ef4444",
  errorBg: "#fef2f2",
  gold: "#fbbf24",
  goldDark: "#d97706",
  goldLight: "#fffae8",
  goldGlow: "rgba(251, 191, 36, 0.3)",
  silver: "#94a3b8",
  silverDark: "#64748b",
  silverLight: "#f1f5f9",
  bronze: "#d97706",
  bronzeDark: "#92400e",
  bronzeLight: "#f8eeea",
};

type Turno = "dia" | "tarde" | "noche";
type Estado = "online" | "break" | "offline";

interface OperadorStats {
  id: string;
  nombre: string;
  avatar: string;
  turno: Turno;
  estado: Estado;
  ticketsAsignados: number;
  ticketsEnGestion: number;
  ticketsResponsable: number;
  tendencia: number[];
}

const MOCK_OPERADORES: OperadorStats[] = [
  { id: "1", nombre: "Dinalba Navas", avatar: "DN", turno: "dia", estado: "online", ticketsAsignados: 31, ticketsEnGestion: 14, ticketsResponsable: 28, tendencia: [18, 20, 22, 24, 25, 27, 28] },
  { id: "2", nombre: "Karen Archila", avatar: "KA", turno: "noche", estado: "offline", ticketsAsignados: 31, ticketsEnGestion: 10, ticketsResponsable: 25, tendencia: [28, 27, 26, 25, 24, 23, 22] },
  { id: "3", nombre: "Alejandro Alvis", avatar: "AA", turno: "tarde", estado: "online", ticketsAsignados: 36, ticketsEnGestion: 11, ticketsResponsable: 22, tendencia: [15, 16, 17, 18, 19, 20, 22] },
  { id: "4", nombre: "Ares Cirina", avatar: "AC", turno: "dia", estado: "online", ticketsAsignados: 24, ticketsEnGestion: 18, ticketsResponsable: 20, tendencia: [18, 19, 19, 20, 20, 20, 20] },
  { id: "5", nombre: "Ares Concepción", avatar: "AC", turno: "dia", estado: "online", ticketsAsignados: 28, ticketsEnGestion: 17, ticketsResponsable: 18, tendencia: [12, 13, 14, 15, 16, 17, 18] },
  { id: "6", nombre: "José Madera", avatar: "JM", turno: "dia", estado: "online", ticketsAsignados: 29, ticketsEnGestion: 17, ticketsResponsable: 15, tendencia: [20, 19, 18, 17, 16, 15, 15] },
  { id: "7", nombre: "Harrío Armiel", avatar: "HA", turno: "tarde", estado: "break", ticketsAsignados: 16, ticketsEnGestion: 16, ticketsResponsable: 12, tendencia: [10, 11, 11, 12, 12, 12, 12] },
  { id: "8", nombre: "Alejark Alas", avatar: "AA", turno: "noche", estado: "offline", ticketsAsignados: 21, ticketsEnGestion: 16, ticketsResponsable: 10, tendencia: [15, 14, 13, 12, 11, 10, 10] },
  { id: "9", nombre: "Alejandro AL", avatar: "AL", turno: "dia", estado: "break", ticketsAsignados: 39, ticketsEnGestion: 10, ticketsResponsable: 8, tendencia: [5, 6, 6, 7, 7, 8, 8] },
  { id: "10", nombre: "Maria Fernanda Fernandez", avatar: "MF", turno: "tarde", estado: "online", ticketsAsignados: 32, ticketsEnGestion: 18, ticketsResponsable: 7, tendencia: [6, 6, 7, 7, 7, 7, 7] },
  { id: "11", nombre: "Andre Pimentel", avatar: "AP", turno: "noche", estado: "online", ticketsAsignados: 32, ticketsEnGestion: 10, ticketsResponsable: 6, tendencia: [8, 7, 7, 7, 6, 6, 6] },
  { id: "12", nombre: "Katherina Nava", avatar: "KN", turno: "dia", estado: "break", ticketsAsignados: 39, ticketsEnGestion: 18, ticketsResponsable: 5, tendencia: [3, 4, 4, 4, 5, 5, 5] },
];

const TURNO_CONFIG: Record<Turno, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  dia: { label: "Día", icon: WbSunny, color: "#f59e0b", bg: "#fffbeb" },
  tarde: { label: "Tarde", icon: WbTwilight, color: "#8b5cf6", bg: "#f5f3ff" },
  noche: { label: "Noche", icon: NightsStay, color: "#3b82f6", bg: "#eff6ff" },
};

const ESTADO_CONFIG: Record<Estado, { label: string; color: string; dot: string }> = {
  online: { label: "Online", color: "#059669", dot: "#10b981" },
  break: { label: "Break", color: "#d97706", dot: "#f59e0b" },
  offline: { label: "Offline", color: "#dc2626", dot: "#ef4444" },
};

// 🎯 Contador Animado
const AnimatedCounter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display}</>;
};

// 📈 Sparkline Animado
const Sparkline = ({ data, color = COLORS.primary, height = 32, width = 80 }: { data: number[]; color?: string; height?: number; width?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");

  return (
    <motion.svg
      width={width}
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace("#", "")})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </motion.svg>
  );
};

// 📋 Fila de Ranking
const RankingRow = ({ op, rank, delay }: { op: OperadorStats; rank: number; delay: number }) => {
  const turnoCfg = TURNO_CONFIG[op.turno];
  const estadoCfg = ESTADO_CONFIG[op.estado];
  const TurnoIcon = turnoCfg.icon;
  const tendenciaDiff = op.tendencia[op.tendencia.length - 1] - op.tendencia[0];
  const tendenciaColor = tendenciaDiff > 0 ? COLORS.success : tendenciaDiff < 0 ? COLORS.error : COLORS.textMuted;

  const getRowStyle = () => {
    if (rank === 1) return { 
      bg: COLORS.goldLight, 
      border: COLORS.gold, 
      glow: COLORS.goldGlow,
      badgeBg: COLORS.gold,
      avatarSize: 56,
      badgeSize: 44
    };
    if (rank === 2) return { 
      bg: "#e7e7ff", 
      border: "#93c5fd", 
      glow: "rgba(147, 197, 253, 0.3)",
      badgeBg: "#60a5fa",
      avatarSize: 52,
      badgeSize: 40
    };
    if (rank === 3) return { 
      bg: COLORS.bronzeLight, 
      border: COLORS.bronze, 
      glow: "rgba(217, 119, 6, 0.3)",
      badgeBg: COLORS.bronze,
      avatarSize: 52,
      badgeSize: 40
    };
    return { 
      bg: "white", 
      border: COLORS.border, 
      glow: "transparent",
      badgeBg: "#f1f5f9",
      avatarSize: 44,
      badgeSize: 36
    };
  };

  const rowStyle = getRowStyle();
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: isTop3 ? 1.02 : 1.01, transition: { duration: 0.15 } }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "70px 2.5fr 1fr 1fr 1fr 1.2fr",
          gap: 2,
          px: 3,
          py: isTop3 ? 2.5 : 2,
          borderBottom: `1px solid ${rowStyle.border}`,
          alignItems: "center",
          bgcolor: rowStyle.bg,
          boxShadow: rank <= 3 ? `0 4px 20px ${rowStyle.glow}` : "none",
          transition: "all 0.2s ease",
          borderRadius: isTop3 ? "12px" : "0",
          mb: isTop3 ? 1 : 0,
        }}
      >
        {/* Posición con iconos especiales para top 3 */}
        <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {rank === 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay + 0.3 }}
              style={{
                position: "absolute",
                top: -39,
                left: "26%",
                transform: "translateX(-50%)",
                fontSize: 34,
                filter: "drop-shadow(0 2px 8px rgba(251, 191, 36, 0.6))",
                zIndex: 10,
              }}
            >
              👑
            </motion.div>
          )}
          <Box
            sx={{
              width: rowStyle.badgeSize,
              height: rowStyle.badgeSize,
              borderRadius: "12px",
              bgcolor: rowStyle.badgeBg,
              color: rank <= 3 ? "white" : COLORS.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: isTop3 ? "1.3rem" : "0.9rem",
              boxShadow: rank <= 3 ? `0 4px 16px ${rowStyle.glow}` : "none",
              border: rank <= 3 ? "2px solid white" : "none",
            }}
          >
            {rank}
          </Box>
          {rank === 2 && (
            <Box
              sx={{
                position: "absolute",
                top: -16,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 24,
                filter: "drop-shadow(0 2px 6px rgba(148, 163, 184, 0.5))",
              }}
            >
              🥈
            </Box>
          )}
          {rank === 3 && (
            <Box
              sx={{
                position: "absolute",
                top: -16,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 24,
                filter: "drop-shadow(0 2px 6px rgba(217, 119, 6, 0.5))",
              }}
            >
              
            </Box>
          )}
        </Box>

        {/* Operador */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: COLORS.primary, 
              width: rowStyle.avatarSize, 
              height: rowStyle.avatarSize, 
              fontSize: isTop3 ? "1.1rem" : "0.9rem", 
              fontWeight: 800, 
              color: "white", 
              boxShadow: isTop3 ? `0 4px 16px ${rowStyle.glow}` : "0 4px 12px rgba(8, 7, 105, 0.2)" 
            }}
          >
            {op.avatar}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: isTop3 ? 900 : 800, 
                color: COLORS.text, 
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis", 
                fontSize: isTop3 ? "1.05rem" : "0.95rem" 
              }}
            >
              {op.nombre}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
              <Chip 
                icon={<TurnoIcon sx={{ fontSize: isTop3 ? 14 : 12 }} />} 
                label={turnoCfg.label} 
                size="small" 
                sx={{ 
                  height: isTop3 ? 22 : 18, 
                  fontSize: "0.65rem", 
                  bgcolor: turnoCfg.bg, 
                  color: turnoCfg.color, 
                  fontWeight: 700 
                }} 
              />
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.3, 
                  px: 0.75, 
                  height: isTop3 ? 22 : 18, 
                  borderRadius: "9px", 
                  bgcolor: estadoCfg.color + "15", 
                  fontSize: "0.65rem", 
                  fontWeight: 700, 
                  color: estadoCfg.color 
                }}
              >
                <Box 
                  sx={{ 
                    width: isTop3 ? 7 : 5, 
                    height: isTop3 ? 7 : 5, 
                    borderRadius: "50%", 
                    bgcolor: estadoCfg.dot, 
                    animation: estadoCfg.label === "Online" ? "pulse 2s infinite" : "none" 
                  }} 
                />
                {estadoCfg.label}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tickets Asignados */}
        <Box sx={{ textAlign: "center" }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              color: COLORS.primary, 
              lineHeight: 1, 
              mb: 0.25, 
              fontSize: isTop3 ? "1.8rem" : "1.6rem" 
            }}
          >
            <AnimatedCounter value={op.ticketsAsignados} />
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: COLORS.textMuted, 
              fontSize: "0.6rem", 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em" 
            }}
          >
            Asignados
          </Typography>
        </Box>

        {/* Tickets Responsable */}
        <Box sx={{ textAlign: "center" }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 900, 
              color: COLORS.goldDark, 
              lineHeight: 1, 
              mb: 0.25, 
              fontSize: isTop3 ? "1.8rem" : "1.6rem" 
            }}
          >
            <AnimatedCounter value={op.ticketsResponsable} />
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: COLORS.textMuted, 
              fontSize: "0.6rem", 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em" 
            }}
          >
            Responsable
          </Typography>
        </Box>

        {/* En Gestión */}
        <Box sx={{ textAlign: "center" }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800, 
              color: COLORS.warning, 
              lineHeight: 1, 
              mb: 0.25, 
              fontSize: isTop3 ? "1.5rem" : "1.3rem" 
            }}
          >
            <AnimatedCounter value={op.ticketsEnGestion} />
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: COLORS.textMuted, 
              fontSize: "0.6rem", 
              fontWeight: 700, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em" 
            }}
          >
            En gestión
          </Typography>
        </Box>

        {/* Tendencia */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
          <Sparkline data={op.tendencia} color={tendenciaColor} width={isTop3 ? 80 : 60} height={isTop3 ? 36 : 28} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            {tendenciaDiff > 0 && <ArrowUpward sx={{ fontSize: isTop3 ? 20 : 16, color: COLORS.success }} />}
            {tendenciaDiff < 0 && <ArrowDownward sx={{ fontSize: isTop3 ? 20 : 16, color: COLORS.error }} />}
            {tendenciaDiff === 0 && <Remove sx={{ fontSize: isTop3 ? 20 : 16, color: COLORS.textMuted }} />}
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 800, 
                color: tendenciaColor, 
                fontSize: isTop3 ? "0.85rem" : "0.75rem" 
              }}
            >
              {Math.abs(tendenciaDiff)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default function OperationsDashboard() {
  const [filtroTurno, setFiltroTurno] = useState<Turno | "todos">("todos");
  const [operadores] = useState<OperadorStats[]>(MOCK_OPERADORES);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const ranking = useMemo(() => {
    let lista = [...operadores];
    if (filtroTurno !== "todos") {
      lista = lista.filter((op) => op.turno === filtroTurno);
    }
    return lista.sort((a, b) => {
      if (b.ticketsResponsable !== a.ticketsResponsable) return b.ticketsResponsable - a.ticketsResponsable;
      return b.ticketsAsignados - a.ticketsAsignados;
    });
  }, [operadores, filtroTurno]);

  const kpis = useMemo(() => {
    const total = operadores.length;
    const online = operadores.filter((o) => o.estado === "online").length;
    const totalAsignados = operadores.reduce((acc, o) => acc + o.ticketsAsignados, 0);
    const totalResponsable = operadores.reduce((acc, o) => acc + o.ticketsResponsable, 0);
    const totalEnGestion = operadores.reduce((acc, o) => acc + o.ticketsEnGestion, 0);
    return { total, online, totalAsignados, totalResponsable, totalEnGestion };
  }, [operadores]);

  const handleRefresh = () => setLastUpdate(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: COLORS.bg,  fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* 🎯 HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 1 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: "-0.02em", fontSize: { xs: "1.6rem", md: "2rem" } }}>
                Administración de Actividades
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary, fontWeight: 500, mt: 0.5 }}>
                Monitorización en tiempo real de operaciones (PRUEBA MAQUETACIÓN)
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "white", px: 2, py: 0.75, borderRadius: "10px", border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: COLORS.success, animation: "pulse 2s infinite" }} />
              <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600, fontSize: "0.7rem" }}>
                Auto-refresh (30s) · {lastUpdate.toLocaleTimeString("es-VE")}
              </Typography>
              <IconButton onClick={handleRefresh} size="small" sx={{ p: 0.5 }}>
                <Refresh fontSize="small" sx={{ color: COLORS.primary, fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* 🎛️ FILTRO DE TURNOS */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Box sx={{ mb: 4 }}>
          <ToggleButtonGroup
            value={filtroTurno}
            exclusive
            onChange={(_, val) => val && setFiltroTurno(val)}
            size="small"
            sx={{
              bgcolor: "white",
              borderRadius: "12px",
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
              "& .MuiToggleButton-root": {
                border: "none",
                py: 1,
                px: 2.5,
                fontWeight: 600,
                color: COLORS.textSecondary,
                fontSize: "0.85rem",
                "&.Mui-selected": { bgcolor: COLORS.primary, color: "white", "&:hover": { bgcolor: COLORS.primaryLight } },
              },
            }}
          >
            <ToggleButton value="todos">Todos los Turnos</ToggleButton>
            <ToggleButton value="dia"><WbSunny sx={{ mr: 0.5, fontSize: 16 }} /> Día</ToggleButton>
            <ToggleButton value="tarde"><WbTwilight sx={{ mr: 0.5, fontSize: 16 }} /> Tarde</ToggleButton>
            <ToggleButton value="noche"><NightsStay sx={{ mr: 0.5, fontSize: 16 }} /> Noche</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </motion.div>

      {/* 📊 SECCIÓN PRINCIPAL: RANKING DE OPERADORES */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: "16px", 
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            mb: 4 
          }}
        >
          {/* Header Azul Oscuro */}
          <Box sx={{ bgcolor: COLORS.primary, color: "white", p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ 
                width: 44, 
                height: 44, 
                borderRadius: "12px", 
                bgcolor: "rgba(255,255,255,0.15)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <Leaderboard sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Ranking de Operadores
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                  {ranking.length} operadores en el sistema
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Contenido de la Tabla */}
          <Box sx={{ p: 3, bgcolor: COLORS.surface }}>
            {/* Header de tabla */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "70px 2.5fr 1fr 1fr 1fr 1.2fr",
                gap: 2,
                px: 3,
                py: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: "12px",
                mb: 2,
                fontWeight: 700,
                fontSize: "14px",
                color: COLORS.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <Box sx={{ textAlign: "center" }}>#</Box>
              <Box>Operador</Box>
              <Box sx={{ textAlign: "center" }}>Asignados</Box>
              <Box sx={{ textAlign: "center" }}>Responsable</Box>
              <Box sx={{ textAlign: "center" }}>En Gestión</Box>
              <Box sx={{ textAlign: "center" }}>Tendencia</Box>
            </Box>

            {/* Filas del Ranking */}
            {ranking.map((op, index) => (
              <RankingRow key={op.id} op={op} rank={index + 1} delay={index * 0.05} />
            ))}
          </Box>
        </Paper>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
}