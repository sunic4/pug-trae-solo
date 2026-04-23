/**
 * 抽象绘制接口
 * 封装不同渲染后端的绘制操作
 */
export interface DrawAPI {
  // 颜色操作
  setFillStyle(color: string | CanvasGradient | CanvasPattern): void;
  setStrokeStyle(color: string | CanvasGradient | CanvasPattern): void;
  setLineWidth(width: number): void;
  
  // 基本形状
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  
  // 文本
  setFont(font: string): void;
  setTextAlign(align: CanvasTextAlign): void;
  setTextBaseline(baseline: CanvasTextBaseline): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  
  // 路径
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  closePath(): void;
  fill(): void;
  stroke(): void;
  
  // 状态管理
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
}

/**
 * Canvas 2D 绘制 API 实现
 */
export class Canvas2DDrawAPI implements DrawAPI {
  constructor(private ctx: CanvasRenderingContext2D) {}
  
  setFillStyle(color: string | CanvasGradient | CanvasPattern): void {
    this.ctx.fillStyle = color;
  }
  
  setStrokeStyle(color: string | CanvasGradient | CanvasPattern): void {
    this.ctx.strokeStyle = color;
  }
  
  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }
  
  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }
  
  strokeRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height);
  }
  
  clearRect(x: number, y: number, width: number, height: number): void {
    this.ctx.clearRect(x, y, width, height);
  }
  
  setFont(font: string): void {
    this.ctx.font = font;
  }
  
  setTextAlign(align: CanvasTextAlign): void {
    this.ctx.textAlign = align;
  }
  
  setTextBaseline(baseline: CanvasTextBaseline): void {
    this.ctx.textBaseline = baseline;
  }
  
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.ctx.fillText(text, x, y, maxWidth);
  }
  
  measureText(text: string): TextMetrics {
    return this.ctx.measureText(text);
  }
  
  beginPath(): void {
    this.ctx.beginPath();
  }
  
  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }
  
  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }
  
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }
  
  closePath(): void {
    this.ctx.closePath();
  }
  
  fill(): void {
    this.ctx.fill();
  }
  
  stroke(): void {
    this.ctx.stroke();
  }
  
  save(): void {
    this.ctx.save();
  }
  
  restore(): void {
    this.ctx.restore();
  }
  
  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }
  
  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }
  
  scale(x: number, y: number): void {
    this.ctx.scale(x, y);
  }
}

