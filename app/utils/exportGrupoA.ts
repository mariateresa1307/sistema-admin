import dayjs, { Dayjs } from 'dayjs';
import ExcelJS from 'exceljs';
import { ReportePreview } from 'app/utils/types';

const AZUL = 'FF080769';
const GRIS = 'FF64748B';
const BORDE = 'FFD9DEE5';
const ZEBRA = 'FFF5F6FA';
const VERDE = 'FF2E7D32';
const NARANJA = 'FFE65100';
const ROJO = 'FFC62828';
const AMARILLO = 'FFF5A842';
const VERDE_TORTA = 'FF42F5A8';
const ROJO_TORTA = 'FFF54242';
const AMARILLO_TORTA = 'FFF5A842';

const borde = (): Partial<ExcelJS.Borders> => {
  const side = { style: 'thin', color: { argb: BORDE } } as ExcelJS.Border;
  return { top: side, left: side, bottom: side, right: side };
};

interface TicketResumen {
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
  operadorAsignado: string;
}

interface ExportGrupoAParams {
  reportPreview: ReportePreview;
  mes: Dayjs;
  tickets: TicketResumen[];
}

const formatMttr = (minutos: number): string => {
  if (!minutos || minutos <= 0) return '0h 0m';
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  return `${h}h ${m}m`;
};

export const exportReporteGrupoAExcel = async ({
  reportPreview,
  mes,
  tickets,
}: ExportGrupoAParams): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Grupo A - Gestión de Fallas', {
    views: [{ showGridLines: false }],
  });

  // ✅ 11 COLUMNAS (no 10) con anchos adecuados
  ws.columns = [
    { key: 'ticket', width: 18 },
    { key: 'c2', width: 22 },
    { key: 'c3', width: 20 },
    { key: 'c4', width: 22 },
    { key: 'c5', width: 22 },
    { key: 'c6', width: 22 },
    { key: 'c7', width: 18 },
    { key: 'c8', width: 28 },
    { key: 'c9', width: 30 },
    { key: 'c10', width: 35 }, // ✅ OPERADOR RESPONSABLE (más ancho)
    { key: 'c11', width: 30 }, // ✅ OPERADOR ASIGNADO
  ];

  // ============== TÍTULO ==============
  ws.mergeCells('A1:K1'); // ✅ 11 columnas (A-K)
  const titulo = ws.getCell('A1');
  titulo.value = 'REPORTE OPERACIONAL - GRUPO A: GESTIÓN DE FALLAS';
  titulo.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  titulo.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 34;

  ws.mergeCells('A2:K2'); // ✅ 11 columnas
  const sub = ws.getCell('A2');
  sub.value = `Mes: ${mes.format('MMMM YYYY').toUpperCase()}   •   Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
  sub.font = { italic: true, size: 10, color: { argb: GRIS } };
  sub.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // ============== KPIs ==============
  const cards = reportPreview.cards || [];
  const getCard = (title: string) => cards.find((c) => c.title === title);

  const kpis = [
    { label: 'INCIDENTES POR PLATAFORMA', valor: getCard('Incidentes por plataforma')?.value || '0', color: 'FF1976D2', col: 1 },
    { label: 'INCIDENTES POR SERVICIO', valor: getCard('Incidentes por servicio')?.value || '0', color: 'FF7B1FA2', col: 3 },
    { label: 'TOTAL TICKETS', valor: getCard('Total Tickets')?.value || '0', color: 'FFF57C00', col: 5 },
    { label: '% RESUELTAS EN SOPORTE', valor: getCard('% fallas resueltas en Soporte')?.value || '0%', color: 'FF388E3C', col: 7 },
    { label: 'MTTR PLATAFORMA', valor: getCard('MTTR Tiempo Medio Plataforma')?.value || '0h 0m', color: 'FF0288D1', col: 9 },
    { label: 'INCIDENCIAS PUNTUALES', valor: getCard('Incidencias Puntuales')?.value || '0', color: 'FF2E7D32', col: 1, fila: 6 },
    { label: 'INCIDENCIAS MASIVAS', valor: getCard('Incidencias Masivas')?.value || '0', color: 'FFC62828', col: 3, fila: 6 },
    { label: 'VENTANA MANTENIMIENTO', valor: getCard('Ventana de Mantenimiento')?.value || '0', color: 'FFEF6C00', col: 5, fila: 6 },
    { label: 'MTTR SERVICIO', valor: getCard('MTTR Tiempo Medio Servicio')?.value || '0h 0m', color: 'FF7B1FA2', col: 7, fila: 6 },
  ];

  kpis.forEach((k) => {
    const filaLabel = k.fila || 4;
    const filaValor = (k.fila || 4) + 1;
    ws.mergeCells(filaLabel, k.col, filaLabel, k.col + 1);
    ws.mergeCells(filaValor, k.col, filaValor, k.col + 1);
    const label = ws.getCell(filaLabel, k.col);
    label.value = k.label;
    label.font = { bold: true, size: 9, color: { argb: GRIS } };
    label.alignment = { horizontal: 'center' };
    const valor = ws.getCell(filaValor, k.col);
    valor.value = String(k.valor);
    valor.font = { bold: true, size: 18, color: { argb: k.color } };
    valor.alignment = { horizontal: 'center' };
  });
  ws.getRow(5).height = 28;
  ws.getRow(7).height = 28;

  let currentRow = 9;

  // ============== SECCIÓN DISTRIBUCIÓN ==============
  const tituloSeccion = (titulo: string, fila: number) => {
    ws.mergeCells(fila, 1, fila, 11); // ✅ 11 columnas
    const cell = ws.getCell(fila, 1);
    cell.value = titulo;
    cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    cell.alignment = { horizontal: 'center' };
    ws.getRow(fila).height = 24;
  };

  const HEADERS_DETALLE = [
    'N° TICKET', 'TIPO INCIDENCIA', 'PLATAFORMA', 'SERVICIO',
    'INICIO FALLA', 'CIERRE', 'DURACIÓN',
    'CAUSA RAÍZ', 'SOLUCIÓN', 'OPERADOR RESPONSABLE', 'OPERADOR ASIGNADO'
  ];

  const renderTablaTipo = (
    tipo: 'PUNTUAL' | 'MASIVA' | 'MANTENIMIENTO',
    colorTipo: string,
    filaInicio: number,
  ): number => {
    const filtrados = tickets.filter((t) => {
      const tipoUp = (t.tipoIncidencia || '').toUpperCase();
      if (tipo === 'PUNTUAL') return (tipoUp.includes('PUNTUAL') || tipoUp.includes('FALLA')) && !tipoUp.includes('MASIVA');
      if (tipo === 'MASIVA') return tipoUp.includes('MASIVA');
      return tipoUp.includes('MANTENIMIENTO') || tipoUp.includes('VENTANA');
    });

    tituloSeccion(
      `${tipo === 'PUNTUAL' ? 'INCIDENCIAS PUNTUALES' : tipo === 'MASIVA' ? 'INCIDENCIAS MASIVAS' : 'VENTANA DE MANTENIMIENTO'} (${filtrados.length})`,
      filaInicio,
    );

    const headerRow = ws.getRow(filaInicio + 1);
    HEADERS_DETALLE.forEach((h, i) => {
      const c = headerRow.getCell(i + 1);
      c.value = h;
      c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorTipo } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = borde();
    });
    headerRow.height = 28;

    filtrados.forEach((row, idx) => {
      const r = ws.getRow(filaInicio + 2 + idx);
      r.values = [
        row.caseNumber,
        row.tipoIncidencia,
        row.networkCategory,
        row.tipoCliente,
        row.horaInicioFalla ? dayjs(row.horaInicioFalla).format('DD/MM/YYYY HH:mm') : 'N/A',
        row.horaCierre ? dayjs(row.horaCierre).format('DD/MM/YYYY HH:mm') : 'N/A',
        row.duracion || 'N/A',
        row.causaRaiz || 'Sin causa',
        row.solucionCaso || 'Sin solución',
        row.operadorResponsable || 'N/A',
        row.operadorAsignado || '-'
      ];
      r.eachCell((c, colNumber) => {
        c.border = borde();
        c.alignment = colNumber >= 5 && colNumber <= 7
          ? { horizontal: 'center', vertical: 'middle' }
          : { vertical: 'middle', wrapText: true };
        if (idx % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      });
      r.height = 40; // ✅ Altura fija para que se vean los nombres completos
    });

    const totalRow = ws.getRow(filaInicio + 2 + filtrados.length);
    ws.mergeCells(totalRow.number, 1, totalRow.number, 10); // ✅ Merge de 1 a 10
    for (let i = 1; i <= 11; i++) { // ✅ 11 columnas
      const cell = totalRow.getCell(i);
      cell.border = borde();
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorTipo } };
    }
    const totalLabel = totalRow.getCell(1);
    totalLabel.value = `TOTAL ${tipo}`;
    totalLabel.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    totalLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    const totalValue = totalRow.getCell(11); // ✅ Columna 11
    totalValue.value = filtrados.length;
    totalValue.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalValue.alignment = { horizontal: 'center', vertical: 'middle' };

    return filaInicio + 2 + filtrados.length + 2;
  };

  tituloSeccion('DISTRIBUCIÓN POR TIPO DE INCIDENCIA', currentRow);
  currentRow += 1;

  currentRow = renderTablaTipo('PUNTUAL', VERDE, currentRow);
  currentRow = renderTablaTipo('MASIVA', ROJO, currentRow);
  currentRow = renderTablaTipo('MANTENIMIENTO', AMARILLO, currentRow);

  // ============== SECCIÓN GRÁFICAS ==============
  currentRow += 1;
  tituloSeccion('RESUMEN GRÁFICO', currentRow);
  currentRow += 1;

  const dibujarBarra = (
    fila: number,
    col: number,
    porcentaje: number,
    color: string,
    maxBloques: number = 30,
  ) => {
    const bloquesLlenos = Math.round((porcentaje / 100) * maxBloques);
    const barra = '█'.repeat(bloquesLlenos) + '░'.repeat(maxBloques - bloquesLlenos);
    const cell = ws.getCell(fila, col);
    cell.value = barra;
    cell.font = { color: { argb: color }, size: 10, name: 'Consolas' };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  };

  // ---- GRÁFICA 1: TORTA ----
  const total = tickets.length || 1;
  const puntualCount = tickets.filter(t => {
    const tipoUp = (t.tipoIncidencia || '').toUpperCase();
    return (tipoUp.includes('PUNTUAL') || tipoUp.includes('FALLA')) && !tipoUp.includes('MASIVA');
  }).length;
  const masivaCount = tickets.filter(t => (t.tipoIncidencia || '').toUpperCase().includes('MASIVA')).length;
  const mantCount = tickets.filter(t => {
    const tipoUp = (t.tipoIncidencia || '').toUpperCase();
    return tipoUp.includes('MANTENIMIENTO') || tipoUp.includes('VENTANA');
  }).length;

  const distribucion = [
    { label: 'Puntuales', valor: puntualCount, color: VERDE_TORTA },
    { label: 'Masivas', valor: masivaCount, color: ROJO_TORTA },
    { label: 'Mantenimiento', valor: mantCount, color: AMARILLO_TORTA },
  ];

  ws.mergeCells(currentRow, 1, currentRow, 11);
  const tituloTorta = ws.getCell(currentRow, 1);
  tituloTorta.value = 'Distribución por Tipo de Incidencia';
  tituloTorta.font = { bold: true, size: 11, color: { argb: AZUL } };
  tituloTorta.alignment = { horizontal: 'center' };
  currentRow += 1;

  const headerTorta = ws.getRow(currentRow);
  ['Tipo', 'Cantidad', '%', 'Distribución'].forEach((h, i) => {
    const c = headerTorta.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  currentRow += 1;

  distribucion.forEach((item, idx) => {
    const pct = total > 0 ? Math.round((item.valor / total) * 100) : 0;
    const r = ws.getRow(currentRow + idx);
    r.getCell(1).value = item.label;
    r.getCell(1).font = { bold: true, color: { argb: item.color } };
    r.getCell(1).border = borde();
    r.getCell(1).alignment = { vertical: 'middle' };

    r.getCell(2).value = item.valor;
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).border = borde();

    r.getCell(3).value = `${pct}%`;
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).border = borde();
    r.getCell(3).font = { bold: true, color: { argb: item.color } };

    r.getCell(4).border = borde();
    dibujarBarra(currentRow + idx, 4, pct, item.color, 30);

    if (idx % 2 === 1) {
      for (let i = 1; i <= 4; i++) {
        r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      }
    }
  });
  currentRow += distribucion.length + 2;

  // ---- GRÁFICA 2: MTTR PLATAFORMA ----
  ws.mergeCells(currentRow, 1, currentRow, 11);
  const tituloMttrPlat = ws.getCell(currentRow, 1);
  tituloMttrPlat.value = 'MTTR por Plataforma';
  tituloMttrPlat.font = { bold: true, size: 11, color: { argb: AZUL } };
  tituloMttrPlat.alignment = { horizontal: 'center' };
  currentRow += 1;

  const mttrPlatHeaders = ws.getRow(currentRow);
  ['Plataforma', 'MTTR', 'Comparativa'].forEach((h, i) => {
    const c = mttrPlatHeaders.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  ws.getColumn(3).width = 50; // ✅ Más ancho para la barra
  currentRow += 1;

  const mttrPlataforma = reportPreview.mttrPlataforma || [];
  const maxMttrPlat = Math.max(...mttrPlataforma.map(m => m.value || 0), 1);

  mttrPlataforma.slice(0, 8).forEach((item, idx) => {
    const r = ws.getRow(currentRow + idx);
    r.getCell(1).value = item.title;
    r.getCell(1).border = borde();
    r.getCell(1).alignment = { vertical: 'middle' };

    r.getCell(2).value = formatMttr(Number(item.value || 0));
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).border = borde();
    r.getCell(2).font = { bold: true, color: { argb: 'FF1976D2' } };

    r.getCell(3).border = borde();
    const pct = maxMttrPlat > 0 ? Math.round(((item.value || 0) / maxMttrPlat) * 100) : 0;
    dibujarBarra(currentRow + idx, 3, pct, 'FF1976D2', 40); // ✅ 40 bloques

    if (idx % 2 === 1) {
      for (let i = 1; i <= 3; i++) {
        r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      }
    }
  });
  currentRow += Math.min(mttrPlataforma.length, 8) + 2;

  // ---- GRÁFICA 3: MTTR SERVICIO ----
  ws.mergeCells(currentRow, 1, currentRow, 11);
  const tituloMttrServ = ws.getCell(currentRow, 1);
  tituloMttrServ.value = 'MTTR por Tipo de Cliente';
  tituloMttrServ.font = { bold: true, size: 11, color: { argb: AZUL } };
  tituloMttrServ.alignment = { horizontal: 'center' };
  currentRow += 1;

  const mttrServHeaders = ws.getRow(currentRow);
  ['Tipo de Cliente', 'MTTR', 'Comparativa'].forEach((h, i) => {
    const c = mttrServHeaders.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7B1FA2' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = borde();
  });
  currentRow += 1;

  const mttrServicio = reportPreview.mttrServicio || [];
  const maxMttrServ = Math.max(...mttrServicio.map(m => m.value || 0), 1);

  mttrServicio.slice(0, 8).forEach((item, idx) => {
    const r = ws.getRow(currentRow + idx);
    r.getCell(1).value = item.title;
    r.getCell(1).border = borde();
    r.getCell(1).alignment = { vertical: 'middle' };

    r.getCell(2).value = formatMttr(Number(item.value || 0));
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).border = borde();
    r.getCell(2).font = { bold: true, color: { argb: 'FF7B1FA2' } };

    r.getCell(3).border = borde();
    const pct = maxMttrServ > 0 ? Math.round(((item.value || 0) / maxMttrServ) * 100) : 0;
    dibujarBarra(currentRow + idx, 3, pct, 'FF7B1FA2', 40);

    if (idx % 2 === 1) {
      for (let i = 1; i <= 3; i++) {
        r.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } };
      }
    }
  });

  // ============== DESCARGA ==============
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-grupoA-${mes.format('YYYY-MM')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};