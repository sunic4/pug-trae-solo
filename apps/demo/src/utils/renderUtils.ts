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
    
    if (!rootNode) {
      console.log('[HITTEST] rootNode is null');
      return null;
    }

    console.log('[HITTEST] Root node:', rootNode.constructor.name, 'at (', rootNode.x, ',', rootNode.y, ')', 'size (', rootNode.width, ',', rootNode.height, ')');

    // 递归寻找命中的节点 - 先检查子节点（后绘制的在上层）
    function test(node: any, depth: number = 0, parentX: number = 0, parentY: number = 0): any {
      const indent = '  '.repeat(depth);
      // 计算节点的绝对坐标
      const absoluteX = parentX + node.x;
      const absoluteY = parentY + node.y;
      console.log(`${indent}[HITTEST] Checking ${node.constructor.name} at (${absoluteX}, ${absoluteY}) size (${node.width}, ${node.height})`);
      console.log(`${indent}[HITTEST] Point (${x}, ${y}) in bounds: ${x >= absoluteX && x <= absoluteX + node.width && y >= absoluteY && y <= absoluteY + node.height}`);

      // 先检查子节点
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        const childResult = test(child, depth + 1, absoluteX, absoluteY);
        if (childResult) {
          console.log(`${indent}[HITTEST] Found target in child: ${childResult.constructor.name}`);
          return childResult;
        }
      }
      
      // 检查是否命中当前节点
      if (x >= absoluteX && x <= absoluteX + node.width &&
          y >= absoluteY && y <= absoluteY + node.height) {
        console.log(`${indent}[HITTEST] Hit ${node.constructor.name}`);
        return node;
      }
      
      console.log(`${indent}[HITTEST] Missed ${node.constructor.name}`);
      return null;
    }
    
    const result = test(rootNode);
    console.log('[HITTEST] Final result:', result ? result.constructor.name : 'null');
    return result;
  }

  dispatch(type: string, x: number, y: number): void {
    console.log(`[EVENT] Dispatching ${type} at (${x}, ${y})`);
    const target = this.hitTest(x, y);
    console.log(`[EVENT] Hit test result: ${target ? target.constructor.name : 'null'}`);

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
      console.log(`[EVENT] Calling ${type} handler on ${target.constructor.name}`);
      target.handlers[type](x, y);
    } else if (target) {
      console.log(`[EVENT] Target ${target.constructor.name} has no handler for ${type}`);
    } else {
      console.log(`[EVENT] No target found for ${type} at (${x}, ${y})`);
    }
  }

  attachToCanvas(canvas: HTMLCanvasElement): () => void {
    console.log('[EVENT] Attaching event listeners to canvas');
    
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log('[EVENT] Canvas click at client (', e.clientX, ',', e.clientY, '), canvas (', x, ',', y, ')');
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

    console.log('[EVENT] Event listeners attached');
    
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
  console.log('[RENDER] Initial rootNode created:', rootNode.constructor.name);
  globalRootNode = rootNode; 
  console.log('[RENDER] globalRootNode set:', globalRootNode ? globalRootNode.constructor.name : 'null');
  
  renderer.setRoot(rootNode);
  globalComposer!.endCompose();
  globalComposer!.recompose();
  renderer.renderFrame();

  // 监听状态变化，自动重新渲染
  effect(() => {
    console.log('[RENDER] Re-rendering due to state change');
    // 访问导航状态，建立依赖关系
    const newRootNode = globalComposer!.startCompose(App);
    console.log('[RENDER] New rootNode created:', newRootNode.constructor.name);
    globalRootNode = newRootNode;
    console.log('[RENDER] globalRootNode updated:', globalRootNode ? globalRootNode.constructor.name : 'null');
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
