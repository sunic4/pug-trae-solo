import { signal } from '@pug/reactivity';
import { Theme, defaultTheme } from './theme';
import { AppContext } from '@pug/core';

export class ThemeContext {
  private themeSignal;

  constructor(initialTheme: Theme = defaultTheme) {
    this.themeSignal = signal(initialTheme);
  }

  get theme() {
    return this.themeSignal.value;
  }

  setTheme(theme: Theme): void {
    this.themeSignal.value = theme;
  }

  watchTheme(callback: (theme: Theme) => void): () => void {
    return this.themeSignal.subscribe(() => callback(this.themeSignal.value));
  }
}

// 全局主题上下文实例（保持向后兼容）
export const globalThemeContext = new ThemeContext();

// 全局 AppContext 引用（用于全局钩子函数）
let globalAppContext: AppContext | null = null;

// 设置全局 AppContext
export function setGlobalAppContext(context: AppContext): void {
  globalAppContext = context;
}

// 获取主题上下文（优先从 AppContext 获取）
export function getThemeContext(): ThemeContext {
  return globalAppContext?.theme || globalThemeContext;
}

// 主题钩子函数，用于在组件中访问主题
export function useTheme(): Theme {
  // 优先从 AppContext 获取，否则使用全局主题上下文
  return getThemeContext().theme;
}

// 主题切换钩子函数，用于在组件中切换主题
export function useThemeSwitcher() {
  return (theme: Theme) => {
    getThemeContext().setTheme(theme);
  };
}
