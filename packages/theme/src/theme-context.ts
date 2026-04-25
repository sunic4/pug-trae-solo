import { signal } from '@pug/reactivity';
import { Theme, defaultTheme } from './theme';
import { AppContext } from '@pug/core';
import { getCurrentAppContext } from '@pug/reactivity';

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

// 获取 AppContext，优先使用传入的，否则从当前上下文中获取
function getAppContext(appContext?: AppContext): AppContext | null {
  if (appContext) {
    return appContext;
  }
  return getCurrentAppContext();
}

// 主题钩子函数，用于在组件中访问主题
export function useTheme(appContext?: AppContext): Theme {
  const ctx = getAppContext(appContext);
  if (ctx) {
    return ctx.theme.theme;
  }
  return defaultTheme;
}

// 主题切换钩子函数，用于在组件中切换主题
export function useThemeSwitcher(appContext?: AppContext) {
  const ctx = getAppContext(appContext);
  return (theme: Theme) => {
    if (ctx) {
      ctx.theme.setTheme(theme);
    }
  };
}
