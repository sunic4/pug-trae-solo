export interface Disposable {
  dispose(): void;
}

export function effect(fn: () => void): Disposable {
  // 立即执行一次
  fn();

  // 简化实现：返回一个空的 dispose 函数
  // 后续会实现依赖追踪和自动清理
  return {
    dispose: () => {}
  };
}
