import { signal } from '@pug/reactivity';

// 应用状态管理
export const count = signal(0);
export const isDarkTheme = signal(false);
export const inputValue = signal('');
export const isChecked = signal(false);
