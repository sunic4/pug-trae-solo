import { signal } from '@canvas-compose/reactivity';
import { Theme, defaultTheme } from './theme';

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

// 全局主题上下文实例
export const globalThemeContext = new ThemeContext();

// 主题钩子函数，用于在组件中访问主题
export function useTheme(): Theme {
  return globalThemeContext.theme;
}

// 主题切换钩子函数，用于在组件中切换主题
export function useThemeSwitcher() {
  return (theme: Theme) => {
    globalThemeContext.setTheme(theme);
  };
}
