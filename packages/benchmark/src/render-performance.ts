import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';
import { BoxComponent, TextComponent, ColumnComponent } from '@pug/components';

// 模拟浏览器环境
if (typeof window === 'undefined') {
  global.window = {} as any;
  global.document = {
    createElement: () => ({
      width: 800,
      height: 600,
      getContext: () => ({
        fillRect: () => {},
        fillText: () => {},
        strokeRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        clip: () => {},
        setTransform: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        measureText: () => ({ width: 0 })
      })
    })
  } as any;
}

import { CanvasRenderer } from '@pug/renderer';

interface RenderPerformanceResult {
  name: string;
  duration: number;
  nodes: number;
  fps: number;
}

export function runRenderPerformanceTest(): RenderPerformanceResult {
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  // 创建渲染器
  const renderer = new CanvasRenderer(canvas, {
    width: 800,
    height: 600
  });
  
  // 创建AppContext
  const appContext = createAppContext({
    theme: defaultTheme,
    renderer
  });
  
  // 传递AppContext给渲染器
  renderer.setAppContext(appContext);
  
  // 创建大量节点进行测试
  const nodeCount = 1000;
  const startTime = performance.now();
  
  // 创建根组件
  const rootNode = appContext.composer.startCompose(() => {
    return ColumnComponent({
      children: Array.from({ length: nodeCount }, (_, i) => {
        return BoxComponent({
          width: 100,
          height: 30,
          backgroundColor: `rgba(${i % 255}, ${(i * 7) % 255}, ${(i * 13) % 255}, 0.5)`,
          margin: 2,
          children: TextComponent({
            text: `Node ${i + 1}`,
            fontSize: 12,
            color: '#000000'
          })
        });
      })
    });
  });
  
  // 设置根节点
  renderer.setRoot(rootNode);
  
  // 渲染10次
  const renderCount = 10;
  for (let i = 0; i < renderCount; i++) {
    renderer.markDirty({ x: 0, y: 0, w: 800, h: 600 });
    renderer.renderFrame();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const fps = (renderCount / (duration / 1000)).toFixed(2);
  
  // 清理
  renderer.dispose();
  appContext.dispose();
  
  return {
    name: 'Render Performance',
    duration: parseFloat(duration.toFixed(2)),
    nodes: nodeCount,
    fps: parseFloat(fps)
  };
}
