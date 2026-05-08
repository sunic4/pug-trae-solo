import { describe, it, expect, vi } from 'vitest'
import { Dialog } from '../overlay/dialog'
import { DropdownMenu } from '../overlay/dropdown-menu'
import { Text } from '../basic/text'
import { ModalBottomSheet } from '../overlay/modal-bottom-sheet'
import { Modifier } from '@pug-canvas-ui/layout'
import { Popup } from '../overlay/popup'
import { hasModifierElement } from '../test-utils'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('Dialog', () => {
  it('should emit a dialog surface group with title', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, { title: 'Confirm', onDismiss })
    expect(ctx.emittedNodes.size).toBeGreaterThanOrEqual(1)
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.modifier).toBeDefined()
    expect(rootNode.measurePolicy).toBeDefined()
  })

  it('should accept content via options', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, { title: 'Title', onDismiss, content: () => { Text(ctx, 'Body text') } })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should accept buttons via options', () => {
    const onDismiss = vi.fn()
    const onConfirm = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, {
      title: 'Title',
      onDismiss,
      content: () => {},
      buttons: [
        { label: 'Cancel', onClick: onDismiss },
        { label: 'OK', onClick: onConfirm },
      ],
    })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.childrenIds.length).toBeGreaterThan(0)
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, { title: 'Title', onDismiss })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(rootNode.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, { title: 'Title', onDismiss })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(rootNode.measurePolicy).toBeDefined()
    expect(typeof rootNode.measurePolicy.measure).toBe('function')
  })

  it('should measure dialog', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Dialog(ctx, { title: 'Title', onDismiss })
    const rootNode = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = rootNode.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 600, minHeight: 0, maxHeight: 800,
    })
    expect(result.width).toBeGreaterThanOrEqual(0)
    expect(result.height).toBeGreaterThanOrEqual(0)
  })
})

describe('ModalBottomSheet', () => {
  it('should emit a group node with default peek height', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { peekHeight: number }
    expect(data.peekHeight).toBe(200)
  })

  it('should accept custom peek height', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss, () => {}, Modifier.create().freeze(), 300)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { peekHeight: number }
    expect(data.peekHeight).toBe(300)
  })

  it('should accept content', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss, () => { Text(ctx, 'Sheet content') })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(1)
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure with peek height', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    ModalBottomSheet(ctx, onDismiss, () => {}, Modifier.create().freeze(), 300)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 800,
    })
    expect(result.height).toBeGreaterThanOrEqual(300)
  })
})

describe('DropdownMenu', () => {
  it('should emit a leaf node with items', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'Edit', onClick: vi.fn(), enabled: true },
      { label: 'Delete', onClick: vi.fn(), enabled: true },
    ]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, true, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { items: typeof items; expanded: boolean }
    expect(data.items.length).toBe(2)
    expect(data.expanded).toBe(true)
  })

  it('should support disabled items', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'Edit', onClick: vi.fn(), enabled: true },
      { label: 'Delete', onClick: vi.fn(), enabled: false },
    ]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, true, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { items: typeof items }
    expect(data.items[1]!.enabled).toBe(false)
  })

  it('should track expanded state', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, false, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { expanded: boolean }
    expect(data.expanded).toBe(false)
  })

  it('should have background in modifier', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, true, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(hasModifierElement(node.modifier, 'draw', 'background')).toBe(true)
  })

  it('should have a measure policy', () => {
    const onDismiss = vi.fn()
    const items = [{ label: 'Item', onClick: vi.fn(), enabled: true }]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, true, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure based on item count', () => {
    const onDismiss = vi.fn()
    const items = [
      { label: 'A', onClick: vi.fn(), enabled: true },
      { label: 'B', onClick: vi.fn(), enabled: true },
      { label: 'C', onClick: vi.fn(), enabled: true },
    ]
    const ctx = createTestCtx()
    DropdownMenu(ctx, items, true, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.height).toBe(3 * 48)
  })
})

describe('Popup', () => {
  it('should emit a group node with default params', () => {
    const ctx = createTestCtx()
    Popup(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { alignment: string; offset: { x: number; y: number } }
    expect(data.alignment).toBe('center')
    expect(data.offset).toEqual({ x: 0, y: 0 })
  })

  it('should accept content', () => {
    const ctx = createTestCtx()
    Popup(ctx, () => { Text(ctx, 'Tooltip') })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.childrenIds.length).toBe(1)
  })

  it('should accept alignment', () => {
    const ctx = createTestCtx()
    Popup(ctx, () => {}, Modifier.create().freeze(), 'start')
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { alignment: string }
    expect(data.alignment).toBe('start')
  })

  it('should accept offset', () => {
    const ctx = createTestCtx()
    Popup(ctx, () => {}, Modifier.create().freeze(), 'center', { x: 10, y: 20 })
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { offset: { x: number; y: number } }
    expect(data.offset).toEqual({ x: 10, y: 20 })
  })

  it('should accept onDismissRequest', () => {
    const onDismiss = vi.fn()
    const ctx = createTestCtx()
    Popup(ctx, () => {}, Modifier.create().freeze(), 'center', { x: 0, y: 0 }, onDismiss)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { onDismissRequest: (() => void) | null }
    expect(data.onDismissRequest).toBe(onDismiss)
  })

  it('should have null onDismissRequest by default', () => {
    const ctx = createTestCtx()
    Popup(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as { onDismissRequest: (() => void) | null }
    expect(data.onDismissRequest).toBeNull()
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    Popup(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
  })

  it('should measure empty popup', () => {
    const ctx = createTestCtx()
    Popup(ctx)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 300, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })
})
