import { ComposeNode } from './node';
import { SlotTable } from './slot-table';
import { setCurrentContext } from '@pug/reactivity';
import { AppContext } from '@pug/core';

export type ComposableFunction = (...args: any[]) => ComposeNode;

export class Composer {
  private rootNode: ComposeNode | null = null;
  private slotTable = new SlotTable();
  private dirtyNodes = new Set<ComposeNode>();
  private appContext: AppContext | null = null;
  private errorHandlers: Array<(error: Error) => void> = [];
  private isBatching = false;
  private batchDirtyNodes = new Set<ComposeNode>();

  constructor(appContext?: AppContext) {
    this.rootNode = null;
    this.slotTable = new SlotTable();
    this.dirtyNodes = new Set<ComposeNode>();
    this.appContext = appContext || null;
  }

  setAppContext(appContext: AppContext): void {
    this.appContext = appContext;
  }

  getAppContext(): AppContext | null {
    return this.appContext;
  }

  // 错误处理
  addErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  removeErrorHandler(handler: (error: Error) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  private handleError(error: Error): void {
    console.error('Composer error:', error);
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  startCompose(fn: ComposableFunction): ComposeNode {
    if (!fn || typeof fn !== 'function') {
      const error = new Error('Invalid composable function');
      this.handleError(error);
      throw error;
    }
    
    setCurrentContext(this);
    this.slotTable.reset();
    
    try {
      const node = fn();
      if (!node || !(node instanceof ComposeNode)) {
        const error = new Error('Composable function must return a ComposeNode');
        this.handleError(error);
        throw error;
      }
      if (this.appContext) {
        node.appContext = this.appContext;
      }
      this.rootNode = node;
      return node;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    } finally {
      setCurrentContext(null);
    }
  }

  endCompose(): void {
    this.cleanupUnusedNodes();
  }

  private cleanupUnusedNodes(): void {
    try {
      this.slotTable.cleanup();
      this.dirtyNodes.clear();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  markDirty(node: ComposeNode): void {
    if (!node || !(node instanceof ComposeNode)) {
      this.handleError(new Error('Invalid node passed to markDirty'));
      return;
    }
    
    if (this.isBatching) {
      this.batchDirtyNodes.add(node);
    } else {
      this.dirtyNodes.add(node);
    }
  }

  // 批量处理状态更新
  batch<T>(callback: () => T): T {
    if (this.isBatching) {
      return callback();
    }
    
    this.isBatching = true;
    try {
      return callback();
    } finally {
      this.isBatching = false;
      this.flushBatch();
    }
  }

  private flushBatch(): void {
    if (this.batchDirtyNodes.size > 0) {
      this.batchDirtyNodes.forEach(node => {
        this.dirtyNodes.add(node);
      });
      this.batchDirtyNodes.clear();
    }
  }

  recompose(): void {
    try {
      if (this.dirtyNodes.size === 0) {
        return;
      }
      
      // 收集所有脏节点及其祖先
      const nodesToProcess = new Set<ComposeNode>();
      const layoutDirtyNodes = new Set<ComposeNode>();
      
      this.dirtyNodes.forEach(node => {
        if (node && node instanceof ComposeNode) {
          nodesToProcess.add(node);
          
          // 标记布局脏节点
          let current = node.parent;
          while (current) {
            layoutDirtyNodes.add(current);
            current = current.parent;
          }
        }
      });
      
      // 处理脏节点
      nodesToProcess.forEach(node => {
        try {
          node.clearDirty();
        } catch (error) {
          this.handleError(error as Error);
        }
      });
      
      // 标记布局脏节点
      layoutDirtyNodes.forEach(node => {
        try {
          node.markLayoutDirty();
        } catch (error) {
          this.handleError(error as Error);
        }
      });
      
      this.dirtyNodes.clear();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  getSlotTable(): SlotTable {
    return this.slotTable;
  }

  getRootNode(): ComposeNode | null {
    return this.rootNode;
  }

  getDirtyNodes(): Set<ComposeNode> {
    return new Set(this.dirtyNodes);
  }

  clearDirtyNodes(): void {
    this.dirtyNodes.clear();
  }

  hasDirtyNodes(): boolean {
    return this.dirtyNodes.size > 0;
  }

  dispose(): void {
    try {
      this.slotTable.cleanup();
      this.dirtyNodes.clear();
      this.batchDirtyNodes.clear();
      this.rootNode = null;
      this.appContext = null;
      this.errorHandlers = [];
    } catch (error) {
      this.handleError(error as Error);
    }
  }
}
