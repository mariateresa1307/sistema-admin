'use client';
import {
  DataGrid,
  GridColDef,
  DataGridProps,
} from "@mui/x-data-grid";
import { useMemo, useState, useEffect, useCallback } from "react";
import { TextField, Box, InputAdornment, Chip, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface CustomDataGridProps extends Omit<DataGridProps, 'rows'> {
  rows: Array<any>;
  columns: Array<GridColDef>;
  loading: boolean;
}

const CustomDataGrid = ({ rows, columns, loading, ...restProps }: CustomDataGridProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  // 🔹 INICIALIZACIÓN: Definimos el campo y término iniciales
  const [searchField, setSearchField] = useState<string>(
    columns.find(col => col.field === 'username') ? 'username' : (columns[0]?.field || "")
);
 const [searchTerm, setSearchTerm] = useState("");
  
  const [searchResults, setSearchResults] = useState(rows);
  const [isSearching, setIsSearching] = useState(false);

  const isStatusField = useMemo(() => searchField === 'isActive', [searchField]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sincronizar: Si el término está vacío, mostramos todo, excepto si es estado (que siempre tiene valor)
  useEffect(() => {
    if (!searchTerm && !isStatusField) {
      setSearchResults(rows);
    }
  }, [rows, searchTerm, isStatusField]);

  const mockApiSearch = useCallback(async (field: string, value: string) => {
    return new Promise<any[]>((resolve) => {
      setTimeout(() => {
        const filtered = rows.filter((row: any) => {
          if (field === 'isActive') {
            return String(row[field]) === value;
          }
          const cellValue = String(row[field] || "").toLowerCase();
          return cellValue.includes(value.toLowerCase());
        });
        resolve(filtered);
      }, 300);
    });
  }, [rows]);

  const handleSearch = useCallback(async () => {
    // Si no hay término y no es campo de estado, mostramos todo
    if (!searchTerm && !isStatusField) {
      setSearchResults(rows);
      return;
    }

    setIsSearching(true);
    try {
      const results = await mockApiSearch(searchField, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults(rows);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, searchField, rows, mockApiSearch, isStatusField]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchField, handleSearch]);

  const initialState = useMemo(() => ({
    pagination: { paginationModel: { page: 0, pageSize: 10 } },
  }), []);

  if (!isMounted) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          select
          value={searchField}
          onChange={(e) => {
            const newField = e.target.value;
            setSearchField(newField);
            // Si cambia a estado, ponemos "true" por defecto, si no, limpiamos
            setSearchTerm(newField === 'isActive' ? "true" : "");
          }}
          label="Search by"
          size="small"
          sx={{ minWidth: 150 }}
        >
          {columns.map((col) => (
            <MenuItem key={col.field} value={col.field}>
              {col.headerName || col.field}
            </MenuItem>
          ))}
        </TextField>

        {isStatusField ? (
          <TextField
            select
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200, maxWidth: 500, flex: 1 }}
            label="Filter by status"
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </TextField>
        ) : (
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search...`}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ),
            }}
            sx={{ maxWidth: 500 }}
          />
        )}
      </Box>

      <DataGrid
        getRowId={(row) => row._id || row.id}
        rows={searchResults}
        columns={columns}
        loading={loading || isSearching}
        initialState={initialState}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{
          borderRadius: "12px",
          border: '1px solid #eaedf1',
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "primary.main" },
          "& .MuiDataGrid-columnHeader": { backgroundColor: "primary.main", color: "#FFFFFF !important" },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, color: "#FFFFFF !important" },
        }}
        {...restProps}
      />
    </Box>
  );
}

export { CustomDataGrid };