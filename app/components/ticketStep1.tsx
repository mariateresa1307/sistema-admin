'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, TextField, MenuItem, Autocomplete, Switch, Typography, Stack, Chip, createFilterOptions } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { getMiscellaneous } from '@/lib/api';
import { TIPO_INCIDENCIA, TIPO_CLIENTE, TICKET_STATUS } from 'app/utils/constants';
import { TipoIncidenciaKey, SimpleConfigOpt } from '../utils/types';
import { TicketFormData, ServicioAfectado } from '../utils/ticketHelpers';
import { useTicketData } from '../tickets/hooks/useTicketData';
import ElementoModal from '../components/elementoTicketModal';

const filterOptions = createFilterOptions({
  limit: 15,
});

// ✅ Mapa de severidad → color (coincide con tu tabla de configuración)
const SEVERIDAD_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ALTO: { bg: '#FFEBEE', text: '#C62828', dot: '#E53935' },
  MEDIO: { bg: '#FFF3E0', text: '#E65100', dot: '#FB8C00' },
  BAJO: { bg: '#E8F5E9', text: '#2E7D32', dot: '#43A047' },
  DEFAULT: { bg: '#EEF0F7', text: '#475569', dot: '#94A3B8' },
};

const getSeveridadColor = (option: any) => {
  const key = (option?.nivelSeveridad || '').toString().toUpperCase().trim();
  return SEVERIDAD_COLORS[key] || SEVERIDAD_COLORS.DEFAULT;
};

interface TicketStep1Props {
  form: TicketFormData;
  data: ReturnType<typeof useTicketData>;
  operatorDisplayName: string;
  onFieldChange: (name: keyof TicketFormData, value: any) => void;
  onTipoIncidenciaChange: (tipo: string) => void;
  onCategoriaChange: (categoriaId: string) => void;
  onSubcategoriaChange: (subcategoriaId: string) => void;
  onTipoClienteChange: (tipoClienteId: string | string[]) => void;
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

    // ✅ 2. Toma los tipos de cliente directamente de Miscellaneous (data)
    const categoriaRedArray = Array.isArray(data?.categoriaRed) ? data.categoriaRed : [];
    const subcategoriasArray = Array.isArray(data?.subcategorias) ? data.subcategorias : [];
    const detalleArray = Array.isArray(data?.detalle) ? data.detalle : [];
    const ciudadesOptionsArray = Array.isArray(data?.ciudadesOptions) ? data.ciudadesOptions : [];
    const localidadesOptionsArray = Array.isArray(data?.localidadesOptions) ? data.localidadesOptions : [];
    const serviciosAfectadosArrayRaw = Array.isArray(data?.serviciosAfectados) ? (data.serviciosAfectados as ServicioAfectado[]) : [];

    const serviciosAfectadosArray = serviciosAfectadosArrayRaw.filter((s: any) => {
      const status = (s.status || s.estado || '').toString().trim().toLowerCase();
      return status !== 'inactivo' && status !== 'inactive';
    });
    const [tipoClienteFallback, setTipoClienteFallback] = useState<any[]>([]);
    const todasLocalidadesArray = Array.isArray((data as any)?.todasLasLocalidades)
      ? (data as any).todasLasLocalidades
      : [];
    const localidadesBase = todasLocalidadesArray.length > 0 ? todasLocalidadesArray : localidadesOptionsArray;
    const todasLocalidadesCargadas = todasLocalidadesArray.length > 0;

    const isFallaMasiva = form.tipoIncidencia === TIPO_INCIDENCIA.FALLA_MASIVA;
    const esVentanaMantenimiento = (form.tipoIncidencia || '').toString().toUpperCase().includes('VENTANA') ||
      (form.tipoIncidencia || '').toString().toUpperCase().includes('MANTENIMIENTO');

    const showTipoClienteInput = true;
    const requiereMultiseleccion = isFallaMasiva || esVentanaMantenimiento;


    //  usa el del hook o el fallback de Miscellaneous
    const tipoClienteArray = useMemo(() => {
      const delHook = Array.isArray(data?.tipoCliente) ? data.tipoCliente : [];
      return delHook.length > 0 ? delHook : tipoClienteFallback;
    }, [data?.tipoCliente, tipoClienteFallback]);

    // ✅ 3. Lógica corregida para soportar tanto string como array de strings en form.tipoCliente


    // Verifica si AL MENOS UNO de los tipos de cliente seleccionados es Residencial
    // ✅ Manejar tanto string como array
    const tipoClienteIds = Array.isArray(form.tipoCliente)
      ? form.tipoCliente
      : (form.tipoCliente ? [form.tipoCliente] : []);

    const selectedTipoClientes = tipoClienteArray.filter(tc =>
      tipoClienteIds.includes(tc._id)
    );

    const isResidencial = selectedTipoClientes.some(tc => tc.valor === TIPO_CLIENTE.RESIDENCIAL);
    const esPuntual = (form.tipoIncidencia || '').toString().toUpperCase().includes('PUNTUAL');
    const filteredTipoClienteArray = useMemo(() => {
      return tipoClienteArray.filter((tc: any) => {
        const esResidencial = (tc.valor || '').toString().toUpperCase() === 'RESIDENCIAL';
        // Si es residencial, solo lo permitimos si es PUNTUAL
        if (esResidencial && !esPuntual) {
          return false;
        }
        return true;
      });
    }, [tipoClienteArray, esPuntual]);
    const mostrarServicios = !isResidencial && (form.afectacion === true || esPuntual || esVentanaMantenimiento || isFallaMasiva);

    const isClosed = form.estatus === TICKET_STATUS.CERRADO || form.estatus === 'CERRADO';
    const isLoading = data?.loading;

    const localidadesFiltradas = useMemo(() => {
      if (!form.ciudad) return [];
      const ciudadObj = ciudadesOptionsArray.find(
        (c: any) => c.valor === form.ciudad || String(c._id) === String(form.ciudad)
      );
      if (!ciudadObj) return [];

      const ciudadId = String(ciudadObj._id);
      const ciudadNombre = ciudadObj.valor;

      return localidadesBase.filter((loc: any) => {
        const locPadreId = typeof loc.padreId === 'object' ? String(loc.padreId?._id ?? '') : String(loc.padreId || '');
        const locCiudadId = typeof loc.ciudadId === 'object' ? String(loc.ciudadId?._id ?? '') : String(loc.ciudadId || '');
        const locPadreNombre = (loc.padreNombre || '').toString().trim().toUpperCase();
        const ciudadNombreNorm = ciudadNombre.toString().trim().toUpperCase();

        return locPadreId === ciudadId || locCiudadId === ciudadId || locPadreNombre === ciudadNombreNorm;
      });
    }, [localidadesBase, ciudadesOptionsArray, form.ciudad]);

    const localidadDisplayValue = useMemo(() => {
      if (!form.localidad) return '';
      const norm = (form.localidad || '').toString().trim().toUpperCase();
      const match = localidadesFiltradas.find(
        (loc: any) => (loc.valor || '').toString().trim().toUpperCase() === norm
      );
      return match ? match.valor : form.localidad;
    }, [form.localidad, localidadesFiltradas]);

    const estadoResuelto = useMemo(() => {
      if (!form.ciudad) return '';
      const ciudadObj = ciudadesOptionsArray.find(
        (c: any) => c.valor === form.ciudad || String(c._id) === String(form.ciudad)
      );
      if (!ciudadObj) return '';
      return ciudadObj.padreNombre || '';
    }, [ciudadesOptionsArray, form.ciudad]);

    useEffect(() => {
      if (!form.ciudad) {
        if (form.localidad) onFieldChange('localidad', '');
        if (form.estado) onFieldChange('estado', '');
        return;
      }
      if (!todasLocalidadesCargadas) return;

      if (form.localidad) {
        const norm = (form.localidad || '').toString().trim().toUpperCase();
        const pertenece = localidadesFiltradas.some(
          (loc: any) => (loc.valor || '').toString().trim().toUpperCase() === norm
        );
        if (!pertenece) onFieldChange('localidad', '');
      }
      if (estadoResuelto && form.estado !== estadoResuelto) {
        onFieldChange('estado', estadoResuelto);
      }
    }, [form.ciudad, localidadesFiltradas, estadoResuelto, form.localidad, form.estado, onFieldChange, todasLocalidadesCargadas]);

    useEffect(() => {
      // Solo cargar si es multiselección (Falla Masiva o Ventana) y el array principal viene vacío
      if ((isFallaMasiva || esVentanaMantenimiento) && tipoClienteArray.length === 0) {
        let activo = true;
        getMiscellaneous({ categoria: 'TIPO_CLIENTE', limit: 9999 })
          .then((res: any) => {
            if (!activo) return;
            const raw = res?.data;
            const arr = Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw)
                ? raw
                : [];
            setTipoClienteFallback(arr.filter((t: any) => t.activo !== false));
          })
          .catch((err) => console.error('❌ Error cargando TIPO_CLIENTE fallback:', err));
        return () => { activo = false; };
      }
    }, [isFallaMasiva, esVentanaMantenimiento, tipoClienteArray.length]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      const finalValue = type === 'checkbox' ? (e.target as any).checked : value;
      onFieldChange(name as keyof TicketFormData, finalValue);
    };

    return (
      <Grid container spacing={2.5}>
        {/* Número de Caso */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            disabled
            label="Número de Caso (Auto)"
            value={form.numeroTicket ?? ''}
            size="small"
            InputProps={{
              startAdornment: <ConfirmationNumberIcon sx={{ color: '#121227', mr: 1, fontSize: '1.1rem' }} />,
            }}
            sx={{ bgcolor: '#f0f4f8' }}
          />
        </Grid>

        {/* Tipo de Incidencia */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            fullWidth
            required
            label="Tipo de Incidencia"
            value={form.tipoIncidencia ?? ''}
            onChange={(e) => onTipoIncidenciaChange(e.target.value)}
            size="small"
            disabled={isClosed}
          >
            {(Object.keys(TIPO_INCIDENCIA) as TipoIncidenciaKey[]).map((key) => (
              <MenuItem key={key} value={TIPO_INCIDENCIA[key]}>
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
            value={form.asunto ?? ''}
            onChange={handleChange}
            placeholder="CCS || SERVICIO || VLAN CLIENTE || FALLA"
            size="small"
            disabled={isClosed}
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
            value={form.categoria ?? ''}
            onChange={(e) => onCategoriaChange(e.target.value)}
            size="small"
            disabled={isClosed || isLoading}
          >
            {isLoading ? (
              <MenuItem value="" disabled>Cargando...</MenuItem>
            ) : !form.tipoIncidencia ? (
              <MenuItem value="" disabled>Seleccione primero Tipo de Incidencia</MenuItem>
            ) : categoriaRedArray.length === 0 ? (
              <MenuItem value="" disabled>No hay categorías para este tipo</MenuItem>
            ) : (
              categoriaRedArray.map((cat: SimpleConfigOpt) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.valor}</MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        {/* Subcategoría */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Subcategoría"
            value={form.subcategoria ?? ''}
            onChange={(e) => onSubcategoriaChange(e.target.value)}
            size="small"
            disabled={!form.categoria || isClosed || isLoading}
          >
            {isLoading ? (
              <MenuItem value="" disabled>Cargando...</MenuItem>
            ) : !form.categoria ? (
              <MenuItem value="" disabled>Seleccione primero Categoría</MenuItem>
            ) : subcategoriasArray.length === 0 ? (
              <MenuItem value="" disabled>No hay subcategorías</MenuItem>
            ) : (
              subcategoriasArray.map((p: SimpleConfigOpt) => (
                <MenuItem key={p._id} value={p._id}>{p.valor}</MenuItem>
              ))
            )}
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
            value={form.detalle ?? ''}
            onChange={handleChange}
            size="small"
            disabled={!form.categoria || isClosed || isLoading}
          >
            {isLoading ? (
              <MenuItem value="" disabled>Cargando...</MenuItem>
            ) : !form.subcategoria ? (
              <MenuItem value="" disabled>Seleccione primero Subcategoría</MenuItem>
            ) : detalleArray.length === 0 ? (
              <MenuItem value="" disabled>No hay detalles</MenuItem>
            ) : (
              detalleArray.map((v: SimpleConfigOpt) => (
                <MenuItem key={v._id} value={v._id}>{v.valor}</MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        {/* ✅ Tipo de Cliente: Ahora funciona correctamente con arrays (multiselección) */}
        {showTipoClienteInput && (
          <Grid size={{ xs: 12, sm: 4 }}>
            {requiereMultiseleccion ? (
              <Autocomplete
                multiple
                size="small"
                options={filteredTipoClienteArray}
                getOptionLabel={(option) => option.valor}
                isOptionEqualToValue={(option, value) => String(option._id) === String(value._id)}
                // ✅ Resolver los valores actuales (soporta string, array de strings o array de objetos poblados)
                value={(() => {
                  const raw = form.tipoCliente;
                  if (!raw) return [];
                  const ids: string[] = Array.isArray(raw)
                    ? raw.map((item: any) => typeof item === 'object' ? String(item._id || item.id || '') : String(item))
                    : [typeof raw === 'object' ? String((raw as any)._id || '') : String(raw)];

                  return filteredTipoClienteArray.filter(tc => ids.includes(String(tc._id)));
                })()}
                onChange={(_, newValue) => {
                  const ids = newValue.map(tc => String(tc._id));
                  onTipoClienteChange(ids as any);
                  onServiciosAfectadosChange([]);
                }}
                disabled={isClosed || isLoading}
                // ✅ Chips coloreados según nivelSeveridad
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    const color = getSeveridadColor(option);

                    return (
                      <Chip
                        key={key}
                        {...tagProps}
                        size="small"
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box
                              component="span"
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: color.dot,
                                flexShrink: 0,
                                boxShadow: `0 0 0 2px ${color.dot}22`,
                              }}
                            />
                            <span>{option.valor}</span>
                          </Box>
                        }
                        sx={{
                          height: 26,
                          m: 0.25,
                          bgcolor: color.bg,
                          color: color.text,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${color.dot}55`,
                          '& .MuiChip-deleteIcon': {
                            color: color.text,
                            fontSize: 16,
                            '&:hover': { color: color.dot, bgcolor: `${color.dot}15` },
                          },
                        }}
                      />
                    );
                  })
                }
                // ✅ Opciones del dropdown con color y etiqueta de severidad
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#0f172a' }}>
                      {option.valor}
                    </Typography>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Tipo de cliente"
                    placeholder="Seleccionar..."
                    size="small"
                  />
                )}
              />
            ) : (


              <TextField
                select
                fullWidth
                required
                label="Tipo de cliente"
                value={Array.isArray(form.tipoCliente) ? form.tipoCliente[0] : (form.tipoCliente ?? '')}
                onChange={(e) => {
                  const nuevoTipoId = e.target.value;
                  onTipoClienteChange(nuevoTipoId);
                  onServiciosAfectadosChange([]);
                }}
                size="small"
                disabled={isClosed || isLoading}
              >
                {isLoading ? (
                  <MenuItem value="" disabled>Cargando...</MenuItem>
                ) : filteredTipoClienteArray.length === 0 ? (
                  <MenuItem value="" disabled>No hay tipos de cliente</MenuItem>
                ) : (
                  filteredTipoClienteArray.map((tc) => (
                    <MenuItem key={tc._id} value={tc._id}>{tc.valor}</MenuItem>
                  ))
                )}
              </TextField>
            )}
          </Grid>
        )}

        {/* Ciudad */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            required
            label="Ciudad"
            value={form.ciudad ?? ''}
            onChange={(e) => onCiudadChange(e.target.value)}
            size="small"
            disabled={isClosed || isLoading}
          >
            {isLoading ? (
              <MenuItem value="" disabled>Cargando...</MenuItem>
            ) : ciudadesOptionsArray.length === 0 ? (
              <MenuItem value="" disabled>No hay ciudades registradas</MenuItem>
            ) : (
              ciudadesOptionsArray.map((c: any) => (
                <MenuItem key={c._id || c.valor} value={c.valor}>{c.valor}</MenuItem>
              ))
            )}
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
                value={estadoResuelto}
                size="small"
                sx={{ bgcolor: '#f0f4f8' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Localidad"
                name="localidad"
                value={localidadDisplayValue}
                onChange={handleChange}
                size="small"
                disabled={isClosed || isLoading}
              >
                {isLoading ? (
                  <MenuItem value="" disabled>Cargando...</MenuItem>
                ) : localidadesFiltradas.length === 0 ? (
                  <MenuItem value="" disabled>No hay localidades para esta ciudad</MenuItem>
                ) : (
                  localidadesFiltradas.map((loc: any) => (
                    <MenuItem key={loc._id || loc.valor} value={loc.valor}>{loc.valor}</MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
          </>
        )}

        {/* Servicios Afectados */}
        {mostrarServicios && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              multiple
              size="small"
              options={serviciosAfectadosArray}
              filterOptions={filterOptions}
              isOptionEqualToValue={(option, value) => {
                const optId = typeof option === 'string' ? option : String((option as any)._id || (option as any).id);
                const valId = typeof value === 'string' ? value : String((value as any)?._id || (value as any)?.id);
                return optId === valId;
              }}
              value={(() => {
                if (!Array.isArray(form.serviciosAfectados)) return [];
                return form.serviciosAfectados.map((sa: any) => {
                  const idToFind = typeof sa === 'string' ? sa : String(sa._id || sa.id || '');
                  const servicioEncontrado = serviciosAfectadosArray.find((s) => String((s as any)._id || (s as any).id) === idToFind);
                  return servicioEncontrado || { _id: idToFind, id: idToFind, name: `Cargando...`, valor: `Cargando...` };
                });
              })()}
              onChange={(_, newValue) => onServiciosAfectadosChange(newValue as ServicioAfectado[])}
              getOptionKey={(option) => typeof option === 'string' ? option : String((option as any)._id || (option as any).id)}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                const opt = option as any;
                return opt.name || opt.valor || opt.nombre || opt.descripcion || `ID: ${opt._id || opt.id}`;
              }}
              disabled={isClosed || isLoading}
              ChipProps={{
                size: 'small',
                sx: { height: 24, m: 0.25, bgcolor: '#7f88ba', color: '#FFFFFF' },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Servicios afectados"
                  placeholder="Escribe para buscar..."
                  size="small"
                />
              )}
            />
            <ElementoModal
              open={openServicioModal}
              onClose={() => setOpenServicioModal(false)}
              onAdd={(nuevo) => {
                if (typeof nuevo === 'string') return;
                onServiciosAfectadosChange([...(form.serviciosAfectados || []), nuevo as ServicioAfectado]);
              }}
            />
          </Grid>
        )}

        {/* Campos para RESIDENCIAL */}
        {isResidencial && (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth required label="Nodo Afectado" name="nodo" value={form.nodo ?? ''} onChange={handleChange} size="small" disabled={isClosed} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth required label="Abonado" name="abonado" value={form.abonado ?? ''} onChange={handleChange} size="small" disabled={isClosed} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth required label="Nombre del Cliente" name="nombreCliente" value={form.nombreCliente ?? ''} onChange={handleChange} size="small" disabled={isClosed} />
            </Grid>
          </>
        )}

        {/* Bitácora */}
        <Grid size={12}>
          <TextField fullWidth label="Bitácora" name="bitacora" multiline maxRows={4} value={form.bitacora ?? ''} onChange={handleChange} size="small" disabled={isClosed} />
        </Grid>

        {/* Afectación */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Switch
              name="afectacion"
              checked={!!form.afectacion}
              onChange={(e) => {
                handleChange(e);
                if (!e.target.checked && !esVentanaMantenimiento && !isFallaMasiva) {
                  onServiciosAfectadosChange([]);
                }
              }}
              inputProps={{ 'aria-label': 'Afectación' }}
              disabled={isClosed}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#6BB1E2' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6BB1E2' },
              }}
            />
            <Typography sx={{ fontWeight: 500, color: '#121227' }}>Afectación</Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }
);

TicketStep1.displayName = 'TicketStep1';