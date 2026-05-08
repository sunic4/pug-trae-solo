// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { createLayerNode, createLayerTree } from '../layer'
import { createDirtyRegion, mergeRects } from '../dirty-region'
import { createCanvasHost } from '../canvas-host'
import type { Rect, DrawCommand } from '../types'
import { createMockCtx, createMockCanvas } from './mocks'

function createMockCommand(bounds: Rect): DrawCommand {
  return {
    type: 'fillRect',
    rect: bounds,
    color: { r: 0, g: 0, b: 0, a: 1 },
    bounds,
    execute: vi.fn(),
  }
}

describe('LayerNode', () => {
  describe('when creating a layer node', () => {
    it('should have default dirty=true and empty commands', () => {
      const node = createLayerNode(1)
      expect(node.id).toBe(1)
      expect(node.dirty).toBe(true)
      expect(node.cachedCommands).toEqual([])
      expect(node.parent).toBeNull()
      expect(node.children).toEqual([])
    })
  })

  describe('when calling markDirty', () => {
    it('should propagate dirty flag to parent', () => {
      const parent = createLayerNode(1)
      const child = createLayerNode(2)
      parent.addChild(child)
      child.markClean()
      parent.markClean()

      child.markDirty()
      expect(child.dirty).toBe(true)
      expect(parent.dirty).toBe(true)
    })
  })

  describe('when calling markClean', () => {
    it('should clear dirty flag recursively', () => {
      const parent = createLayerNode(1)
      const child = createLayerNode(2)
      parent.addChild(child)

      parent.markClean()
      expect(parent.dirty).toBe(false)
      expect(child.dirty).toBe(false)
    })
  })

  describe('when calling updateCommands', () => {
    it('should update cachedCommands and bounds', () => {
      const node = createLayerNode(1)
      node.markClean()
      const cmd = createMockCommand({ x: 10, y: 20, width: 100, height: 50 })
      node.updateCommands([cmd])

      expect(node.cachedCommands).toHaveLength(1)
      expect(node.dirty).toBe(true)
      expect(node.bounds.x).toBe(10)
      expect(node.bounds.y).toBe(20)
      expect(node.bounds.width).toBe(100)
      expect(node.bounds.height).toBe(50)
    })
  })

  describe('when calling addChild', () => {
    it('should add child and set parent reference', () => {
      const parent = createLayerNode(1)
      const child = createLayerNode(2)
      parent.markClean()

      parent.addChild(child)
      expect(parent.children).toHaveLength(1)
      expect(child.parent).toBe(parent)
      expect(parent.dirty).toBe(true)
    })

    it('should remove child from previous parent', () => {
      const oldParent = createLayerNode(1)
      const newParent = createLayerNode(2)
      const child = createLayerNode(3)
      oldParent.addChild(child)
      oldParent.markClean()

      newParent.addChild(child)
      expect(oldParent.children).toHaveLength(0)
      expect(newParent.children).toHaveLength(1)
      expect(child.parent).toBe(newParent)
    })
  })

  describe('when calling removeChild', () => {
    it('should remove child and clear parent reference', () => {
      const parent = createLayerNode(1)
      const child = createLayerNode(2)
      parent.addChild(child)
      parent.markClean()

      parent.removeChild(child)
      expect(parent.children).toHaveLength(0)
      expect(child.parent).toBeNull()
      expect(parent.dirty).toBe(true)
    })
  })
})

describe('LayerTree', () => {
  describe('when inserting root node', () => {
    it('should set root', () => {
      const tree = createLayerTree()
      const root = createLayerNode(1)
      tree.insert(null, root)
      expect(tree.root).toBe(root)
    })
  })

  describe('when inserting child node', () => {
    it('should add child to parent', () => {
      const tree = createLayerTree()
      const root = createLayerNode(1)
      const child = createLayerNode(2)
      tree.insert(null, root)
      tree.insert(root, child)
      expect(root.children).toHaveLength(1)
      expect(child.parent).toBe(root)
    })
  })

  describe('when removing root node', () => {
    it('should clear root', () => {
      const tree = createLayerTree()
      const root = createLayerNode(1)
      tree.insert(null, root)
      tree.remove(root)
      expect(tree.root).toBeNull()
    })
  })

  describe('when collecting dirty nodes', () => {
    it('should return only dirty nodes', () => {
      const tree = createLayerTree()
      const root = createLayerNode(1)
      const child1 = createLayerNode(2)
      const child2 = createLayerNode(3)
      tree.insert(null, root)
      tree.insert(root, child1)
      tree.insert(root, child2)

      root.markClean()
      child1.markDirty()

      const dirty = tree.collectDirty()
      expect(dirty).toHaveLength(2)
      expect(dirty.map((n) => n.id)).toContain(1)
      expect(dirty.map((n) => n.id)).toContain(2)
    })

    it('should return empty array when no dirty nodes', () => {
      const tree = createLayerTree()
      const root = createLayerNode(1)
      tree.insert(null, root)
      root.markClean()

      const dirty = tree.collectDirty()
      expect(dirty).toHaveLength(0)
    })

    it('should return empty array for empty tree', () => {
      const tree = createLayerTree()
      expect(tree.collectDirty()).toHaveLength(0)
    })
  })
})

describe('DirtyRegion', () => {
  describe('when adding a rect', () => {
    it('should include padding in stored rect', () => {
      const region = createDirtyRegion()
      region.add({ x: 10, y: 20, width: 100, height: 50 })
      expect(region.rects).toHaveLength(1)
      expect(region.rects[0]?.x).toBe(8)
      expect(region.rects[0]?.y).toBe(18)
      expect(region.rects[0]?.width).toBe(104)
      expect(region.rects[0]?.height).toBe(54)
    })
  })

  describe('when adding a zero-size rect', () => {
    it('should ignore it', () => {
      const region = createDirtyRegion()
      region.add({ x: 0, y: 0, width: 0, height: 0 })
      expect(region.rects).toHaveLength(0)
    })
  })

  describe('when merging rects', () => {
    it('should return bounding box of all rects', () => {
      const region = createDirtyRegion()
      region.add({ x: 10, y: 10, width: 50, height: 50 })
      region.add({ x: 100, y: 100, width: 50, height: 50 })
      const merged = region.merge()
      expect(merged.x).toBe(8)
      expect(merged.y).toBe(8)
      expect(merged.width).toBe(144)
      expect(merged.height).toBe(144)
    })
  })

  describe('when merging empty region', () => {
    it('should return zero rect', () => {
      const region = createDirtyRegion()
      expect(region.merge()).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
  })

  describe('when calling clear', () => {
    it('should remove all rects', () => {
      const region = createDirtyRegion()
      region.add({ x: 10, y: 10, width: 50, height: 50 })
      region.clear()
      expect(region.isEmpty()).toBe(true)
    })
  })

  describe('when calling isEmpty', () => {
    it('should return true for empty region', () => {
      const region = createDirtyRegion()
      expect(region.isEmpty()).toBe(true)
    })

    it('should return false after adding a rect', () => {
      const region = createDirtyRegion()
      region.add({ x: 10, y: 10, width: 50, height: 50 })
      expect(region.isEmpty()).toBe(false)
    })
  })
})

describe('mergeRects', () => {
  describe('when given empty array', () => {
    it('should return zero rect', () => {
      expect(mergeRects([])).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
  })

  describe('when given single rect', () => {
    it('should return that rect', () => {
      const r: Rect = { x: 10, y: 20, width: 30, height: 40 }
      expect(mergeRects([r])).toEqual(r)
    })
  })

  describe('when given overlapping rects', () => {
    it('should return union bounding box', () => {
      const result = mergeRects([
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 50, y: 50, width: 100, height: 100 },
      ])
      expect(result).toEqual({ x: 0, y: 0, width: 150, height: 150 })
    })
  })
})

describe('CanvasHost renderLayers', () => {
  describe('when rendering a dirty layer tree', () => {
    it('should execute commands for dirty nodes', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)

      const cmd1 = createMockCommand({ x: 0, y: 0, width: 100, height: 100 })
      const cmd2 = createMockCommand({ x: 50, y: 50, width: 100, height: 100 })

      const root = createLayerNode(1)
      const child = createLayerNode(2)
      root.addChild(child)
      root.updateCommands([cmd1])
      child.updateCommands([cmd2])

      host.renderLayers(root)

      expect(cmd1.execute).toHaveBeenCalled()
      expect(cmd2.execute).toHaveBeenCalled()
      expect(root.dirty).toBe(false)
      expect(child.dirty).toBe(false)
    })
  })

  describe('when rendering a clean layer tree', () => {
    it('should skip rendering', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)

      const cmd = createMockCommand({ x: 0, y: 0, width: 100, height: 100 })
      const root = createLayerNode(1)
      root.updateCommands([cmd])
      root.markClean()

      host.renderLayers(root)

      expect(cmd.execute).not.toHaveBeenCalled()
    })
  })

  describe('when rendering after dispose', () => {
    it('should throw an error', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)
      host.dispose()

      const root = createLayerNode(1)
      expect(() => host.renderLayers(root)).toThrow('CanvasHost has been disposed')
    })
  })
})
