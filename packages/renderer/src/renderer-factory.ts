import { Renderer, RendererConfig, RendererType } from './renderer-interface';
import { CanvasRenderer } from './canvas-renderer';

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
        // 使用传入的 canvas，如果没有则创建新的
        let canvas: HTMLCanvasElement;
        if (config.canvas) {
          canvas = config.canvas;
        } else {
          canvas = document.createElement('canvas');
          canvas.width = config.width;
          canvas.height = config.height;
        }
        return new CanvasRenderer(canvas, config);
      
      default:
        throw new Error(`Renderer type ${type} not implemented`);
    }
  }
}