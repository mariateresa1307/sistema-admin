export interface BarDatum { nombre: string; abiertas: number; cerradas: number }
export interface PieDatum { name: string; value: number }

export function generarGraficaBarras(data: BarDatum[]): string | undefined {
  if (!data || data.length === 0) return undefined;
  const W = 1000, H = 520;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#080769';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Top Servicios con Más Incidencias', 20, 32);

  const padL = 50, padR = 20, padT = 60, padB = 130;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data.map((d) => Math.max(d.abiertas, d.cerradas)), 1);
  const groupW = chartW / data.length;
  const barW = Math.min(42, groupW / 3);

  // Línea de eje
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  data.forEach((d, i) => {
    const gx = padL + i * groupW + groupW / 2;

    const hA = (d.abiertas / maxVal) * chartH;
    ctx.fillStyle = '#f5576c';
    ctx.fillRect(gx - barW - 2, padT + chartH - hA, barW, hA);

    const hC = (d.cerradas / maxVal) * chartH;
    ctx.fillStyle = '#00c2fe';
    ctx.fillRect(gx + 2, padT + chartH - hC, barW, hC);

    // Etiqueta rotada
    ctx.save();
    ctx.translate(gx, padT + chartH + 14);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    const nombre = d.nombre.length > 28 ? d.nombre.substring(0, 28) + '…' : d.nombre;
    ctx.fillText(nombre, 0, 0);
    ctx.restore();
  });

  // Leyenda
  ctx.fillStyle = '#f5576c'; ctx.fillRect(W - 220, 20, 14, 14);
  ctx.fillStyle = '#334155'; ctx.font = '12px Arial'; ctx.fillText('Abiertas', W - 200, 32);
  ctx.fillStyle = '#00c2fe'; ctx.fillRect(W - 120, 20, 14, 14);
  ctx.fillStyle = '#334155'; ctx.fillText('Cerradas', W - 100, 32);

  return canvas.toDataURL('image/png').split(',')[1];
}

export function generarGraficaTorta(data: PieDatum[]): string | undefined {
  if (!data || data.length === 0) return undefined;
  const W = 1000, H = 520;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#080769';
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Distribución por Tipo de Servicio', 20, 32);

  const colors = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const cx = 320, cy = 280, r = 160;
  let start = -Math.PI / 2;

  data.forEach((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    const mid = start + angle / 2;
    const lx = cx + Math.cos(mid) * (r + 30);
    const ly = cy + Math.sin(mid) * (r + 30);
    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial';
    const pct = Math.round((d.value / total) * 100);
    ctx.fillText(`${d.name} ${pct}%`, lx - 30, ly);
    start += angle;
  });

  return canvas.toDataURL('image/png').split(',')[1];
}