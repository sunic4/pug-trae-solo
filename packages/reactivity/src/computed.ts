import { trackDependencies } from './signal.js';

export interface ComputedSignal<T> {
  get value(): T;
  subscribe(callback: () => void): () => void;
}

export function computed<T>(fn: () => T): ComputedSignal<T> {
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
      subscribers.forEach(callback => callback());
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
    }
  };

  // 初始计算
  recompute();

  return computed;
}
