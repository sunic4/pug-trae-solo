import { AppContext, createAppContext, AppContextConfig } from './app-context';
import { Composer } from '@pug/composer';
import { defaultTheme } from '@pug/theme';

/**
 * 创建用于测试的 AppContext
 * @param overrides 覆盖默认配置的选项
 * @returns 测试用的 AppContext
 */
export function createTestAppContext(overrides: Partial<AppContextConfig> = {}): AppContext {
  // 类型检查：确保 overrides 是对象
  if (overrides && typeof overrides !== 'object') {
    throw new Error('Invalid overrides object');
  }
  
  const composer = new Composer();
  
  return createAppContext({
    theme: defaultTheme,
    composer,
    ...overrides
  });
}

/**
 * 创建用于测试的 Composer
 * @returns 测试用的 Composer
 */
export function createTestComposer(): Composer {
  return new Composer();
}
