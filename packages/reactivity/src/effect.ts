import { trackDependencies } from './signal';

export interface Disposable {
  dispose(): void;
}

export function effect(fn: () => void): Disposable {
  // 用于存储 cleanup 函数
  let cleanup: (() => void) | null = null;
  
  // 定义 effect 执行函数
  const runEffect = () => {
    // 执行之前的 cleanup
    if (cleanup) {
      cleanup();
    }
    
    // 追踪依赖并执行
    trackDependencies(fn, runEffect);
  };
  
  // 立即执行一次
  runEffect();
  
  return {
    dispose: () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    }
  };
}
