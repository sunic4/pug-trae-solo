import type { NodeId, Rect, DrawCommand, LayerNode, LayerTree } from '@/renderer/types'
import { mergeRects } from '@/renderer/dirty-region'

class LayerNodeImpl implements LayerNode {
  readonly id: NodeId
  parent: LayerNode | null = null
  children: LayerNode[] = []
  cachedCommands: DrawCommand[] = []
  dirty = true
  bounds: Rect

  constructor(id: NodeId, bounds: Rect = { x: 0, y: 0, width: 0, height: 0 }) {
    this.id = id
    this.bounds = bounds
  }

  markDirty(): void {
    if (this.dirty) return
    this.dirty = true
    if (this.parent !== null) {
      this.parent.markDirty()
    }
  }

  markClean(): void {
    this.dirty = false
    for (const child of this.children) {
      child.markClean()
    }
  }

  updateCommands(commands: DrawCommand[]): void {
    if (this.cachedCommands === commands && !this.dirty) return
    this.cachedCommands = commands
    this.dirty = true
    this.bounds = mergeRects(commands.map(cmd => cmd.bounds))
  }

  addChild(child: LayerNode): void {
    if (child === this) {
      throw new Error(`Cannot add node ${this.id} as its own child`)
    }
    if (child.parent !== null) {
      child.parent.removeChild(child)
    }
    this.children.push(child)
    child.parent = this
    this.markDirty()
  }

  removeChild(child: LayerNode): void {
    const idx = this.children.indexOf(child)
    if (idx === -1) {
      throw new Error(`Cannot remove node ${child.id}: not a child of node ${this.id}`)
    }
    this.children.splice(idx, 1)
    child.parent = null
    this.markDirty()
  }
}

class LayerTreeImpl implements LayerTree {
  root: LayerNode | null = null

  insert(parent: LayerNode | null, node: LayerNode): void {
    if (parent === null) {
      if (node.parent !== null) {
        node.parent.removeChild(node)
      }
      if (this.root !== null && this.root !== node) {
        this.root.parent = null
      }
      this.root = node
      node.parent = null
    } else {
      parent.addChild(node)
    }
  }

  remove(node: LayerNode): void {
    if (this.root === node) {
      this.root = null
      node.parent = null
      return
    }
    if (node.parent !== null) {
      node.parent.removeChild(node)
    }
  }

  collectDirty(): LayerNode[] {
    const result: LayerNode[] = []
    if (this.root === null) return result
    this._collectDirtyRecursive(this.root, result)
    return result
  }

  private _collectDirtyRecursive(node: LayerNode, result: LayerNode[]): void {
    if (node.dirty) {
      result.push(node)
    }
    for (const child of node.children) {
      this._collectDirtyRecursive(child, result)
    }
  }
}


function createLayerNode(id: NodeId, bounds?: Rect): LayerNode {
  return new LayerNodeImpl(id, bounds)
}


function createLayerTree(): LayerTree {
  return new LayerTreeImpl()
}

export { LayerNodeImpl, LayerTreeImpl, createLayerNode, createLayerTree }
