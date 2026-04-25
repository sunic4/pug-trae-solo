/**
 * 信号接口，定义了响应式信号的基本操作
 * @template T 信号的值类型
 */
export interface Signal<T> {
  /**
   * 获取信号的值
   */
  get value(): T;
  
  /**
   * 设置信号的值
   */
  set value(v: T);
  
  /**
   * 订阅信号的变化
   * @param callback 信号变化时的回调函数
   * @returns 取消订阅的函数
   */
  subscribe(callback: () => void): () => void;
  
  /**
   * 清除所有订阅者
   */
  clearSubscribers(): void;
  
  /**
   * 获取订阅者数量
   */
  get subscriberCount(): number;
  
  /**
   * 异步更新信号的值
   * @param valueOrFn 新值或计算新值的函数
   * @returns Promise 表示更新完成
   */
  update(valueOrFn: T | ((current: T) => T)): Promise<void>;
  
  /**
   * 销毁信号，清理资源
   */
  dispose(): void;
}

// 全局依赖跟踪栈
const dependencyStack: Set<() => void>[] = [];

// 清理依赖跟踪栈
export function clearDependencyStack(): void {
  dependencyStack.length = 0;
}

// 获取依赖跟踪栈的长度
export function getDependencyStackLength(): number {
  return dependencyStack.length;
}

// 检查依赖跟踪栈是否为空
export function isDependencyStackEmpty(): boolean {
  return dependencyStack.length === 0;
}

/**
 * 信号配置选项
 * @template T 信号的值类型
 */
export interface SignalOptions<T> {
  /**
   * 是否持久化信号值到本地存储
   */
  persistent?: boolean;
  /**
   * 持久化存储的键名
   */
  storageKey?: string;
  /**
   * 值序列化函数
   */
  serialize?: (value: T) => string;
  /**
   * 值反序列化函数
   */
  deserialize?: (str: string) => T;
}

/**
 * 创建一个响应式信号
 * @template T 信号的值类型
 * @param initialValue 信号的初始值
 * @param options 信号配置选项
 * @returns 信号实例
 */
export function signal<T>(initialValue: T, options: SignalOptions<T> = {}): Signal<T> {
  // 类型检查：确保 initialValue 不是 undefined 或 null（除非 T 允许这些值）
  // 注意：这里不做严格检查，因为 T 可能允许 undefined 或 null
  
  const subscribers = new Set<() => void>();
  // 使用一个单独的 Set 来跟踪已添加的回调，避免重复订阅
  const addedCallbacks = new WeakSet<() => void>();
  let value = initialValue;
  let disposed = false;
  
  // 处理持久化
  const { persistent = false, storageKey, serialize = JSON.stringify, deserialize = JSON.parse } = options;
  
  // 从本地存储加载持久化值
  if (persistent && storageKey && typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (storedValue !== null) {
        value = deserialize(storedValue);
      }
    } catch (error) {
      console.error('Error loading persisted signal value:', error);
    }
  }

  const signal: Signal<T> = {
    get value() {
      if (disposed) {
        throw new Error('Cannot access disposed signal');
      }
      
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
      if (disposed) {
        throw new Error('Cannot set disposed signal');
      }
      
      if (value !== v) {
        value = v;
        
        // 持久化值
        if (persistent && storageKey && typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem(storageKey, serialize(value));
          } catch (error) {
            console.error('Error persisting signal value:', error);
          }
        }
        
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
      if (disposed) {
        throw new Error('Cannot subscribe to disposed signal');
      }
      
      subscribers.add(callback);
      return () => {
        if (!disposed) {
          subscribers.delete(callback);
        }
      };
    },
    clearSubscribers() {
      if (disposed) {
        throw new Error('Cannot clear subscribers of disposed signal');
      }
      
      subscribers.clear();
      addedCallbacks.clear();
    },
    get subscriberCount() {
      if (disposed) {
        return 0;
      }
      return subscribers.size;
    },
    async update(valueOrFn: T | ((current: T) => T)) {
      if (disposed) {
        throw new Error('Cannot update disposed signal');
      }
      
      try {
        const newValue = typeof valueOrFn === 'function' 
          ? (valueOrFn as (current: T) => T)(value) 
          : valueOrFn;
        
        this.value = newValue;
      } catch (error) {
        console.error('Error updating signal:', error);
        throw error;
      }
    },
    dispose() {
      if (disposed) {
        return;
      }
      
      subscribers.clear();
      addedCallbacks.clear();
      disposed = true;
    }
  };

  return signal;
}

// 用于跟踪依赖的工具函数
export function trackDependencies(fn: () => void, onDependencyChange: () => void): void {
  // 类型检查
  if (!fn || typeof fn !== 'function') {
    throw new Error('Invalid function to track');
  }
  if (!onDependencyChange || typeof onDependencyChange !== 'function') {
    throw new Error('Invalid dependency change callback');
  }
  
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
