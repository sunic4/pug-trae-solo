import { ComposeNode } from '@pug/composer';
import { RendererFactory } from './renderer-factory.js';
import { RendererType } from './renderer-interface.js';

/**
 * 渲染组件并生成截图
 * @param component 要渲染的组件
 * @param options 渲染选项
 * @returns 截图 Buffer
 */
export async function renderComponent(
  component: ComposeNode,
  options: {
    width: number;
    height: number;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
) {
  const { width, height, format = 'png', quality = 1 } = options;

  // 创建 NodeCanvas 渲染器
  const renderer = RendererFactory.create(RendererType.NODE_CANVAS, {
    width,
    height,
  });

  // 设置根节点
  renderer.setRoot(component);

  // 渲染一帧
  renderer.renderFrame();

  // 生成截图
  const buffer = (renderer as any).toBuffer(format, quality);

  // 销毁渲染器
  renderer.dispose();

  return buffer;
}

/**
 * 保存组件截图到文件
 * @param component 要渲染的组件
 * @param path 文件路径
 * @param options 渲染选项
 */
export async function saveComponentScreenshot(
  component: ComposeNode,
  path: string,
  options: {
    width: number;
    height: number;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }
) {
  const { width, height, format = 'png', quality = 1 } = options;

  // 创建 NodeCanvas 渲染器
  const renderer = RendererFactory.create(RendererType.NODE_CANVAS, {
    width,
    height,
  });

  // 设置根节点
  renderer.setRoot(component);

  // 渲染一帧
  renderer.renderFrame();

  // 保存截图
  await (renderer as any).saveToFile(path, format, quality);

  // 销毁渲染器
  renderer.dispose();
}