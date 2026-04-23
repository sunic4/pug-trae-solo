// 使用隐藏 DOM 元素进行文本测量
let measureCanvas: HTMLCanvasElement | null = null;

function getMeasureCanvas(): HTMLCanvasElement {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }
  return measureCanvas;
}

export interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface TextLayoutResult {
  lines: string[];
  totalHeight: number;
  lineHeight: number;
  maxWidth: number;
}

export function measureText(text: string, font: string): TextMetrics {
  const canvas = getMeasureCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    ascent: metrics.actualBoundingBoxAscent,
    descent: metrics.actualBoundingBoxDescent,
  };
}

export function layoutText(text: string, font: string, maxWidth: number): TextLayoutResult {
  if (!text) {
    const m = measureText(' ', font);
    return { lines: [''], totalHeight: m.height, lineHeight: m.height, maxWidth: 0 };
  }

  const canvas = getMeasureCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;

  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = measureText('Xy', font).height;
  const totalHeight = lines.length * lineHeight;

  let maxWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  }

  return { lines, totalHeight, lineHeight, maxWidth };
}
