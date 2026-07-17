'use client';
import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Autocomplete,
  IconButton,
  Switch,
  Typography,
  Stack,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { TIPO_INCIDENCIA, TIPO_CLIENTE } from 'app/utils/constants';
import { TipoIncidenciaKey, SimpleConfigOpt } from '../utils/types';
import { TicketFormData, ServicioAfectado } from '../utils/ticketHelpers';
import { useTicketData } from '../home/hooks/useTicketData';
import ElementoModal from '../components/elementoTicketModal';

// ✅ Tipografía Corporativa NetUno
const corporateFont = 'Calibri, Arial, sans-serif';

interface TicketStep1Props {
  form: TicketFormData;
  data: ReturnType<typeof useTicketData>;
  operatorDisplayName: string;
  onFieldChange: (name: keyof TicketFormData, value: any) => void;
  onTipoIncidenciaChange: (tipo: string) => void;
  onCategoriaChange: (categoriaId: string) => void;
  onSubcategoriaChange: (subcategoriaId: string) => void;
  onTipoClienteChange: (tipoClienteId: string) => void;
  onCiudadChange: (ciudadValue: string) => void;
  onServiciosAfectadosChange: (servicios: ServicioAfectado[]) => void;
}

export const TicketStep1 = React.memo(
  ({
    form,
    data,
    operatorDisplayName,
    onFieldChange,
    onTipoIncidenciaChange,
    onCategoriaChange,
    onSubcategoriaChange,
    onTipoClienteChange,
    onCiudadChange,
    onServiciosAfectadosChange,
  }: TicketStep1Props) => {
    const [openServicioModal, setOpenServicioModal] = useState(false);
    const showTipoClienteInput = form.tipoIncidencia !== TIPO_INCIDENCIA.FALLA_MASIVA;
    const selectedTipoCliente = data.tipoCliente.find((tc) => tc._id === form.tipoCliente);
    const isResidencial = selectedTipoCliente?.valor === TIPO_CLIENTE.RESIDENCIAL;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      const finalValue = type === 'checkbox' ? (e.target as any).checked : value;
      onFieldChange(name as keyof TicketFormData, finalValue);
    };

    // ✅ Debug temporal para verificar la carga de servicios
    useEffect(() => {
      console.log('🔍 [TicketStep1] Servicios:', {
        formServicios: form.serviciosAfectados,
        dataServicios: data.serviciosAfectados,
      });
    }, [form.serviciosAfectados, data.serviciosAfectados]);

    return (
      <Grid container spacing={2.5} >
        {/* Número de Caso */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            disabled
            label="Número de Caso (Auto)"
            value={form.numeroTicket ?? ""}
            size="small"
            InputProps={{
              startAdornment: (
                <ConfirmationNumberIcon sx={{ color: '#121227', mr: 1, fontSize: '1.1rem' }} /> // ✅ Azul Marino NetUno
              ),
            }}
            sx={{ bgcolor: '#f0f4f8'}}
          />
        </Grid>

        {/* Tipo de Incidencia */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            fullWidth
            required
            label="Tipo de Incidencia"
            value={form.tipoIncidencia ?? ""}
            onChange={(e) => onTipoIncidenciaChange(e.target.value)}
            size="small"
            
          >
            {(Object.keys(TIPO_INCIDENCIA) as TipoIncidenciaKey[]).map((key) => (
              <MenuItem key={key} value={TIPO_INCIDENCIA[key]} >
                {TIPO_INCIDENCIA[key]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Asunto */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Asunto del Caso"
            name="asunto"
            value={form.asunto ?? ""}
            onChange={handleChange}
            placeholder="CCS || SERVICIO || VLAN CLIENTE || FALLA"
            size="small"
            
          />
        </Grid>

        {/* Categoría de Red */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Categoría de Red"
            name="categoria"
            value={form.categoria ?? ""}
            onChange={(e) => onCategoriaChange(e.target.value)}
            size="small"
          
          >
            {data.categoriaRed.map((cat: SimpleConfigOpt) => (
              <MenuItem key={cat._id} value={cat._id} >
                {cat.valor}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Subcategoría */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Subcategoría"
            value={form.subcategoria ?? ""}
            onChange={(e) => onSubcategoriaChange(e.target.value)}
            size="small"
            disabled={!form.categoria}
            
          >
            {data.subcategorias.map((p: SimpleConfigOpt) => (
              <MenuItem key={p._id} value={p._id} >
                {p.valor}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Detalle */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Detalle"
            name="detalle"
            value={form.detalle ?? ""}
            onChange={handleChange}
            size="small"
            disabled={!form.categoria}
            
          >
            {data.detalle.map((v: SimpleConfigOpt) => (
              <MenuItem key={v._id} value={v._id} >
                {v.valor}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Tipo de Cliente */}
        {showTipoClienteInput && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              required
              label="Tipo de cliente"
              value={form.tipoCliente ?? ""}
              onChange={(e) => onTipoClienteChange(e.target.value)}
              size="small"
             
            >
              {data.tipoCliente.map((tc) => (
                <MenuItem key={tc._id} value={tc._id} >
                  {tc.valor}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* ✅ Servicios Afectados (Lógica Inteligente de Mapeo) */}
        {showTipoClienteInput && !isResidencial && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              multiple
              size="small"
              options={data.serviciosAfectados || []}
              value={(() => {
                if (!Array.isArray(form.serviciosAfectados)) return [];
                return form.serviciosAfectados.map((sa: any) => {
                  if (typeof sa === 'object' && sa.name) return sa;
                  const idToFind = typeof sa === 'string' ? sa : sa._id;
                  const servicioEncontrado = (data.serviciosAfectados || []).find(
                    (s) => s._id === idToFind
                  );
                  if (servicioEncontrado) return servicioEncontrado;
                  return { _id: idToFind, name: idToFind }; // Fallback temporal
                });
              })()}
              onChange={(_, newValue) => onServiciosAfectadosChange(newValue)}
              getOptionKey={(option) => (typeof option === 'string' ? option : option._id)}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.name || option.valor || 'Sin nombre';
              }}
              ChipProps={{ 
                size: 'small', 
                sx: { 
                  height: 24, 
                  m: 0.25,
                 
                  bgcolor: '#7f88ba', // ✅ Azul Celeste NetUno
                  color: '#FFFFFF'
                } 
              }}
             
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Servicios afectados"
                  size="small"
            
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <IconButton
                          onClick={() => setOpenServicioModal(true)}
                          size="small"
                          sx={{ p: 0.5, color: '#121227' }}
                        />
                      </>
                    ),
                  }}
                />
              )}
            />
            <ElementoModal
              open={openServicioModal}
              onClose={() => setOpenServicioModal(false)}
              onAdd={(nuevo) => {
                if (typeof nuevo === 'string') return;
                onServiciosAfectadosChange([...(form.serviciosAfectados || []), nuevo]);
              }}
            />
          </Grid>
        )}

        {/* Ciudad */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Ciudad"
            value={form.ciudad ?? ""}
            onChange={(e) => onCiudadChange(e.target.value)}
            size="small"
          
          >
            {data.ciudadesOptions.map((c: any) => (
              <MenuItem key={c._id || c.valor} value={c.valor} >
                {c.valor}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Estado y Localidad */}
        {form.ciudad && (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                disabled
                label="Estado"
                name="estado"
                value={form.estado ?? ""}
                size="small"
                sx={{ bgcolor: '#f0f4f8'}}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Localidad"
                name="localidad"
                value={form.localidad ?? ""}
                onChange={handleChange}
                size="small"
      
              >
                {data.localidadesOptions.map((loc: any) => (
                  <MenuItem key={loc._id || loc.valor} value={loc.valor} >
                    {loc.valor}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        )}

        {/* Campos para RESIDENCIAL */}
        {isResidencial && (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Nodo Afectado"
                name="nodo"
                value={form.nodo ?? ""}
                onChange={handleChange}
                size="small"
               
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Abonado"
                name="abonado"
                value={form.abonado ?? ""}
                onChange={handleChange}
                size="small"
               
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Nombre del Cliente"
                name="nombreCliente"
                value={form.nombreCliente ?? ""}
                onChange={handleChange}
                size="small"
              
              />
            </Grid>
          </>
        )}

        {/* Bitácora */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Bitácora"
            name="bitacora"
            multiline
            maxRows={4}
            value={form.bitacora ?? ""}
            onChange={handleChange}
            size="small"
           
          />
        </Grid>

        {/* Afectación */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Switch
              name="afectacion"
              checked={!!form.afectacion}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'Afectación' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#6BB1E2', // ✅ Azul Celeste NetUno
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#6BB1E2',
                },
              }}
            />
            <Typography sx={{  fontWeight: 500, color: '#121227' }}>
              Afectación
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }
);

TicketStep1.displayName = 'TicketStep1';