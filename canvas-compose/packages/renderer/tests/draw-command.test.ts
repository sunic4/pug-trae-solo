import { describe, it, expect } from 'vitest';
import { DrawCommand, executeDrawCommand } from '../src/draw-command.js';

// 创建一个模拟的 CanvasRenderingContext2D
class MockContext {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 0;
  font = '';
  textAlign: CanvasTextAlign = 'left';
  textBaseline: CanvasTextBaseline = 'top';
  calls: string[] = [];

  fillRect(x: number, y: number, w: number, h: number): void {
    this.calls.push(`fillRect(${x}, ${y}, ${w}, ${h})`);
  }

  strokeRect(x: number, y: number, w: number, h: number): void {
    this.calls.push(`strokeRect(${x}, ${y}, ${w}, ${h})`);
  }

  fillText(content: string, x: number, y: number): void {
    this.calls.push(`fillText(${content}, ${x}, ${y})`);
  }

  save(): void {
    this.calls.push('save');
  }

  restore(): void {
    this.calls.push('restore');
  }

  beginPath(): void {
    this.calls.push('beginPath');
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.calls.push(`rect(${x}, ${y}, ${w}, ${h})`);
  }

  clip(): void {
    this.calls.push('clip');
  }

  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.calls.push(`transform(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`);
  }

  drawImage(img: any, x: number, y: number, w: number, h: number): void {
    this.calls.push(`drawImage(${x}, ${y}, ${w}, ${h})`);
  }

  moveTo(x: number, y: number): void {
    this.calls.push(`moveTo(${x}, ${y})`);
  }

  lineTo(x: number, y: number): void {
    this.calls.push(`lineTo(${x}, ${y})`);
  }

  stroke(): void {
    this.calls.push('stroke');
  }

  arc(x: number, y: number, r: number, startAngle: number, endAngle: number): void {
    this.calls.push(`arc(${x}, ${y}, ${r}, ${startAngle}, ${endAngle})`);
  }

  fill(): void {
    this.calls.push('fill');
  }
}

describe('executeDrawCommand', () => {
  it('should execute rect command', () => {
    const ctx = new MockContext();
    const cmd: DrawCommand = { type: 'rect', x: 10, y: 10, w: 100, h: 50, fill: '#FF0000' };
    executeDrawCommand(ctx as any, cmd);
    expect(ctx.calls).toContain('fillRect(10, 10, 100, 50)');
  });

  it('should execute text command', () => {
    const ctx = new MockContext();
    const cmd: DrawCommand = { type: 'text', x: 20, y: 30, content: 'Hello', font: '16px sans-serif', color: '#000000' };
    executeDrawCommand(ctx as any, cmd);
    expect(ctx.calls).toContain('fillText(Hello, 20, 30)');
  });

  it('should execute save and restore commands', () => {
    const ctx = new MockContext();
    executeDrawCommand(ctx as any, { type: 'save' });
    executeDrawCommand(ctx as any, { type: 'restore' });
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('should execute line command', () => {
    const ctx = new MockContext();
    const cmd: DrawCommand = { type: 'line', x1: 0, y1: 0, x2: 100, y2: 100, stroke: '#0000FF', strokeWidth: 2 };
    executeDrawCommand(ctx as any, cmd);
    expect(ctx.calls).toContain('moveTo(0, 0)');
    expect(ctx.calls).toContain('lineTo(100, 100)');
    expect(ctx.calls).toContain('stroke');
  });

  it('should execute circle command', () => {
    const ctx = new MockContext();
    const cmd: DrawCommand = { type: 'circle', x: 50, y: 50, r: 25, fill: '#FFA500' };
    executeDrawCommand(ctx as any, cmd);
    expect(ctx.calls).toContain('beginPath');
    expect(ctx.calls).toContain('arc(50, 50, 25, 0, 6.283185307179586)');
  });
});
