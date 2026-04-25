import { signal, computed, effect } from '@pug/reactivity';

interface StatePerformanceResult {
  name: string;
  duration: number;
  updates: number;
  computedSignals: number;
  effects: number;
}

export function runStatePerformanceTest(): StatePerformanceResult {
  const updateCount = 1000;
  const computedCount = 100;
  const effectCount = 100;
  
  // 创建信号
  const baseSignal = signal(0);
  
  // 创建计算信号
  const computedSignals = Array.from({ length: computedCount }, (_, i) => {
    return computed(() => baseSignal.value * (i + 1));
  });
  
  // 创建效果
  const effects = Array.from({ length: effectCount }, () => {
    return effect(() => {
      // 依赖所有计算信号
      computedSignals.forEach(cs => cs.value);
    });
  });
  
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
