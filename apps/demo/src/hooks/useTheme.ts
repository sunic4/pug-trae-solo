import { useTheme as usePugTheme, useThemeSwitcher, defaultTheme, darkTheme } from '@pug/theme';
import { isDarkTheme } from '../state/appState';
import { effect } from '@pug/reactivity';

// 主题管理 hook
export function useTheme() {
  return usePugTheme();
}

// 主题切换 hook
export function useAppThemeSwitcher() {
  const switchTheme = useThemeSwitcher();
  
  // 监听主题变化
  effect(() => {
    switchTheme(isDarkTheme.value ? darkTheme : defaultTheme);
  });
  
  return () => {
    isDarkTheme.value = !isDarkTheme.value;
  };
}
