export interface Size {
  width: number;
  height: number;
}

export interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface EventHandler {
  (event: any, ...args: any[]): void;
}

export interface ComposeNodeProps {
  [key: string]: any;
}

import { DrawAPI } from '@pug/renderer';
import { AppContext } from '@pug/core';

export class ComposeNode<P extends ComposeNodeProps = ComposeNodeProps> {
  readonly key: string;
  children: ComposeNode[] = [];
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  handlers: Record<string, EventHandler[]> = {};
  props: P = {} as P;
  private _dirty = false;
  private _layoutDirty = false;
  parent: ComposeNode | null = null;
  appContext: AppContext | null = null;

  constructor(key: string = Math.random().toString(36).substr(2, 9), props?: P, appContext?: AppContext) {
    this.key = key;
    if (props && typeof props === 'object') {
      this.props = props;
    }
    this.handlers = {};
    this.appContext = appContext || null;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get layoutDirty(): boolean {
    return this._layoutDirty;
  }

  markDirty(): void {
    if (this._dirty) return; // 避免重复标记
    this._dirty = true;
  }

  markLayoutDirty(): void {
    if (this._layoutDirty) return; // 避免重复标记
    this._layoutDirty = true;
    this.markDirty();
    // 向上标记父节点为布局脏
    if (this.parent) {
      this.parent.markLayoutDirty();
    }
  }

  clearDirty(): void {
    this._dirty = false;
    this._layoutDirty = false;
  }

  addChild(child: ComposeNode): void {
    if (!child || !(child instanceof ComposeNode)) return; // 类型保护
    // 防止循环引用
    if (child === this || this.isDescendant(child)) return;
    // 如果子节点已经有父节点，先从父节点中移除
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    // 传递 appContext 给子节点
    if (this.appContext) {
      child.appContext = this.appContext;
    }
    this.children.push(child);
    this.markLayoutDirty();
  }

  removeChild(child: ComposeNode): void {
    if (!child || !(child instanceof ComposeNode)) return; // 类型保护
    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.parent = null;
      this.children.splice(index, 1);
      this.markLayoutDirty();
    }
  }

  // 检查节点是否是当前节点的后代
  private isDescendant(node: ComposeNode): boolean {
    let current: ComposeNode | null = this.parent;
    while (current) {
      if (current === node) return true;
      current = current.parent;
    }
    return false;
  }

  // 添加事件监听器
  addEventListener(event: string, handler: EventHandler): void {
    if (!event || typeof handler !== 'function') return;
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    if (!this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
  }

  // 移除事件监听器
  removeEventListener(event: string, handler: EventHandler): void {
    if (!event || typeof handler !== 'function') return;
    if (this.handlers[event]) {
      const index = this.handlers[event].indexOf(handler);
      if (index !== -1) {
        this.handlers[event].splice(index, 1);
      }
    }
  }

  // 触发事件
  triggerEvent(event: string, ...args: any[]): void {
    if (!event) return;
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => {
        try {
          handler(event, ...args);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // 根据 key 获取子节点
  getChildByKey(key: string): ComposeNode | null {
    if (!key) return null;
    return this.children.find(child => child.key === key) || null;
  }

  // 获取所有子节点
  getChildren(): ComposeNode[] {
    return [...this.children];
  }

  // 清空所有子节点
  clearChildren(): void {
    this.children.forEach(child => {
      child.parent = null;
    });
    this.children = [];
    this.markLayoutDirty();
  }

  // 获取节点的深度
  getDepth(): number {
    let depth = 0;
    let current: ComposeNode | null = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  // 检查节点是否是根节点
  isRoot(): boolean {
    return this.parent === null;
  }

  containsPoint(x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  }

  // 布局相关方法，由子类实现
  measure(_constraints: Constraints): Size {
    return { width: 0, height: 0 };
  }

  place(x: number, y: number, width: number, height: number): void {
    // 确保参数的有效性
    this.x = typeof x === 'number' && !isNaN(x) ? x : 0;
    this.y = typeof y === 'number' && !isNaN(y) ? y : 0;
    this.width = typeof width === 'number' && !isNaN(width) && width >= 0 ? width : 0;
    this.height = typeof height === 'number' && !isNaN(height) && height >= 0 ? height : 0;
    this.placeChildren();
  }

  placeChildren(): void {
    // 由子类实现
  }

  // 绘制相关方法，由子类实现
  drawCommands(): any[] {
    return [];
  }

  draw(_drawApi: DrawAPI): void {
    // 由子类实现
  }

  // 递归获取所有脏节点
  getDirtyNodes(): ComposeNode[] {
    const dirtyNodes: ComposeNode[] = [];
    const stack: ComposeNode[] = [this];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.dirty) {
        dirtyNodes.push(node);
      }
      // 将子节点添加到栈中，顺序不影响结果
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        if (child) {
          stack.push(child);
        }
      }
    }
    
    return dirtyNodes;
  }

  // 递归清理所有节点的脏状态
  clearAllDirty(): void {
    const stack: ComposeNode[] = [this];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      node.clearDirty();
      // 将子节点添加到栈中
      for (const child of node.children) {
        if (child) {
          stack.push(child);
        }
      }
    }
  }
}
