"use client";
import { useMemo } from "react";
import { CustomDataGrid } from "app/components/customDataGrid";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Chip, Box, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import MapIcon from "@mui/icons-material/Map";
import CategoryIcon from "@mui/icons-material/Category";
import WarningIcon from "@mui/icons-material/Warning";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { MiscellaneousItem } from "../miscellaneous/useMiscellaneous";

interface MiscellaneousTableProps {
  rows: MiscellaneousItem[];
  localidades: MiscellaneousItem[];
  loading: boolean;
  currentCategoria: string;
  onCellClick: (params: GridCellParams) => void;
  onEdit: (item: MiscellaneousItem) => void;
  onDelete: (item: MiscellaneousItem) => void;
  onOpenLocalidades: (item: MiscellaneousItem) => void;
  onOpenSubcategorias: (item: MiscellaneousItem) => void;
}

export const MiscellaneousTable = ({
  rows,
  localidades,
  loading,
  currentCategoria,
  onCellClick,
  onEdit,
  onDelete,
  onOpenLocalidades,
  onOpenSubcategorias,
}: MiscellaneousTableProps) => {
  const getLocalidadesByCiudad = (ciudadId: string) => {
    if (!ciudadId) return [];

    const result = localidades.filter(
      (item) =>
        item.categoria === "LOCALIDAD" &&
        item.padreId === ciudadId &&
        item.activo !== false,
    );

    return result;
  };

  const getTipoIncidenciaConfig = (tipo: string) => {
    const tipoUpper = (tipo || "").toUpperCase();

    if (tipoUpper.includes("PUNTUAL")) {
      return { bgcolor: "#fff3e0", color: "#e65100", icon: "⚠️" };
    }
    if (tipoUpper.includes("MASIVA")) {
      return { bgcolor: "#ffebee", color: "#c62828", icon: "🚨" };
    }
    if (tipoUpper.includes("MANTENIMIENTO")) {
      return { bgcolor: "#e3f2fd", color: "#1565c0", icon: "🔧" };
    }
    return { bgcolor: "#f5f5f5", color: "#616161", icon: "ℹ️" };
  };

  const columns = useMemo((): GridColDef[] => {
    const baseColumns: GridColDef[] = [];

    baseColumns.push({
      field: "valor",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: "#e8eaf6",
            color: "#000027",
            fontWeight: "bold",
            borderRadius: "8px",
          }}
        />
      ),
    });

    if (currentCategoria === "CIUDAD") {
      baseColumns.push({
        field: "padreNombre",
        headerName: "Estado",
        flex: 1,
        minWidth: 150,
        renderCell: (params) =>
          params.value ? (
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              icon={<MapIcon sx={{ fontSize: 16 }} />}
              sx={{ borderColor: "#1976d2", color: "#1976d2", fontWeight: 600 }}
            />
          ) : (
            <Typography
              variant="caption"
              color="error"
              sx={{ fontWeight: 600 }}
            >
              ⚠️ Sin estado
            </Typography>
          ),
      });

      baseColumns.push({
        field: "localidades",
        headerName: "Localidades",
        flex: 2,
        minWidth: 300,
        sortable: false,
        renderCell: (params) => {
          const ciudadId = params.row._id || params.row.id;
          const localidadesData = getLocalidadesByCiudad(ciudadId);

          if (localidadesData.length === 0) {
            return (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin localidades
              </Typography>
            );
          }

          return (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {localidadesData.slice(0, 3).map((loc) => (
                <Chip
                  key={loc._id || loc.id}
                  label={loc.valor}
                  size="small"
                  icon={<PlaceIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1976d2",
                    fontWeight: 500,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              ))}
              {localidadesData.length > 3 && (
                <Chip
                  label={`+${localidadesData.length - 3}`}
                  size="small"
                  sx={{
                    bgcolor: "#f5f5f5",
                    color: "#616161",
                    fontWeight: 600,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    height: "24px",
                  }}
                />
              )}
            </Box>
          );
        },
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });

      baseColumns.push({
        field: "gestionarLocalidades",
        headerName: "Gestionar",
        width: 100,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="Agregar/Editar localidades">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLocalidades(params.row as MiscellaneousItem);
              }}
              sx={{
                color: "#1976d2",
                bgcolor: "#e3f2fd",
                "&:hover": { bgcolor: "#bbdefb" },
              }}
            >
              <PlaceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      });
    } else if (currentCategoria === "SUBCATEGORIA") {
      baseColumns.push({
        field: "padreNombre",
        headerName: "Categoría",
        flex: 1,
        minWidth: 150,
        renderCell: (params) =>
          params.value ? (
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              icon={<CategoryIcon sx={{ fontSize: 16 }} />}
              sx={{ borderColor: "#7b1fa2", color: "#7b1fa2", fontWeight: 600 }}
            />
          ) : (
            <Typography
              variant="caption"
              color="error"
              sx={{ fontWeight: 600 }}
            >
              ⚠️ Sin categoría
            </Typography>
          ),
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });
    } else if (currentCategoria === "CATEGORIA_RED") {
      baseColumns.push({
        field: "tipoIncidencia",
        headerName: "Tipo de Incidencia",
        flex: 1.5,
        minWidth: 280,
        renderCell: (params) => {
          const tipos = params.value || [];
          const tiposArray = Array.isArray(tipos)
            ? tipos
            : tipos
              ? [tipos]
              : [];

          if (tiposArray.length === 0) {
            return (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin tipo de incidencia
              </Typography>
            );
          }

          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              {tiposArray.map((tipo) => {
                const config = getTipoIncidenciaConfig(tipo);
                return (
                  <Chip
                    key={tipo}
                    label={`${config.icon} ${tipo}`}
                    size="small"
                    sx={{
                      bgcolor: config.bgcolor,
                      color: config.color,
                      fontWeight: 700,
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      height: "24px",
                      px: 0.8,
                    }}
                  />
                );
              })}
            </Box>
          );
        },
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });

      baseColumns.push({
        field: "gestionarSubcategorias",
        headerName: "Subcategorías",
        width: 130,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="Gestionar subcategorías">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSubcategorias(params.row as MiscellaneousItem);
              }}
              sx={{
                color: "#7b1fa2",
                bgcolor: "#f3e5f5",
                "&:hover": { bgcolor: "#e1bee7" },
              }}
            >
              <CategoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      });
    } else if (currentCategoria === "CAUSA_RAIZ") {
      baseColumns.push({
        field: "solucionesAsociadas",
        headerName: "Detalles",
        flex: 1.5,
        minWidth: 250,
        sortable: false,
        renderCell: (params) => {
          const soluciones = params.row.solucionesAsociadas || [];
          const solucionesArray = Array.isArray(soluciones) ? soluciones : [];

          if (solucionesArray.length === 0) {
            return (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin soluciones asociadas
              </Typography>
            );
          }

          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "center",
              }}
            >
              {solucionesArray.slice(0, 2).map((sol: any) => (
                <Chip
                  key={sol._id || sol.id}
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label={sol.valor}
                  size="small"
                  sx={{
                    bgcolor: "#e8f5e9",
                    color: "#2e7d32",
                    fontWeight: 600,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    "& .MuiChip-icon": { color: "#2e7d32" },
                  }}
                />
              ))}
              {solucionesArray.length > 2 && (
                <Chip
                  label={`+${solucionesArray.length - 2}`}
                  size="small"
                  sx={{
                    bgcolor: "#f5f5f5",
                    color: "#616161",
                    fontWeight: 600,
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>
          );
        },
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });
    } else if (currentCategoria === "SOLUCION_CASO") {
      baseColumns.push({
        field: "padreNombre",
        headerName: "Detalles",
        flex: 1.5,
        minWidth: 250,
        renderCell: (params) => {
          const causaRaiz = params.value;

          if (!causaRaiz) {
            return (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin causa raíz asociada
              </Typography>
            );
          }

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <ReportProblemIcon sx={{ fontSize: 18, color: "#c62828" }} />
              <Chip
                label={causaRaiz}
                size="small"
                sx={{
                  bgcolor: "#ffebee",
                  color: "#c62828",
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          );
        },
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });
    }
    // ✅ NUEVO: Caso TIPO_CLIENTE - Mostrar Nivel de Severidad asociado
    else if (currentCategoria === "TIPO_CLIENTE") {
      baseColumns.push({
        field: "nivelSeveridad", // ✅ CAMBIADO: de "padreNombre" a "nivelSeveridad"
        headerName: "Nivel de Severidad",
        flex: 1.2,
        minWidth: 200,
        renderCell: (params) => {
          const nivelSeveridad = params.value;

          if (!nivelSeveridad) {
            return (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                Sin nivel de severidad
              </Typography>
            );
          }
          // Función para obtener color según el nivel
          const getNivelColor = (nivel: string) => {
            const nivelUpper = nivel.toUpperCase().trim();
            if (nivelUpper === "ALTO") {
              return { bgcolor: "#ffcdd2", color: "#c62828", icon: "🔴" };
            }
            if (nivelUpper === "MEDIO") {
              return { bgcolor: "#fff3e0", color: "#e65100", icon: "🟠" };
            }
            if (nivelUpper === "BAJO") {
              return { bgcolor: "#c8e6c9", color: "#2e7d32", icon: "🟢" };
            }
            return { bgcolor: "#f5f5f5", color: "#616161", icon: "⚪" };
          };

          const config = getNivelColor(nivelSeveridad);

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Chip
                label={`${config.icon} ${nivelSeveridad}`}
                size="small"
                sx={{
                  bgcolor: config.bgcolor,
                  color: config.color,
                  fontWeight: 600,
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          );
        },
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });
    } else {
      // Default para DETALLE y otras categorías
      baseColumns.push({
        field: "descripcion",
        headerName: "Detalles",
        flex: 1.5,
        minWidth: 250,
        renderCell: (params) =>
          params.value ? (
            <Typography variant="body2" sx={{ color: "#1e293b" }}>
              {params.value}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Sin detalles
            </Typography>
          ),
      });

      baseColumns.push({
        field: "activo",
        headerName: "Estado",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
          <Chip
            label={params.value !== false ? "Activo" : "Inactivo"}
            size="small"
            sx={{
              bgcolor: params.value !== false ? "#e8f5e9" : "#ffebee",
              color: params.value !== false ? "#2e7d32" : "#c62828",
              fontWeight: "bold",
            }}
          />
        ),
      });
    }

    return baseColumns;
  }, [
    currentCategoria,
    localidades,
    onEdit,
    onDelete,
    onOpenLocalidades,
    onOpenSubcategorias,
  ]);

  return (
    <Box
      sx={{
        "& .MuiDataGrid-row": {
          cursor: "pointer",
          transition: "background-color 0.15s ease",
        },
        "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
      }}
    >
      <CustomDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        onCellClick={onCellClick}
        getRowId={(row) => row._id || row.id || Math.random().toString()}
      />
    </Box>
  );
};
