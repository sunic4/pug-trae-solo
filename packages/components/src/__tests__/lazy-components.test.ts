import { describe, it, expect } from 'vitest'
import { LazyColumn, LazyRow, computeVisibleItems } from '../lazy/lazy-column'
import { Modifier } from '@pug-canvas-ui/layout'
import { createSnapshot } from '@pug-canvas-ui/core'
import { createRecomposer } from '@pug-canvas-ui/core'
import { CompositionContextImpl } from '@pug-canvas-ui/core'
import type { LazyColumnNodeData, LazyRowNodeData } from '../node-data'

function createTestCtx() {
  return new CompositionContextImpl(createSnapshot(), createRecomposer())
}

describe('LazyColumn', () => {
  it('should emit a group node with default params', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 10)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyColumnNodeData
    expect(data.kind).toBe('lazy-column')
    expect(data.itemCount).toBe(10)
    expect(data.itemSize).toBeNull()
    expect(data.spacing).toBe(0)
    expect(data.contentPadding).toBe(0)
    expect(data.firstVisibleItemIndex).toBe(0)
    expect(data.firstVisibleItemScrollOffset).toBe(0)
  })

  it('should emit a lazy column with custom itemSize', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 20, undefined, Modifier.create().freeze(), 64)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyColumnNodeData
    expect(data.itemSize).toBe(64)
  })

  it('should emit a lazy column with spacing and padding', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 10, undefined, Modifier.create().freeze(), null, 8, 16)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyColumnNodeData
    expect(data.spacing).toBe(8)
    expect(data.contentPadding).toBe(16)
  })

  it('should emit a lazy column with scroll state', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 100, undefined, Modifier.create().freeze(), null, 0, 0, 5, 120)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyColumnNodeData
    expect(data.firstVisibleItemIndex).toBe(5)
    expect(data.firstVisibleItemScrollOffset).toBe(120)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 10)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
    expect(typeof node.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty lazy column', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(360)
  })

  it('should measure lazy column with items', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 10, undefined, Modifier.create().freeze(), 48)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(360)
    expect(result.height).toBeLessThanOrEqual(600)
  })

  it('should compute minIntrinsicHeight correctly', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 5, undefined, Modifier.create().freeze(), 80, 8, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const height = node.measurePolicy.minIntrinsicHeight([], 360)
    expect(height).toBe(5 * 80 + 4 * 8)
  })

  it('should handle zero items', () => {
    const ctx = createTestCtx()
    LazyColumn(ctx, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(360)
  })
})

describe('computeVisibleItems', () => {
  it('should compute visible items within viewport', () => {
    const items = computeVisibleItems('vertical', 10, 48, 0, 0, 0, 0, 200, 'lazy-column-item')
    expect(items.length).toBeGreaterThan(0)
    expect(items.length).toBeLessThanOrEqual(10)
    for (const item of items) {
      expect(item.index).toBeGreaterThanOrEqual(0)
      expect(item.index).toBeLessThan(10)
      expect(item.size).toBe(48)
    }
  })

  it('should respect scroll offset', () => {
    const items = computeVisibleItems('vertical', 20, 48, 0, 0, 2, 0, 200, 'lazy-column-item')
    for (const item of items) {
      expect(item.index).toBeGreaterThanOrEqual(0)
    }
  })

  it('should handle spacing', () => {
    const items = computeVisibleItems('vertical', 5, 48, 8, 0, 0, 0, 600, 'lazy-column-item')
    expect(items.length).toBe(5)
  })

  it('should handle content padding', () => {
    const items = computeVisibleItems('vertical', 5, 48, 0, 16, 0, 0, 600, 'lazy-column-item')
    expect(items.length).toBe(5)
  })

  it('should return empty for zero items', () => {
    const items = computeVisibleItems('vertical', 0, 48, 0, 0, 0, 0, 600, 'lazy-column-item')
    expect(items).toEqual([])
  })
})

describe('LazyRow', () => {
  it('should emit a group node with default params', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 10)
    expect(ctx.emittedNodes.size).toBe(1)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyRowNodeData
    expect(data.kind).toBe('lazy-row')
    expect(data.itemCount).toBe(10)
    expect(data.itemSize).toBeNull()
    expect(data.spacing).toBe(0)
    expect(data.contentPadding).toBe(0)
  })

  it('should emit a lazy row with custom itemSize', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 15, undefined, Modifier.create().freeze(), 120)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyRowNodeData
    expect(data.itemSize).toBe(120)
  })

  it('should emit a lazy row with spacing and padding', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 10, undefined, Modifier.create().freeze(), null, 12, 8)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyRowNodeData
    expect(data.spacing).toBe(12)
    expect(data.contentPadding).toBe(8)
  })

  it('should emit a lazy row with scroll state', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 50, undefined, Modifier.create().freeze(), null, 0, 0, 3, 80)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const data = node.data as LazyRowNodeData
    expect(data.firstVisibleItemIndex).toBe(3)
    expect(data.firstVisibleItemScrollOffset).toBe(80)
  })

  it('should have a measure policy', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 10)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    expect(node.measurePolicy).toBeDefined()
    expect(typeof node.measurePolicy.measure).toBe('function')
    expect(typeof node.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty lazy row', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })

  it('should measure lazy row with items', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 10, undefined, Modifier.create().freeze(), 120)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })

  it('should compute minIntrinsicWidth correctly', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 5, undefined, Modifier.create().freeze(), 100, 8, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const width = node.measurePolicy.minIntrinsicWidth([], 200)
    expect(width).toBe(5 * 100 + 4 * 8)
  })

  it('should handle zero items', () => {
    const ctx = createTestCtx()
    LazyRow(ctx, 0)
    const node = ctx.emittedNodes.get(ctx.rootNodeId!)!
    const result = node.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })
})
