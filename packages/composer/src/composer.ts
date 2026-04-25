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

  startCompose(fn: ComposableFunction): ComposeNode {
    if (!fn || typeof fn !== 'function') {
      throw new Error('Invalid composable function');
    }
    
    setCurrentContext(this);
    this.slotTable.reset();
    
    try {
      const node = fn();
      if (!node || !(node instanceof ComposeNode)) {
        throw new Error('Composable function must return a ComposeNode');
      }
      if (this.appContext) {
        node.appContext = this.appContext;
      }
      this.rootNode = node;
      return node;
    } catch (error) {
      console.error('Error during composition:', error);
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
      console.error('Error during cleanup:', error);
    }
  }

  markDirty(node: ComposeNode): void {
    this.dirtyNodes.add(node);
  }

  recompose(): void {
    const validNodes = Array.from(this.dirtyNodes).filter(node => {
      return node && node instanceof ComposeNode;
    });
    
    validNodes.forEach(node => {
      try {
        node.clearDirty();
        if (node.parent) {
          node.markLayoutDirty();
        }
      } catch (error) {
        console.error('Error processing dirty node:', error);
      }
    });
    
    this.dirtyNodes.clear();
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
      this.rootNode = null;
      this.appContext = null;
    } catch (error) {
      console.error('Error during dispose:', error);
    }
  }
}
