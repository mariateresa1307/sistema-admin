import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { IncidenciaPorServicio } from '../report/hooks/useIncidenciasData';

const escapeCsv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const exportIncidenciasCsv = (data: IncidenciaPorServicio[], mes: Dayjs): void => {
  if (data.length === 0) return;

  const headers = ['Servicio', 'Tipo de Servicio', 'Total Incidencias', 'Abiertas', 'Cerradas', 'Última Incidencia'];

  const bodyLines = data.map((row) =>
    [
      (row as IncidenciaPorServicio & { servicio: string }).servicio,
      row.tipoServicio,
      row.totalIncidencias,
      row.abiertas,
      row.cerradas,
      dayjs(row.ultimaIncidencia).format('DD/MM/YYYY HH:mm'),
    ].map(escapeCsv).join(','),
  );

  const totales = data.reduce(
    (acc, row) => ({
      total: acc.total + row.totalIncidencias,
      abiertas: acc.abiertas + row.abiertas,
      cerradas: acc.cerradas + row.cerradas,
    }),
    { total: 0, abiertas: 0, cerradas: 0 },
  );

  const csvContent = [
    escapeCsv('Incidencias por Servicio'),
    `${escapeCsv('Mes')},${escapeCsv(mes.format('MMMM YYYY'))}`,
    `${escapeCsv('Generado')},${escapeCsv(dayjs().format('DD/MM/YYYY HH:mm'))}`,
    '',
    headers.map(escapeCsv).join(','),
    ...bodyLines,
    [escapeCsv('TOTALES'), '', totales.total, totales.abiertas, totales.cerradas, ''].map(escapeCsv).join(','),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `incidencias-por-servicio-${mes.format('YYYY-MM')}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};