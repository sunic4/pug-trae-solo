import { AppContext, createAppContext, AppContextConfig } from './app-context';
import { Composer } from '@pug/composer';
import { defaultTheme } from '@pug/theme';
import { Renderer, RendererConfig } from '@pug/renderer';
import { ComposeNode } from '@pug/composer';
import { signal, Signal } from '@pug/reactivity';
import { effect, Disposable } from '@pug/reactivity';

/**
 * 模拟渲染器，用于测试
 */
export class MockRenderer implements Renderer {
  config: RendererConfig;
  private rootNode: ComposeNode | null = null;
  private dirtyRects: Array<{ x: number; y: number; w: number; h: number }> = [];

  constructor(config: Partial<RendererConfig> = {}) {
    this.config = {
      width: 800,
      height: 600,
      pixelRatio: 1,
      debug: false,
      ...config
    };
  }

  setRoot(node: ComposeNode): void {
    this.rootNode = node;
  }

  setAppContext(appContext: AppContext): void {
    // 空实现
  }

  markDirty(rect: { x: number; y: number; w: number; h: number }): void {
    this.dirtyRects.push(rect);
  }

  getRootNode(): ComposeNode | null {
    return this.rootNode;
  }

  getDirtyRects(): Array<{ x: number; y: number; w: number; h: number }> {
    return [...this.dirtyRects];
  }

  clearDirtyRects(): void {
    this.dirtyRects = [];
  }

  dispose(): void {
    this.rootNode = null;
    this.dirtyRects = [];
  }
}

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
  const renderer = new MockRenderer();
  
  return createAppContext({
    theme: defaultTheme,
    composer,
    renderer,
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

/**
 * 测试信号的工具函数
 * @param initialValue 初始值
 * @returns 包含信号和测试辅助函数的对象
 */
export function testSignal<T>(initialValue: T) {
  const sig = signal(initialValue);
  const updates: T[] = [];
  
  const dispose = effect(() => {
    updates.push(sig.value);
  });
  
  return {
    signal: sig,
    updates,
    dispose,
    assertUpdates(expected: T[]) {
      expect(updates).toEqual(expected);
    },
    assertValue(expected: T) {
      expect(sig.value).toBe(expected);
    }
  };
}

/**
 * 测试效果的工具函数
 * @param fn 效果函数
 * @returns 包含效果和测试辅助函数的对象
 */
export function testEffect(fn: () => void | Promise<void>) {
  let runCount = 0;
  let lastError: Error | null = null;
  
  const dispose = effect(fn, {
    onError: (error) => {
      lastError = error;
    }
  });
  
  return {
    dispose,
    runCount,
    lastError,
    assertRunCount(expected: number) {
      expect(runCount).toBe(expected);
    },
    assertError(expectedMessage: string) {
      expect(lastError).toBeTruthy();
      expect(lastError?.message).toContain(expectedMessage);
    }
  };
}

/**
 * 组件测试工具
 * @param createComponent 组件创建函数
 * @param appContext 应用上下文
 * @returns 包含组件和测试辅助函数的对象
 */
export function testComponent<T extends ComposeNode>(
  createComponent: (appContext: AppContext) => T,
  appContext?: AppContext
) {
  const ctx = appContext || createTestAppContext();
  const component = createComponent(ctx);
  
  return {
    component,
    appContext: ctx,
    assertExists() {
      expect(component).toBeTruthy();
    },
    assertType(expectedType: string) {
      expect(component.type).toBe(expectedType);
    },
    assertHasChild(childType: string) {
      const hasChild = component.children.some(child => child.type === childType);
      expect(hasChild).toBe(true);
    }
  };
}

/**
 * 模拟事件工具
 */
export class MockEventSystem {
  private events: Map<string, Array<() => void>> = new Map();

  on(event: string, callback: () => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  off(event: string, callback: () => void) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string) {
    const callbacks = this.events.get(event);
    callbacks?.forEach(callback => callback());
  }

  clear() {
    this.events.clear();
  }
}

/**
 * 创建模拟事件系统
 * @returns 模拟事件系统
 */
export function createMockEventSystem() {
  return new MockEventSystem();
}
