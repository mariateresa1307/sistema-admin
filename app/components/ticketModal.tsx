'use client';
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', md: 1200 }, 
  maxHeight: '92vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4.5, 
  borderRadius: 3,
  overflowY: 'auto',
};

// --- MAPEO DE SUBCATEGORÍAS SEGÚN EL SERVICIO AFECTADO ---
const subcategoriasPorServicio: Record<string, string[]> = {
  INTERNET: [
    "ALTA LATENCIA", "COMUNICACIÓN ENTRE SEDES", "CONEXIÓN INTERMITENTE",
    "FTTX REDES COMPARTIDAS", "INCONVENIENTES CON DNS", "MONITOREO",
    "NO ALCANZA EL ANCHO DE BANDA", "PÉRDIDA DE PAQUETES", "PROBLEMAS CON EL REGISTRO EN PORTAL WEB",
    "PROBLEMAS EN EL ENVÍO/RECEPCIÓN DE CORREOS", "PROBLEMAS PARA ACCEDER ALGUNAS PÁGINAS",
    "SIN CONEXIÓN", "INCONSISTENCIAS EN RECURSOS ASIGNADOS", "DUPLICIDAD DE RECURSOS ASIGNADOS",
    "CREACIÓN DE REGISTRO PTR"
  ],
  TELEFONIA: [
    "INCIDENCIA EN LLAMADAS ENTRANTES", "INCIDENCIA EN LLAMADAS SALIENTES",
    "INTERFERENCIAS", "SEÑALIZACIÓN", "SIN TONO", "TONO OCUPADO"
  ],
  DATOS: [
    "CONEXIÓN INTERMITENTE", "MONITOREO", "NO ALCANZA LA CAPACIDAD DE TRANSPORTE",
    "PÉRDIDA DE PAQUETES", "SIN CONEXIÓN"
  ],
  TELEVISION_OTT: [
    "NO VE ALGUNOS CANALES", "PIXELACIÓN DE IMAGEN", "PROBLEMAS DE AUDIO",
    "SIN ACCESO", "ELIMINACIÓN DE CORREOS DE LA PLATAFORMA OTT"
  ]
};

// --- PUNTO 2: OPCIONES DE PLATAFORMA DEPENDIENDO DE LA CATEGORÍA RAÍZ (SOLO INCIDENCIA PUNTUAL) ---
const plataformasPorCategoria: Record<string, string[]> = {
  ACCESO: [
    "SERVICIO DE INTERNET GPON",
    "SERVICIO DE INTERNET HFC",
    "SERVICIO DE TELEFONÍA GPON",
    "SERVICIO DE TELEFONÍA HFC",
    "SERVICIO DE STREAMING GPON",
    "SERVICIO DE DATOS GPON",
    "SERVICIO DE TELEVISIÓN HFC"
  ],
  TRANSPORTE: [
    "SERVICIO DE INTERNET XDSL",
    "SERVICIO DE INTERNET METROETHERNET",
    "SERVICIO DE DATOS METROETHERNET"
  ],
  CORE: [
    "SERVICIO DE TELEFONÍA TELEFONÍA"
  ],
  IT: [
    "SERVICIO DE TELEFONÍA TELEFONÍA"
  ]
};

// --- PUNTO 3: EQUIPO DE ACCESO DEPENDIENDO DE LA PLATAFORMA SELECCIONADA (SOLO INCIDENCIA PUNTUAL) ---
const equiposPorPlataforma: Record<string, string[]> = {
  "SERVICIO DE INTERNET GPON": ["GPON ONT"],
  "SERVICIO DE TELEFONÍA GPON": ["GPON ONT"],
  "SERVICIO DE STREAMING GPON": ["GPON ONT"],
  "SERVICIO DE DATOS GPON": ["GPON ONT"],
  
  "SERVICIO DE INTERNET HFC": ["HFC CABLE MODEM"],
  "SERVICIO DE TELEFONÍA HFC": ["HFC CABLE MODEM"],
  "SERVICIO DE TELEVISIÓN HFC": ["HFC CABLE MODEM"],
  
  "SERVICIO DE INTERNET XDSL": ["XDSL MODEM"],
  
  "SERVICIO DE INTERNET METROETHERNET": ["METROETHERNET TRANSCEIVER"],
  "SERVICIO DE DATOS METROETHERNET": ["METROETHERNET TRANSCEIVER"],
  
  "SERVICIO DE TELEFONÍA TELEFONÍA": ["TELEFONÍA IAD", "TELEFONÍA GATEWAY"]
};

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ticketData: any) => void;
}

export default function TicketModal({ open, onClose, onSave }: TicketModalProps) {
  const [form, setForm] = useState({
    numeroTicket: '', 
    tipoIncidencia: '', 
    canalRecepcion: '', 
    proactivoReactivo: 'REACTIVO', 
    grupoAsignado: 'NOC', 
    asunto: '', 
    solicitante: 'NOC Soporte',
    
    categoria: '',      // Categoría Raíz
    plataforma: '',     // Cambiado a dinámico dependiente de categoria
    equipoAcceso: '',   // Cambiado a dinámico dependiente de plataforma
    
    tipoCliente: '',    // Servicio Afectado
    subcategoria: '',   
    segmento: '',       
    localidad: '',      
    estatus: 'ABIERTO',  

    inicioFalla: '',     
    deteccionNoc: '',    
    atencionFalla: '',   
    escalamientoFalla: '',
    cierreFalla: '',     

    requiereEscalamiento: 'NO',
    escaladoA: '',       
    causaRaiz: '',       
    descripcion: '',     
    responsable: '',     

    tiempoDeteccion: 0,  
    tiempoAtencion: 0,   
    tiempoEscalado: 0,   
    cierreSoporte: 0,    
    tiempoTotalFalla: 0  
  });

  const esIncidenciaPuntual = form.tipoIncidencia === 'INCIDENCIA PUNTUAL';

  // Generación automática del Número de Caso basado en la Categoría Raíz
  useEffect(() => {
    if (form.categoria) {
      const prefijo = form.categoria.substring(0, 4).toUpperCase();
      if (!form.numeroTicket || !form.numeroTicket.startsWith(prefijo)) {
        const identificadorUnico = Math.floor(100000 + Math.random() * 900000);
        setForm(prev => ({
          ...prev,
          numeroTicket: `${prefijo}-${identificadorUnico}`
        }));
      }
    } else {
      setForm(prev => ({ ...prev, numeroTicket: '' }));
    }
  }, [form.categoria]);

  // Limpiar subcategoría si cambia el servicio afectado
  useEffect(() => {
    setForm(prev => ({ ...prev, subcategoria: '' }));
  }, [form.tipoCliente]);

  // Cascada de limpieza 1: Si cambia la Categoría o el Tipo de Incidencia, resetea Plataforma y Equipo
  useEffect(() => {
    setForm(prev => ({ ...prev, plataforma: '', equipoAcceso: '' }));
  }, [form.categoria, form.tipoIncidencia]);

  // Cascada de limpieza 2: Si cambia la Plataforma, resetea el Equipo de Acceso
  useEffect(() => {
    setForm(prev => ({ ...prev, equipoAcceso: '' }));
  }, [form.plataforma]);

  const calcularMinutos = (desde: string, hasta: string): number => {
    if (!desde || !hasta) return 0;
    const tMin = new Date(desde).getTime();
    const tMax = new Date(hasta).getTime();
    if (isNaN(tMin) || isNaN(tMax) || tMax < tMin) return 0;
    return Math.round((tMax - tMin) / 1000 / 60);
  };

  useEffect(() => {
    const tDeteccion = calcularMinutos(form.inicioFalla, form.deteccionNoc);
    const tAtencion = calcularMinutos(form.deteccionNoc, form.atencionFalla);
    const tEscalado = form.requiereEscalamiento === 'SI' ? calcularMinutos(form.escalamientoFalla, form.cierreFalla) : 0;
    const tCierreSoporte = calcularMinutos(form.atencionFalla, form.cierreFalla);
    const tTotal = calcularMinutos(form.inicioFalla, form.cierreFalla);

    setForm(prev => ({
      ...prev,
      tiempoDeteccion: tDeteccion,
      tiempoAtencion: tAtencion,
      tiempoEscalado: tEscalado,
      cierreSoporte: tCierreSoporte,
      tiempoTotalFalla: tTotal
    }));
  }, [form.inicioFalla, form.deteccionNoc, form.atencionFalla, form.escalamientoFalla, form.cierreFalla, form.requiereEscalamiento]);

  useEffect(() => {
    if (form.canalRecepcion === 'MONITOREO') {
      setForm(prev => ({ ...prev, proactivoReactivo: 'PROACTIVO' }));
    } else if (form.canalRecepcion !== '') {
      setForm(prev => ({ ...prev, proactivoReactivo: 'REACTIVO' }));
    }
  }, [form.canalRecepcion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      fechaRegistroSistema: new Date().toISOString()
    });
    onClose();
  };

  // Listas Dinámicas Filtradas
  const opcionesPlataforma = esIncidenciaPuntual ? (plataformasPorCategoria[form.categoria] || []) : ["GENERAL CORE", "GENERAL TRANSPORTE", "GENERAL ACCESO", "GENERAL IT"];
  const opcionesEquipos = esIncidenciaPuntual ? (equiposPorPlataforma[form.plataforma] || []) : [];
  const opcionesSubcategoria = subcategoriasPorServicio[form.tipoCliente] || [];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
        
        {/* Cabecera */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h5" sx={{ color: '#000027', fontWeight: 600 }}>
            Apertura y Tipificación de Caso - Falla NOC
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2.5}>
          
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ color: '#000027', fontWeight: 'bold', mb: 0.5 }}>
              1. Datos de Origen e Identificación del Caso
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField 
              fullWidth disabled label="Número de Caso (Auto)" name="numeroTicket" value={form.numeroTicket} placeholder="Defina Categoría..." size="small" 
              InputProps={{ startAdornment: <ConfirmationNumberIcon sx={{ color: '#000027', mr: 1, fontSize: '1.1rem' }} /> }}
              sx={{ bgcolor: '#f0f4f8', input: { fontWeight: 'bold', color: '#000027' }, "& .MuiInputLabel-root.Mui-disabled": { color: '#000027' } }} 
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select fullWidth required label="Tipo de Incidencia" name="tipoIncidencia" value={form.tipoIncidencia} onChange={handleChange} size="small">
              <MenuItem value="INCIDENCIA PUNTUAL">INCIDENCIA PUNTUAL</MenuItem>
              <MenuItem value="INCIDENCIA MASIVA">INCIDENCIA MASIVA</MenuItem>
              <MenuItem value="VENTANA DE MANTENIMIENTO">VENTANA DE MANTENIMIENTO</MenuItem>
            </TextField>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth required label="Asunto del Ticket" name="asunto" value={form.asunto} onChange={handleChange} size="small" placeholder="Ej: FALLA EN EQUIPO ONT - CLIENTE CARRIER" />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select fullWidth required label="Canal de Recepción" name="canalRecepcion" value={form.canalRecepcion} onChange={handleChange} size="small">
              <MenuItem value="TELEFONO">Teléfono / Llamada</MenuItem>
              <MenuItem value="WHATSAPP">WhatsApp Business</MenuItem>
              <MenuItem value="CORREO">Correo Electrónico</MenuItem>
              <MenuItem value="MONITOREO">Monitoreo Proactivo (PRTG/Cacti)</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth required label="Operador Responsable" name="responsable" value={form.responsable} onChange={handleChange} size="small" />
          </Grid>

          {/* SECCIÓN 2: TIER CLASIFICACIÓN EN CASCADA */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#000027', fontWeight: 'bold', mb: 0.5 }}>
              2. Matriz de Red y Tipificación de Infraestructura (Cascada)
            </Typography>
          </Grid>
          
          {/* A. CATEGORÍA */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select fullWidth required label="Categoría (Área)" name="categoria" value={form.categoria} onChange={handleChange} size="small">
              <MenuItem value="CORE">CORE</MenuItem>
              <MenuItem value="TRANSPORTE">TRANSPORTE</MenuItem>
              <MenuItem value="ACCESO">ACCESO</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
            </TextField>
          </Grid>

          {/* B. PLATAFORMA (Depende de Categoría) */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField 
              select 
              fullWidth 
              required 
              label="Plataforma" 
              name="plataforma" 
              value={form.plataforma} 
              onChange={handleChange} 
              size="small"
              disabled={!form.categoria}
            >
              {opcionesPlataforma.map((plat) => (
                <MenuItem key={plat} value={plat}>{plat}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* C. EQUIPO DE ACCESO (Depende de Plataforma + Solo Incidencia Puntual) */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField 
              select 
              fullWidth 
              label="Equipo de Acceso" 
              name="equipoAcceso" 
              value={form.equipoAcceso} 
              onChange={handleChange} 
              size="small"
              required={esIncidenciaPuntual}
              disabled={!esIncidenciaPuntual || !form.plataforma}
              placeholder={!esIncidenciaPuntual ? "N/A - Solo Puntual" : "Seleccione..."}
            >
              {opcionesEquipos.map((eq) => (
                <MenuItem key={eq} value={eq}>{eq}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select fullWidth required label="Servicio Afectado" name="tipoCliente" value={form.tipoCliente} onChange={handleChange} size="small">
              <MenuItem value="INTERNET">INTERNET</MenuItem>
              <MenuItem value="TELEFONIA">TELEFONÍA</MenuItem>
              <MenuItem value="DATOS">DATOS</MenuItem>
              <MenuItem value="TELEVISION_OTT">SERVICIO DE TV / OTT</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField 
              select fullWidth required label="Subcategoría (Falla)" name="subcategoria" value={form.subcategoria} onChange={handleChange} size="small"
              disabled={opcionesSubcategoria.length === 0}
            >
              {opcionesSubcategoria.map((sub) => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select fullWidth required label="Segmento" name="segmento" value={form.segmento} onChange={handleChange} size="small">
              <MenuItem value="FTTH">FTTH / Fibra Hogar</MenuItem>
              <MenuItem value="FTTO">FTTO / Fibra Empresas</MenuItem>
              <MenuItem value="PTP">Punto a Punto</MenuItem>
              <MenuItem value="CORPORATIVO">Corporativo Dedicado</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 12 }}>
            <TextField fullWidth required label="Localidad / Nodo afectado" name="localidad" value={form.localidad} onChange={handleChange} size="small" placeholder="Ej: Nodo Chacao, Región Capital" />
          </Grid>

          {/* SECCIÓN 3: TIEMPOS */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#000027', fontWeight: 'bold', mb: 0.5 }}>
              3. Tiempos de Ciclo de Falla (Marcas Cronológicas)
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <TextField fullWidth required type="datetime-local" label="t0: Inicio Falla" name="inicioFalla" value={form.inicioFalla} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <TextField fullWidth required type="datetime-local" label="t1: Detección NOC" name="deteccionNoc" value={form.deteccionNoc} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <TextField fullWidth required type="datetime-local" label="t2: Inicio Atención" name="atencionFalla" value={form.atencionFalla} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <TextField fullWidth type="datetime-local" label="t3: Escalamiento" name="escalamientoFalla" value={form.escalamientoFalla} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} disabled={form.requiereEscalamiento === 'NO'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <TextField fullWidth type="datetime-local" label="t4: Cierre Falla" name="cierreFalla" value={form.cierreFalla} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </Grid>

          {/* CUADRO METRICAS */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ bgcolor: '#b3b3ff', color: '#000000', p: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-around', mt: 0.5 }}>
              <Typography variant="body2"><strong>T. Detección:</strong> {form.tiempoDeteccion} min</Typography>
              <Typography variant="body2"><strong>T. Atención:</strong> {form.tiempoAtencion} min</Typography>
              <Typography variant="body2"><strong>T. Escalado:</strong> {form.tiempoEscalado} min</Typography>
              <Typography variant="body2"><strong>Cierre Soporte:</strong> {form.cierreSoporte} min</Typography>
              <Typography variant="body2" sx={{ color: '#8d2041', fontWeight: 'bold', fontSize: '0.95rem' }}><strong>MTTR Total (Falla):</strong> {form.tiempoTotalFalla} min</Typography>
            </Box>
          </Grid>

          {/* SECCIÓN 4: ESCALAMIENTOS */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#000027', fontWeight: 'bold', mb: 0.5 }}>
              4. Resolución, Gestión de Terceros y Cierre
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select fullWidth label="¿Escalar Caso?" name="requiereEscalamiento" value={form.requiereEscalamiento} onChange={handleChange} size="small">
              <MenuItem value="NO">No (Resuelve NOC)</MenuItem>
              <MenuItem value="SI">Sí (Requiere Apoyo)</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label="Asignar a / Escalado a" name="escaladoA" value={form.escaladoA} onChange={handleChange} size="small" disabled={form.requiereEscalamiento === 'NO'} placeholder="Ej: Planta Externa / Ingeniería" />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField fullWidth label="Causa Raíz Diagnóstica" name="causaRaiz" value={form.causaRaiz} onChange={handleChange} size="small" placeholder="Ej: Corte de Fibra / Caída de Rectificador" />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField select fullWidth label="Estatus Operativo" name="estatus" value={form.estatus} onChange={handleChange} size="small">
              <MenuItem value="ABIERTO">ABIERTO</MenuItem>
              <MenuItem value="EN PROCESO">EN PROCESO</MenuItem>
              <MenuItem value="ESCALADO">ESCALADO</MenuItem>
              <MenuItem value="CERRADO">CERRADO</MenuItem>
            </TextField>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 9 }}>
            <TextField fullWidth multiline rows={2} required label="Bitácora / Análisis Técnico de la Falla" name="descripcion" value={form.descripcion} onChange={handleChange} size="small" />
          </Grid>
        </Grid>

        {/* Acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" color="error" onClick={onClose} size="medium">
            Descartar
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} size="medium" sx={{ bgcolor: '#000027', px: 3, '&:hover': { bgcolor: '#000045' } }}>
            Registrar y Tipificar Ticket
          </Button>
        </Box>

      </Box>
    </Modal>
  );
}