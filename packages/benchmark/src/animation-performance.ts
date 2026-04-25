/**
 * 动画性能测试
 * 测试动画效果的性能
 */

import { signal, effect } from '@pug/reactivity';
import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';

/**
 * 运行动画性能测试
 * @returns 测试结果
 */
export function runAnimationPerformanceTest() {
  const appContext = createAppContext({ theme: defaultTheme });
  
  const startTime = performance.now();
  
  // 模拟100个动画
  const animations = [];
  for (let i = 0; i < 100; i++) {
    const progress = signal(0);
    const direction = signal(1);
    
    const dispose = effect(() => {
      const interval = setInterval(() => {
        progress.value += 0.01 * direction.value;
        if (progress.value >= 1) {
          direction.value = -1;
        }
        if (progress.value <= 0) {
          direction.value = 1;
        }
      }, 16);
      return () => clearInterval(interval);
    });
    
    animations.push({ progress, direction, dispose });
  }
  
  // 模拟运行1秒
  const simulateTime = 1000;
  const endTime = performance.now() + simulateTime;
  while (performance.now() < endTime) {
    // 空循环，模拟时间流逝
  }
  
  // 清理
  animations.forEach(anim => anim.dispose());
  appContext.dispose();
  
  const duration = performance.now() - startTime;
  
  return {
    name: 'Animation Performance Test',
    duration,
    animations: 100,
    fps: Math.round(1000 / (duration / (simulateTime / 16)))
  };
}
