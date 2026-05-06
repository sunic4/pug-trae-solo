import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createFPSMonitor,
  createRecompositionCounter,
  createLayoutInspector,
} from '@/platform/perf-monitor'
import type { RecompositionCounter, LayoutInspector, InspectableNode } from '@/platform/perf-monitor'
import type { FPSMonitor } from '@/platform/perf-monitor'

describe('FPSMonitor', () => {
  let rafCallbacks: Map<number, () => void>
  let rafIdCounter: number
  let timeNow: number

  beforeEach(() => {
    rafCallbacks = new Map()
    rafIdCounter = 0
    timeNow = 1000000
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      const id = ++rafIdCounter
      rafCallbacks.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })
    vi.spyOn(performance, 'now').mockImplementation(() => timeNow)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function tick(ms: number): void {
    timeNow += ms
    const callbacks = [...rafCallbacks.values()]
    rafCallbacks.clear()
    for (const cb of callbacks) {
      cb()
    }
  }

  it('initializes with zero stats', () => {
    const m = createFPSMonitor()
    expect(m.stats.fps).toBe(0)
    expect(m.stats.totalFrames).toBe(0)
    expect(m.stats.droppedFrames).toBe(0)
    expect(m.isRunning).toBe(false)
  })

  it('starts and stops monitoring', () => {
    const m = createFPSMonitor()
    m.start()
    expect(m.isRunning).toBe(true)
    m.stop()
    expect(m.isRunning).toBe(false)
  })

  it('counts frames', () => {
    const m = createFPSMonitor()
    m.start()
    tick(16)
    tick(16)
    tick(16)
    expect(m.stats.totalFrames).toBe(3)
    m.stop()
  })

  it('calculates FPS', () => {
    const m = createFPSMonitor()
    m.start()
    for (let i = 0; i < 10; i++) {
      tick(16)
    }
    expect(m.stats.fps).toBeGreaterThan(50)
    expect(m.stats.frameTimeMs).toBeCloseTo(16, 0)
    m.stop()
  })

  it('detects dropped frames', () => {
    const m = createFPSMonitor()
    m.start()
    tick(16)
    tick(50)
    tick(16)
    expect(m.stats.droppedFrames).toBe(1)
    m.stop()
  })

  it('calls onUpdate callback', () => {
    const onUpdate = vi.fn()
    const m = createFPSMonitor(onUpdate)
    m.start()
    tick(16)
    expect(onUpdate).toHaveBeenCalledTimes(1)
    m.stop()
  })

  it('reset clears stats', () => {
    const m = createFPSMonitor()
    m.start()
    tick(16)
    tick(16)
    m.stop()
    m.reset()
    expect(m.stats.totalFrames).toBe(0)
    expect(m.stats.droppedFrames).toBe(0)
  })

  it('does not start twice', () => {
    const m = createFPSMonitor()
    m.start()
    m.start()
    expect(m.isRunning).toBe(true)
    m.stop()
  })
})

describe('RecompositionCounter', () => {
  let counter: RecompositionCounter

  beforeEach(() => {
    counter = createRecompositionCounter()
  })

  it('records and retrieves stats', () => {
    counter.record('scope-1', 5)
    counter.record('scope-1', 3)
    counter.record('scope-2', 10)

    const stats = counter.getStats()
    expect(stats).toHaveLength(2)
    const s1 = stats.find(s => s.scopeId === 'scope-1')!
    expect(s1.count).toBe(2)
    expect(s1.totalMs).toBe(8)
    expect(s1.avgMs).toBe(4)
  })

  it('sorts stats by count descending', () => {
    counter.record('scope-a', 1)
    counter.record('scope-b', 1)
    counter.record('scope-b', 1)
    counter.record('scope-b', 1)

    const stats = counter.getStats()
    expect(stats[0]!.scopeId).toBe('scope-b')
    expect(stats[0]!.count).toBe(3)
  })

  it('reset clears all records', () => {
    counter.record('scope-1', 5)
    counter.reset()
    expect(counter.getStats()).toHaveLength(0)
  })

  it('handles empty stats', () => {
    expect(counter.getStats()).toHaveLength(0)
  })

  it('calculates avgMs correctly', () => {
    counter.record('scope-x', 10)
    counter.record('scope-x', 20)
    counter.record('scope-x', 30)
    const stats = counter.getStats()
    expect(stats[0]!.avgMs).toBe(20)
  })
})

describe('LayoutInspector', () => {
  let inspector: LayoutInspector

  beforeEach(() => {
    inspector = createLayoutInspector()
  })

  it('inspects single node', () => {
    const root: InspectableNode = {
      id: 1,
      position: { x: 0, y: 0 },
      measureResult: { width: 100, height: 200 },
      children: [],
    }
    const result = inspector.inspect(root)
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(1)
    expect(result[0]!.width).toBe(100)
    expect(result[0]!.height).toBe(200)
    expect(result[0]!.depth).toBe(0)
  })

  it('inspects tree with children', () => {
    const root: InspectableNode = {
      id: 1,
      position: { x: 0, y: 0 },
      measureResult: { width: 300, height: 400 },
      children: [
        {
          id: 2,
          position: { x: 10, y: 10 },
          measureResult: { width: 100, height: 50 },
          children: [],
        },
        {
          id: 3,
          position: { x: 120, y: 10 },
          measureResult: { width: 100, height: 50 },
          children: [],
        },
      ],
    }
    const result = inspector.inspect(root)
    expect(result).toHaveLength(3)
    expect(result[0]!.depth).toBe(0)
    expect(result[1]!.depth).toBe(1)
    expect(result[2]!.depth).toBe(1)
  })

  it('handles node without measureResult', () => {
    const root: InspectableNode = {
      id: 1,
      position: { x: 0, y: 0 },
      measureResult: null,
      children: [],
    }
    const result = inspector.inspect(root)
    expect(result[0]!.width).toBe(0)
    expect(result[0]!.height).toBe(0)
  })

  it('handles deeply nested tree', () => {
    const leaf: InspectableNode = {
      id: 3,
      position: { x: 0, y: 0 },
      measureResult: { width: 10, height: 10 },
      children: [],
    }
    const mid: InspectableNode = {
      id: 2,
      position: { x: 0, y: 0 },
      measureResult: { width: 50, height: 50 },
      children: [leaf],
    }
    const root: InspectableNode = {
      id: 1,
      position: { x: 0, y: 0 },
      measureResult: { width: 100, height: 100 },
      children: [mid],
    }
    const result = inspector.inspect(root)
    expect(result).toHaveLength(3)
    expect(result[0]!.depth).toBe(0)
    expect(result[1]!.depth).toBe(1)
    expect(result[2]!.depth).toBe(2)
  })
})
