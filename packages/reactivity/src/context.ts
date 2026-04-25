import { Composer } from '@pug/composer';
import { AppContext } from '@pug/core';

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
 * 获取当前 Composer
 * @returns {Composer | null}
 */
export function getCurrentComposer(): Composer | null {
  return currentContext instanceof Composer ? currentContext : null;
}

/**
 * 获取当前 AppContext
 * @returns {AppContext | null}
 */
export function getCurrentAppContext(): AppContext | null {
  const composer = getCurrentComposer();
  return composer ? composer.getAppContext() : null;
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
