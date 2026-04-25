import { Composer } from '@pug/composer';
import { Renderer } from '@pug/renderer';
import { Theme, ThemeContext } from '@pug/theme';

// AppContext 配置接口
export interface AppContextConfig {
  theme?: Theme;
  composer?: Composer;
  renderer?: Renderer;
  maxNavigationHistory?: number;
}

// 插件接口
export interface Plugin {
  name: string;
  initialize?: (appContext: AppContext) => void;
  dispose?: () => void;
}

// 插件容器接口
export interface PluginContainer {
  get<T extends Plugin>(name: string): T | null;
  register(plugin: Plugin): void;
  unregister(name: string): void;
  dispose(): void;
}

// AppContext 接口
export interface AppContext {
  // 主题服务
  theme: ThemeContext;
  
  // 组件组合器
  composer: Composer;
  
  // 渲染器
  renderer: Renderer | null;
  
  // 插件容器
  plugins: PluginContainer;
  
  // 获取配置
  getConfig(): AppContextConfig;
  
  // 销毁上下文
  dispose(): void;
  
  // 事件监听器管理
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
  
  // 信号管理
  registerSignal<T>(signal: { dispose?: () => void }): void;
  
  // 错误处理
  addErrorHandler(handler: (error: Error) => void): void;
  removeErrorHandler(handler: (error: Error) => void): void;
}

// 插件容器实现
class PluginContainerImpl implements PluginContainer {
  private plugins: Map<string, Plugin> = new Map();

  get<T extends Plugin>(name: string): T | null {
    return this.plugins.get(name) as T | null;
  }

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string): void {
    this.plugins.delete(name);
  }

  dispose(): void {
    this.plugins.forEach(plugin => {
      if (plugin.dispose) {
        try {
          plugin.dispose();
        } catch (error) {
          console.error(`Error disposing plugin ${plugin.name}:`, error);
        }
      }
    });
    this.plugins.clear();
  }
}

// AppContext 实现
export class AppContextImpl implements AppContext {
  private config: AppContextConfig;
  private _theme: ThemeContext;
  private _composer: Composer;
  private _renderer: Renderer | null;
  private disposed = false;
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private signals: Set<{ dispose?: () => void }> = new Set();
  private errorHandlers: Array<(error: Error) => void> = [];
  private maxNavigationHistory: number = 50; // 默认最大导航历史长度
  private _plugins: PluginContainer = new PluginContainerImpl();

  constructor(config: AppContextConfig) {
    this.config = config;
    this.maxNavigationHistory = config.maxNavigationHistory || 50;
    
    // 初始化主题上下文
    this._theme = new ThemeContext(config.theme);
    
    // 使用提供的 composer 或创建新的
    this._composer = config.composer || new Composer(this);
    // Ensure composer has appContext
    this._composer.setAppContext(this);
    
    // 使用提供的 renderer
    this._renderer = config.renderer || null;
  }

  get theme(): ThemeContext {
    this.assertNotDisposed();
    return this._theme;
  }

  get composer(): Composer {
    this.assertNotDisposed();
    return this._composer;
  }

  get renderer(): Renderer | null {
    this.assertNotDisposed();
    return this._renderer;
  }

  get plugins(): PluginContainer {
    this.assertNotDisposed();
    return this._plugins;
  }

  getConfig(): AppContextConfig {
    this.assertNotDisposed();
    return { ...this.config };
  }

  addEventListener(event: string, listener: () => void): void {
    this.assertNotDisposed();
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(listener);
  }

  removeEventListener(event: string, listener: () => void): void {
    this.assertNotDisposed();
    this.eventListeners.get(event)?.delete(listener);
  }

  registerSignal<T>(signal: { dispose?: () => void }): void {
    this.assertNotDisposed();
    this.signals.add(signal);
  }

  addErrorHandler(handler: (error: Error) => void): void {
    this.assertNotDisposed();
    this.errorHandlers.push(handler);
    // Also add the error handler to the composer
    this._composer.addErrorHandler(handler);
  }

  removeErrorHandler(handler: (error: Error) => void): void {
    this.assertNotDisposed();
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
    // Also remove the error handler from the composer
    this._composer.removeErrorHandler(handler);
  }

  private handleError(error: Error): void {
    console.error('AppContext error:', error);
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  dispose(): void {
    if (this.disposed) return;
    
    // 清理事件监听器
    this.eventListeners.forEach((listeners) => {
      listeners.clear();
    });
    this.eventListeners.clear();
    
    // 清理信号
    this.signals.forEach((signal) => {
      if (signal.dispose) {
        signal.dispose();
      }
    });
    this.signals.clear();
    
    // 清理错误处理器
    this.errorHandlers = [];
    
    // 清理插件
    this._plugins.dispose();
    
    // 清理资源
    this._renderer?.dispose();
    this._composer.dispose();
    
    this.disposed = true;
  }

  getMaxNavigationHistory(): number {
    return this.maxNavigationHistory;
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error('AppContext has been disposed');
    }
  }
}

// 创建 AppContext 的工厂函数
export function createAppContext(config: AppContextConfig): AppContext {
  return new AppContextImpl(config);
}

