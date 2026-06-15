"use client";
import * as React from "react";
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Map as MapIcon, Place as PlaceIcon, Category as CategoryIcon, 
  Info as InfoIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  ReportProblem as ReportProblemIcon, AccountTree as AccountTreeIcon,
  Warning as WarningIcon, CalendarToday as CalendarIcon, Update as UpdateIcon
} from "@mui/icons-material";
import { ConfirmDialog } from "../components/confirmDialog"

type MiscellaneousItem = {
  _id?: string;
  id?: string;
  categoria: string;
  valor: string;
  descripcion?: string;
  padreId?: string;
  padreNombre?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tipoIncidencia?: string[];
  nivelSeveridad?: string; 
};

interface CardSeeMiscellaneousModalProps {
  open: boolean;
  onClose: () => void;
  item: MiscellaneousItem | null;
  localidades: MiscellaneousItem[];
  subcategorias: MiscellaneousItem[];
  soluciones?: MiscellaneousItem[];
  causasRaiz?: MiscellaneousItem[];
  onEditClick: () => void;
  onDelete: (item: MiscellaneousItem) => void;
}

const formatCategoria = (categoria: string): string => {
  return categoria.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const getColorByTipoIncidencia = (tipoIncidencia: string): string => {
  const tipoUpper = (tipoIncidencia || '').toUpperCase();
  
  if (tipoUpper.includes('PUNTUAL')) return '#e65100';
  if (tipoUpper.includes('MASIVA')) return '#c62828';
  if (tipoUpper.includes('MANTENIMIENTO')) return '#1565c0';
  
  return '#1976d2';
};

const getNivelSeveridadConfig = (nivel: string) => {
  const nivelUpper = (nivel || '').toUpperCase().trim();
  
  if (nivelUpper === 'ALTO') {
    return { bgcolor: '#ffcdd2', color: '#c62828', icon: '🔴', label: 'Alto' };
  }
  if (nivelUpper === 'MEDIO') {
    return { bgcolor: '#fff3e0', color: '#e65100', icon: '🟠', label: 'Medio' };
  }
  if (nivelUpper === 'BAJO') {
    return { bgcolor: '#c8e6c9', color: '#2e7d32', icon: '🟢', label: 'Bajo' };
  }
  
  return { bgcolor: '#f5f5f5', color: '#616161', icon: '⚪', label: nivel || 'No especificado' };
};

const getIconByCategoria = (categoria: string) => {
  switch (categoria) {
    case 'CIUDAD':
    case 'ESTADO':
      return <MapIcon sx={{ fontSize: 32, color: '#1976d2' }} />;
    case 'LOCALIDAD':
      return <PlaceIcon sx={{ fontSize: 32, color: '#1976d2' }} />;
    case 'CATEGORIA_RED':
    case 'SUBCATEGORIA':
    case 'DETALLE':
      return <CategoryIcon sx={{ fontSize: 32, color: '#7b1fa2' }} />;
    case 'CAUSA_RAIZ':
    case 'SOLUCION_CASO':
      return <ReportProblemIcon sx={{ fontSize: 32, color: '#c62828' }} />;
    case 'TIPO_CLIENTE':
      return <WarningIcon sx={{ fontSize: 32, color: '#ed6c02' }} />;
    default:
      return <InfoIcon sx={{ fontSize: 32, color: '#000027' }} />;
  }
};

const getIdAsString = (id: any): string => {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (id.toString) return id.toString();
  return String(id);
};

export const CardSeeMiscellaneousModal = ({
  open,
  onClose,
  item,
  localidades = [],
  subcategorias = [],
  soluciones = [],
  causasRaiz = [],
  onEditClick,
  onDelete
}: CardSeeMiscellaneousModalProps) => {
  if (!item) return null;
  const localidadesList = localidades || [];
  const subcategoriasList = subcategorias || [];
  const solucionesList = soluciones || [];
  const causasRaizList = causasRaiz || [];

  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item);
    setConfirmDeleteOpen(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };

  const subcategoriasAsociadas = React.useMemo(() => {
    if (item.categoria !== 'CATEGORIA_RED') return [];
    const itemIdStr = getIdAsString(item._id || item.id);
    if (!itemIdStr) return [];
    return subcategoriasList.filter((sub) => {
      const subPadreIdStr = getIdAsString(sub.padreId);
      return subPadreIdStr === itemIdStr && sub.activo !== false;
    });
  }, [item, subcategoriasList]);

  const solucionesAsociadas = React.useMemo(() => {
    if (item.categoria !== 'CAUSA_RAIZ') return [];
    const itemIdStr = getIdAsString(item._id || item.id);
    if (!itemIdStr) return [];
    return solucionesList.filter((sol) => {
      const solPadreIdStr = getIdAsString(sol.padreId);
      return solPadreIdStr === itemIdStr && sol.activo !== false;
    });
  }, [item, solucionesList]);

  const causasRaizAsociadas = React.useMemo(() => {
    if (item.categoria !== 'SOLUCION_CASO') return [];
    const itemPadreIdStr = getIdAsString(item.padreId);
    if (!itemPadreIdStr) return [];
    return causasRaizList.filter((causa) => {
      const causaIdStr = getIdAsString(causa._id || causa.id);
      return causaIdStr === itemPadreIdStr && causa.activo !== false;
    });
  }, [item, causasRaizList]);

  const nivelSeveridadConfig = item.nivelSeveridad ? getNivelSeveridadConfig(item.nivelSeveridad) : null;

  return (
    <>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de eliminar "${item.valor}"? Esta acción no se puede deshacer.`}
      />

      <AnimatePresence>
        {open && item && (
          <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35 }}
              style={{ width: '100%', maxWidth: '650px', outline: 'none' }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4, borderRadius: '18px', border: '1px solid #eaedf1',
                  boxShadow: '0px 10px 40px rgba(0,0,0,0.06), 0px 20px 70px rgba(0,0,20,0.04)',
                  bgcolor: '#ffffff', position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Top border based on status */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '5px',
                  bgcolor: item.activo !== false ? '#22c55e' : '#ef4444'
                }} />

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {getIconByCategoria(item.categoria)}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.valor}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                        {formatCategoria(item.categoria)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Editar">
                      <IconButton 
                        onClick={onEditClick} 
                        size="small" 
                        sx={{ color: '#080769', '&:hover': { bgcolor: '#0807690a' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        onClick={handleDeleteClick} 
                        size="small" 
                        sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#d32f2f0a' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3.5, borderColor: '#f1f5f9' }} />

                <Grid container spacing={3}>
                  {/* Valor */}
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Valor
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.valor}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Estado y Sección */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Estado
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={item.activo !== false ? "Activo" : "Inactivo"} 
                        size="small"
                        icon={item.activo !== false ? <CheckCircleIcon /> : <CancelIcon />}
                        sx={{ 
                          fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1,
                          bgcolor: item.activo !== false ? '#e8f5e9' : '#ffebee',
                          color: item.activo !== false ? '#2e7d32' : '#c62828'
                        }} 
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Sección
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={formatCategoria(item.categoria)} 
                        size="small"
                        sx={{ 
                          fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', px: 1,
                          bgcolor: '#e8eaf6',
                          color: '#000027'
                        }} 
                      />
                    </Box>
                  </Grid>

                  {/* Tipo de Incidencia - CATEGORIA_RED */}
                  {item.categoria === 'CATEGORIA_RED' && item.tipoIncidencia && item.tipoIncidencia.length > 0 && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Tipos de Incidencia
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {item.tipoIncidencia.map((tipo) => (
                          <Chip
                            key={tipo}
                            label={tipo}
                            size="small"
                            sx={{
                              bgcolor: getColorByTipoIncidencia(tipo),
                              color: 'white',
                              fontWeight: 600,
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              px: 1
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  {/* Nivel de Severidad - TIPO_CLIENTE */}
                  {item.categoria === 'TIPO_CLIENTE' && nivelSeveridadConfig && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Nivel de Severidad
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={`${nivelSeveridadConfig.icon} ${nivelSeveridadConfig.label}`}
                          size="small"
                          sx={{ 
                            fontWeight: 700, borderRadius: '6px', fontSize: '0.72rem', px: 1,
                            bgcolor: nivelSeveridadConfig.bgcolor,
                            color: nivelSeveridadConfig.color
                          }} 
                        />
                      </Box>
                    </Grid>
                  )}

                  {/* Pertenece a */}
                  {item.padreNombre && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Pertenece a
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', bgcolor: '#e3f2fd', px: 1.5, py: 0.6, borderRadius: '6px', display: 'inline-block' }}>
                          {item.padreNombre}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Subcategorías asociadas */}
                  {item.categoria === 'CATEGORIA_RED' && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Subcategorías asociadas ({subcategoriasAsociadas.length})
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {subcategoriasAsociadas.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                            No hay subcategorías registradas
                          </Typography>
                        ) : (
                          subcategoriasAsociadas.map((sub) => (
                            <Chip
                              key={getIdAsString(sub._id || sub.id)}
                              label={sub.valor}
                              size="small"
                              icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                bgcolor: '#e1bee7',
                                color: '#7b1fa2',
                                fontWeight: 600,
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                px: 1,
                                '& .MuiChip-icon': { color: '#7b1fa2', mr: 0.5 }
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Soluciones asociadas */}
                  {item.categoria === 'CAUSA_RAIZ' && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Soluciones asociadas ({solucionesAsociadas.length})
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {solucionesAsociadas.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                            No hay soluciones registradas
                          </Typography>
                        ) : (
                          solucionesAsociadas.map((sol) => (
                            <Chip
                              key={getIdAsString(sol._id || sol.id)}
                              label={sol.valor}
                              size="small"
                              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                bgcolor: '#c8e6c9',
                                color: '#2e7d32',
                                fontWeight: 600,
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                px: 1,
                                '& .MuiChip-icon': { color: '#2e7d32', mr: 0.5 }
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Causa raíz asociada */}
                  {item.categoria === 'SOLUCION_CASO' && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Causa raíz asociada ({causasRaizAsociadas.length})
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {causasRaizAsociadas.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                            No hay causa raíz asociada
                          </Typography>
                        ) : (
                          causasRaizAsociadas.map((causa) => (
                            <Chip
                              key={getIdAsString(causa._id || causa.id)}
                              label={causa.valor}
                              size="small"
                              icon={<ReportProblemIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                bgcolor: '#ffcdd2',
                                color: '#c62828',
                                fontWeight: 600,
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                px: 1,
                                '& .MuiChip-icon': { color: '#c62828', mr: 0.5 }
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Descripción */}
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Descripción
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                        {item.descripcion || (
                          <Typography component="span" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Sin descripción
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Localidades */}
                  {item.categoria === 'CIUDAD' && (
                    <Grid size={12}>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        Localidades ({localidadesList.length})
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {localidadesList.length === 0 ? (
                          <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                            No hay localidades registradas
                          </Typography>
                        ) : (
                          localidadesList.map((loc) => (
                            <Chip
                              key={getIdAsString(loc._id || loc.id)}
                              label={loc.valor}
                              size="small"
                              icon={<PlaceIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 500,
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                px: 1,
                                '& .MuiChip-icon': { color: '#1976d2', mr: 0.5 }
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Fechas */}
                  {(item.createdAt || item.updatedAt) && (
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {item.createdAt && (
                          <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon sx={{ fontSize: 14 }} />
                              Creado
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>
                              {new Date(item.createdAt).toLocaleDateString('es-VE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        )}
                        {item.updatedAt && (
                          <Box>
                            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UpdateIcon sx={{ fontSize: 14 }} />
                              Actualizado
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, mt: 0.5 }}>
                              {new Date(item.updatedAt).toLocaleDateString('es-VE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};