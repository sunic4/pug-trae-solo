import { Composer } from '@pug/composer';
import { Renderer, RendererFactory, RendererType } from '@pug/renderer';
import { EventDispatcher } from '@pug/event';
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

/**
 * 渲染应用到指定的渲染器
 * @param rendererType 渲染器类型
 * @param config 渲染配置
 * @returns 渲染结果
 */
export function renderApp(rendererType: RendererType, config: RenderConfig): RenderResult {
  // 创建渲染器
  const renderer = RendererFactory.create(rendererType, {
    width: config.width,
    height: config.height,
    canvas: config.canvas
  });

  // 创建 composer
  const composer = new Composer();

  // 渲染函数
  function render() {
    const rootNode = composer.startCompose(App);
    renderer.setRoot(rootNode);
    composer.endCompose();
    composer.recompose();
    renderer.renderFrame();
  }

  // 初始渲染
  render();

  // 监听状态变化，自动重新渲染
  effect(render);

  // 如果是浏览器环境且提供了 canvas 元素，添加事件监听
  let detachEvents: (() => void) | undefined;
  if (rendererType === RendererType.CANVAS_2D && config.canvas) {
    const dispatcher = new EventDispatcher(composer.startCompose(App));
    detachEvents = dispatcher.attachToCanvas(config.canvas);
  }

  return {
    renderer,
    composer,
    detachEvents
  };
}
