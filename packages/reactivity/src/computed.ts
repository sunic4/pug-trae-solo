import { trackDependencies } from './signal';

/**
 * 计算信号接口，定义了计算信号的基本操作
 * @template T 计算信号的值类型
 */
export interface ComputedSignal<T> {
  /**
   * 获取计算信号的值
   */
  get value(): T;
  
  /**
   * 订阅计算信号的变化
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
}

/**
 * 创建一个计算信号
 * @template T 计算信号的值类型
 * @param fn 计算函数
 * @returns 计算信号实例
 */
export function computed<T>(fn: () => T): ComputedSignal<T> {
  // 类型检查
  if (!fn || typeof fn !== 'function') {
    throw new Error('Invalid computed function');
  }
  
  let value: T;
  let dirty = true;
  const subscribers = new Set<() => void>();

  // 跟踪依赖的函数
  function recompute() {
    try {
      trackDependencies(() => {
        value = fn();
      }, markDirty);
      dirty = false;
    } catch (error) {
      console.error('Error in computed function:', error);
      // 即使计算失败，也标记为非脏，避免无限重试
      dirty = false;
    }
  }

  // 当依赖变化时，标记为脏
  function markDirty() {
    if (!dirty) {
      dirty = true;
      // 通知订阅者时添加错误处理
      subscribers.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in computed subscriber:', error);
        }
      });
    }
  }

  const computed: ComputedSignal<T> = {
    get value() {
      if (dirty) {
        recompute();
      }
      return value;
    },
    subscribe(callback: () => void) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    clearSubscribers() {
      subscribers.clear();
    },
    get subscriberCount() {
      return subscribers.size;
    }
  };

  // 初始计算
  recompute();

  return computed;
}
