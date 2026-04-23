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
      // 检查是否需要重新计算整个布局
      if (this.rootNode.layoutDirty) {
        // 对根节点进行布局计算
        const rootSize = this.rootNode.measure({
          minWidth: 0,
          maxWidth: this.canvas.width,
          minHeight: 0,
          maxHeight: this.canvas.height
        });
        this.rootNode.place(0, 0, rootSize.width, rootSize.height);
      } else {
        // 只对脏节点进行布局计算
        this.updateDirtyNodesLayout(this.rootNode);
      }
      
      // 然后绘制
      this.drawDirtyNodes(this.rootNode);
    }

    // 清空脏矩形
    this.dirtyRects = [];
  }

  private updateDirtyNodesLayout(node: ComposeNode): void {
    if (node.layoutDirty) {
      // 重新计算当前节点的布局
      const parent = node.parent;
      if (parent) {
        // 获取父节点的约束
        const constraints = {
          minWidth: 0,
          maxWidth: parent.width,
          minHeight: 0,
          maxHeight: parent.height
        };
        const nodeSize = node.measure(constraints);
        // 重新放置节点
        // 注意：这里简化处理，实际应该根据父节点的布局逻辑重新计算位置
        node.place(node.x, node.y, nodeSize.width, nodeSize.height);
      }
    }
    
    // 递归处理子节点
    for (const child of node.children) {
      this.updateDirtyNodesLayout(child);
    }
  }

  private drawDirtyNodes(node: ComposeNode): void {
    if (node.dirty) {
      // 保存当前状态
      this.ctx.save();
      
      // 移动到节点的位置
      this.ctx.translate(node.x, node.y);
      
      // 优先使用 draw 方法，如果没有则使用 drawCommands 方法
      if (typeof node.draw === 'function') {
        node.draw(this.ctx);
      } else if (typeof node.drawCommands === 'function') {
        const commands = node.drawCommands();
        this.drawCommands(commands);
      }
      
      // 恢复状态
      this.ctx.restore();
    }
    
    // 递归绘制子节点
    for (const child of node.children) {
      this.drawDirtyNodes(child);
    }
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
