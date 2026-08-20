
export async function capturarGrafica(ref: HTMLElement | null): Promise<string | undefined> {
  if (!ref) return undefined;
  
  try {
    await new Promise((r) => setTimeout(r, 350));

    // Buscar el SVG de Recharts
    const svgElement = ref.querySelector('svg.recharts-surface');
    if (!svgElement) return undefined;

    // Clonar el SVG y preparar para exportar
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    
    // Añadir fondo blanco
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', '#ffffff');
    svgClone.insertBefore(rect, svgClone.firstChild);

    // Obtener dimensiones
    const bbox = svgElement.getBoundingClientRect();
    svgClone.setAttribute('width', String(bbox.width));
    svgClone.setAttribute('height', String(bbox.height));

    // Convertir a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Cargar como imagen y dibujar en canvas
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = bbox.width * 2; // 2x para mejor calidad
        canvas.height = bbox.height * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = () => resolve(undefined);
      img.src = url;
    });
  } catch (err) {
    console.error('❌ Error capturando gráfica:', err);
    return undefined;
  }
}