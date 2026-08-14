"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Chip, Typography, Stack, Avatar, CircularProgress, Alert, IconButton, Tooltip,
    TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TablePagination,
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon, WifiOff as WifiOffIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { getOnlineUsers, sendHeartbeat } from '@/lib/api';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface OnlineUser {
    _id: string;
    username: string;
    email: string;
    primerNombre: string;
    primerApellido: string;
    role: string;
    lastHeartbeat: string;
}

const ROLE_CONFIG: Record<string, { label: string; bgcolor: string; color: string }> = {
    admin: { label: 'Administrador', bgcolor: '#e3f2fd', color: '#1565c0' },
    operador: { label: 'Operador', bgcolor: '#fff3e0', color: '#e65100' },
    editor: { label: 'Operator Editor', bgcolor: '#f3e5f5', color: '#6a1b9a' },
};

export const OnlineUsersTab = () => {
    const [users, setUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // ✅ Filtros y paginación en cliente
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadOnline = useCallback(async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            setError(null);
            const res = await getOnlineUsers();
            setUsers(Array.isArray(res.data) ? res.data : []);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('❌ Error cargando usuarios en línea:', err);
            setError('Error al cargar usuarios en línea');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        sendHeartbeat().catch(() => { }); // registra al usuario actual al abrir el tab
        loadOnline(true);
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') loadOnline(false);
        }, 60000);
        return () => clearInterval(interval);
    }, [loadOnline]);

    // ✅ Datos derivados: filtro por rol + búsqueda + orden por actividad reciente
    const filtered = useMemo(() => {
        let list = [...users];

        if (roleFilter !== 'all') {
            list = list.filter((u) => u.role === roleFilter);
        }

        const term = search.trim().toLowerCase();
        if (term) {
            list = list.filter((u) =>
                [u.primerNombre, u.primerApellido, u.username, u.email]
                    .some((f) => String(f ?? '').toLowerCase().includes(term))
            );
        }

        return list.sort(
            (a, b) => dayjs(b.lastHeartbeat).valueOf() - dayjs(a.lastHeartbeat).valueOf()
        );
    }, [users, search, roleFilter]);

    // ✅ Reset de página al cambiar filtros
    useEffect(() => { setPage(0); }, [search, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(page, totalPages - 1);

    const pageRows = useMemo(
        () => filtered.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage),
        [filtered, safePage, rowsPerPage]
    );

    const roleCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        users.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
        return counts;
    }, [users]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#080769' }} />
            </Box>
        );
    }

    return (
        <Box>
            {/* ========== BARRA SUPERIOR: métricas + acciones ========== */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Box
                        sx={{
                            width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(46,125,50,0.4)' },
                                '70%': { boxShadow: '0 0 0 6px rgba(46,125,50,0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(46,125,50,0)' },
                            },
                        }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#080769' }}>
                        {users.length} en línea
                    </Typography>

                    {lastUpdate && (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Actualizado {dayjs(lastUpdate).fromNow()}
                        </Typography>
                    )}
                </Stack>


            </Stack>

            {/* ✅ Filtros rápidos por rol */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                    label="Todos"
                    size="small"
                    color={roleFilter === 'all' ? 'primary' : 'default'}
                    onClick={() => setRoleFilter('all')}
                    sx={{ fontWeight: 600 }}
                />
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <Chip
                        key={role}
                        label={cfg.label}
                        size="small"
                        onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                        sx={{
                            fontWeight: 600,
                            bgcolor: roleFilter === role ? cfg.color : cfg.bgcolor,
                            color: roleFilter === role ? '#ffffff' : cfg.color,
                            transition: 'all 0.2s ease',
                        }}
                    />
                ))}
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* ========== TABLA Densa ========== */}
            {filtered.length === 0 && !error ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <WifiOffIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                    <Typography color="text.secondary">
                        {users.length === 0
                            ? 'No hay usuarios conectados en este momento'
                            : 'Sin resultados para los filtros aplicados'}
                    </Typography>
                </Box>
            ) : (
                <TableContainer sx={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#080769' }}>
                                {['Usuario', 'Rol', 'Correo Electrónico', 'Última Actividad', 'Estado'].map((h) => (
                                    <TableCell
                                        key={h}
                                        sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.78rem', py: 1.2 }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageRows.map((user) => {
                                const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.editor;
                                return (
                                    <TableRow
                                        key={user._id}
                                        sx={{
                                            '&:hover': { bgcolor: '#f8fafc' },
                                            transition: 'background-color 0.15s ease',
                                        }}
                                    >
                                        {/* Usuario: avatar + nombre + @username */}
                                        <TableCell>
                                            <Stack direction="row" spacing={1.2} alignItems="center">
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8eaf6', color: '#080769', fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {(user.primerNombre?.[0] || user.username?.[0] || 'U').toUpperCase()}
                                                    </Avatar>
                                                    <Box
                                                        sx={{
                                                            position: 'absolute', bottom: -1, right: -1,
                                                            width: 10, height: 10, borderRadius: '50%',
                                                            bgcolor: '#2e7d32', border: '2px solid #ffffff',
                                                        }}
                                                    />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                                                        {user.primerNombre} {user.primerApellido}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                        @{user.username}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 700, fontSize: '0.68rem' }} />
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.8rem', color: '#334155' }}>{user.email}</TableCell>

                                        <TableCell>
                                            <Tooltip title={dayjs(user.lastHeartbeat).format('DD/MM/YYYY HH:mm:ss')}>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                    {dayjs(user.lastHeartbeat).fromNow()}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label="En línea"
                                                size="small"
                                                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: '0.68rem' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    
                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={safePage}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50]}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    
                    />
                </TableContainer>
            )}
        </Box>
    );
};