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

// 主题钩子函数，用于在组件中访问主题
export function useTheme(appContext?: AppContext): Theme {
  if (appContext) {
    return appContext.theme.theme;
  }
  // 向后兼容：使用默认主题
  return defaultTheme;
}

// 主题切换钩子函数，用于在组件中切换主题
export function useThemeSwitcher(appContext?: AppContext) {
  return (theme: Theme) => {
    if (appContext) {
      appContext.theme.setTheme(theme);
    }
  };
}
