// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import {
  createObjectPool,
  createOffscreenCanvasManager,
  createGCAdvisor,
  DEFAULT_MAX_POOL_SIZE,
  DEFAULT_MAX_CANVAS_CACHE,
} from '@/platform/memory'
import type { OffscreenCanvasManager, GCAdvisor } from '@/platform/memory'
import type { ObjectPool } from '@/platform/memory'

describe('ObjectPool', () => {
  it('acquires objects from factory', () => {
    const pool = createObjectPool(() => ({ x: 0 }), (obj) => { obj.x = 0 })
    const obj = pool.acquire()
    expect(obj).toEqual({ x: 0 })
    expect(pool.size).toBe(1)
  })

  it('reuses released objects', () => {
    const pool = createObjectPool(() => ({ x: 0 }), (obj) => { obj.x = 0 })
    const obj1 = pool.acquire()
    obj1.x = 42
    pool.release(obj1)
    const obj2 = pool.acquire()
    expect(obj2).toBe(obj1)
    expect(obj2.x).toBe(0)
  })

  it('resets objects on release', () => {
    const reset = vi.fn()
    const pool = createObjectPool(() => ({ x: 0 }), reset)
    const obj = pool.acquire()
    pool.release(obj)
    expect(reset).toHaveBeenCalledWith(obj)
  })

  it('tracks available count', () => {
    const pool = createObjectPool(() => ({ x: 0 }), (obj) => { obj.x = 0 })
    expect(pool.available).toBe(0)
    const obj = pool.acquire()
    expect(pool.available).toBe(0)
    pool.release(obj)
    expect(pool.available).toBe(1)
  })

  it('discards objects when pool is full', () => {
    const pool = createObjectPool(() => ({ x: 0 }), (obj) => { obj.x = 0 }, 2)
    const obj1 = pool.acquire()
    const obj2 = pool.acquire()
    const obj3 = pool.acquire()
    pool.release(obj1)
    pool.release(obj2)
    pool.release(obj3)
    expect(pool.available).toBe(2)
  })

  it('clear resets pool', () => {
    const pool = createObjectPool(() => ({ x: 0 }), (obj) => { obj.x = 0 })
    pool.acquire()
    pool.acquire()
    pool.clear()
    expect(pool.size).toBe(0)
    expect(pool.available).toBe(0)
  })

  it('DEFAULT_MAX_POOL_SIZE is 64', () => {
    expect(DEFAULT_MAX_POOL_SIZE).toBe(64)
  })
})

describe('OffscreenCanvasManager', () => {
  function createTestCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }

  function createTestManager(maxSize?: number): OffscreenCanvasManager {
    return createOffscreenCanvasManager({
      maxSize,
      canvasFactory: createTestCanvas,
    })
  }

  it('creates canvas entries', () => {
    const mgr = createTestManager()
    const entry = mgr.acquire('test', 100, 200)
    expect(entry.width).toBe(100)
    expect(entry.height).toBe(200)
    expect(entry.canvas).toBeDefined()
    expect(mgr.size).toBe(1)
  })

  it('reuses existing canvas with same key and size', () => {
    const mgr = createTestManager()
    const entry1 = mgr.acquire('test', 100, 200)
    const entry2 = mgr.acquire('test', 100, 200)
    expect(entry2).toBe(entry1)
    expect(mgr.size).toBe(1)
  })

  it('recreates canvas when size changes', () => {
    const mgr = createTestManager()
    mgr.acquire('test', 100, 200)
    const entry2 = mgr.acquire('test', 200, 300)
    expect(entry2.width).toBe(200)
    expect(entry2.height).toBe(300)
    expect(mgr.size).toBe(1)
  })

  it('evicts oldest entry when cache is full', () => {
    const mgr = createTestManager(2)
    mgr.acquire('a', 100, 100)
    mgr.acquire('b', 100, 100)
    mgr.acquire('c', 100, 100)
    expect(mgr.size).toBe(2)
    expect(mgr.acquire('a', 100, 100)).toBeDefined()
  })

  it('evict removes specific entry', () => {
    const mgr = createTestManager()
    mgr.acquire('test', 100, 200)
    mgr.evict('test')
    expect(mgr.size).toBe(0)
  })

  it('release updates lastUsed', () => {
    const mgr = createTestManager()
    const entry = mgr.acquire('test', 100, 200)
    const before = entry.lastUsed
    mgr.release('test')
    expect(entry.lastUsed).toBeGreaterThanOrEqual(before)
  })

  it('clear removes all entries', () => {
    const mgr = createTestManager()
    mgr.acquire('a', 100, 100)
    mgr.acquire('b', 100, 100)
    mgr.clear()
    expect(mgr.size).toBe(0)
  })

  it('dispose clears and marks disposed', () => {
    const mgr = createTestManager()
    mgr.acquire('a', 100, 100)
    mgr.dispose()
    expect(mgr.size).toBe(0)
  })

  it('DEFAULT_MAX_CANVAS_CACHE is 16', () => {
    expect(DEFAULT_MAX_CANVAS_CACHE).toBe(16)
  })
})

describe('GCAdvisor', () => {
  let advisor: GCAdvisor

  beforeEach(() => {
    advisor = createGCAdvisor()
  })

  it('initializes with zero stats', () => {
    expect(advisor.stats.poolSize).toBe(0)
    expect(advisor.stats.canvasCount).toBe(0)
    expect(advisor.stats.estimatedBytes).toBe(0)
  })

  it('tracks registered pools', () => {
    advisor.registerPool('draw-commands', { size: 10, available: 2 })
    expect(advisor.stats.poolSize).toBe(10)
  })

  it('tracks registered canvas manager', () => {
    advisor.registerCanvasManager({ size: 5 })
    expect(advisor.stats.canvasCount).toBe(5)
  })

  it('suggests reducing idle pools', () => {
    advisor.registerPool('idle-pool', { size: 100, available: 90 })
    const suggestions = advisor.suggest()
    expect(suggestions.some(s => s.includes('idle-pool'))).toBe(true)
  })

  it('suggests reducing canvas cache when large', () => {
    advisor.registerCanvasManager({ size: 12 })
    const suggestions = advisor.suggest()
    expect(suggestions.some(s => s.includes('offscreen canvases'))).toBe(true)
  })

  it('reports optimal when everything is fine', () => {
    advisor.registerPool('good-pool', { size: 10, available: 3 })
    const suggestions = advisor.suggest()
    expect(suggestions).toContain('Memory usage looks optimal')
  })

  it('unregisterPool removes pool', () => {
    advisor.registerPool('temp', { size: 5, available: 0 })
    advisor.unregisterPool('temp')
    expect(advisor.stats.poolSize).toBe(0)
  })

  it('unregisterCanvasManager removes manager', () => {
    advisor.registerCanvasManager({ size: 5 })
    advisor.unregisterCanvasManager()
    expect(advisor.stats.canvasCount).toBe(0)
  })
})
