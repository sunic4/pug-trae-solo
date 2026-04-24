import { trackDependencies } from './signal';

export interface Disposable {
  dispose(): void;
}

export function effect(fn: () => void, options?: {
  cleanup?: () => void;
  onError?: (error: Error) => void;
}): Disposable {
  // 用于存储 cleanup 函数
  let cleanup: (() => void) | null = null;
  let isDisposed = false;
  
  // 定义 effect 执行函数
  const runEffect = () => {
    if (isDisposed) return;
    
    // 执行之前的 cleanup
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in effect cleanup:', error);
        if (options?.onError) {
          options.onError(error as Error);
        }
      }
    }
    
    // 追踪依赖并执行
    try {
      const result = trackDependencies(fn, runEffect);
      // 如果 fn 返回一个函数，将其作为 cleanup 函数
      if (typeof result === 'function') {
        cleanup = result;
      } else if (options?.cleanup) {
        cleanup = options.cleanup;
      } else {
        cleanup = null;
      }
    } catch (error) {
      console.error('Error in effect:', error);
      if (options?.onError) {
        options.onError(error as Error);
      }
    }
  };
  
  // 立即执行一次
  runEffect();
  
  return {
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error in effect dispose:', error);
          if (options?.onError) {
            options.onError(error as Error);
          }
        }
        cleanup = null;
      }
    }
  };
}
