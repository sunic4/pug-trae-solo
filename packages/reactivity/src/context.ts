/**
 * 用于跟踪当前 Composable 执行上下文
 * @type {T | null}
 */
export let currentContext: any = null;

/**
 * 设置当前 Composable 执行上下文
 * @param {T | null} context 上下文对象
 */
export function setCurrentContext(context: any): void {
  // 类型检查：允许设置为 null 或任何对象
  currentContext = context;
}

/**
 * 获取当前 Composable 执行上下文
 * @returns {T | null} 上下文对象
 */
export function getCurrentContext(): any {
  return currentContext;
}

/**
 * 清除当前 Composable 执行上下文
 */
export function clearCurrentContext(): void {
  currentContext = null;
}

/**
 * 检查是否存在当前 Composable 执行上下文
 * @returns {boolean} 是否存在上下文
 */
export function hasCurrentContext(): boolean {
  return currentContext !== null;
}
