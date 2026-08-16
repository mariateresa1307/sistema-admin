"use client";
import React, { useEffect, useState } from "react";
import { Modal, Paper, Box, Typography, IconButton, Divider, Chip, Tooltip, Dialog, Avatar } from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UpdateIcon from "@mui/icons-material/Update";
import { getMiscellaneous, deleteService } from "@/lib/api";
import { ConfirmDialog } from "../components/confirmDialog";

interface ServiceData {
  _id?: string;
  tipoServicio: string;
  name: string;
  city: string;
  tipoCliente?: string | { _id: string; valor?: string; nombre?: string };
  ipNetuno?: string;
  id_netuno?: string;
  idRBS?: string;
  id_circuito?: string;
  idServicio?: string;
  serialONT?: string;
  nodoA?: string;
  nodoB?: string;
  nodoOLT?: string;
  contrato?: number;
  vlan?: number | string;
  status?: string;
  instalado?: boolean;
  proveedorDelServicioCompartido?: string;
  diagramaRed?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface CardSeeServiceModalProps {
  open: boolean;
  onClose: () => void;
  service: ServiceData | null;
  onEditClick?: () => void;
  onDeleteSuccess?: () => void;
}

export const CardSeeServiceModal = ({
  open,
  onClose,
  service,
  onEditClick,
  onDeleteSuccess,
}: CardSeeServiceModalProps) => {
  const [tipoClienteNombre, setTipoClienteNombre] = useState<string>("");
  const [loadingTipoCliente, setLoadingTipoCliente] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning" as "warning" | "info" | "success",
  });


  const normalizeToArray = (response: any): any[] => {
    if (!response?.data) return [];
    
    // Si response.data ya es el array directamente
    if (Array.isArray(response.data)) return response.data;
    
    // Si response.data tiene estructura paginada { data: [...], total: X }
    if (Array.isArray(response.data.data)) return response.data.data;
    
    // Si response.data tiene estructura { results: [...] }
    if (Array.isArray(response.data.results)) return response.data.results;
    
    // Fallback: array vacío
    return [];
  };

  useEffect(() => {
    if (!open || !service?.tipoCliente) {
      setTipoClienteNombre("");
      return;
    }

    const obtenerNombreTipoCliente = async () => {
      setLoadingTipoCliente(true);
      try {
        let tipoClienteId = "";

        if (typeof service.tipoCliente === "object" && service.tipoCliente !== null) {
          if ("valor" in service.tipoCliente && service.tipoCliente.valor) {
            setTipoClienteNombre(service.tipoCliente.valor);
            setLoadingTipoCliente(false);
            return;
          }
          if ("nombre" in service.tipoCliente && service.tipoCliente.nombre) {
            setTipoClienteNombre(service.tipoCliente.nombre);
            setLoadingTipoCliente(false);
            return;
          }
          if ("_id" in service.tipoCliente) {
            tipoClienteId = String(service.tipoCliente._id);
          }
        } else if (typeof service.tipoCliente === "string") {
          tipoClienteId = service.tipoCliente;
        }

        if (!tipoClienteId) {
          setTipoClienteNombre("");
          setLoadingTipoCliente(false);
          return;
        }

        const response = await getMiscellaneous({ categoria: "TIPO_CLIENTE" });
        const tipoClientes = normalizeToArray(response);
        const listaSegura = Array.isArray(tipoClientes) ? tipoClientes : [];
        const tipoEncontrado = listaSegura.find(
          (tc: any) => String(tc._id) === tipoClienteId,
        );

        if (tipoEncontrado) {
          setTipoClienteNombre(tipoEncontrado.valor || tipoEncontrado.nombre || "Sin nombre");
        } else {
          setTipoClienteNombre(tipoClienteId);
        }
      } catch (error) {
        console.error("❌ [SeeModal] Error al obtener tipo de cliente:", error);
        setTipoClienteNombre(String(service.tipoCliente));
      } finally {
        setLoadingTipoCliente(false);
      }
    };

    obtenerNombreTipoCliente();
  }, [open, service]);

  const isActivo = service?.status === "Activo";
  const accionTexto = isActivo ? "desactivar" : "reactivar";
  const nuevoEstado = isActivo ? "Inactivo" : "Activo";

  const requestToggleStatus = () => {
    if (!service?._id) return;

    setConfirmDialog({
      open: true,
      title: isActivo ? "Desactivar Servicio" : "Reactivar Servicio",
      message: `¿Estás seguro de que deseas ${accionTexto} el servicio "${service.name}"? El registro se marcará como "${nuevoEstado}".`,
      type: "warning",
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        try {
          await deleteService(service._id!);
          window.dispatchEvent(
            new CustomEvent("app-notification", {
              detail: {
                message: `Servicio ${accionTexto}do exitosamente`,
                severity: "success",
              },
            }),
          );
          onClose();
          if (onDeleteSuccess) onDeleteSuccess();
        } catch (error: any) {
          console.error(`❌ [SeeModal] Error al ${accionTexto} servicio:`, error);
        }
      },
    });
  };

  if (!service) return null;

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return null;
    try {
      return new Date(dateValue).toLocaleDateString("es-VE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getDynamicFields = (s: ServiceData) => {
    switch (s.tipoServicio) {
      case "METROLAN":
        return [
          { label: "NOMBRE CLIENTE", value: s.name },
          { label: "TIPO SERVICIO", value: s.tipoServicio },
          { label: "ID SERVICIO", value: s.id_circuito },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
          { label: "IP NETUNO", value: s.ipNetuno },
          { label: "VLAN", value: s.vlan },
        ];
      case "RBS":
        return [
          { label: "ID NETUNO / CIRCUITO", value: s.id_netuno || s.id_circuito || "N/A" },
          { label: "TIPO CLIENTE", value: loadingTipoCliente ? "Cargando..." : tipoClienteNombre || "—" },
          { label: "ID RBS", value: s.idRBS },
          { label: "SERIAL ONT", value: s.serialONT },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
          { label: "NODO OLT", value: s.nodoOLT },
        ];
      case "IU":
        return [
          { label: "NOMBRE DE ENLACE", value: s.name },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
        ];
      case "DOG":
        return [
          { label: "CONTRATO", value: s.contrato },
          { label: "ID DOG", value: s.id_circuito },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "NODO B", value: s.nodoB },
          { label: "NODO OLT", value: s.nodoOLT },
          { label: "SERIAL ONT", value: s.serialONT },
        ];
      case "REDES COMPARTIDAS":
        return [
          { label: "NOMBRE CLIENTE", value: s.name },
           { label: "TIPO CLIENTE", value: loadingTipoCliente ? "Cargando..." : tipoClienteNombre || "—" },
          { label: "CONTRATO", value: s.contrato },
          { label: "VLAN", value: s.vlan },
          { label: "NODO A", value: s.nodoA },
          { label: "IP NETUNO", value: s.ipNetuno },
          
        ];
      default:
        return [];
    }
  };

  return (
    <>
      {/* MODAL VISOR DE IMAGEN A PANTALLA COMPLETA */}
      <Dialog
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: "rgba(0, 0, 0, 0.9)", boxShadow: "none" } }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
            p: 2,
          }}
        >
          <IconButton
            onClick={() => setIsImageModalOpen(false)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>
          {service?.diagramaRed && (
            <img
              src={service.diagramaRed}
              alt="Diagrama de red ampliado"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            />
          )}
        </Box>
      </Dialog>

      <AnimatePresence>
        {open && (
          <Modal
            open={open}
            onClose={onClose}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.35 }}
              style={{ width: "100%", maxWidth: "600px", outline: "none" }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: "18px",
                  border: "1px solid #eaedf1",
                  boxShadow: "0px 10px 40px rgba(0,0,0,0.06)",
                  bgcolor: "#ffffff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "5px",
                    bgcolor: isActivo ? "#22c55e" : "#f59e0b",
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <SettingsEthernetIcon sx={{ color: "#080769", fontSize: "1.5rem" }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      Detalles del Servicio
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {onEditClick && isActivo && (
                      <Tooltip title="Editar">
                        <IconButton onClick={onEditClick} size="small" sx={{ color: "#1976d2" }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={isActivo ? "Desactivar" : "Reactivar"}>
                      <IconButton
                        onClick={requestToggleStatus}
                        size="small"
                        sx={{ color: isActivo ? "#d32f2f" : "#2e7d32" }}
                      >
                        {isActivo ? <DeleteIcon /> : <DoneAllIcon />}
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3.5, borderColor: "#c0c8d0" }} />

                {/* SECCIÓN DE IMAGEN */}
                {service.diagramaRed && (
                  <Grid size={12} sx={{ mb: 3 }}>
                    <Box
                      onClick={() => setIsImageModalOpen(true)}
                      sx={{
                        position: "relative",
                        cursor: "zoom-in",
                        transition: "transform 0.2s ease",
                        "&:hover": { transform: "scale(1.01)" },
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #d9dee5",
                      }}
                    >
                      <Avatar
                        src={service.diagramaRed}
                        variant="rounded"
                        sx={{ width: "100%", height: 180, bgcolor: "#F8FAFC" }}
                      >
                        <PhotoCamera sx={{ fontSize: 40, color: "#94a3b8" }} />
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: "50%",
                          p: 0.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ZoomInIcon fontSize="small" />
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: "rgba(8, 7, 105, 0.85)",
                          color: "white",
                          p: 1,
                          textAlign: "center",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          letterSpacing: "0.5px",
                        }}
                      >
                        CLICK PARA AMPLIAR DIAGRAMA
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", display: "block" }}>
                      ESTADO
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={isActivo ? "Activo" : "Inactivo"}
                        size="small"
                        color={isActivo ? "success" : "default"}
                        sx={isActivo ? {} : { border: "1px solid #cbd5e1", color: "#64748b" }}
                      />
                    </Box>
                  </Grid>

                  {getDynamicFields(service).map((field, idx) => (
                    <Grid key={idx} size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", display: "block" }}>
                        {field.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", wordBreak: "break-word" }}>
                        {field.value || "—"}
                      </Typography>
                    </Grid>
                  ))}

                  {/*  SECCIÓN DE FECHAS: Creado y Actualizado */}
                  {(service.createdAt || service.updatedAt) && (
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {service.createdAt && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: "uppercase",
                                color: "#64748b",
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <CalendarMonthIcon sx={{ fontSize: 14 }} />
                              Creado
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500, mt: 0.5 }}>
                              {formatDate(service.createdAt)}
                            </Typography>
                          </Box>
                        )}
                        {service.updatedAt && (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: "uppercase",
                                color: "#64748b",
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <UpdateIcon sx={{ fontSize: 14 }} />
                              Actualizado
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500, mt: 0.5 }}>
                              {formatDate(service.updatedAt)}
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

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => {
          console.log(" [ConfirmDialog] Cancel button clicked");
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }}
        confirmText={isActivo ? "Sí, desactivar" : "Sí, reactivar"}
        cancelText="Cancelar"
      />
    </>
  );
};