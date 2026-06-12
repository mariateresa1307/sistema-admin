"use client";
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  TextField,
  Box,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Close as CloseIcon,
  Map as MapIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { TIPO_INCIDENCIA } from "app/utils/constants";

type MiscellaneousItem = {
  _id?: string;
  id?: string;
  categoria: string;
  valor: string;
  descripcion?: string;
  padreId?: string;
  padreNombre?: string;
  activo?: boolean;
};

interface MiscellaneousModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialData?: MiscellaneousItem | null;
  categoria: string;
}

export const MiscellaneousModal = ({
  isOpen,
  onClose,
  title = "Nuevo Elemento",
  initialData,
  categoria,
}: MiscellaneousModalProps) => {
  const [valor, setValor] = React.useState("");
  const [tipoIncidencia, setTipoIncidencia] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [activo, setActivo] = React.useState(true);
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState("");
  const [estados, setEstados] = React.useState<MiscellaneousItem[]>([]);
  const [categorias, setCategorias] = React.useState<MiscellaneousItem[]>([]);
  const [loadingEstados, setLoadingEstados] = React.useState(false);
  const [loadingCategorias, setLoadingCategorias] = React.useState(false);
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Cargar estados cuando se abre el modal y es categoría CIUDAD
  React.useEffect(() => {
    const cargarEstados = async () => {
      if (categoria === "CIUDAD" && isOpen) {
        setLoadingEstados(true);
        try {
          const res = await fetch(
            "http://localhost:4000/miscellaneous?categoria=ESTADO",
          );
          const data = await res.json();
          const estadosData = Array.isArray(data) ? data : [];
          const estadosActivos = estadosData.filter(
            (e: MiscellaneousItem) => e.activo !== false,
          );
          setEstados(estadosActivos);
        } catch (error) {
          console.error("Error al cargar estados:", error);
        } finally {
          setLoadingEstados(false);
        }
      }
    };

    cargarEstados();
  }, [categoria, isOpen]);

  // Cargar categorías cuando se abre el modal y es categoría SUBCATEGORIA
  React.useEffect(() => {
    const cargarCategorias = async () => {
      if (categoria === "SUBCATEGORIA" && isOpen) {
        setLoadingCategorias(true);
        try {
          const res = await fetch(
            "http://localhost:4000/miscellaneous?categoria=CATEGORIA_RED",
          );
          const data = await res.json();
          const categoriasData = Array.isArray(data) ? data : [];
          const categoriasActivas = categoriasData.filter(
            (c: MiscellaneousItem) => c.activo !== false,
          );
          setCategorias(categoriasActivas);
        } catch (error) {
          console.error("Error al cargar categorías:", error);
        } finally {
          setLoadingCategorias(false);
        }
      }
    };

    cargarCategorias();
  }, [categoria, isOpen]);

  // Inicializar valores cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValor(initialData.valor || "");
        setDescripcion(initialData.descripcion || "");
        setActivo(initialData.activo !== false);
        if (categoria === "CIUDAD" && initialData.padreId) {
          setEstadoSeleccionado(initialData.padreId);
        }
        if (categoria === "SUBCATEGORIA" && initialData.padreId) {
          setCategoriaSeleccionada(initialData.padreId);
        }
      } else {
        setValor("");
        setDescripcion("");
        setActivo(true);
        setEstadoSeleccionado("");
        setCategoriaSeleccionada("");
      }
    }
  }, [initialData, isOpen, categoria]);

  const triggerNotification = (
    message: string,
    severity: "success" | "error",
  ) => {
    setNotification({ open: true, message, severity });
  };

  const isEditMode = Boolean(initialData?._id || initialData?.id);

  const handleSave = async () => {
    if (!valor.trim()) {
      triggerNotification("El valor es obligatorio", "error");
      return;
    }

    if (categoria === "CIUDAD" && !estadoSeleccionado) {
      triggerNotification("Debe seleccionar un estado", "error");
      return;
    }

    if (categoria === "SUBCATEGORIA" && !categoriaSeleccionada) {
      triggerNotification("Debe seleccionar una categoría", "error");
      return;
    }

    const payload: any = {
      categoria,
      valor: valor.toUpperCase(),
      descripcion,
      activo,
    };

    if (categoria === "CATEGORIA_RED" && tipoIncidencia) {
      payload.tipoIncidencia = tipoIncidencia;
    }

    if (categoria === "CIUDAD" && estadoSeleccionado) {
      const estado = estados.find(
        (e) => (e._id || e.id) === estadoSeleccionado,
      );
      if (estado) {
        payload.padreId = estado._id || estado.id;
        payload.padreNombre = estado.valor;
      }
    }

    if (categoria === "SUBCATEGORIA" && categoriaSeleccionada) {
      const cat = categorias.find(
        (c) => (c._id || c.id) === categoriaSeleccionada,
      );
      if (cat) {
        payload.padreId = cat._id || cat.id;
        payload.padreNombre = cat.valor;
      }
    }

    try {
      // TODO_MT: mover al archivo centralizado. src/lib/api.ts
      const id = initialData?._id || initialData?.id;
      const url =
        isEditMode && id
          ? `http://localhost:4000/miscellaneous/${id}`
          : "http://localhost:4000/miscellaneous";

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        triggerNotification("Elemento guardado correctamente", "success");
        setTimeout(onClose, 1000);
      } else {
        const err = await response.json();
        triggerNotification(
          `Error: ${err.message || "No se pudo guardar"}`,
          "error",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      triggerNotification("Error de conexión con el servidor", "error");
    }
  };

  return (
    <>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{
            width: "100%",
            bgcolor:
              notification.severity === "success" ? "#1ccf46" : "#d32f2f",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 0,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Categoría: {categoria.replace("_", " ")}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              {/* SELECTOR DE ESTADO - SOLO PARA CIUDAD */}
              {categoria === "CIUDAD" && (
                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      color: "#1976d2",
                    }}
                  >
                    <MapIcon fontSize="small" />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Estado *
                    </Typography>
                  </Box>

                  {loadingEstados ? (
                    <Typography variant="body2" color="text.secondary">
                      Cargando estados...
                    </Typography>
                  ) : estados.length === 0 ? (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff3e0",
                        borderRadius: 1,
                        border: "1px solid #ffb74d",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      >
                        ⚠️ No hay estados disponibles
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primero debes crear estados desde el botón "Gestionar
                        Estados" en el tab de Ciudad
                      </Typography>
                    </Box>
                  ) : (
                    <TextField
                      select
                      fullWidth
                      value={estadoSeleccionado}
                      onChange={(e) => setEstadoSeleccionado(e.target.value)}
                      size="small"
                      required
                      helperText="Selecciona el estado al que pertenece esta ciudad"
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor: "#1976d2",
                          },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography variant="body2" color="text.secondary">
                          -- Selecciona un estado --
                        </Typography>
                      </MenuItem>
                      {estados.map((estado) => (
                        <MenuItem
                          key={estado._id || estado.id}
                          value={estado._id || estado.id}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <MapIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                            <Typography>{estado.valor}</Typography>
                            {estado.descripcion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                - {estado.descripcion}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>
              )}

              {/* SELECTOR DE CATEGORÍA - SOLO PARA SUBCATEGORIA */}
              {categoria === "SUBCATEGORIA" && (
                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      color: "#7b1fa2",
                    }}
                  >
                    <CategoryIcon fontSize="small" />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Categoría *
                    </Typography>
                  </Box>

                  {loadingCategorias ? (
                    <Typography variant="body2" color="text.secondary">
                      Cargando categorías...
                    </Typography>
                  ) : categorias.length === 0 ? (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fff3e0",
                        borderRadius: 1,
                        border: "1px solid #ffb74d",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ fontWeight: 600 }}
                      >
                        ⚠️ No hay categorías disponibles
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primero debes crear categorías desde el tab de Categoría
                        Red
                      </Typography>
                    </Box>
                  ) : (
                    <TextField
                      select
                      fullWidth
                      value={categoriaSeleccionada}
                      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                      size="small"
                      required
                      helperText="Selecciona la categoría a la que pertenece esta subcategoría"
                      sx={{
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                          {
                            borderColor: "#7b1fa2",
                          },
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography variant="body2" color="text.secondary">
                          -- Selecciona una categoría --
                        </Typography>
                      </MenuItem>
                      {categorias.map((cat) => (
                        <MenuItem
                          key={cat._id || cat.id}
                          value={cat._id || cat.id}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CategoryIcon
                              sx={{ fontSize: 16, color: "#7b1fa2" }}
                            />
                            <Typography>{cat.valor}</Typography>
                            {cat.descripcion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                              >
                                - {cat.descripcion}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>
              )}

              {/* TIPO DE INCIDENCIA */}
              {categoria === "CATEGORIA_RED" && (
                <Grid size={12}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                      mb: 0.5,
                    }}
                  >
                    Tipo de incidencia
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Tipo de Incidencia"
                    name="tipoIncidencia"
                    value={tipoIncidencia}
                    onChange={(e) => setTipoIncidencia(e.target.value)}
                    size="small"
                  >
                    {TIPO_INCIDENCIA.map((tipoIncidencia) => (
                      <MenuItem value={tipoIncidencia}>
                        {tipoIncidencia}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {/* CAMPO VALOR */}
              <Grid size={12}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Valor *
                </Typography>
                <TextField
                  fullWidth
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder={
                    categoria === "CIUDAD" ? "Ej: CARACAS" : "Ej: NUEVO VALOR"
                  }
                  size="small"
                  autoFocus
                />
              </Grid>

              {/* CAMPO DESCRIPCIÓN */}
              <Grid size={12}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  Descripción
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional del elemento"
                  size="small"
                />
              </Grid>

              {/* SWITCH ACTIVO */}
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#2e7d32",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#2e7d32",
                          },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: activo ? "#2e7d32" : "#666",
                      }}
                    >
                      {activo ? "Activo" : "Inactivo"}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button onClick={onClose} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                bgcolor: "#000027",
                borderRadius: "8px",
                px: 4,
                textTransform: "none",
                "&:hover": { bgcolor: "#000045" },
              }}
            >
              Guardar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
