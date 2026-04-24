export interface Signal<T> {
  get value(): T;
  set value(v: T);
  subscribe(callback: () => void): () => void;
}

// 全局依赖跟踪栈
const dependencyStack: Set<() => void>[] = [];

export function signal<T>(initialValue: T): Signal<T> {
  const subscribers = new Set<() => void>();
  // 使用一个单独的 Set 来跟踪已添加的回调，避免重复订阅
  const addedCallbacks = new WeakSet<() => void>();
  let value = initialValue;

  const signal: Signal<T> = {
    get value() {
      // 检查是否在依赖跟踪上下文中
      if (dependencyStack.length > 0) {
        const currentTrackers = dependencyStack[dependencyStack.length - 1];
        // 为每个依赖的 signal 添加一个回调，当 signal 变化时标记 computed 为脏
        // 直接将 currentTrackers 中的所有回调添加到 subscribers 中
        currentTrackers.forEach(callback => {
          if (!addedCallbacks.has(callback)) {
            subscribers.add(callback);
            addedCallbacks.add(callback);
          }
        });
      }
      return value;
    },
    set value(v: T) {
      if (value !== v) {
        value = v;
        // 同步通知订阅者，确保测试通过
        subscribers.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Error in signal subscriber:', error);
          }
        });
      }
    },
    subscribe(callback: () => void) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
  };

  return signal;
}

// 用于跟踪依赖的工具函数
export function trackDependencies(fn: () => void, onDependencyChange: () => void): void {
  // 创建一个新的依赖跟踪上下文
  const trackers = new Set<() => void>();
  trackers.add(onDependencyChange);
  dependencyStack.push(trackers);

  try {
    fn();
  } catch (error) {
    console.error('Error in tracked function:', error);
    throw error;
  } finally {
    dependencyStack.pop();
  }
}
