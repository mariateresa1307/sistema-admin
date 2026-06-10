"use client";
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  RestartAlt as ResetIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
// Importaciones para manejo de fechas (requiere @mui/x-date-pickers)
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { getUsers } from "@/lib/api";
import { UserDTO } from "@/lib/types/user.dto";

interface UserSelectOpt extends UserDTO {
  selected: boolean;
}

export default function FiltrosSuperiores() {
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(null);
  const [toDate, setToDate] = React.useState<Dayjs | null>(null);
  const [users, setUsers] = React.useState<Array<UserSelectOpt>>([]);

  const downloadExcel = () => { 
    const formData = new URLSearchParams();

    formData.append("startDate", fromDate?.toISOString() ?? "");
    formData.append("endDate", toDate?.toISOString() ?? "");

    const selectedUser = users.find((u) => u.selected);
    if (selectedUser) {
      formData.append("testuser", selectedUser._id);
    }

    window.open(`http://localhost:4000/audit/export?${formData.toString()}`, '_blank');
  }

  useEffect(() => {
    getUsers().then((result: any) => {
      setUsers(result.data?.map((u: UserDTO) => ({...u, selected: false})))
    })
  }, [setUsers])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card 
      elevation={0}
        sx={{
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
            <FilterIcon sx={{ color: "#080769" }} fontSize="small" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#080769" }}
            >
              Filtros de Auditoría
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {/* Búsqueda por Usuario */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Usuario"
                defaultValue=""
              >
                {
                  users.map(user => (
                    <MenuItem key={user._id} value={user._id}>{user.primerNombre} {user.primerApellido}</MenuItem>
                  ))
                } 
              </TextField>
            </Grid>


            {/* Fecha Desde */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Fecha de inicio"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>

            {/* Fecha Hasta */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Fecha de finalización"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Grid>

            {/* Botones de Control */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#080769",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    console.log("ww")
                    downloadExcel();
                  }}
                >
                  Descargar excel
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ borderRadius: "8px", minWidth: "45px" }}
                >
                  <ResetIcon fontSize="small" />
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
