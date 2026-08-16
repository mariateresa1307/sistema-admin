import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { IncidenciaPorProveedor } from '../report/hooks/useIncidenciasData'; // Ajusta la ruta si es necesario

const escapeCsv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportIncidenciasPorProveedorCsv = (data: IncidenciaPorProveedor[], mes: Dayjs): void => {
  if (data.length === 0) return;

  const headers = [
    'N° Ticket',
    'Servicio',
    'Tipo de Servicio',
    'Proveedor',
    'Inicio Falla',
    'Fin Afectación',
    'Duración Total',
    'Causa Raíz',
    'Solución',
    'Estado'
  ];

  const bodyLines = data.map((row) =>
    [
      row.caseNumber,
      row.servicioNombre,
      row.tipoServicio,
      row.proveedorNombre,
      row.horaInicioFalla !== 'N/A' ? dayjs(row.horaInicioFalla).format('DD/MM/YYYY HH:mm') : 'N/A',
      row.horaFinAfectacion !== 'N/A' ? dayjs(row.horaFinAfectacion).format('DD/MM/YYYY HH:mm') : 'N/A',
      row.duracionAfectacion,
      row.causaRaiz,
      row.solucionCaso,
      row.status.toUpperCase(),
    ].map(escapeCsv).join(','),
  );

  const totales = data.reduce(
    (acc) => ({
      total: acc.total + 1,
    }),
    { total: 0 },
  );

  const csvContent = [
    escapeCsv('Incidencias por Proveedor'),
    `${escapeCsv('Mes')},${escapeCsv(mes.format('MMMM YYYY'))}`,
    `${escapeCsv('Generado')},${escapeCsv(dayjs().format('DD/MM/YYYY HH:mm'))}`,
    '',
    headers.map(escapeCsv).join(','),
    ...bodyLines,
    // Fila de totales alineada con la columna de "N° Ticket" (la primera) y "Estado" (la última)
    [escapeCsv('TOTALES'), '', '', '', '', '', '', '', '', totales.total].map(escapeCsv).join(','),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `incidencias-por-proveedor-${mes.format('YYYY-MM')}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};