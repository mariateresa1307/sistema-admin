import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { ReportePreview } from 'app/utils/types';

// ==========================================
// PALETA DE COLORES: Base Azul + Pasteles (Idéntica a Grupo C)
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

interface ExportGrupoDParams {
  reportPreview: ReportePreview;
  mes: Dayjs;
}

export const exportReporteGrupoDExcel = async ({
  reportPreview,
  mes,
}: ExportGrupoDParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Grupo D - Calidad y Mejora', {
    views: [{ showGridLines: false }],
  });

  // 6 columnas bien distribuidas
  ws.columns = [
    { key: 'c1', width: 35 },
    { key: 'c2', width: 30 },
    { key: 'c3', width: 35 },
    { key: 'c4', width: 30 },
    { key: 'c5', width: 30 },
    { key: 'c6', width: 30 },
  ];

  // ==========================================
  // TÍTULO PRINCIPAL
  // ==========================================
  ws.mergeCells('A1:F1');
  const titulo = ws.getCell('A1');
  titulo.value = `REPORTE OPERACIONAL - GRUPO D: CALIDAD Y MEJORA\nMes: ${mes.format('MMMM YYYY').toUpperCase()}`;
  titulo.font = { bold: true, size: 16, color: { argb: BLANCO } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
  titulo.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titulo.border = borde(AZUL_OSCURO);
  ws.getRow(1).height = 50;

  ws.mergeCells('A2:F2');
  const fechaGen = ws.getCell('A2');
  fechaGen.value = `Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  fechaGen.font = { italic: true, size: 10, color: { argb: GRIS } };
  fechaGen.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 25;

  let currentRow = 4;

  // ==========================================
  // KPIs PRINCIPALES
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 6);
  const kpiTitulo = ws.getCell(currentRow, 1);
  kpiTitulo.value = 'INDICADORES CLAVE DE DESEMPEÑO';
  kpiTitulo.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  kpiTitulo.alignment = { horizontal: 'left' };
  kpiTitulo.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const cards = reportPreview.cards || [];
  const getCard = (title: string) => cards.find((c) => c.title === title);

  // Usamos la paleta de pasteles para los fondos de los KPIs
  const kpisData = [
    { label: 'Incidentes Mayores', valor: getCard('Incidentes mayores')?.value || '0', bgColor: ROSA_PASTEL, textColor: AZUL_OSCURO, col: 1 },
    { label: 'Tiempo Escalamiento', valor: getCard('Tiempo escalamiento')?.value || '0h', bgColor: AMARILLO_PASTEL, textColor: AZUL_OSCURO, col: 3 },
    { label: '% Cambios Documentados', valor: getCard('% cambios documentados')?.value || '0%', bgColor: VERDE_PASTEL, textColor: AZUL_OSCURO, col: 5 },
  ];

  kpisData.forEach((k) => {
    ws.mergeCells(currentRow, k.col, currentRow + 2, k.col + 1);
    const box = ws.getCell(currentRow, k.col);
    box.value = `${k.label}\n\n${k.valor}`;
    box.font = { bold: true, size: 12, color: { argb: k.textColor } };
    box.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: k.bgColor } };
    box.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    box.border = borde(AZUL_MEDIO);
  });

  currentRow += 4;

  // ==========================================
  // SECCIÓN 1: TENDENCIA DE INCIDENTES MAYORES
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 6);
  const tituloTendencia = ws.getCell(currentRow, 1);
  tituloTendencia.value = '1. TENDENCIA DE INCIDENTES MAYORES POR MES';
  tituloTendencia.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  tituloTendencia.alignment = { horizontal: 'left' };
  tituloTendencia.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const incidentesMayoresPorMes = (reportPreview as any).incidentesMayoresPorMes || [];
  
  const headerTendencia = ws.getRow(currentRow);
  ['Mes', 'Cantidad', 'Tickets Detalle', 'Distribución'].forEach((h, i) => {
    const c = headerTendencia.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  ws.getColumn(3).width = 40;
  currentRow++;

  const maxIncidentes = Math.max(...incidentesMayoresPorMes.map((m: any) => m.cantidad || 0), 1);

  incidentesMayoresPorMes.forEach((item: any, idx: number) => {
    const r = ws.getRow(currentRow + idx);
    
    const [year, month] = item.mes.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const mesFormateado = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    
    r.getCell(1).value = mesFormateado;
    r.getCell(2).value = item.cantidad;
    r.getCell(3).value = item.tickets || `${item.cantidad} incidente(s)`;
    
    for (let i = 1; i <= 4; i++) {
      r.getCell(i).border = borde();
      r.getCell(i).alignment = { vertical: 'middle' };
    }

    r.getCell(1).font = { bold: true };
    r.getCell(2).font = { bold: true, color: { argb: AZUL_MEDIO } };
    r.getCell(2).alignment = { horizontal: 'center' };
    r.getCell(3).font = { size: 9, color: { argb: GRIS } };
    r.getCell(3).alignment = { vertical: 'middle', wrapText: true };

    // Barra visual
    const pct = maxIncidentes > 0 ? Math.round((item.cantidad / maxIncidentes) * 100) : 0;
    const bloquesLlenos = Math.round((pct / 100) * 25);
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(25 - bloquesLlenos);
    r.getCell(4).value = barra;
    r.getCell(4).font = { color: { argb: AZUL_MEDIO }, size: 10, name: 'Consolas' };
    r.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };

    // Zebra striping
    const bgColor = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    for (let i = 1; i <= 4; i++) {
      r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    }
  });

  currentRow += incidentesMayoresPorMes.length + 2;

  // ==========================================
  // SECCIÓN 2: CASO MÁS DEMANDANTE POR SERVICIO
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 6);
  const tituloRanking = ws.getCell(currentRow, 1);
  tituloRanking.value = '2. CASO MÁS DEMANDANTE POR SERVICIO';
  tituloRanking.font = { bold: true, size: 12, color: { argb: AZUL_OSCURO } };
  tituloRanking.alignment = { horizontal: 'left' };
  tituloRanking.border = { bottom: { style: 'medium', color: { argb: AZUL_MEDIO } } };
  currentRow++;

  const rankingServicios = (reportPreview as any).rankingServicios || [];
  
  const headerRanking = ws.getRow(currentRow);
  ['Posición', 'Servicio', 'Tickets', 'Porcentaje'].forEach((h, i) => {
    const c = headerRanking.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: BLANCO } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  currentRow++;

  const totalTickets = rankingServicios.reduce((sum: number, r: any) => sum + (r.cantidad || 0), 0) || 1;

  rankingServicios.slice(0, 10).forEach((row: any, idx: number) => {
    const r = ws.getRow(currentRow + idx);
    
    // Determinar color de fondo pastel según la posición
    let badgeBgColor = AZUL_PASTEL;
    if (idx === 0) badgeBgColor = AMARILLO_PASTEL;
    else if (idx === 1) badgeBgColor = GRIS_CLARO;
    else if (idx === 2) badgeBgColor = ROSA_PASTEL;

    r.getCell(1).value = `${idx + 1}`;
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(1).border = borde();
    r.getCell(1).font = { bold: true, size: 11, color: { argb: AZUL_OSCURO } };
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: badgeBgColor } };

    r.getCell(2).value = row.name;
    r.getCell(2).border = borde();
    r.getCell(2).alignment = { vertical: 'middle' };
    r.getCell(2).font = { bold: true };

    r.getCell(3).value = row.cantidad;
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).border = borde();
    r.getCell(3).font = { bold: true, color: { argb: AZUL_MEDIO } };

    const pct = Math.round((row.cantidad / totalTickets) * 100);
    r.getCell(4).value = `${pct}%`;
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).border = borde();
    r.getCell(4).font = { color: { argb: GRIS } };

    // Barra visual de porcentaje
    const bloquesLlenos = Math.round((pct / 100) * 25);
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(25 - bloquesLlenos);
    ws.mergeCells(currentRow + idx, 5, currentRow + idx, 6);
    const cellBarra = ws.getCell(currentRow + idx, 5);
    cellBarra.value = barra;
    cellBarra.font = { color: { argb: AZUL_MEDIO }, size: 10, name: 'Consolas' };
    cellBarra.alignment = { horizontal: 'left', vertical: 'middle' };
    cellBarra.border = borde();

    // Zebra striping (sobrescribe el badge de posición si es impar, pero se ve bien)
    if (idx % 2 === 1) {
      for (let i = 1; i <= 6; i++) {
        // No sobrescribimos la celda 1 para mantener el color de la medalla
        if (i > 1) {
          r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_CLARO } };
        }
      }
    } else {
       for (let i = 2; i <= 6; i++) {
          r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLANCO } };
       }
    }
  });

  currentRow += Math.min(rankingServicios.length, 10) + 2;

  // ==========================================
  // PIE DE PÁGINA
  // ==========================================
  ws.mergeCells(currentRow, 1, currentRow, 6);
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
  link.download = `reporte-grupoD-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};