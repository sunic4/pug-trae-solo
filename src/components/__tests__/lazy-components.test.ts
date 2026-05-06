import { describe, it, expect } from 'vitest'
import { LazyColumn, LazyRow, computeVisibleItems } from '@/components/index'
import { Modifier } from '@/layout/modifier'

describe('LazyColumn', () => {
  it('should create a lazy column with default params', () => {
    const lazy = LazyColumn(10)
    expect(lazy.kind).toBe('lazy-column')
    expect(lazy.itemCount).toBe(10)
    expect(lazy.itemSize).toBeNull()
    expect(lazy.spacing).toBe(0)
    expect(lazy.contentPadding).toBe(0)
    expect(lazy.firstVisibleItemIndex).toBe(0)
    expect(lazy.firstVisibleItemScrollOffset).toBe(0)
  })

  it('should create a lazy column with custom itemSize', () => {
    const lazy = LazyColumn(20, Modifier.create().freeze(), 64)
    expect(lazy.itemSize).toBe(64)
  })

  it('should create a lazy column with spacing and padding', () => {
    const lazy = LazyColumn(10, Modifier.create().freeze(), null, 8, 16)
    expect(lazy.spacing).toBe(8)
    expect(lazy.contentPadding).toBe(16)
  })

  it('should create a lazy column with scroll state', () => {
    const lazy = LazyColumn(100, Modifier.create().freeze(), null, 0, 0, 5, 120)
    expect(lazy.firstVisibleItemIndex).toBe(5)
    expect(lazy.firstVisibleItemScrollOffset).toBe(120)
  })

  it('should have a measure policy', () => {
    const lazy = LazyColumn(10)
    expect(lazy.measurePolicy).toBeDefined()
    expect(typeof lazy.measurePolicy.measure).toBe('function')
    expect(typeof lazy.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty lazy column', () => {
    const lazy = LazyColumn(0)
    const result = lazy.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(360)
  })

  it('should measure lazy column with items', () => {
    const lazy = LazyColumn(10, Modifier.create().freeze(), 48)
    const result = lazy.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 600,
    })
    expect(result.width).toBe(360)
    expect(result.height).toBeLessThanOrEqual(600)
  })

  it('should compute minIntrinsicHeight correctly', () => {
    const lazy = LazyColumn(5, Modifier.create().freeze(), 80, 8, 0)
    const height = lazy.measurePolicy.minIntrinsicHeight([], 360)
    expect(height).toBe(5 * 80 + 4 * 8)
  })

  it('should handle zero items', () => {
    const lazy = LazyColumn(0)
    const result = lazy.measurePolicy.measure([], {
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
  it('should create a lazy row with default params', () => {
    const lazy = LazyRow(10)
    expect(lazy.kind).toBe('lazy-row')
    expect(lazy.itemCount).toBe(10)
    expect(lazy.itemSize).toBeNull()
    expect(lazy.spacing).toBe(0)
    expect(lazy.contentPadding).toBe(0)
  })

  it('should create a lazy row with custom itemSize', () => {
    const lazy = LazyRow(15, Modifier.create().freeze(), 120)
    expect(lazy.itemSize).toBe(120)
  })

  it('should create a lazy row with spacing and padding', () => {
    const lazy = LazyRow(10, Modifier.create().freeze(), null, 12, 8)
    expect(lazy.spacing).toBe(12)
    expect(lazy.contentPadding).toBe(8)
  })

  it('should create a lazy row with scroll state', () => {
    const lazy = LazyRow(50, Modifier.create().freeze(), null, 0, 0, 3, 80)
    expect(lazy.firstVisibleItemIndex).toBe(3)
    expect(lazy.firstVisibleItemScrollOffset).toBe(80)
  })

  it('should have a measure policy', () => {
    const lazy = LazyRow(10)
    expect(lazy.measurePolicy).toBeDefined()
    expect(typeof lazy.measurePolicy.measure).toBe('function')
    expect(typeof lazy.measurePolicy.measureWithWeights).toBe('function')
  })

  it('should measure empty lazy row', () => {
    const lazy = LazyRow(0)
    const result = lazy.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })

  it('should measure lazy row with items', () => {
    const lazy = LazyRow(10, Modifier.create().freeze(), 120)
    const result = lazy.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })

  it('should compute minIntrinsicWidth correctly', () => {
    const lazy = LazyRow(5, Modifier.create().freeze(), 100, 8, 0)
    const width = lazy.measurePolicy.minIntrinsicWidth([], 200)
    expect(width).toBe(5 * 100 + 4 * 8)
  })

  it('should handle zero items', () => {
    const lazy = LazyRow(0)
    const result = lazy.measurePolicy.measure([], {
      minWidth: 0, maxWidth: 360, minHeight: 0, maxHeight: 200,
    })
    expect(result.height).toBe(200)
  })
})
