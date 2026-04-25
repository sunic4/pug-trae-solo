import { trackDependencies } from './signal';

/**
 * 可销毁对象接口，定义了销毁操作
 */
export interface Disposable {
  /**
   * 销毁对象，清理资源
   */
  dispose(): void;
}

/**
 * 创建一个响应式效果
 * @param fn 效果函数
 * @param options 选项参数
 * @returns 可销毁对象
 */
export function effect(fn: () => void, options?: {
  cleanup?: () => void;
  onError?: (error: Error) => void;
}): Disposable {
  // 类型检查
  if (!fn || typeof fn !== 'function') {
    throw new Error('Invalid effect function');
  }
  
  // 选项参数类型检查
  if (options && typeof options !== 'object') {
    throw new Error('Invalid options object');
  }
  
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
