import { useTheme as usePugTheme, useThemeSwitcher, defaultTheme, darkTheme } from '@pug/theme';
import { isDarkTheme } from '../state/appState';
import { effect, getCurrentAppContext } from '@pug/reactivity';

// 主题管理 hook
export function useTheme(appContext?: any) {
  return usePugTheme(appContext || getCurrentAppContext());
}

// 主题切换 hook
export function useAppThemeSwitcher(appContext?: any) {
  const ctx = appContext || getCurrentAppContext();
  const switchTheme = useThemeSwitcher(ctx);
  
  // 监听主题变化
  effect(() => {
    switchTheme(isDarkTheme.value ? darkTheme : defaultTheme);
  });
  
  return () => {
    isDarkTheme.value = !isDarkTheme.value;
  };
}
