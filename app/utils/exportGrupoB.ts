import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { ReportePreview } from 'app/utils/types';

interface TiempoPorServicioRow {
  title: string;
  value: number;
}

interface FallaRecurrenteRow {
  servicio: string;
  causaRaiz: string;
  cantidad: number;
}

interface TicketDetalle {
  caseNumber: string;
  tipoIncidencia: string;
  networkCategory: string;
  tipoCliente: string;
  horaInicioFalla: string;
  horaCierre: string;
  duracion: string;
  causaRaiz: string;
  solucionCaso: string;
  operadorResponsable: string;
}

interface ExportGrupoBParams {
  reportPreview: ReportePreview;
  mes: Dayjs;
  tiempoPorServicio: TiempoPorServicioRow[];
  fallasRecurrentes: FallaRecurrenteRow[];
  ticketsDetalle?: TicketDetalle[];
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

const GRIS = 'FF64748B';
const GRIS_CLARO = 'FFF5F7FA';
const BORDE = 'FFD9DEE5';
const BLANCO = 'FFFFFFFF';

const borde = (color: string = BORDE): Partial<ExcelJS.Borders> => {
  const side = { style: 'thin', color: { argb: color } } as ExcelJS.Border;
  return { top: side, left: side, bottom: side, right: side };
};

export const exportReporteGrupoBExcel = async ({
  reportPreview,
  mes,
  tiempoPorServicio,
  fallasRecurrentes,
  ticketsDetalle = [],
}: ExportGrupoBParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Grupo B - Por Servicio', {
    views: [{ showGridLines: false }],
  });

  // ✅ 3 columnas: A y B para contenido principal, C para tickets
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
  titulo.value = `REPORTE OPERACIONAL - GRUPO B: POR SERVICIO\nMes: ${mes.format('MMMM YYYY').toUpperCase()}`;
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
  // KPI 1: TIEMPO PROMEDIO POR SERVICIO
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi1Titulo = ws.getCell(currentRow, 1);
  kpi1Titulo.value = '1. TIEMPO PROMEDIO DE AFECTACIÓN POR SERVICIO';
  kpi1Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi1Titulo.alignment = { horizontal: 'left' };
  kpi1Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  // Header MTTR: A-B fusionados visualmente, C integrada
  const headerMTTR = ws.getRow(currentRow);
  ['Servicio', 'MTTR Promedio', ''].forEach((h, i) => {
    const c = headerMTTR.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  headerMTTR.height = 28;
  currentRow++;

  tiempoPorServicio.forEach((row, idx) => {
    const horas = Math.floor(row.value / 60);
    const mins = Math.round(row.value % 60);
    const r = ws.getRow(currentRow);
    
    r.getCell(1).value = row.title;
    r.getCell(2).value = `${horas}h ${mins}m`;
    
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle' };
    }
    
    r.getCell(1).font = { bold: true };
    r.getCell(2).font = { bold: true, color: { argb: AZUL_MEDIO } };
    
    // Fondo alternado en las 3 columnas
    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    }
    currentRow++;
  });

  currentRow += 2;

  // ==========================================
  // KPI 2: FALLAS RECURRENTES
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi2Titulo = ws.getCell(currentRow, 1);
  kpi2Titulo.value = '2. FALLAS RECURRENTES (Últimos 30 días)';
  kpi2Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi2Titulo.alignment = { horizontal: 'left' };
  kpi2Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const headerFallas = ws.getRow(currentRow);
  ['Servicio', 'Causa Raíz', 'Cantidad'].forEach((h, i) => {
    const c = headerFallas.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  headerFallas.height = 28;
  currentRow++;

  fallasRecurrentes.forEach((row, idx) => {
    const r = ws.getRow(currentRow);
    
    r.getCell(1).value = row.servicio;
    r.getCell(2).value = row.causaRaiz;
    r.getCell(3).value = row.cantidad;
    
    for (let i = 1; i <= 3; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle' };
    }
    
    r.getCell(1).font = { bold: true };
    r.getCell(3).font = { bold: true, color: { argb: AZUL_OSCURO } };
    r.getCell(3).alignment = { horizontal: 'center' };
    
    let badgeColor = VERDE_PASTEL;
    if (row.cantidad >= 3) badgeColor = ROSA_PASTEL;
    else if (row.cantidad === 2) badgeColor = AMARILLO_PASTEL;
    
    r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: badgeColor } };
    
    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 3; i++) {
      const cell = r.getCell(i);
      if (!cell.fill || cell.fill.type === undefined ) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      }
    }
    currentRow++;
  });

  currentRow += 2;

  // ==========================================
  // KPI 3: TASA DE RECURRENCIA
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const kpi3Titulo = ws.getCell(currentRow, 1);
  kpi3Titulo.value = '3. TASA DE INCIDENTES RECURRENTES';
  kpi3Titulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpi3Titulo.alignment = { horizontal: 'left' };
  kpi3Titulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const totalRecurrentes = fallasRecurrentes.reduce((sum, r) => sum + r.cantidad, 0);
  const totalTickets = (reportPreview as any).totalTickets ?? 0;
  const tasaRecurrentes = totalTickets > 0 ? ((totalRecurrentes / totalTickets) * 100).toFixed(2) : '0';

  ws.mergeCells(currentRow, 1, currentRow, 3);
  const formulaCell = ws.getCell(currentRow, 1);
  formulaCell.value = 'Fórmula: (N° incidentes repetidos / Total incidentes) × 100';
  formulaCell.font = { italic: true, size: 10, color: { argb: GRIS } };
  formulaCell.alignment = { horizontal: 'center' };
  formulaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_CLARO } };
  formulaCell.border = borde();
  currentRow++;

  // Métricas en 3 columnas
  currentRow++;
  const metrics = [
    { label: 'Total Incidentes Recurrentes', value: totalRecurrentes, bgColor: ROSA_PASTEL, textColor: 'FFC62828' },
    { label: 'Total Tickets', value: totalTickets, bgColor: AZUL_PASTEL, textColor: 'FF1976D2' },
    { label: 'Tasa de Recurrencia', value: `${tasaRecurrentes}%`, bgColor: LAVANDA_PASTEL, textColor: 'FF7B1FA2' },
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
  // SECCIÓN: TICKETS CON FALLAS RECURRENTES (3 COLUMNAS)
  // ==========================================
  currentRow += 1;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const ticketsSectionTitle = ws.getCell(currentRow, 1);
  ticketsSectionTitle.value = '4. LISTA DE TICKETS CON FALLAS RECURRENTES';
  ticketsSectionTitle.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  ticketsSectionTitle.alignment = { horizontal: 'left' };
  ticketsSectionTitle.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  if (!ticketsDetalle || ticketsDetalle.length === 0) {
    ws.mergeCells(currentRow, 1, currentRow, 3);
    const noDataCell = ws.getCell(currentRow, 1);
    noDataCell.value = 'No se proporcionó el detalle de tickets para esta exportación.';
    noDataCell.font = { italic: true, size: 11, color: { argb: GRIS } };
    noDataCell.alignment = { horizontal: 'center', vertical: 'middle' };
    noDataCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_CLARO } };
    noDataCell.border = borde();
    ws.getRow(currentRow).height = 40;
    currentRow++;
  } else {
    const causasRecurrentes = new Set(
      fallasRecurrentes.map(f => (f.causaRaiz || '').toLowerCase().trim())
    );
    
    const ticketsRecurrentes = ticketsDetalle.filter(t => 
      causasRecurrentes.has((t.causaRaiz || '').toLowerCase().trim())
    );

    if (ticketsRecurrentes.length > 0) {
      ws.mergeCells(currentRow, 1, currentRow, 3);
      const subTituloTickets = ws.getCell(currentRow, 1);
      subTituloTickets.value = `Tickets asociados a causas recurrentes: ${ticketsRecurrentes.length}`;
      subTituloTickets.font = { italic: true, size: 10, color: { argb: GRIS } };
      subTituloTickets.alignment = { horizontal: 'left' };
      currentRow++;

      // ✅ Header de 3 columnas para tickets
      const headerTickets = ws.getRow(currentRow);
      ['N° Ticket', 'Servicio / Causa Raíz', 'Duración'].forEach((h, i) => {
        const c = headerTickets.getCell(i + 1);
        c.value = h;
        c.font = { bold: true, size: 10, color: { argb: BLANCO } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = borde();
      });
      headerTickets.height = 28;
      currentRow++;

      ticketsRecurrentes.slice(0, 100).forEach((ticket, idx) => {
        const r = ws.getRow(currentRow);
        
        // ✅ 3 columnas separadas como en la imagen
        r.getCell(1).value = ticket.caseNumber;
        r.getCell(2).value = `${ticket.tipoCliente} - ${ticket.causaRaiz}`;
        r.getCell(3).value = ticket.duracion;
        
        for (let i = 1; i <= 3; i++) {
          r.getCell(i).border = borde();
          r.getCell(i).alignment = { vertical: 'middle', wrapText: true };
        }
        
        r.getCell(1).font = { bold: true };
        r.getCell(2).font = { color: { argb: AZUL_MEDIO }, bold: true };
        r.getCell(3).font = { bold: true, color: { argb: AZUL_OSCURO } };
        r.getCell(3).alignment = { horizontal: 'center' };
        
        const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
        for (let i = 1; i <= 3; i++) {
          r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        }
        currentRow++;
      });

      if (ticketsRecurrentes.length > 100) {
        ws.mergeCells(currentRow, 1, currentRow, 3);
        const moreCell = ws.getCell(currentRow, 1);
        moreCell.value = `... y ${ticketsRecurrentes.length - 100} tickets más no mostrados.`;
        moreCell.font = { italic: true, color: { argb: GRIS } };
        moreCell.alignment = { horizontal: 'center' };
        currentRow++;
      }
    } else {
      ws.mergeCells(currentRow, 1, currentRow, 3);
      const noTicketsCell = ws.getCell(currentRow, 1);
      noTicketsCell.value = 'No se encontraron tickets que coincidan con las causas raíz recurrentes.';
      noTicketsCell.font = { italic: true, size: 11, color: { argb: GRIS } };
      noTicketsCell.alignment = { horizontal: 'center', vertical: 'middle' };
      noTicketsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_CLARO } };
      noTicketsCell.border = borde();
      ws.getRow(currentRow).height = 40;
      currentRow++;
    }
  }

  // ==========================================
  // RESUMEN VISUAL DE DISTRIBUCIÓN
  // ==========================================
  currentRow += 2;
  ws.mergeCells(currentRow, 1, currentRow, 3);
  const resumenTitulo = ws.getCell(currentRow, 1);
  resumenTitulo.value = 'RESUMEN VISUAL DE DISTRIBUCIÓN DE FALLAS';
  resumenTitulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  resumenTitulo.alignment = { horizontal: 'left' };
  resumenTitulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const coloresBarras = [AZUL_MEDIO, AZUL_CLARO, LAVANDA_PASTEL, ROSA_PASTEL, AMARILLO_PASTEL];
  const maxFallas = Math.max(...fallasRecurrentes.map(f => f.cantidad), 1);
  
  fallasRecurrentes.forEach((falla, idx) => {
    const porcentaje = Math.round((falla.cantidad / maxFallas) * 100);
    const bloquesLlenos = Math.round((porcentaje / 100) * 25);
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(25 - bloquesLlenos);
    
    const r = ws.getRow(currentRow);
    r.getCell(1).value = falla.causaRaiz;
    r.getCell(2).value = barra;
    r.getCell(3).value = `${falla.cantidad} (${porcentaje}%)`;
    
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
  link.download = `reporte-grupoB-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};