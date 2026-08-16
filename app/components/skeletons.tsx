"use client";
import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

// ✅ Skeleton de tabla: imita el diseño corporativo (header #080769 + filas)
export const TableSkeleton = ({ rows = 8, withSearch = true }: { rows?: number; withSearch?: boolean }) => (
  <Box>
    {withSearch && (
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Skeleton variant="rounded" width={140} height={40} sx={{ bgcolor: '#e2e8f0' }} />
        <Skeleton variant="rounded" width={320} height={40} sx={{ bgcolor: '#e2e8f0' }} />
      </Stack>
    )}

    <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', bgcolor: '#ffffff' }}>
      {/* Header oscuro corporativo */}
      <Box sx={{ bgcolor: '#080769', height: 48 }} />

      {Array.from({ length: rows }).map((_, i) => (
        <Stack
          key={i}
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}
        >
          <Skeleton variant="circular" width={34} height={34} sx={{ animationDelay: `${i * 60}ms` }} />
          <Skeleton variant="text" width="16%" sx={{ animationDelay: `${i * 60}ms` }} />
          <Skeleton variant="text" width="28%" sx={{ animationDelay: `${i * 60}ms` }} />
          <Skeleton variant="text" width="20%" sx={{ animationDelay: `${i * 60}ms` }} />
          <Skeleton variant="rounded" width={90} height={26} sx={{ ml: 'auto', animationDelay: `${i * 60}ms` }} />
        </Stack>
      ))}
    </Box>
  </Box>
);

// ✅ Skeleton de tarjetas KPI (dashboards, métricas)
export const KpiSkeleton = ({ count = 4 }: { count?: number }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={110}
        sx={{ flex: 1, bgcolor: '#e2e8f0', animationDelay: `${i * 80}ms` }}
      />
    ))}
  </Stack>
);

// ✅ Skeleton de página completa (navegación entre módulos)
export const PageSkeleton = () => (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Skeleton variant="text" width={280} height={44} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width={420} height={24} sx={{ mb: 3 }} />
    <KpiSkeleton count={4} />
    <Box sx={{ mt: 3 }}>
      <TableSkeleton rows={6} withSearch={true} />
    </Box>
  </Box>
);