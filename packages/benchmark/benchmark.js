// JavaScript版本的性能测试脚本
const { createAppContext } = require('@pug/core');
const { defaultTheme } = require('@pug/theme');
const { ButtonComponent, TextComponent, ColumnComponent } = require('@pug/components');
const { signal, computed, effect } = require('@pug/reactivity');

// 模拟浏览器环境
if (typeof window === 'undefined') {
  global.window = {};
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
  };
}

// 延迟加载CanvasRenderer，因为它依赖浏览器环境
let CanvasRenderer;
try {
  CanvasRenderer = require('@pug/renderer').CanvasRenderer;
} catch (e) {
  console.log('CanvasRenderer not available in this environment');
}

async function runAllTests() {
  console.log('Running performance benchmarks...\n');
  
  const results = [];
  
  try {
    // 运行状态性能测试
    console.log('Running State Performance Test...');
    const stateResult = runStatePerformanceTest();
    results.push(stateResult);
    console.log(`✓ State Performance: ${stateResult.duration}ms for ${stateResult.updates} updates (${stateResult.computedSignals} computed signals, ${stateResult.effects} effects)\n`);
  } catch (error) {
    console.error('Error running state performance test:', error);
  }
  
  try {
    // 运行组件性能测试
    console.log('Running Component Performance Test...');
    const componentResult = runComponentPerformanceTest();
    results.push(componentResult);
    console.log(`✓ Component Performance: ${componentResult.duration}ms for ${componentResult.components} components\n`);
  } catch (error) {
    console.error('Error running component performance test:', error);
  }
  
  try {
    // 运行内存性能测试
    console.log('Running Memory Performance Test...');
    const memoryResult = runMemoryPerformanceTest();
    results.push(memoryResult);
    console.log(`✓ Memory Performance: ${memoryResult.memoryUsage}MB used (Initial: ${memoryResult.initialMemory}MB, Peak: ${memoryResult.peakMemory}MB, Final: ${memoryResult.finalMemory}MB)\n`);
  } catch (error) {
    console.error('Error running memory performance test:', error);
  }
  
  try {
    // 运行渲染性能测试（如果CanvasRenderer可用）
    if (CanvasRenderer) {
      console.log('Running Render Performance Test...');
      const renderResult = runRenderPerformanceTest();
      results.push(renderResult);
      console.log(`✓ Render Performance: ${renderResult.duration}ms for ${renderResult.nodes} nodes (${renderResult.fps} FPS)\n`);
    } else {
      console.log('✗ Render Performance Test: CanvasRenderer not available\n');
    }
  } catch (error) {
    console.error('Error running render performance test:', error);
  }
  
  // 输出总结
  console.log('=== Performance Benchmark Summary ===');
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.duration) {
      console.log(`  Duration: ${result.duration}ms`);
    }
    if (result.nodes) {
      console.log(`  Nodes: ${result.nodes}`);
    }
    if (result.fps) {
      console.log(`  FPS: ${result.fps}`);
    }
    if (result.updates) {
      console.log(`  Updates: ${result.updates}`);
    }
    if (result.computedSignals) {
      console.log(`  Computed Signals: ${result.computedSignals}`);
    }
    if (result.effects) {
      console.log(`  Effects: ${result.effects}`);
    }
    if (result.components) {
      console.log(`  Components: ${result.components}`);
    }
    if (result.memoryUsage) {
      console.log(`  Memory Usage: ${result.memoryUsage}MB`);
    }
  });
  
  return results;
}

function runStatePerformanceTest() {
  const updateCount = 1000;
  const computedCount = 100;
  const effectCount = 100;
  
  // 创建信号
  const baseSignal = signal(0);
  
  // 创建计算信号
  const computedSignals = [];
  for (let i = 0; i < computedCount; i++) {
    computedSignals.push(computed(() => baseSignal.value * (i + 1)));
  }
  
  // 创建效果
  const effects = [];
  for (let i = 0; i < effectCount; i++) {
    effects.push(effect(() => {
      computedSignals.forEach(cs => cs.value);
    }));
  }
  
  const startTime = performance.now();
  
  // 执行状态更新
  for (let i = 1; i <= updateCount; i++) {
    baseSignal.value = i;
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // 清理
  baseSignal.dispose();
  effects.forEach(e => e.dispose());
  
  return {
    name: 'State Performance',
    duration: parseFloat(duration.toFixed(2)),
    updates: updateCount,
    computedSignals: computedCount,
    effects: effectCount
  };
}

function runComponentPerformanceTest() {
  // 创建AppContext
  const appContext = createAppContext({
    theme: defaultTheme
  });
  
  const componentCount = 1000;
  const startTime = performance.now();
  
  // 创建大量组件
  const components = [];
  for (let i = 0; i < componentCount; i++) {
    if (i % 2 === 0) {
      components.push(ButtonComponent({
        text: `Button ${i + 1}`,
        onClick: () => {},
        appContext
      }));
    } else {
      components.push(TextComponent({
        text: `Text ${i + 1}`,
        fontSize: 14,
        appContext
      }));
    }
  }
  
  // 创建根组件包含所有子组件
  ColumnComponent({
    children: components,
    appContext
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // 清理
  appContext.dispose();
  
  return {
    name: 'Component Creation Performance',
    duration: parseFloat(duration.toFixed(2)),
    components: componentCount
  };
}

function runMemoryPerformanceTest() {
  // 初始内存快照
  const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  
  // 创建大量信号和效果
  const signalCount = 1000;
  const signals = [];
  const effects = [];
  
  // 创建AppContext
  const appContext = createAppContext({
    theme: defaultTheme
  });
  
  // 创建信号
  for (let i = 0; i < signalCount; i++) {
    const s = signal(i);
    signals.push(s);
    
    // 为每个信号创建效果
    const e = effect(() => {
      s.value;
    });
    effects.push(e);
  }
  
  // 创建大量组件
  const componentCount = 1000;
  const components = [];
  
  for (let i = 0; i < componentCount; i++) {
    const button = ButtonComponent({
      text: `Button ${i}`,
      onClick: () => {},
      appContext
    });
    components.push(button);
  }
  
  // 峰值内存快照
  const peakMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  
  // 清理
  signals.forEach(signal => signal.dispose());
  effects.forEach(effect => effect.dispose());
  appContext.dispose();
  
  // 强制垃圾回收
  if (global.gc) {
    global.gc();
  }
  
  // 最终内存快照
  const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const memoryUsage = peakMemory - initialMemory;
  
  return {
    name: 'Memory Performance',
    initialMemory: parseFloat(initialMemory.toFixed(2)),
    peakMemory: parseFloat(peakMemory.toFixed(2)),
    finalMemory: parseFloat(finalMemory.toFixed(2)),
    memoryUsage: parseFloat(memoryUsage.toFixed(2))
  };
}

function runRenderPerformanceTest() {
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
        return ButtonComponent({
          text: `Node ${i + 1}`,
          onClick: () => {},
          appContext
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

// 运行所有测试
runAllTests().catch(console.error);
