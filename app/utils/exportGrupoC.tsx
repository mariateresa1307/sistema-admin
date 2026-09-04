import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { ReportePreview } from 'app/utils/types';

interface TicketPorOperador {
  name: string;
  cantidad: number;
}

interface ExportGrupoCParams {
  reportPreview: ReportePreview;
  mes: Dayjs;
  ticketsPorOperador?: TicketPorOperador[];
  promedioPorOperador?: number;
  cantidadOperadores?: number;
}

// ==========================================
// PALETA DE COLORES: Base Azul + Pasteles
// ==========================================
const AZUL_OSCURO = 'FF080769';
const AZUL_MEDIO = 'FF1976D2';
const AZUL_CLARO = 'FF42A5F5';
const AZUL_PASTEL = 'FFBBDEFB';

const VERDE_PASTEL = 'FFC8E6C9';
const AMARILLO_PASTEL = 'FFFFECB3';
const ROSA_PASTEL = 'FFF8BBD0';
const LAVANDA_PASTEL = 'FFE1BEE7';
const TURQUESA_PASTEL = 'FFB2DFDB';

const GRIS = 'FF64748B';
const GRIS_CLARO = 'FFF5F7FA';
const BORDE = 'FFD9DEE5';
const BLANCO = 'FFFFFFFF';

const borde = (color: string = BORDE): Partial<ExcelJS.Borders> => {
  const side = { style: 'thin', color: { argb: color } } as ExcelJS.Border;
  return { top: side, left: side, bottom: side, right: side };
};

export const exportReporteGrupoCExcel = async ({
  reportPreview,
  mes,
  ticketsPorOperador = [],
  promedioPorOperador = 0,
  cantidadOperadores = 0,
}: ExportGrupoCParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Grupo C - Operativos 7x24', {
    views: [{ showGridLines: false }],
  });

  // 3 columnas bien distribuidas
  ws.columns = [
    { key: 'colA', width: 55 },
    { key: 'colB', width: 55 },
    { key: 'colC', width: 30 },
  ];

  // ==========================================
  // TÍTULO PRINCIPAL
  // ==========================================
  ws.mergeCells('A1:C1');
  const titulo = ws.getCell('A1');
  titulo.value = `REPORTE OPERACIONAL - GRUPO C: OPERATIVOS 7x24\nMes: ${mes.format('MMMM YYYY').toUpperCase()}`;
  titulo.font = { bold: true, size: 16, color: { argb: BLANCO } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
  titulo.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titulo.border = borde(AZUL_OSCURO);
  ws.getRow(1).height = 50;

  ws.mergeCells('A2:C2');
  const fechaGen = ws.getCell('A2');
  fechaGen.value = `Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  fechaGen.font = { italic: true, size: 10, color: { argb: GRIS } };
  fechaGen.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 25;

  let currentRow = 4;

  // ==========================================
  // KPI 1: TASAS DE ROTACIÓN
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi1Titulo = ws.getCell(currentRow, 1);
  kpi1Titulo.value = '1. TASAS DE ROTACIÓN POR TURNO';
  kpi1Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi1Titulo.alignment = { horizontal: 'left' };
  kpi1Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const tasaRotacionDiurna = reportPreview.cards?.find(c => c.title === 'Tasa rotación diurna')?.value || '0%';
  const tasaRotacionNocturna = reportPreview.cards?.find(c => c.title === 'Tasa rotación nocturna')?.value || '0%';
  const eficienciaCierre = reportPreview.cards?.find(c => c.title === 'Eficiencia de cierre')?.value || '0%';

  // Header
  const headerTasas = ws.getRow(currentRow);
  ['KPI', 'Valor', 'Descripción'].forEach((h, i) => {
    const c = headerTasas.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  headerTasas.height = 28;
  currentRow++;

  const tasasData = [
    { kpi: 'Tasa Rotación Diurna', valor: tasaRotacionDiurna, desc: 'Turno 7am-7pm' },
    { kpi: 'Tasa Rotación Nocturna', valor: tasaRotacionNocturna, desc: 'Turno 7pm-7am' },
    { kpi: 'Eficiencia de Cierre', valor: eficienciaCierre, desc: 'Tickets cerrados/recibidos' },
  ];

  tasasData.forEach((row, idx) => {
    const r = ws.getRow(currentRow);
    r.getCell(1).value = row.kpi;
    r.getCell(2).value = row.valor;
    r.getCell(3).value = row.desc;

    for (let i = 1; i <= 3; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle' };
    }

    r.getCell(1).font = { bold: true };
    r.getCell(2).font = { bold: true, color: { argb: AZUL_MEDIO }, size: 11 };
    r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).font = { color: { argb: GRIS } };

    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    }
    currentRow++;
  });

  currentRow += 2;

  // ==========================================
  // KPI 2: RANKING DE OPERADORES
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi2Titulo = ws.getCell(currentRow, 1);
  kpi2Titulo.value = '2. RANKING DE OPERADORES';
  kpi2Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi2Titulo.alignment = { horizontal: 'left' };
  kpi2Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const headerRanking = ws.getRow(currentRow);
  ['Posición', 'Operador', 'Tickets Atendidos'].forEach((h, i) => {
    const c = headerRanking.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  headerRanking.height = 28;
  currentRow++;

  // Ordenar de mayor a menor
  const operadoresOrdenados = [...ticketsPorOperador].sort((a, b) => b.cantidad - a.cantidad);

  operadoresOrdenados.forEach((op, idx) => {
    const r = ws.getRow(currentRow);
    r.getCell(1).value = idx + 1;
    r.getCell(2).value = op.name;
    r.getCell(3).value = op.cantidad;

    for (let i = 1; i <= 3; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle' };
    }

    r.getCell(1).font = { bold: true, color: { argb: AZUL_OSCURO } };
    r.getCell(1).alignment = { horizontal: 'center' };
    r.getCell(2).font = { bold: true };
    r.getCell(3).font = { bold: true, color: { argb: AZUL_MEDIO } };
    r.getCell(3).alignment = { horizontal: 'center' };

    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    }
    currentRow++;
  });

  if (operadoresOrdenados.length === 0) {
    ws.mergeCells(currentRow, 1, currentRow, 3);
    const noDataCell = ws.getCell(currentRow, 1);
    noDataCell.value = 'No hay datos de operadores disponibles';
    noDataCell.font = { italic: true, color: { argb: GRIS } };
    noDataCell.alignment = { horizontal: 'center', vertical: 'middle' };
    noDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_CLARO } };
    noDataCell.border = borde();
    ws.getRow(currentRow).height = 40;
    currentRow++;
  }

  currentRow += 2;

  // ==========================================
  // KPI 3: MÉTRICAS RESUMEN
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi3Titulo = ws.getCell(currentRow, 1);
  kpi3Titulo.value = '3. MÉTRICAS RESUMEN';
  kpi3Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi3Titulo.alignment = { horizontal: 'left' };
  kpi3Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  currentRow++;
  const metrics = [
    { label: 'Total Operadores', value: cantidadOperadores, bgColor: AZUL_PASTEL, textColor: 'FF1976D2' },
    { label: 'Promedio por Operador', value: promedioPorOperador, bgColor: LAVANDA_PASTEL, textColor: 'FF7B1FA2' },
    { label: 'Total Tickets Cerrados', value: ticketsPorOperador.reduce((sum, op) => sum + op.cantidad, 0), bgColor: TURQUESA_PASTEL, textColor: 'FF00796B' },
  ];

  metrics.forEach((metric, idx) => {
    const col = idx + 1;
    ws.mergeCells(currentRow, col, currentRow + 2, col);
    const box = ws.getCell(currentRow, col);
    box.value = `${metric.label}\n\n${metric.value}`;
    box.font = { bold: true, size: 12, color: { argb: metric.textColor } };
    box.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: metric.bgColor } };
    box.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    box.border = borde(AZUL_MEDIO);
  });

  currentRow += 4;

  // ==========================================
  // RESUMEN VISUAL DE DISTRIBUCIÓN
  // ==========================================
  currentRow += 1;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const resumenTitulo = ws.getCell(currentRow, 1);
  resumenTitulo.value = 'RESUMEN VISUAL - DISTRIBUCIÓN POR OPERADOR';
  resumenTitulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  resumenTitulo.alignment = { horizontal: 'left' };
  resumenTitulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const coloresBarras = [AZUL_MEDIO, AZUL_CLARO, LAVANDA_PASTEL, ROSA_PASTEL, AMARILLO_PASTEL, TURQUESA_PASTEL];
  const maxTickets = Math.max(...ticketsPorOperador.map(op => op.cantidad), 1);
  
  operadoresOrdenados.slice(0, 10).forEach((op, idx) => {
    const porcentaje = Math.round((op.cantidad / maxTickets) * 100);
    const bloquesLlenos = Math.round((porcentaje / 100) * 25);
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(25 - bloquesLlenos);
    
    const r = ws.getRow(currentRow);
    r.getCell(1).value = op.name;
    r.getCell(2).value = barra;
    r.getCell(3).value = `${op.cantidad} (${porcentaje}%)`;
    
    r.getCell(1).font = { bold: true };
    r.getCell(2).font = { color: { argb: coloresBarras[idx % coloresBarras.length] }, name: 'Consolas', size: 10 };
    r.getCell(3).font = { bold: true, color: { argb: AZUL_MEDIO } };
    r.getCell(3).alignment = { horizontal: 'center' };
    
    currentRow++;
  });

  // ==========================================
  // PIE DE PÁGINA
  // ==========================================
  currentRow += 2;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const footer = ws.getCell(currentRow, 1);
  footer.value = `Reporte generado automáticamente - ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;
  footer.font = { italic: true, size: 9, color: { argb: GRIS } };
  footer.alignment = { horizontal: 'center' };
  footer.border = { top: { style: 'thin', color: { argb: BORDE } } };
  ws.getRow(currentRow).height = 30;

  // ==========================================
  // DESCARGA
  // ==========================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-grupoC-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};