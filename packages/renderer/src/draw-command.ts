export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export type DrawCommand =
  | { type: 'rect'; x: number; y: number; w: number; h: number; fill?: string; stroke?: string; strokeWidth?: number }
  | { type: 'text'; x: number; y: number; content: string; font: string; color: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline }
  | { type: 'clip'; rect: Rect }
  | { type: 'transform'; matrix: Matrix }
  | { type: 'image'; img: HTMLImageElement; x: number; y: number; w: number; h: number }
  | { type: 'save' }
  | { type: 'restore' }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number }
  | { type: 'circle'; x: number; y: number; r: number; fill?: string; stroke?: string; strokeWidth?: number };

export function executeDrawCommand(ctx: CanvasRenderingContext2D, cmd: DrawCommand): void {
  switch (cmd.type) {
    case 'rect':
      if (cmd.fill) {
        ctx.fillStyle = cmd.fill;
        ctx.fillRect(cmd.x, cmd.y, cmd.w, cmd.h);
      }
      if (cmd.stroke) {
        ctx.strokeStyle = cmd.stroke;
        ctx.lineWidth = cmd.strokeWidth || 1;
        ctx.strokeRect(cmd.x, cmd.y, cmd.w, cmd.h);
      }
      break;

    case 'text':
      ctx.fillStyle = cmd.color;
      ctx.font = cmd.font;
      ctx.textAlign = cmd.align || 'left';
      ctx.textBaseline = cmd.baseline || 'top';
      ctx.fillText(cmd.content, cmd.x, cmd.y);
      break;

    case 'clip':
      ctx.save();
      ctx.beginPath();
      ctx.rect(cmd.rect.x, cmd.rect.y, cmd.rect.w, cmd.rect.h);
      ctx.clip();
      break;

    case 'transform':
      ctx.transform(cmd.matrix.a, cmd.matrix.b, cmd.matrix.c, cmd.matrix.d, cmd.matrix.e, cmd.matrix.f);
      break;

    case 'image':
      ctx.drawImage(cmd.img, cmd.x, cmd.y, cmd.w, cmd.h);
      break;

    case 'save':
      ctx.save();
      break;

    case 'restore':
      ctx.restore();
      break;

    case 'line':
      ctx.strokeStyle = cmd.stroke;
      ctx.lineWidth = cmd.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(cmd.x1, cmd.y1);
      ctx.lineTo(cmd.x2, cmd.y2);
      ctx.stroke();
      break;

    case 'circle':
      ctx.beginPath();
      ctx.arc(cmd.x, cmd.y, cmd.r, 0, Math.PI * 2);
      if (cmd.fill) {
        ctx.fillStyle = cmd.fill;
        ctx.fill();
      }
      if (cmd.stroke) {
        ctx.strokeStyle = cmd.stroke;
        ctx.lineWidth = cmd.strokeWidth || 1;
        ctx.stroke();
      }
      break;
  }
}
