"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Button, Box, Chip, Divider
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { 
  Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Map as MapIcon, Place as PlaceIcon, Category as CategoryIcon, 
  Info as InfoIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon 
} from "@mui/icons-material";

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
};

interface CardSeeMiscellaneousModalProps {
  open: boolean;
  onClose: () => void;
  item: MiscellaneousItem | null;
  localidades: MiscellaneousItem[]; // ✅ NUEVO: Array de localidades
  onEditClick: () => void;
  onDelete: (item: MiscellaneousItem) => void;
}

// Función para formatear la categoría
const formatCategoria = (categoria: string): string => {
  return categoria.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Icono según la categoría
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
    default:
      return <InfoIcon sx={{ fontSize: 28, color: '#000027' }} />;
  }
};

export const CardSeeMiscellaneousModal = ({
  open,
  onClose,
  item,
 localidades = [], // ✅ NUEVO
  onEditClick,
  onDelete
}: CardSeeMiscellaneousModalProps) => {
  if (!item) return null;
const localidadesList = localidades || [];
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

  // ✅ Handler para eliminar con confirmación
  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar "${item.valor}"?`)) {
      onDelete(item);
      onClose();
    }
  };

  return (
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
      {/* Header con color según categoría */}
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
          {/* Valor */}
          <Grid size={{ xs: 12 }}>
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

          {/* Estado y Categoría */}
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

          {/* Padre (si existe) */}
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

    {/* ✅ SECCIÓN DE LOCALIDADES - Solo para CIUDAD */}
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
              key={loc._id || loc.id}
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
          onClick={handleDelete}
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
  );
};