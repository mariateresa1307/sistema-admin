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
  totalTicketsCerrados?: number;
  totalTicketsActivos?: number;
  totalTicketsGeneral?: number;
  ticketsDia?: number;
  ticketsNoche?: number;
  recibidosDia?: number;
  recibidosNoche?: number;
  cerradosDia?: number;
  cerradosNoche?: number;
}

const AZUL_OSCURO = 'FF080769';
const AZUL_MEDIO = 'FF1976D2';
const AZUL_CLARO = 'FF42A5F5';
const AZUL_PASTEL_METRICAS = 'FFBBDEFB';
const LAVANDA_PASTEL_METRICAS = 'FFE1BEE7';
const TURQUESA_PASTEL_METRICAS = 'FFB2DFDB';
const AZUL_BAR_1 = 'FF1976D2';
const AZUL_BAR_2 = 'FF42A5F5';
const LAVANDA_BAR = 'FFE1BEE7';
const ROSA_BAR = 'FFF8BBD0';
const AMARILLO_BAR = 'FFFFECB3';
const TURQUESA_BAR = 'FFB2DFDB';
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
  totalTicketsCerrados = 0,
  totalTicketsActivos = 0,
  totalTicketsGeneral = 0,
  ticketsDia = 0,
  ticketsNoche = 0,
  recibidosDia = 0,
  recibidosNoche = 0,
  cerradosDia = 0,
  cerradosNoche = 0,
}: ExportGrupoCParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Grupo C - Operativos 7x24', { views: [{ showGridLines: false }] });

  ws.columns = [
    { key: 'colA', width: 55 },
    { key: 'colB', width: 55 },
    { key: 'colC', width: 30 },
  ];

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

  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi1Titulo = ws.getCell(currentRow, 1);
  kpi1Titulo.value = '1. TASAS DE ROTACIÓN POR TURNO';
  kpi1Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi1Titulo.alignment = { horizontal: 'left' };
  kpi1Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const cardDiurna = reportPreview.cards?.find(c => c.title.toLowerCase().includes('rotación') && c.title.toLowerCase().includes('diurna'));
  const cardNocturna = reportPreview.cards?.find(c => c.title.toLowerCase().includes('rotación') && c.title.toLowerCase().includes('nocturna'));
  const cardEficiencia = reportPreview.cards?.find(c => c.title.toLowerCase().includes('eficiencia'));

  const tasaRotacionDiurna = cardDiurna?.value || '0%';
  const tasaRotacionNocturna = cardNocturna?.value || '0%';
  const eficienciaCierre = cardEficiencia?.value || '0%';

  // Fallback inteligente por si los parámetros llegan en 0
  let fRecibidosDia = recibidosDia;
  let fRecibidosNoche = recibidosNoche;
  let fTotalCerrados = totalTicketsCerrados;
  let fTotalGeneral = totalTicketsGeneral;
  let fCerradosDia = cerradosDia;
  let fCerradosNoche = cerradosNoche;

  if (fRecibidosDia === 0 && cardDiurna?.subtitle) {
    const match = cardDiurna.subtitle.match(/total\s+(\d+)\s+tickets/i);
    if (match) fRecibidosDia = parseInt(match[1], 10);
  }
  if (fRecibidosNoche === 0 && cardNocturna?.subtitle) {
    const match = cardNocturna.subtitle.match(/total\s+(\d+)\s+tickets/i);
    if (match) fRecibidosNoche = parseInt(match[1], 10);
  }
  if (fTotalCerrados === 0 && cardEficiencia?.subtitle) {
    const match = cardEficiencia.subtitle.match(/\((\d+)\s+de\s+(\d+)\s+tickets\)/i);
    if (match) {
      fTotalCerrados = parseInt(match[1], 10);
      fTotalGeneral = parseInt(match[2], 10);
    }
  }

  // ✅ CALcular cerrados POR TURNO si vienen en 0
  if (fCerradosDia === 0 && fRecibidosDia > 0 && tasaRotacionDiurna) {
    fCerradosDia = Math.round((parseFloat(tasaRotacionDiurna) / 100) * fRecibidosDia);
  }
  if (fCerradosNoche === 0 && fRecibidosNoche > 0 && tasaRotacionNocturna) {
    fCerradosNoche = Math.round((parseFloat(tasaRotacionNocturna) / 100) * fRecibidosNoche);
  }

  // Calcular porcentajes de distribución
  const distribucionDia = fTotalGeneral > 0 ? (fRecibidosDia / fTotalGeneral) * 100 : 0;
  const distribucionNoche = fTotalGeneral > 0 ? (fRecibidosNoche / fTotalGeneral) * 100 : 0;

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

  // ✅ USA LOS VALORES CALCULADOS CORRECTAMENTE (fCerradosDia y fCerradosNoche)
  const tasasData = [
    { 
      kpi: 'Tasa Rotación Diurna', 
      valor: tasaRotacionDiurna,
      desc: `Turno 7am-7pm\n${fCerradosDia} cerrados de ${fRecibidosDia} recibidos\n${distribucionDia.toFixed(2)}% de tickets distribuido a este turno`
    },
    { 
      kpi: 'Tasa Rotación Nocturna', 
      valor: tasaRotacionNocturna,
      desc: `Turno 7pm-7am\n${fCerradosNoche} cerrados de ${fRecibidosNoche} recibidos\n${distribucionNoche.toFixed(2)}% de tickets distribuido a este turno`
    },
    { 
      kpi: 'Eficiencia de Cierre', 
      valor: eficienciaCierre,
      desc: `Tickets cerrados/recibidos\n${fTotalCerrados} cerrados de ${fTotalGeneral} recibidos`
    },
  ];

  tasasData.forEach((row, idx) => {
    const r = ws.getRow(currentRow);
    r.getCell(1).value = row.kpi;
    r.getCell(2).value = row.valor;
    r.getCell(3).value = row.desc;

    for (let i = 1; i <= 3; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle', wrapText: true };
    }

    r.getCell(1).font = { bold: true };
    r.getCell(2).font = { bold: true, color: { argb: AZUL_MEDIO }, size: 11 };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).font = { color: { argb: GRIS } };

    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    }
    r.height = 60;
    currentRow++;
  });

  currentRow += 2;

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

  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi3Titulo = ws.getCell(currentRow, 1);
  kpi3Titulo.value = '3. MÉTRICAS RESUMEN';
  kpi3Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi3Titulo.alignment = { horizontal: 'left' };
  kpi3Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  currentRow++;
  const totalCalculado = fTotalGeneral > 0 ? fTotalGeneral : ticketsPorOperador.reduce((sum, op) => sum + op.cantidad, 0);
  const subtexto = fTotalGeneral > 0 ? `${totalTicketsActivos} Activos | ${fTotalCerrados} Cerrados` : '';

  const metrics = [
    { label: 'Total Operadores', value: cantidadOperadores, bgColor: AZUL_PASTEL_METRICAS, textColor: 'FF1976D2', sub: 'Operadores únicos' },
    { label: 'Promedio por Operador', value: `${promedioPorOperador}%`, bgColor: LAVANDA_PASTEL_METRICAS, textColor: 'FF7B1FA2', sub: 'Tickets por operador' },
    { label: 'Total Tickets', value: totalCalculado, bgColor: TURQUESA_PASTEL_METRICAS, textColor: 'FF00796B', sub: subtexto },
  ];

  metrics.forEach((metric, idx) => {
    const col = idx + 1;
    ws.mergeCells(currentRow, col, currentRow + 2, col);
    const box = ws.getCell(currentRow, col);
    
    if (metric.sub) {
      box.value = `${metric.label}\n\n${metric.value}\n\n${metric.sub}`;
    } else {
      box.value = `${metric.label}\n\n${metric.value}`;
    }
    
    box.font = { bold: true, size: 12, color: { argb: metric.textColor } };
    box.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: metric.bgColor } };
    box.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    box.border = borde(AZUL_MEDIO);
  });

  currentRow += 4;

  currentRow += 1;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const resumenTitulo = ws.getCell(currentRow, 1);
  resumenTitulo.value = 'RESUMEN VISUAL - DISTRIBUCIÓN POR OPERADOR';
  resumenTitulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  resumenTitulo.alignment = { horizontal: 'left' };
  resumenTitulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const coloresBarras = [AZUL_BAR_1, AZUL_BAR_2, LAVANDA_BAR, ROSA_BAR, AMARILLO_BAR, TURQUESA_BAR];
  const maxTickets = Math.max(...ticketsPorOperador.map(op => op.cantidad), 1);
  
  operadoresOrdenados.forEach((op, idx) => {
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

  currentRow += 2;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const footer = ws.getCell(currentRow, 1);
  footer.value = `Reporte generado automáticamente - ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;
  footer.font = { italic: true, size: 9, color: { argb: GRIS } };
  footer.alignment = { horizontal: 'center' };
  footer.border = { top: { style: 'thin', color: { argb: BORDE } } };
  ws.getRow(currentRow).height = 30;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-grupoC-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};