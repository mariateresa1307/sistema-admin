"use client";

import React, { useState } from "react";
import { Box, Typography, Card, CardContent, TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Paper, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Download, BarChart as ChartIcon } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Divider from '@mui/material/Divider';
import { Search } from "@mui/icons-material"
import { getReportPreview } from "@/lib/api";
import { ReportePreview } from "app/utils/types";

interface Props {
    reportPreview: ReportePreview;
}

const minutesToHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

const formatHours = (hours: number) => `${hours.toLocaleString('es-VE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} h`;

export function GrupoA({ reportPreview, }: Props) {
    const mttrPlataformaHours = (reportPreview.mttrPlataforma ?? []).map(({ title, value }) => ({
        title,
        value: minutesToHours(value),
    }));

    const mttrServicioHours = (reportPreview.mttrServicio ?? []).map(({ title, value }) => ({
        title,
        value: minutesToHours(value),
    }));

    return (
        /* --- GRÁFICOS MTTR --- */
        <Grid container spacing={3}>

            {/* --- GRÁFICOS MTTR plataforma --- */}
            <Grid size={{ xs: 12, lg: 12 }}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChartIcon sx={{ mr: 1 }} /> MTTR Plataforma
                    </Typography>
                    <Typography sx={{ mb: 3, display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                        Valor expresado en horas
                    </Typography>
                    <Box sx={{ height: 360, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mttrPlataformaHours}
                                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="title"
                                    interval={0}
                                    angle={-35}
                                    textAnchor="end"
                                    height={70}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={formatHours} />
                                <Tooltip formatter={(value) => formatHours(Number(value))} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Card>
            </Grid>

            {/* --- GRÁFICOS MTTR servicio --- */}
            <Grid size={{ xs: 12, lg: 12 }}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <ChartIcon sx={{ mr: 1 }} /> MTTR Servicio
                    </Typography>
                    <Typography sx={{ mb: 3, display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                        Valor expresado en horas
                    </Typography>
                    <Box sx={{ height: 360, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mttrServicioHours}
                                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="title"
                                    interval={0}
                                    angle={-35}
                                    textAnchor="end"
                                    height={70}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={formatHours} />
                                <Tooltip formatter={(value) => formatHours(Number(value))} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Card>
            </Grid>
        </Grid >
    )
}