"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Button, Box, Chip, Divider
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { 
  Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Map as MapIcon, Place as PlaceIcon, Category as CategoryIcon, 
  Info as InfoIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  ReportProblem as ReportProblemIcon, AccountTree as AccountTreeIcon,
  Warning as WarningIcon
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

// ✅ NUEVA: Función para obtener color del nivel de severidad
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
      return <MapIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
    case 'LOCALIDAD':
      return <PlaceIcon sx={{ fontSize: 28, color: '#1976d2' }} />;
    case 'CATEGORIA_RED':
    case 'SUBCATEGORIA':
    case 'DETALLE':
      return <CategoryIcon sx={{ fontSize: 28, color: '#7b1fa2' }} />;
    case 'CAUSA_RAIZ':
    case 'SOLUCION_CASO':
      return <ReportProblemIcon sx={{ fontSize: 28, color: '#c62828' }} />;
    case 'TIPO_CLIENTE':
      return <WarningIcon sx={{ fontSize: 28, color: '#ed6c02' }} />;
    default:
      return <InfoIcon sx={{ fontSize: 28, color: '#000027' }} />;
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

  const labelStyle = {
    fontWeight: 700,
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    mb: 0.5,
    letterSpacing: '0.5px'
  };

  const valueStyle = {
    fontSize: '0.95rem',
    color: '#1e293b',
    fontWeight: 500
  };

  const infoBoxStyle = {
    p: 2,
    bgcolor: '#f8fafc',
    borderRadius: 2,
    border: '1px solid #e2e8f0',
    height: '100%'
  };

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
    if (item.categoria !== 'CATEGORIA_RED') {
      return [];
    }

    const itemIdStr = getIdAsString(item._id || item.id);
    
    if (!itemIdStr) {
      return [];
    }

    return subcategoriasList.filter((sub) => {
      const subPadreIdStr = getIdAsString(sub.padreId);
      return subPadreIdStr === itemIdStr && sub.activo !== false;
    });
  }, [item, subcategoriasList]);

  const solucionesAsociadas = React.useMemo(() => {
    if (item.categoria !== 'CAUSA_RAIZ') {
      return [];
    }

    const itemIdStr = getIdAsString(item._id || item.id);
    
    if (!itemIdStr) {
      return [];
    }

    return solucionesList.filter((sol) => {
      const solPadreIdStr = getIdAsString(sol.padreId);
      return solPadreIdStr === itemIdStr && sol.activo !== false;
    });
  }, [item, solucionesList]);

  const causasRaizAsociadas = React.useMemo(() => {
    if (item.categoria !== 'SOLUCION_CASO') {
      return [];
    }

    const itemPadreIdStr = getIdAsString(item.padreId);
    
    if (!itemPadreIdStr) {
      return [];
    }

    return causasRaizList.filter((causa) => {
      const causaIdStr = getIdAsString(causa._id || causa.id);
      return causaIdStr === itemPadreIdStr && causa.activo !== false;
    });
  }, [item, causasRaizList]);

  // ✅ NUEVA: Obtener configuración del nivel de severidad
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

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '18px',
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            bgcolor: '#000027',
            color: 'white',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {getIconByCategoria(item.categoria)}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {item.valor}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatCategoria(item.categoria)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Tipo de Incidencia - SOLO para CATEGORIA_RED */}
            {item.categoria === 'CATEGORIA_RED' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ 
                  ...infoBoxStyle, 
                  borderColor: '#1976d2',
                  borderWidth: '2px'
                }}>
                  <Typography sx={{ 
                    ...labelStyle, 
                    color: '#1976d2',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <AccountTreeIcon sx={{ fontSize: 16 }} />
                    Tipos de Incidencia
                  </Typography>
                  
                  {(() => {
                    const tipos = item.tipoIncidencia || [];
                    const tiposArray = Array.isArray(tipos) ? tipos : (tipos ? [tipos] : []);
                    
                    if (tiposArray.length === 0) {
                      return (
                        <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 0.5 }}>
                          No especificado
                        </Typography>
                      );
                    }
                    
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {tiposArray.map((tipo) => (
                          <Chip
                            key={tipo}
                            label={tipo}
                            size="small"
                            sx={{
                              bgcolor: getColorByTipoIncidencia(tipo),
                              color: 'white',
                              fontWeight: 700,
                              borderRadius: '6px',
                            }}
                          />
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              </Grid>
            )}

           

            <Grid size={item.categoria === 'CATEGORIA_RED' || item.categoria === 'TIPO_CLIENTE' ? { xs: 12, sm: 6 } : { xs: 12 }}>
              <Box sx={infoBoxStyle}>
                <Typography sx={labelStyle}>
                  <CategoryIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Valor
                </Typography>
                <Typography sx={{ ...valueStyle, fontSize: '1.1rem', fontWeight: 600, color: '#000027' }}>
                  {item.valor}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={infoBoxStyle}>
                <Typography sx={labelStyle}>Estado</Typography>
                <Chip
                  label={item.activo !== false ? "Activo" : "Inactivo"}
                  size="small"
                  icon={item.activo !== false ? <CheckCircleIcon /> : <CancelIcon />}
                  sx={{
                    bgcolor: item.activo !== false ? '#e8f5e9' : '#ffebee',
                    color: item.activo !== false ? '#2e7d32' : '#c62828',
                    fontWeight: 'bold',
                    borderRadius: '6px'
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={infoBoxStyle}>
                <Typography sx={labelStyle}>Seccion</Typography>
                <Chip
                  label={formatCategoria(item.categoria)}
                  size="small"
                  sx={{
                    bgcolor: '#e8eaf6',
                    color: '#000027',
                    fontWeight: 600,
                    borderRadius: '6px'
                  }}
                />
              </Box>
            </Grid>

             {/* ✅ NUEVO: Nivel de Severidad - SOLO para TIPO_CLIENTE */}
            {item.categoria === 'TIPO_CLIENTE' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ 
                  ...infoBoxStyle, 
                  borderColor: nivelSeveridadConfig?.color || '#ed6c02',
                  borderWidth: '2px'
                }}>
                  <Typography sx={{ 
                    ...labelStyle, 
                    color: nivelSeveridadConfig?.color || '#ed6c02',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <WarningIcon sx={{ fontSize: 16 }} />
                    Nivel de Severidad
                  </Typography>
                  
                  {nivelSeveridadConfig ? (
                    <Chip
                      label={`${nivelSeveridadConfig.icon} ${nivelSeveridadConfig.label}`}
                      size="medium"
                      sx={{
                        bgcolor: nivelSeveridadConfig.bgcolor,
                        color: nivelSeveridadConfig.color,
                        fontWeight: 700,
                        borderRadius: '6px',
                        mt: 0.5,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 0.5 }}>
                      No especificado
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            {item.padreNombre && (
              <Grid size={12}>
                <Box sx={{ ...infoBoxStyle, bgcolor: '#e3f2fd', borderColor: '#1976d2' }}>
                  <Typography sx={{ ...labelStyle, color: '#1976d2' }}>
                    <MapIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Pertenece a
                  </Typography>
                  <Typography sx={{ ...valueStyle, color: '#1976d2', fontWeight: 600 }}>
                    {item.padreNombre}
                  </Typography>
                </Box>
              </Grid>
            )}

            {item.categoria === 'CATEGORIA_RED' && (
              <Grid size={12}>
                <Box sx={{ ...infoBoxStyle, bgcolor: '#f3e5f5', borderColor: '#7b1fa2' }}>
                  <Typography sx={{ ...labelStyle, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CategoryIcon sx={{ fontSize: 14 }} />
                    Subcategorías asociadas ({subcategoriasAsociadas.length})
                  </Typography>
                  
                  {subcategoriasAsociadas.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 1 }}>
                      No hay subcategorías registradas para esta categoría
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {subcategoriasAsociadas.map((sub) => (
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
                            '& .MuiChip-icon': { color: '#7b1fa2' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {item.categoria === 'CAUSA_RAIZ' && (
              <Grid size={12}>
                <Box sx={{ ...infoBoxStyle, bgcolor: '#e8f5e9', borderColor: '#2e7d32' }}>
                  <Typography sx={{ ...labelStyle, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14 }} />
                    Soluciones del caso asociadas ({solucionesAsociadas.length})
                  </Typography>
                  
                  {solucionesAsociadas.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 1 }}>
                      No hay soluciones registradas para esta causa raíz
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {solucionesAsociadas.map((sol) => (
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
                            '& .MuiChip-icon': { color: '#2e7d32' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {item.categoria === 'SOLUCION_CASO' && (
              <Grid size={12}>
                <Box sx={{ ...infoBoxStyle, bgcolor: '#ffebee', borderColor: '#c62828' }}>
                  <Typography sx={{ ...labelStyle, color: '#c62828', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ReportProblemIcon sx={{ fontSize: 14 }} />
                    Causa raíz asociada ({causasRaizAsociadas.length})
                  </Typography>
                  
                  {causasRaizAsociadas.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic', mt: 1 }}>
                      No hay causa raíz asociada
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {causasRaizAsociadas.map((causa) => (
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
                            '& .MuiChip-icon': { color: '#c62828' }
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            <Grid size={12}>
              <Box sx={infoBoxStyle}>
                <Typography sx={labelStyle}>
                  <InfoIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Descripción
                </Typography>
                <Typography sx={valueStyle}>
                  {item.descripcion || (
                    <Typography component="span" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                      Sin descripción
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Grid>

            {item.categoria === 'CIUDAD' && (
              <Grid size={12}>
                <Box sx={{ ...infoBoxStyle, bgcolor: '#e0e3ff', borderColor: '#009dff' }}>
                  <Typography sx={{ ...labelStyle, color: '#4490db' }}>
                    <PlaceIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Localidades ({localidadesList.length})
                  </Typography>
                  
                  {localidadesList.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                      No hay localidades registradas para esta ciudad
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {localidadesList.map((loc) => (
                        <Chip
                          key={getIdAsString(loc._id || loc.id)}
                          label={loc.valor}
                          size="small"
                          icon={<PlaceIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 500,
                            borderRadius: '6px'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

            {(item.createdAt || item.updatedAt) && (
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {item.createdAt && (
                    <Box>
                      <Typography sx={{ ...labelStyle, fontSize: '0.65rem' }}>Creado</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
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
                      <Typography sx={{ ...labelStyle, fontSize: '0.65rem' }}>Actualizado</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
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
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: 'none',
              color: '#64748b',
              fontWeight: 600
            }}
          >
            Cerrar
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteClick}
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: '#d32f2f',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              '&:hover': { bgcolor: '#b71c1c' }
            }}
          >
            Eliminar
          </Button>
          <Button
            variant="contained"
            onClick={onEditClick}
            startIcon={<EditIcon />}
            sx={{
              bgcolor: '#000027',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              '&:hover': { bgcolor: '#000045' }
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};