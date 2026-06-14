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
  ReportProblem as ReportProblemIcon, AccountTree as AccountTreeIcon
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
  tipoIncidencia?: string;
};

interface CardSeeMiscellaneousModalProps {
  open: boolean;
  onClose: () => void;
  item: MiscellaneousItem | null;
  localidades: MiscellaneousItem[];
  subcategorias: MiscellaneousItem[];
  onEditClick: () => void;
  onDelete: (item: MiscellaneousItem) => void;
}

const formatCategoria = (categoria: string): string => {
  return categoria.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const getColorByTipoIncidencia = (tipoIncidencia: string): string => {
  const tipoLower = tipoIncidencia?.toLowerCase() || '';
  
  if (tipoLower.includes('mayor') || tipoLower.includes('critic')) return '#c62828';
  if (tipoLower.includes('menor') || tipoLower.includes('baj')) return '#2e7d32';
  if (tipoLower.includes('media') || tipoLower.includes('moder')) return '#ed6c02';
  if (tipoLower.includes('alta')) return '#d32f2f';
  if (tipoLower.includes('baja')) return '#388e3c';
  
  return '#1976d2';
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
  onEditClick,
  onDelete
}: CardSeeMiscellaneousModalProps) => {
  if (!item) return null;
  const localidadesList = localidades || [];
  const subcategoriasList = subcategorias || [];

  // ✅ Estado para controlar el diálogo de confirmación
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

  // ✅ Handler para abrir el diálogo de confirmación
  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  // ✅ Handler para confirmar la eliminación
  const handleConfirmDelete = () => {
    onDelete(item);
    setConfirmDeleteOpen(false);
    onClose();
  };

  // ✅ Handler para cancelar la eliminación
  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };

  const subcategoriasAsociadas = React.useMemo(() => {
    if (item.categoria !== 'CATEGORIA_RED') {
      return [];
    }

    const itemIdStr = getIdAsString(item._id || item.id);
    
    if (!itemIdStr) {
      console.warn('⚠️ [Modal] Item sin ID válido:', item);
      return [];
    }

    console.log('🔍 [Modal] Buscando subcategorías para categoría:', {
      itemId: itemIdStr,
      itemValor: item.valor,
      totalSubcategorias: subcategoriasList.length,
      subcategoriasDisponibles: subcategoriasList.map(s => ({
        valor: s.valor,
        padreId: getIdAsString(s.padreId),
        categoria: s.categoria
      }))
    });

    const asociadas = subcategoriasList.filter((sub) => {
      const subPadreIdStr = getIdAsString(sub.padreId);
      const coincide = subPadreIdStr === itemIdStr && sub.activo !== false;
      
      if (coincide) {
        console.log(`✅ [Modal] Subcategoría encontrada: "${sub.valor}" (padreId: ${subPadreIdStr})`);
      }
      
      return coincide;
    });

    console.log(`📊 [Modal] Total subcategorías asociadas: ${asociadas.length}`);
    
    return asociadas;
  }, [item, subcategoriasList]);

  return (
    <>
      {/* ✅ Diálogo de confirmación */}
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
        {/* Header */}
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
                  bgcolor: `${getColorByTipoIncidencia(item.tipoIncidencia || '')}10`,
                  borderColor: getColorByTipoIncidencia(item.tipoIncidencia || ''),
                  borderWidth: '2px'
                }}>
                  <Typography sx={{ 
                    ...labelStyle, 
                    color: getColorByTipoIncidencia(item.tipoIncidencia || ''),
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <AccountTreeIcon sx={{ fontSize: 16 }} />
                    Tipo de Incidencia
                  </Typography>
                  <Chip
                    label={item.tipoIncidencia || 'No especificado'}
                    size="small"
                    sx={{
                      bgcolor: item.tipoIncidencia ? getColorByTipoIncidencia(item.tipoIncidencia) : '#e0e0e0',
                      color: item.tipoIncidencia ? 'white' : '#616161',
                      fontWeight: 700,
                      borderRadius: '6px',
                      mt: 0.5
                    }}
                  />
                </Box>
              </Grid>
            )}

            {/* Valor */}
            <Grid size={item.categoria === 'CATEGORIA_RED' ? { xs: 12, sm: 6 } : { xs: 12 }}>
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

            {/* Estado */}
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

            {/* Categoría */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={infoBoxStyle}>
                <Typography sx={labelStyle}>Categoría</Typography>
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

            {/* Padre */}
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

            {/* Subcategorías asociadas - SOLO para CATEGORIA_RED */}
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

            {/* Descripción */}
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

            {/* Localidades - SOLO para CIUDAD */}
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

            {/* Fechas */}
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
            onClick={handleDeleteClick} // ✅ Cambiado de handleDelete a handleDeleteClick
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