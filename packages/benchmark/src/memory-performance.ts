import { signal, effect } from '@pug/reactivity';
import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';
import { ButtonComponent } from '@pug/components';

interface MemoryPerformanceResult {
  name: string;
  initialMemory: number;
  peakMemory: number;
  finalMemory: number;
  memoryUsage: number;
}

export function runMemoryPerformanceTest(): MemoryPerformanceResult {
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
