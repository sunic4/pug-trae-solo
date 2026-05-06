import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { decay, createDraggableState, createAnchoredDraggable, DEFAULT_FRICTION } from '@/animation/gesture-animation'
import type { AnchoredDraggable } from '@/animation/gesture-animation'
import { spring } from '@/animation/animation-spec'
import type { DecaySpec, DraggableState } from '@/animation/gesture-animation'

describe('DecaySpec', () => {
  it('creates decay with default friction', () => {
    const d = decay()
    expect(d.friction).toBe(DEFAULT_FRICTION)
  })

  it('creates decay with custom friction', () => {
    const d = decay({ friction: 0.02 })
    expect(d.friction).toBe(0.02)
  })

  it('clamps friction to minimum 0.001', () => {
    const d = decay({ friction: 0 })
    expect(d.friction).toBe(0.001)
  })

  it('returns done when velocity is below threshold', () => {
    const d = decay({ friction: 1.0 })
    const result = d.getValueFromNanos(10_000_000_000, 0, 0.1, 0)
    expect(result.done).toBe(true)
  })

  it('returns not done for early time', () => {
    const d = decay({ friction: 0.01 })
    const result = d.getValueFromNanos(1_000_000, 0, 1000, 0)
    expect(result.done).toBe(false)
  })

  it('displacement follows exponential decay formula', () => {
    const friction = 0.02
    const d = decay({ friction })
    const v0 = 1000
    const elapsedMs = 100
    const expectedDisplacement = v0 / friction * (1 - Math.exp(-friction * elapsedMs))
    const result = d.getValueFromNanos(elapsedMs * 1_000_000, 0, v0, 0)
    expect(Math.abs(result.value - expectedDisplacement)).toBeLessThan(0.01)
  })

  it('value increases over time for positive velocity', () => {
    const d = decay({ friction: 0.02 })
    const r1 = d.getValueFromNanos(50_000_000, 0, 1000, 0)
    const r2 = d.getValueFromNanos(100_000_000, 0, 1000, 0)
    expect(r2.value).toBeGreaterThan(r1.value)
  })
})

describe('DraggableState', () => {
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

  it('initializes with given offset', () => {
    const s = createDraggableState(100)
    expect(s.offset).toBe(100)
  })

  it('initializes with default offset 0', () => {
    const s = createDraggableState()
    expect(s.offset).toBe(0)
  })

  it('dragTo adds delta to offset', () => {
    const s = createDraggableState(0)
    s.dragTo(10)
    expect(s.offset).toBe(10)
    s.dragTo(5)
    expect(s.offset).toBe(15)
  })

  it('dragTo calls onChange callback', () => {
    const onChange = vi.fn()
    const s = createDraggableState(0, onChange)
    s.dragTo(20)
    expect(onChange).toHaveBeenCalledWith(20)
  })

  it('snapTo sets offset directly', () => {
    const s = createDraggableState(0)
    s.dragTo(50)
    s.snapTo(200)
    expect(s.offset).toBe(200)
  })

  it('snapTo stops running animation', () => {
    const s = createDraggableState(0)
    s.snapTo(0)
    expect(s.isAnimationRunning).toBe(false)
  })

  it('stop cancels animation', () => {
    const s = createDraggableState(0)
    s.stop()
    expect(s.isAnimationRunning).toBe(false)
  })

  it('settle resolves immediately when already at target', async () => {
    const s = createDraggableState(0)
    await s.settle(0)
    expect(s.offset).toBe(0)
  })

  it('settle animates to target', async () => {
    const s = createDraggableState(0)
    const spec = spring({ dampingRatio: 1, stiffness: 10000 })
    const promise = s.settle(100, spec)

    for (let i = 0; i < 50; i++) {
      tick(16)
    }

    await promise
    expect(s.offset).toBeCloseTo(100, 0)
    expect(s.isAnimationRunning).toBe(false)
  })

  it('fling animates with decay', async () => {
    const s = createDraggableState(0)
    const decaySpec = decay({ friction: 0.1 })
    const promise = s.fling(500, decaySpec)

    for (let i = 0; i < 80; i++) {
      tick(16)
    }

    await promise
    expect(s.offset).toBeGreaterThan(0)
    expect(s.isAnimationRunning).toBe(false)
  })

  it('dragTo stops running animation', () => {
    const s = createDraggableState(0)
    const spec = spring({ dampingRatio: 1, stiffness: 100 })
    s.settle(100, spec)
    expect(s.isAnimationRunning).toBe(true)
    s.dragTo(10)
    expect(s.isAnimationRunning).toBe(false)
    expect(s.offset).toBe(10)
  })
})

describe('AnchoredDraggable', () => {
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

  function createTestDraggable(): AnchoredDraggable {
    const anchors = new Map<number, string>([
      [0, 'left'],
      [150, 'center'],
      [300, 'right'],
    ])
    return createAnchoredDraggable(
      { anchors, initialAnchor: 0 },
      spring({ dampingRatio: 1, stiffness: 10000 }),
    )
  }

  it('initializes at initial anchor', () => {
    const d = createTestDraggable()
    expect(d.offset).toBe(0)
    expect(d.currentAnchor).toBe(0)
    expect(d.currentAnchorLabel).toBe('left')
  })

  it('dragTo changes offset', () => {
    const d = createTestDraggable()
    d.dragTo(50)
    expect(d.offset).toBe(50)
  })

  it('snapTo moves to anchor', () => {
    const d = createTestDraggable()
    d.snapTo(150)
    expect(d.offset).toBe(150)
    expect(d.currentAnchor).toBe(150)
    expect(d.currentAnchorLabel).toBe('center')
  })

  it('snapTo ignores invalid anchor', () => {
    const d = createTestDraggable()
    d.snapTo(999)
    expect(d.offset).toBe(0)
    expect(d.currentAnchor).toBe(0)
  })

  it('settle finds nearest anchor', async () => {
    const d = createTestDraggable()
    d.dragTo(80)
    const promise = d.settle()
    for (let i = 0; i < 50; i++) {
      tick(16)
    }
    await promise
    expect(d.currentAnchor).toBe(150)
    expect(d.offset).toBeCloseTo(150, 0)
  })

  it('settle selects left anchor when closer', async () => {
    const d = createTestDraggable()
    d.dragTo(40)
    const promise = d.settle()
    for (let i = 0; i < 50; i++) {
      tick(16)
    }
    await promise
    expect(d.currentAnchor).toBe(0)
  })

  it('settle selects right anchor when closer', async () => {
    const d = createTestDraggable()
    d.dragTo(250)
    const promise = d.settle()
    for (let i = 0; i < 50; i++) {
      tick(16)
    }
    await promise
    expect(d.currentAnchor).toBe(300)
  })

  it('dispose prevents further operations', () => {
    const d = createTestDraggable()
    d.dispose()
    d.dragTo(50)
    expect(d.offset).toBe(0)
  })

  it('dispose during fling stops animation', () => {
    const d = createTestDraggable()
    d.dispose()
    expect(d.offset).toBe(0)
  })
})
