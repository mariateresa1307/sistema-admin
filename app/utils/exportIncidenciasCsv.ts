import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { IncidenciaPorServicio } from '../report/hooks/useIncidenciasData';

/* ================================================================== */
/*  CONSTANTES DE DISEÑO                                               */
/* ================================================================== */
const THEME = {
  azul: 'FF080769',
  azulKpi: 'FF1565C0',
  gris: 'FF64748B',
  borde: 'FFD9DEE5',
  zebra: 'FFF5F6FA',
  verde: 'FF2E7D32',
  naranja: 'FFE65100',
  blanco: 'FFFFFFFF',
} as const;

const SHEET_DATA = 'Incidencias por Servicio';
const SHEET_CHARTS = 'Gráficas';
const HEADER_ROW = 7;
const IMAGE_ROWS = 26; // filas aprox. que ocupa una imagen de 480px

interface GraficasReporte {
  barras?: string;
  torta?: string;
  serviciosAfectados?: number;
}

interface Kpi {
  label: string;
  valor: number;
  color: string;
  col: number;
  span: number;
}

/* ================================================================== */
/*  HELPERS DE ESTILO (responsabilidad única)                          */
/* ================================================================== */
const fillSolid = (argb: string): ExcelJS.Fill => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
});

const thinBorder = (): Partial<ExcelJS.Borders> => {
  const side: ExcelJS.Border = { style: 'thin', color: { argb: THEME.borde } };
  return { top: side, left: side, bottom: side, right: side };
};

interface BandOptions {
  size?: number;
  fill?: string;
  fontColor?: string;
  italic?: boolean;
}

/** Pinta una banda de título fusionada en una fila. */
const setBand = (
  ws: ExcelJS.Worksheet,
  row: number,
  fromCol: number,
  toCol: number,
  text: string,
  opts: BandOptions = {},
): void => {
  const { size = 16, fill, fontColor = THEME.blanco, italic = false } = opts;
  ws.mergeCells(row, fromCol, row, toCol);
  const cell = ws.getCell(row, fromCol);
  cell.value = text;
  cell.font = { bold: !italic, italic, size, color: { argb: fontColor } };
  if (fill) cell.fill = fillSolid(fill);
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

/* ================================================================== */
/*  CÁLCULOS (funciones puras)                                         */
/* ================================================================== */
const calcularTotales = (data: IncidenciaPorServicio[]) =>
  data.reduce(
    (acc, row) => ({
      total: acc.total + row.totalIncidencias,
      abiertas: acc.abiertas + row.abiertas,
      cerradas: acc.cerradas + row.cerradas,
    }),
    { total: 0, abiertas: 0, cerradas: 0 },
  );

const formatearFecha = (value?: string | Date | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A';

/* ================================================================== */
/*  CONSTRUCTORES DE SECCIONES                                         */
/* ================================================================== */
const renderEncabezado = (ws: ExcelJS.Worksheet, mes: Dayjs): void => {
  setBand(ws, 1, 1, 5, 'REPORTE DE INCIDENCIAS POR SERVICIO', { size: 16, fill: THEME.azul });
  ws.getRow(1).height = 34;

  setBand(
    ws, 2, 1, 5,
    `Mes: ${mes.format('MMMM YYYY').toUpperCase()}   •   Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
    { size: 10, fontColor: THEME.gris, italic: true },
  );
  ws.getRow(2).height = 20;
};

const renderKpis = (ws: ExcelJS.Worksheet, kpis: Kpi[]): void => {
  kpis.forEach((k) => {
    if (k.span > 1) {
      ws.mergeCells(4, k.col, 4, k.col + k.span - 1);
      ws.mergeCells(5, k.col, 5, k.col + k.span - 1);
    }
    const label = ws.getCell(4, k.col);
    label.value = k.label;
    label.font = { bold: true, size: 8, color: { argb: THEME.gris } };
    label.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    const valor = ws.getCell(5, k.col);
    valor.value = k.valor;
    valor.font = { bold: true, size: 18, color: { argb: k.color } };
    valor.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ws.getRow(4).height = 16;
  ws.getRow(5).height = 28;
};

const renderTabla = (ws: ExcelJS.Worksheet, data: IncidenciaPorServicio[]): void => {
  const headers = ['TIPO DE SERVICIO', 'TOTAL INCIDENCIAS', 'ABIERTAS', 'CERRADAS', 'ÚLTIMA INCIDENCIA'];
  const headerRow = ws.getRow(HEADER_ROW);

  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: THEME.blanco } };
    c.fill = fillSolid(THEME.azul);
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = thinBorder();
  });
  headerRow.height = 28;

  data.forEach((row, idx) => {
    const r = ws.getRow(HEADER_ROW + 1 + idx);
    r.values = [
      row.tipoServicio,
      row.totalIncidencias,
      row.abiertas,
      row.cerradas,
      formatearFecha(row.ultimaIncidencia),
    ];
    r.eachCell((c, colNumber) => {
      c.border = thinBorder();
      c.alignment = colNumber >= 2
        ? { horizontal: 'center', vertical: 'middle' }
        : { vertical: 'middle' };
      if (idx % 2 === 1) c.fill = fillSolid(THEME.zebra);
    });
    r.getCell(3).font = { bold: true, color: { argb: THEME.naranja } };
    r.getCell(4).font = { bold: true, color: { argb: THEME.verde } };
  });

  // Fila de totales
  const totales = calcularTotales(data);
  const totalRow = ws.getRow(HEADER_ROW + 1 + data.length);
  totalRow.values = ['TOTALES', totales.total, totales.abiertas, totales.cerradas, ''];
  totalRow.eachCell((c) => {
    c.border = thinBorder();
    c.fill = fillSolid(THEME.azul);
    c.font = { bold: true, size: 11, color: { argb: THEME.blanco } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
  totalRow.height = 24;

  ws.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW + data.length, column: 5 },
  };
  ws.views = [{ state: 'frozen', ySplit: HEADER_ROW }];
};

/* ================================================================== */
/*  HOJAS DEL LIBRO                                                    */
/* ================================================================== */
const buildDataSheet = (
  workbook: ExcelJS.Workbook,
  data: IncidenciaPorServicio[],
  mes: Dayjs,
  serviciosAfectados: number,
): void => {
  const ws = workbook.addWorksheet(SHEET_DATA, { views: [{ showGridLines: false }] });

  ws.columns = [
    { key: 'tipo', width: 24 },
    { key: 'total', width: 18 },
    { key: 'abiertas', width: 14 },
    { key: 'cerradas', width: 14 },
    { key: 'ultima', width: 22 },
  ];

  renderEncabezado(ws, mes);

  const totales = calcularTotales(data);
  renderKpis(ws, [
    { label: 'TOTAL INCIDENCIAS', valor: totales.total, color: THEME.azul, col: 1, span: 1 },
    { label: 'ABIERTAS', valor: totales.abiertas, color: THEME.naranja, col: 2, span: 1 },
    { label: 'CERRADAS', valor: totales.cerradas, color: THEME.verde, col: 3, span: 1 },
    { label: 'SERVICIOS AFECTADOS', valor: serviciosAfectados, color: THEME.azulKpi, col: 4, span: 2 },
  ]);

  renderTabla(ws, data);
};

/** Hoja independiente para las gráficas: no interfiere con la data. */
const buildChartsSheet = (workbook: ExcelJS.Workbook, graficas: GraficasReporte): void => {
  const ws = workbook.addWorksheet(SHEET_CHARTS, { views: [{ showGridLines: false }] });
  ws.columns = Array.from({ length: 14 }, () => ({ width: 11 }));

  setBand(ws, 1, 1, 14, 'RESUMEN GRÁFICO', { size: 14, fill: THEME.azul });
  ws.getRow(1).height = 28;

  let nextRow = 3;

  if (graficas.barras) {
    const id = workbook.addImage({ base64: graficas.barras, extension: 'png' });
    ws.addImage(id, { tl: { col: 0.5, row: nextRow }, ext: { width: 950, height: 500 } });
    nextRow += IMAGE_ROWS + 2;
  }

  if (graficas.torta) {
    const id = workbook.addImage({ base64: graficas.torta, extension: 'png' });
    ws.addImage(id, { tl: { col: 0.5, row: nextRow }, ext: { width: 950, height: 500 } });
  }
};

/* ================================================================== */
/*  DESCARGA                                                           */
/* ================================================================== */
const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string): Promise<void> => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/* ================================================================== */
/*  PUNTO DE ENTRADA                                                   */
/* ================================================================== */
export const exportIncidenciasCsv = async (
  data: IncidenciaPorServicio[],
  mes: Dayjs,
  graficas: GraficasReporte = {},
): Promise<void> => {
  if (data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Admin';
  workbook.created = new Date();

  buildDataSheet(workbook, data, mes, graficas.serviciosAfectados ?? data.length);

  if (graficas.barras || graficas.torta) {
    buildChartsSheet(workbook, graficas);
  }

  await downloadWorkbook(workbook, `incidencias-por-servicio-${mes.format('YYYY-MM')}.xlsx`);
};