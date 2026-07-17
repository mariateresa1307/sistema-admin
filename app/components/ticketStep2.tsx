'use client';
import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { NIVEL_SEVERIDAD, IMPUTABLE, TICKET_STATUS } from 'app/utils/constants';
import { getNivelSeveridadConfig } from 'app/utils/auxiliares';
import { TicketFormData } from '../utils/ticketHelpers';
import { ConfiguracionInterface } from '../utils/types';

const corporateFont = 'Calibri, Arial, sans-serif';

interface Operador {
  _id: string;
  primerNombre: string;
  primerApellido: string;
  username?: string;
}

interface TiemposCalculados {
  tDeteccion: number;
  tAtencion: number;
  tEscalado: number;
  cCierreSoporte: number;
  mttrTotal: number;
  turnoAsignado: 'DIURNO' | 'NOCTURNO';
}

interface TicketStep2Props {
  form: TicketFormData;
  tiempos: TiemposCalculados;
  operadores: Operador[];
  causasRaiz: ConfiguracionInterface[];
  solucionesCaso: ConfiguracionInterface[];
  grupoDestino: ConfiguracionInterface[]; // ✅ Estas son las OPCIONES
  onFieldChange: (name: keyof TicketFormData, value: any) => void;
  onCausaRaizChange: (causaRaiz: string) => void;
}

export const TicketStep2 = React.memo(
  ({
    form,
    tiempos,
    operadores,
    causasRaiz,
    solucionesCaso,
    grupoDestino,
    onFieldChange,
    onCausaRaizChange,
  }: TicketStep2Props) => {
    
    // ✅ LOG DE DIAGNÓSTICO PARA VERIFICAR QUE LLEGAN LOS DATOS
    useEffect(() => {
      console.log('🔍 [TicketStep2] Estado del formulario:', {
        requiereEscalamiento: form.requiereEscalamiento,
        escaladoA: form.escaladoA, // ✅ Campo correcto
        opcionesGrupoDestino: grupoDestino?.length || 0,
      });
    }, [form.requiereEscalamiento, form.escaladoA, grupoDestino]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      onFieldChange(name as keyof TicketFormData, value);
    };

    const handleDateTimeClick = (e: React.MouseEvent<HTMLInputElement>) => {
      try {
        (e.target as any).showPicker();
      } catch (err) {}
    };

    const formatUserName = (userList: Array<Operador>) => {
      const result = userList.find(user => user._id === form.operatorResponsable);
      return `${result?.primerNombre} ${result?.primerApellido}`.trim() || 'Sin asignar';
    };

    const formatCierreFalla = () => {
      const status = form.estatus || form.estatus;
      const isClosed = status === TICKET_STATUS.CERRADO || status === 'CERRADO' || status === 'cerrado';
      
      if (!isClosed || !form.horaCierreFalla) return '';

      try {
        const date = new Date(form.horaCierreFalla);
        return date.toLocaleString('es-VE', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
      } catch {
        return '';
      }
    };

    const cierreFallaValue = formatCierreFalla();

    return (
      <Grid container spacing={2.5} sx={{ fontFamily: corporateFont }}>
        {/* Título */}
        <Grid size={12} sx={{ mb: -1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#121227', fontFamily: corporateFont }}>
            3. Tiempos de Ciclo de Falla
          </Typography>
        </Grid>

        {/* t0: Inicio Falla */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required type="datetime-local" label="t0: Inicio Falla *" name="horaInicioFalla" value={form.horaInicioFalla ?? ""} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' }, fontFamily: corporateFont }} />
        </Grid>

        {/* t1: Apertura NOC (Auto) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth disabled type="datetime-local" label="t1: Apertura NOC (Auto)" name="horaDeteccionNoc" value={form.horaDeteccionNoc ?? ""} size="small" InputLabelProps={{ shrink: true }} sx={{ bgcolor: '#f0f4f8', fontFamily: corporateFont }} />
        </Grid>

        {/* t2: Inicio Atención */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth required type="datetime-local" label="t2: Inicio Atención *" name="horaInicioAtencion" value={form.horaInicioAtencion ?? ""} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' }, fontFamily: corporateFont }} />
        </Grid>

        {/* t3: Escalamiento */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth type="datetime-local" label="t3: Escalamiento" name="horaEscalamiento" value={form.horaEscalamiento ?? ""} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} disabled={form.requiereEscalamiento === 'NO'} required={form.requiereEscalamiento === 'SI'} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' }, fontFamily: corporateFont }} />
        </Grid>

        {/* Fin Afectación */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth type="datetime-local" label="Fin Afectación" name="horaFinAfectacion" value={form.horaFinAfectacion ?? ""} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} inputProps={{ onClick: handleDateTimeClick }} sx={{ '& input': { cursor: 'pointer' }, fontFamily: corporateFont }} />
        </Grid>

        {/* t4: Cierre Falla (Auto) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth disabled label="t4: Cierre Falla (Auto)" value={cierreFallaValue}
            placeholder={form.estatus === 'CERRADO' ? 'Sin fecha de cierre' : 'Pendiente de cierre'}
            size="small"
            sx={{ 
              bgcolor: cierreFallaValue ? '#E8F5E9' : '#f0f4f8', fontFamily: corporateFont,
              '& .MuiInputBase-input': { color: cierreFallaValue ? '#2E7D32' : '#90A4AE', fontWeight: cierreFallaValue ? 700 : 400 },
              '& .MuiInputLabel-root': { color: cierreFallaValue ? '#2E7D32' : '#64748B' }
            }}
            InputLabelProps={{ shrink: true, sx: { color: cierreFallaValue ? '#2E7D32' : '#64748B' } }}
          />
        </Grid>

        {/* Resumen de Tiempos */}
        <Grid size={12}>
          <Box sx={{ bgcolor: '#113c5892', color: '#ffffff', p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, px: 3, fontFamily: corporateFont }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Detección:</strong> {tiempos.tDeteccion} min</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Atención:</strong> {tiempos.tAtencion} min</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>T. Escalado:</strong> {tiempos.tEscalado} min</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}><strong>Cierre Soporte:</strong> {cierreFallaValue ? `${tiempos.cCierreSoporte} min` : 'Pendiente'}</Typography>
          </Box>
        </Grid>

        {/* ¿Escalar a Especialistas? */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth label="¿Escalar a Especialistas?" name="requiereEscalamiento" value={form.requiereEscalamiento ?? ""} onChange={handleChange} size="small" sx={{ fontFamily: corporateFont }}>
            <MenuItem value="NO" sx={{ fontFamily: corporateFont }}>No</MenuItem>
            <MenuItem value="SI" sx={{ fontFamily: corporateFont }}>Sí</MenuItem>
          </TextField>
        </Grid>

        {/* ✅ Grupo Destino (Usando form.escaladoA) */}
        {form.requiereEscalamiento === 'SI' && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select fullWidth label="Grupo destino" name="escaladoA" // ✅ name corregido
              value={form.escaladoA ?? ""} // ✅ value corregido
              onChange={handleChange} size="small" sx={{ fontFamily: corporateFont }}
            >
              <MenuItem value="" sx={{ fontFamily: corporateFont }}><em>Seleccionar...</em></MenuItem>
              {(grupoDestino || []).map((grupo) => (
                <MenuItem key={grupo._id} value={grupo._id} sx={{ fontFamily: corporateFont }}>
                  {grupo.valor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Causa Raíz */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth label="Causa Raíz" name="causaRaiz" value={form.causaRaiz ?? ""} onChange={(e) => onCausaRaizChange(e.target.value)} size="small" sx={{ fontFamily: corporateFont }}>
            <MenuItem value="" sx={{ fontFamily: corporateFont }}><em>Seleccionar...</em></MenuItem>
            {(causasRaiz || []).map((causa) => (
              <MenuItem key={causa._id} value={causa._id} sx={{ fontFamily: corporateFont }}>{causa.valor}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Solución Caso */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth label="Solución Caso" name="SolucionCaso" value={form.SolucionCaso ?? ""} onChange={handleChange} size="small" disabled={!form.causaRaiz} sx={{ fontFamily: corporateFont }}>
            <MenuItem value="" sx={{ fontFamily: corporateFont }}><em>{form.causaRaiz ? 'Seleccionar...' : 'Seleccione una causa raíz'}</em></MenuItem>
            {(solucionesCaso || []).map((solucion) => (
              <MenuItem key={solucion._id} value={solucion._id} sx={{ fontFamily: corporateFont }}>{solucion.valor}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Turno */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth disabled label="Turno" value={tiempos.turnoAsignado ?? ""} size="small" sx={{ bgcolor: '#f0f4f8', fontFamily: corporateFont }} />
        </Grid>

        {/* TT-ZOHO */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="TT-ZOHO" name="ttZoho" value={form.ttZoho ?? ""} onChange={handleChange} size="small" sx={{ fontFamily: corporateFont }} />
        </Grid>

        {/* TT-CLIENTE */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth label="TT-CLIENTE" name="ttClienteProveedor" value={form.ttClienteProveedor ?? ""} onChange={handleChange} size="small" sx={{ fontFamily: corporateFont }} />
        </Grid>

        {/* Operador Responsable */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField fullWidth disabled label="Operador" name="operatorResponsable" value={formatUserName(operadores)} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ color: '#121227', mr: 1, fontSize: '1.1rem' }} /> }} sx={{ bgcolor: '#f0f4f8', fontFamily: corporateFont }} />
        </Grid>

        {/* Operador Asignado */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth label="Operador asignado" name="operatorAsignado" value={form.operatorAsignado ?? ""} onChange={handleChange} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ color: '#121227', mr: 1, fontSize: '1.1rem' }} /> }} sx={{ fontFamily: corporateFont }}>
            <MenuItem value="" sx={{ fontFamily: corporateFont }}><em>Seleccionar operador</em></MenuItem>
            {(operadores || []).map((op) => (
              <MenuItem key={op._id} value={op._id} sx={{ fontFamily: corporateFont }}>{[op.primerNombre, op.primerApellido].filter(Boolean).join(' ').trim() || op.username}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Severidad */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth required label="Severidad" name="severidad" value={form.severidad ?? ""} onChange={handleChange} size="small" SelectProps={{ renderValue: (selected) => { const config = getNivelSeveridadConfig(selected as string); return <Chip label={`${config.icon} ${config.label}`} size="small" sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1, bgcolor: config.bgcolor, color: config.color, width: '100%', fontFamily: corporateFont }} />; } }} sx={{ fontFamily: corporateFont }}>
            {NIVEL_SEVERIDAD.map((nivel) => (
              <MenuItem key={nivel.value} value={nivel.value} sx={{ fontFamily: corporateFont }}>
                <Chip label={`${nivel.icon} ${nivel.label}`} size="small" sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1, bgcolor: nivel.bgcolor, color: nivel.color, width: '100%', fontFamily: corporateFont }} />
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Imputable a */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select fullWidth required label="Imputable a" name="imputable" value={form.imputable ?? ""} onChange={handleChange} size="small" sx={{ fontFamily: corporateFont }}>
            <MenuItem value="" sx={{ fontFamily: corporateFont }}><em>Seleccionar</em></MenuItem>
            {Object.values(IMPUTABLE).map((opcion) => (
              <MenuItem key={opcion} value={opcion} sx={{ fontFamily: corporateFont }}>{opcion}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Detalles del incidente */}
        <Grid size={12}>
  <TextField
    fullWidth
    multiline
    rows={7}
    required
    label="Detalles del incidente"
    name="descripcion"
    value={form.descripcion ?? ""}
    onChange={handleChange}
    size="small"
    sx={{ 
      fontFamily: corporateFont,
      '& .MuiInputBase-input': {
        fontFamily: 'Calibri, Arial, sans-serif',
        whiteSpace: 'pre-wrap', // ✅ Mantiene saltos de línea
      }
    }}
    InputProps={{
      readOnly: false, // Permitir edición si es necesario
    }}
  />
</Grid>
      </Grid>
    );
  }
);

TicketStep2.displayName = 'TicketStep2';