import { Renderer, RendererConfig, RendererType } from './renderer-interface.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { NodeCanvasRenderer } from './nodecanvas-renderer.js';

/**
 * 渲染器工厂
 */
export class RendererFactory {
  /**
   * 创建渲染器实例
   */
  static create(type: RendererType, config: RendererConfig): Renderer {
    switch (type) {
      case RendererType.CANVAS_2D:
        if (typeof window === 'undefined') {
          throw new Error('Canvas 2D renderer requires browser environment');
        }
        const canvas = document.createElement('canvas');
        canvas.width = config.width;
        canvas.height = config.height;
        return new CanvasRenderer(canvas);
      
      case RendererType.NODE_CANVAS:
        return new NodeCanvasRenderer(config);
      
      default:
        throw new Error(`Renderer type ${type} not implemented`);
    }
  }
}