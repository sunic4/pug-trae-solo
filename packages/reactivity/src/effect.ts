import { trackDependencies } from './signal';

/**
 * 可销毁对象接口，定义了销毁操作
 */
export interface Disposable {
  /**
   * 销毁对象，清理资源
   */
  dispose(): void;
  
  /**
   * 手动触发效果执行
   */
  run(): void;
}

/**
 * 效果选项
 */
export interface EffectOptions {
  /**
   * 清理函数
   */
  cleanup?: () => void;
  /**
   * 错误处理函数
   */
  onError?: (error: Error) => void;
  /**
   * 是否延迟执行
   */
  lazy?: boolean;
  /**
   * 执行调度器
   */
  scheduler?: (fn: () => void) => void;
}

/**
 * 创建一个响应式效果
 * @param fn 效果函数
 * @param options 选项参数
 * @returns 可销毁对象
 */
export function effect(fn: () => void | Promise<void>, options: EffectOptions = {}): Disposable {
  // 类型检查
  if (!fn || typeof fn !== 'function') {
    throw new Error('Invalid effect function');
  }
  
  // 用于存储 cleanup 函数
  let cleanup: (() => void) | null = null;
  let isDisposed = false;
  let isRunning = false;
  
  // 定义 effect 执行函数
  const runEffect = async () => {
    if (isDisposed || isRunning) return;
    
    isRunning = true;
    
    try {
      // 执行之前的 cleanup
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error in effect cleanup:', error);
          if (options.onError) {
            options.onError(error as Error);
          }
        }
      }
      
      // 追踪依赖并执行
      let result: any;
      
      try {
        result = trackDependencies(() => {
          return fn();
        }, () => {
          if (options.scheduler) {
            options.scheduler(runEffect);
          } else {
            runEffect();
          }
        });
      } catch (error) {
        console.error('Error in effect:', error);
        if (options.onError) {
          options.onError(error as Error);
        }
        isRunning = false;
        return;
      }
      
      // 处理异步结果
      if (result instanceof Promise) {
        try {
          await result;
        } catch (error) {
          console.error('Error in async effect:', error);
          if (options.onError) {
            options.onError(error as Error);
          }
        }
      }
      
      // 如果 fn 返回一个函数，将其作为 cleanup 函数
      if (typeof result === 'function') {
        cleanup = result;
      } else if (options.cleanup) {
        cleanup = options.cleanup;
      } else {
        cleanup = null;
      }
    } finally {
      isRunning = false;
    }
  };
  
  // 立即执行一次（除非是延迟执行）
  if (!options.lazy) {
    runEffect();
  }
  
  return {
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error in effect dispose:', error);
          if (options.onError) {
            options.onError(error as Error);
          }
        }
        cleanup = null;
      }
    },
    run: () => {
      if (!isDisposed) {
        runEffect();
      }
    }
  };
}
