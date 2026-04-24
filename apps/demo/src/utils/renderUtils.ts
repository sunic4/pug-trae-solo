import { Composer } from '@pug/composer';
import { Renderer, RendererFactory, RendererType } from '@pug/renderer';
import { effect } from '@pug/reactivity';
import { hitTest } from '@pug/event';
import { App } from '../App';

// 渲染配置接口
export interface RenderConfig {
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
}

// 渲染结果接口
export interface RenderResult {
  renderer: Renderer;
  composer: Composer;
  detachEvents?: () => void;
}

// 保持全局的 composer 和 rootNode 引用，避免每次重新创建
let globalComposer: Composer | null = null;
let globalRootNode: any = null;

// 创建一个可动态获取 rootNode 的包装类
class DynamicRootEventDispatcher {
  private getRootNode: () => any;
  private lastHovered: any = null;

  constructor(getRootNode: () => any) {
    this.getRootNode = getRootNode;
  }



  private hitTest(x: number, y: number): any {
    const rootNode = this.getRootNode();
    
    if (!rootNode) {
      return null;
    }

    const result = hitTest(rootNode, x, y);
    return result;
  }

  dispatch(type: string, x: number, y: number): void {
    const target = this.hitTest(x, y);

    // hover 追踪
    if (type === 'mousemove') {
      if (this.lastHovered !== target) {
        if (this.lastHovered && this.lastHovered.handlers?.['mouseleave']) {
          this.lastHovered.handlers['mouseleave'](x, y);
        }
        if (target && target.handlers?.['mouseenter']) {
          target.handlers['mouseenter'](x, y);
        }
        this.lastHovered = target;
      }
    }

    if (target && target.handlers?.[type]) {
      target.handlers[type](x, y);
    }
  }

  attachToCanvas(canvas: HTMLCanvasElement): () => void {
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return { x, y };
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('click', x, y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('mousemove', x, y);
    };
    const onWheel = (e: WheelEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('wheel', x, y);
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }
}

/**
 * 渲染应用到指定的渲染器
 * @param rendererType 渲染器类型
 * @param config 渲染配置
 * @returns 渲染结果
 */
export function renderApp(rendererType: RendererType, config: RenderConfig): RenderResult {
  // 创建或重用 composer
  if (!globalComposer) {
    globalComposer = new Composer();
  }

  // 创建渲染器
  const renderer = RendererFactory.create(rendererType, {
    width: config.width,
    height: config.height,
    canvas: config.canvas
  });

  // 初始渲染 - 先设置 globalRootNode
  const rootNode = globalComposer!.startCompose(App);
  globalRootNode = rootNode; 
  
  renderer.setRoot(rootNode);
  globalComposer!.endCompose();
  globalComposer!.recompose();
  renderer.renderFrame();

  // 监听状态变化，自动重新渲染
  effect(() => {
    // 访问导航状态，建立依赖关系
    const newRootNode = globalComposer!.startCompose(App);
    globalRootNode = newRootNode;
    renderer.setRoot(newRootNode);
    globalComposer!.endCompose();
    globalComposer!.recompose();
    renderer.renderFrame();
  });

  // 如果是浏览器环境且提供了 canvas 元素，添加事件监听
  let detachEvents: (() => void) | undefined;
  if (rendererType === RendererType.CANVAS_2D && config.canvas) {
    // 使用动态获取 rootNode 的事件分发器
    const dispatcher = new DynamicRootEventDispatcher(() => globalRootNode);
    detachEvents = dispatcher.attachToCanvas(config.canvas);
  }

  return {
    renderer,
    composer: globalComposer,
    detachEvents
  };
}
