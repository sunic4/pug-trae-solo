import { Composer } from '@pug/composer';
import { Renderer, RendererFactory, RendererType } from '@pug/renderer';
import { effect } from '@pug/reactivity';
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
    if (!rootNode) return null;

    function test(node: any, px: number, py: number): any {
      if (!node) return null;
      // 简单的命中测试
      if (
        px >= node.x &&
        px <= node.x + node.width &&
        py >= node.y &&
        py <= node.y + node.height
      ) {
        // 先检查子元素
        for (let i = node.children.length - 1; i >= 0; i--) {
          const childResult = test(node.children[i], px - node.x, py - node.y);
          if (childResult) return childResult;
        }
        return node;
      }
      return null;
    }

    return test(rootNode, x, y);
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
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

  // 渲染函数
  function render() {
    const rootNode = globalComposer!.startCompose(App);
    globalRootNode = rootNode; // 保存 rootNode 引用
    renderer.setRoot(rootNode);
    globalComposer!.endCompose();
    globalComposer!.recompose();
    renderer.renderFrame();
  }

  // 初始渲染
  render();

  // 监听状态变化，自动重新渲染
  effect(render);

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
