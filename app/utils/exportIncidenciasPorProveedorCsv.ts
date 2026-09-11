import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { IncidenciaPorProveedor } from '../report/hooks/useIncidenciasData';

const AZUL = 'FF080769';
const GRIS = 'FF64748B';
const BORDE = 'FFD9DEE5';
const ZEBRA = 'FFF5F6FA';
const VERDE = 'FF2E7D32';
const NARANJA = 'FFE65100';
const ROJO = 'FFC62828';

const borde = (): Partial<ExcelJS.Borders> => {
  const side = { style: 'thin', color: { argb: BORDE } } as ExcelJS.Border;
  return { top: side, left: side, bottom: side, right: side };
};

export const exportIncidenciasPorProveedorCsv = async (
  data: IncidenciaPorProveedor[],
  mes: Dayjs,
  graficas: { barras?: string; torta?: string; serviciosAfectados?: number } = {},
): Promise<void> => {
  if (data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Incidencias', {
    views: [{ showGridLines: false }],
  });

  ws.columns = [
    { key: 'ticket', width: 16 },
    { key: 'servicio', width: 40 },
    { key: 'tipo', width: 16 },
    { key: 'proveedor', width: 28 },
    { key: 'inicio', width: 18 },
    { key: 'fin', width: 18 },
    { key: 'duracion', width: 18 },
    { key: 'causa', width: 30 },
    { key: 'solucion', width: 30 },
    { key: 'estado', width: 14 },
  ];

  // TÍTULO
  ws.mergeCells('A1:J1');
  const titulo = ws.getCell('A1');
  titulo.value = 'REPORTE DE INCIDENCIAS POR PROVEEDOR';
  titulo.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  titulo.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 34;

  ws.mergeCells('A2:J2');
  const sub = ws.getCell('A2');
  sub.value = `Mes: ${mes.format('MMMM YYYY').toUpperCase()}   •   Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  sub.font = { italic: true, size: 10, color: { argb: GRIS } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // KPIs
  const abiertas = data.filter((d) => {
    const s = d.status?.toUpperCase() || '';
    return s === 'ACTIVO' || s === 'EN GESTIÓN' || s === 'EN_GESTION';
  }).length;
  const cerradas = data.length - abiertas;

  const serviciosAfectados = graficas.serviciosAfectados ?? new Set(data.map((d) => d.servicioNombre)).size;

  const kpis = [
    { label: 'TOTAL INCIDENCIAS', valor: data.length, color: AZUL, col: 1 },
    { label: 'ABIERTAS', valor: abiertas, color: NARANJA, col: 3 },
    { label: 'CERRADAS', valor: cerradas, color: VERDE, col: 5 },
    { label: 'SERVICIOS', valor: serviciosAfectados, color: 'FF1565C0', col: 7 },
  ];

  kpis.forEach((k) => {
    ws.mergeCells(4, k.col, 4, k.col + 1);
    ws.mergeCells(5, k.col, 5, k.col + 1);
    const label = ws.getCell(4, k.col);
    label.value = k.label;
    label.font = { bold: true, size: 9, color: { argb: GRIS } };
    label.alignment = { horizontal: 'center' };
    const valor = ws.getCell(5, k.col);
    valor.value = k.valor;
    valor.font = { bold: true, size: 18, color: { argb: k.color } };
    valor.alignment = { horizontal: 'center' };
  });
  ws.getRow(5).height = 28;

  // ENCABEZADO
  const HEADER_ROW = 7;
  const headers = [
    'N° TICKET', 'SERVICIO', 'TIPO DE SERVICIO', 'PROVEEDOR',
    'INICIO FALLA', 'FIN AFECTACIÓN', 'DURACIÓN TOTAL',
    'CAUSA RAÍZ', 'SOLUCIÓN', 'ESTADO'
  ];
  const headerRow = ws.getRow(HEADER_ROW);
  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = borde();
  });
  headerRow.height = 28;

  // DATOS
  data.forEach((row, idx) => {
    const r = ws.getRow(HEADER_ROW + 1 + idx);
    r.values = [
      row.caseNumber,
      row.servicioNombre,
      row.tipoServicio,
      row.proveedorNombre,
      row.horaInicioFalla !== 'N/A' ? dayjs(row.horaInicioFalla).format('DD/MM/YYYY HH:mm') : 'N/A',
      row.horaFinAfectacion !== 'N/A' ? dayjs(row.horaFinAfectacion).format('DD/MM/YYYY HH:mm') : 'N/A',
      row.duracionAfectacion,
      row.causaRaiz,
      row.solucionCaso,
      (row.status || '').toUpperCase(),
    ];
    r.eachCell((c, colNumber) => {
      c.border = borde();
      c.alignment = colNumber >= 5 && colNumber <= 7
        ? { horizontal: 'center', vertical: 'middle' }
        : { vertical: 'middle', wrapText: true };
      if (idx % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
    });

    const statusCell = r.getCell(10);
    const st = (row.status || '').toUpperCase();
    if (st === 'CERRADO') statusCell.font = { bold: true, color: { argb: VERDE } };
    else if (st === 'ACTIVO') statusCell.font = { bold: true, color: { argb: ROJO } };
    else if (st === 'EN GESTIÓN' || st === 'EN_GESTION') statusCell.font = { bold: true, color: { argb: NARANJA } };
    else statusCell.font = { bold: true, color: { argb: GRIS } };
  });

  // FILA DE TOTALES
  const totalRow = ws.getRow(HEADER_ROW + 1 + data.length);
  ws.mergeCells(totalRow.number, 1, totalRow.number, 9);
  for (let i = 1; i <= 10; i++) {
    const cell = totalRow.getCell(i);
    cell.border = borde();
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  }
  const totalLabel = totalRow.getCell(1);
  totalLabel.value = 'TOTALES';
  totalLabel.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  totalLabel.alignment = { horizontal: 'right', vertical: 'middle' };
  const totalValue = totalRow.getCell(10);
  totalValue.value = data.length;
  totalValue.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  totalValue.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW + data.length, column: 10 },
  };
  ws.views = [{ state: 'frozen', ySplit: HEADER_ROW }];

  // ✅ SECCIÓN GRÁFICAS (Ajustada - Sin perturbar la data principal)
  let currentRow = HEADER_ROW + data.length + 2;

  // --- 1. DISTRIBUCIÓN POR ESTADO (Compacta) ---
  const totalTickets = data.length || 1;
  const pctAbiertas = Math.round((abiertas / totalTickets) * 100);
  const pctCerradas = Math.round((cerradas / totalTickets) * 100);

  ws.mergeCells(currentRow, 1, currentRow, 10);
  const tituloGrafico = ws.getCell(currentRow, 1);
  tituloGrafico.value = 'RESUMEN GRÁFICO';
  tituloGrafico.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  tituloGrafico.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  tituloGrafico.alignment = { horizontal: 'center' };
  ws.getRow(currentRow).height = 24;
  currentRow += 1;

  // Tabla de distribución compacta
  const headerDist = ws.getRow(currentRow);
  ['Estado', 'Cantidad', '%', 'Distribución'].forEach((h, i) => {
    const c = headerDist.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  
  ws.getColumn(1).width = 15;
  ws.getColumn(2).width = 12;
  ws.getColumn(3).width = 8;
  ws.getColumn(4).width = 35;
  currentRow += 1;

  // Fila Abiertas
  ws.getRow(currentRow).getCell(1).value = 'Abiertas';
  ws.getRow(currentRow).getCell(1).font = { bold: true, color: { argb: NARANJA } };
  ws.getRow(currentRow).getCell(1).border = borde();
  
  ws.getRow(currentRow).getCell(2).value = abiertas;
  ws.getRow(currentRow).getCell(2).alignment = { horizontal: 'center' };
  ws.getRow(currentRow).getCell(2).border = borde();
  
  ws.getRow(currentRow).getCell(3).value = `${pctAbiertas}%`;
  ws.getRow(currentRow).getCell(3).font = { bold: true, color: { argb: NARANJA } };
  ws.getRow(currentRow).getCell(3).alignment = { horizontal: 'center' };
  ws.getRow(currentRow).getCell(3).border = borde();
  
  const barraAbiertas = '█'.repeat(Math.round(pctAbiertas / 2.5)) + '░'.repeat(40 - Math.round(pctAbiertas / 2.5));
  ws.getRow(currentRow).getCell(4).value = barraAbiertas;
  ws.getRow(currentRow).getCell(4).font = { color: { argb: NARANJA }, size: 9, name: 'Consolas' };
  ws.getRow(currentRow).getCell(4).border = borde();
  currentRow += 1;

  // Fila Cerradas
  ws.getRow(currentRow).getCell(1).value = 'Cerradas';
  ws.getRow(currentRow).getCell(1).font = { bold: true, color: { argb: VERDE } };
  ws.getRow(currentRow).getCell(1).border = borde();
  
  ws.getRow(currentRow).getCell(2).value = cerradas;
  ws.getRow(currentRow).getCell(2).alignment = { horizontal: 'center' };
  ws.getRow(currentRow).getCell(2).border = borde();
  
  ws.getRow(currentRow).getCell(3).value = `${pctCerradas}%`;
  ws.getRow(currentRow).getCell(3).font = { bold: true, color: { argb: VERDE } };
  ws.getRow(currentRow).getCell(3).alignment = { horizontal: 'center' };
  ws.getRow(currentRow).getCell(3).border = borde();
  
  const barraCerradas = '█'.repeat(Math.round(pctCerradas / 2.5)) + '░'.repeat(40 - Math.round(pctCerradas / 2.5));
  ws.getRow(currentRow).getCell(4).value = barraCerradas;
  ws.getRow(currentRow).getCell(4).font = { color: { argb: VERDE }, size: 9, name: 'Consolas' };
  ws.getRow(currentRow).getCell(4).border = borde();
  currentRow += 2;

  // --- 2. TOP SERVICIOS (Orden ajustado: INCIDENCIAS | SERVICIO | DISTRIBUCIÓN) ---
  const serviciosCount = data.reduce((acc, ticket) => {
    acc[ticket.servicioNombre] = (acc[ticket.servicioNombre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topServicios = Object.entries(serviciosCount)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 8);

  ws.mergeCells(currentRow, 1, currentRow, 10);
  const tituloServicios = ws.getCell(currentRow, 1);
  tituloServicios.value = 'TOP SERVICIOS CON MÁS INCIDENCIAS';
  tituloServicios.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  tituloServicios.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  tituloServicios.alignment = { horizontal: 'center' };
  ws.getRow(currentRow).height = 24;
  currentRow += 1;

  // ✅ Encabezados reordenados: INCIDENCIAS | SERVICIO | DISTRIBUCIÓN
  const headerServ = ws.getRow(currentRow);
  const headersTop = ['INCIDENCIAS', 'SERVICIO', 'DISTRIBUCIÓN'];
  
  headersTop.forEach((h, i) => {
    const c = headerServ.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5C6BC0' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  
  // ✅ Anchos de columna ajustados
  ws.getColumn(1).width = 14;  // Incidencias (estrecho)
  ws.getColumn(2).width = 50;  // Servicio (ancho para ver nombres completos)
  ws.getColumn(3).width = 40;  // Distribución (medio)
  currentRow += 1;

  topServicios.forEach((item, idx) => {
    const r = ws.getRow(currentRow + idx);
    const maxCantidad = topServicios[0].cantidad;
    const pctRelativo = Math.round((item.cantidad / maxCantidad) * 100);

    // ✅ Columna 1: INCIDENCIAS (número centrado)
    r.getCell(1).value = item.cantidad;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(1).border = borde();
    r.getCell(1).font = { bold: true, size: 11, color: { argb: AZUL } };

    // ✅ Columna 2: SERVICIO (nombre completo)
    r.getCell(2).value = item.nombre;
    r.getCell(2).font = { size: 9 };
    r.getCell(2).alignment = { vertical: 'middle', wrapText: false };
    r.getCell(2).border = borde();

    // ✅ Columna 3: DISTRIBUCIÓN (barra visual relativa al que más tiene)
    const barra = '█'.repeat(Math.round(pctRelativo / 2.5)) + '░'.repeat(40 - Math.round(pctRelativo / 2.5));
    r.getCell(3).value = barra;
    r.getCell(3).font = { color: { argb: 'FF5C6BC0' }, size: 9, name: 'Consolas' };
    r.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    r.getCell(3).border = borde();

    // Zebra striping (3 columnas)
    if (idx % 2 === 1) {
      for (let i = 1; i <= 3; i++) {
        r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      }
    }
  });

  currentRow += topServicios.length;

  // DESCARGA
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `incidencias-por-proveedor-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};