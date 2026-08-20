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

  // GRÁFICAS
  if (graficas.barras || graficas.torta) {
    let fila = HEADER_ROW + data.length + 3;

    ws.mergeCells(fila, 1, fila, 10);
    const t2 = ws.getCell(fila, 1);
    t2.value = 'RESUMEN GRÁFICO';
    t2.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    t2.alignment = { horizontal: 'center' };
    ws.getRow(fila).height = 22;

    fila += 1;
    ws.getRow(fila).height = 280;
    ws.getRow(fila + 1).height = 280;

    try {
      if (graficas.barras) {
        const id = workbook.addImage({ base64: graficas.barras, extension: 'png' });
        ws.addImage(id, {
          tl: { col: 0.2, row: fila - 0.1 },
          ext: { width: 720, height: 400 },
        });
      }
      if (graficas.torta) {
        const id2 = workbook.addImage({ base64: graficas.torta, extension: 'png' });
        ws.addImage(id2, {
          tl: { col: 5.3, row: fila - 0.1 },
          ext: { width: 480, height: 400 },
        });
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron insertar las gráficas:', err);
    }
  }

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