import { ComposeNode } from '@pug/composer';
import { DrawCommand, executeDrawCommand } from './draw-command.js';
import { DirtyRect, mergeDirtyRects } from './dirty-rect.js';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirtyRects: DirtyRect[] = [];
  private rootNode: ComposeNode | null = null;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    this.startFrameLoop();
  }

  setRoot(node: ComposeNode): void {
    this.rootNode = node;
    this.markDirty({ x: 0, y: 0, w: this.canvas.width, h: this.canvas.height });
  }

  markDirty(rect: DirtyRect): void {
    this.dirtyRects.push(rect);
  }

  private startFrameLoop(): void {
    const frameLoop = () => {
      if (this.dirtyRects.length > 0) {
        this.renderFrame();
      }
      this.animationFrameId = requestAnimationFrame(frameLoop);
    };
    frameLoop();
  }

  private renderFrame(): void {
    // 合并脏矩形
    const mergedRects = mergeDirtyRects(this.dirtyRects);

    // 清除脏区域
    for (const rect of mergedRects) {
      this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
    }

    // 绘制所有节点
    if (this.rootNode) {
      // 先对根节点进行布局计算
      const rootSize = this.rootNode.measure({
        minWidth: 0,
        maxWidth: this.canvas.width,
        minHeight: 0,
        maxHeight: this.canvas.height
      });
      this.rootNode.place(0, 0, rootSize.width, rootSize.height);
      
      // 然后绘制
      this.drawNode(this.rootNode);
    }

    // 清空脏矩形
    this.dirtyRects = [];
  }

  private drawNode(node: ComposeNode): void {
    // 保存当前状态
    this.ctx.save();
    
    // 移动到节点的位置
    this.ctx.translate(node.x, node.y);
    
    // 调用节点的 draw 方法
    node.draw(this.ctx);
    
    // 绘制子节点
    for (const child of node.children) {
      this.drawNode(child);
    }
    
    // 恢复状态
    this.ctx.restore();
  }

  drawCommands(commands: DrawCommand[]): void {
    for (const cmd of commands) {
      executeDrawCommand(this.ctx, cmd);
    }
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
