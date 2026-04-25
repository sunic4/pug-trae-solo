import { Composer } from '@pug/composer';
import { Renderer } from '@pug/renderer';
import { Theme, ThemeContext } from '@pug/theme';

// AppContext 配置接口
export interface AppContextConfig {
  theme?: Theme;
  composer?: Composer;
  renderer?: Renderer;
}

// AppContext 接口
export interface AppContext {
  // 主题服务
  theme: ThemeContext;
  
  // 组件组合器
  composer: Composer;
  
  // 渲染器
  renderer: Renderer | null;
  
  // 获取配置
  getConfig(): AppContextConfig;
  
  // 销毁上下文
  dispose(): void;
}

// AppContext 实现
export class AppContextImpl implements AppContext {
  private config: AppContextConfig;
  private _theme: ThemeContext;
  private _composer: Composer;
  private _renderer: Renderer | null;
  private disposed = false;

  constructor(config: AppContextConfig) {
    this.config = config;
    
    // 初始化主题上下文
    this._theme = new ThemeContext(config.theme);
    
    // 使用提供的 composer 或创建新的
    this._composer = config.composer || new Composer();
    
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

  getConfig(): AppContextConfig {
    this.assertNotDisposed();
    return { ...this.config };
  }

  dispose(): void {
    if (this.disposed) return;
    
    // 清理资源
    this._renderer?.dispose();
    
    this.disposed = true;
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

