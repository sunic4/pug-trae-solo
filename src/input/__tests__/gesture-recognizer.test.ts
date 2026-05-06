import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createTapRecognizer,
  createLongPressRecognizer,
  createDragRecognizer,
  createVelocityTracker,
  createGestureArena,
  TOUCH_SLOP,
  LONG_PRESS_DELAY,
} from '@/input/gesture-recognizer'
import type { PointerEventData } from '@/input/pointer-event'
import { TapGestureRecognizer, LongPressGestureRecognizer, DragGestureRecognizer } from '@/input/gesture-recognizer'
import type { VelocityTracker, GestureArena } from '@/input/gesture-recognizer'

function makePointerEvent(
  type: PointerEventData['type'],
  opts: Partial<PointerEventData> = {},
): PointerEventData {
  return {
    pointerId: 0,
    type,
    position: { x: 0, y: 0 },
    localPosition: { x: 0, y: 0 },
    pressure: 0.5,
    tiltX: 0,
    tiltY: 0,
    timestamp: Date.now(),
    buttons: 1,
    isPrimary: true,
    ...opts,
  }
}

describe('TapGestureRecognizer', () => {
  it('should recognize a tap on down+up within timeout and slop', () => {
    const recognizer = createTapRecognizer()
    const onTap = vi.fn()
    recognizer.onTap = onTap

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 52, y: 51 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('recognized')
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onTap.mock.calls[0]![0].type).toBe('tap')
    recognizer.dispose()
  })

  it('should fail if pointer moves beyond touch slop', () => {
    const recognizer = createTapRecognizer()
    const onTap = vi.fn()
    recognizer.onTap = onTap

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 50 + TOUCH_SLOP + 5, y: 50 } }))

    expect(recognizer.state).toBe('failed')
    expect(onTap).not.toHaveBeenCalled()
    recognizer.dispose()
  })

  it('should fail if up takes longer than tap timeout', () => {
    const recognizer = createTapRecognizer()
    const onTap = vi.fn()
    recognizer.onTap = onTap

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1400 }))

    expect(recognizer.state).toBe('failed')
    expect(onTap).not.toHaveBeenCalled()
    recognizer.dispose()
  })

  it('should recognize double tap on two quick taps', () => {
    const recognizer = createTapRecognizer()
    const onDoubleTap = vi.fn()
    recognizer.onDoubleTap = onDoubleTap
    recognizer.onTap = vi.fn()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1100 }))

    recognizer.reset()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1200 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1300 }))

    expect(onDoubleTap).toHaveBeenCalledTimes(1)
    recognizer.dispose()
  })

  it('should be cancelled on cancel event', () => {
    const recognizer = createTapRecognizer()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    recognizer.addPointerEvent(makePointerEvent('cancel'))

    expect(recognizer.state).toBe('cancelled')
    recognizer.dispose()
  })

  it('should not respond after dispose', () => {
    const recognizer = createTapRecognizer()
    recognizer.dispose()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    expect(recognizer.state).toBe('possible')
  })
})

describe('LongPressGestureRecognizer', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('should recognize long press after delay', () => {
    const recognizer = createLongPressRecognizer()
    const onLongPress = vi.fn()
    recognizer.onLongPress = onLongPress

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    vi.advanceTimersByTime(LONG_PRESS_DELAY + 10)

    expect(recognizer.state).toBe('recognized')
    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(onLongPress.mock.calls[0]![0].type).toBe('longPress')
    recognizer.dispose()
  })

  it('should fail if pointer moves beyond touch slop', () => {
    const recognizer = createLongPressRecognizer()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 50 + TOUCH_SLOP + 5, y: 50 } }))

    expect(recognizer.state).toBe('failed')
    recognizer.dispose()
  })

  it('should fail if pointer up before delay', () => {
    const recognizer = createLongPressRecognizer()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    vi.advanceTimersByTime(200)
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1200 }))

    expect(recognizer.state).toBe('failed')
    recognizer.dispose()
  })

  it('should be cancelled on cancel event', () => {
    const recognizer = createLongPressRecognizer()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    recognizer.addPointerEvent(makePointerEvent('cancel'))

    expect(recognizer.state).toBe('cancelled')
    recognizer.dispose()
  })
})

describe('DragGestureRecognizer', () => {
  it('should begin drag after exceeding touch slop', () => {
    const recognizer = createDragRecognizer()
    const onDragStart = vi.fn()
    recognizer.onDragStart = onDragStart

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 50 + TOUCH_SLOP + 5, y: 50 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('changed')
    expect(onDragStart).toHaveBeenCalledTimes(1)
    expect(onDragStart.mock.calls[0]![0].type).toBe('dragStart')
    recognizer.dispose()
  })

  it('should track drag deltas', () => {
    const recognizer = createDragRecognizer()
    const onDrag = vi.fn()
    recognizer.onDrag = onDrag
    recognizer.onDragStart = vi.fn()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 80, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 100, y: 50 }, timestamp: 1200 }))

    expect(onDrag).toHaveBeenCalledTimes(2)
    expect(onDrag.mock.calls[1]![0].delta).toEqual({ x: 20, y: 0 })
    recognizer.dispose()
  })

  it('should end drag on pointer up with velocity', () => {
    const recognizer = createDragRecognizer()
    const onDragEnd = vi.fn()
    recognizer.onDragEnd = onDragEnd
    recognizer.onDragStart = vi.fn()
    recognizer.onDrag = vi.fn()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 80, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 80, y: 50 }, timestamp: 1150 }))

    expect(recognizer.state).toBe('ended')
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(onDragEnd.mock.calls[0]![0].type).toBe('dragEnd')
    expect(onDragEnd.mock.calls[0]![0].velocity).toBeDefined()
    recognizer.dispose()
  })

  it('should fail if pointer up without exceeding touch slop', () => {
    const recognizer = createDragRecognizer()

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('up', { localPosition: { x: 52, y: 51 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('failed')
    recognizer.dispose()
  })

  it('should respect horizontal direction constraint', () => {
    const recognizer = createDragRecognizer('horizontal')

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 50, y: 50 + TOUCH_SLOP + 5 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('possible')
    recognizer.dispose()
  })

  it('should respect vertical direction constraint', () => {
    const recognizer = createDragRecognizer('vertical')

    recognizer.addPointerEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { localPosition: { x: 50 + TOUCH_SLOP + 5, y: 50 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('possible')
    recognizer.dispose()
  })
})

describe('VelocityTracker', () => {
  it('should return zero velocity with fewer than 2 samples', () => {
    const tracker = createVelocityTracker()
    tracker.addPosition(1000, { x: 50, y: 50 })
    expect(tracker.getVelocity()).toEqual({ x: 0, y: 0 })
  })

  it('should compute velocity from position samples', () => {
    const tracker = createVelocityTracker()
    tracker.addPosition(1000, { x: 50, y: 50 })
    tracker.addPosition(1100, { x: 150, y: 50 })
    const v = tracker.getVelocity()
    expect(v.x).toBeCloseTo(1000, -1)
    expect(v.y).toBeCloseTo(0, 0)
  })

  it('should reset and clear samples', () => {
    const tracker = createVelocityTracker()
    tracker.addPosition(1000, { x: 50, y: 50 })
    tracker.addPosition(1100, { x: 150, y: 50 })
    tracker.reset()
    expect(tracker.getVelocity()).toEqual({ x: 0, y: 0 })
  })
})

describe('GestureArena', () => {
  it('should let eager recognizer win over non-eager', () => {
    const arena = createGestureArena()
    const tap = createTapRecognizer()
    const drag = createDragRecognizer()
    const onTap = vi.fn()
    tap.onTap = onTap

    arena.addRecognizer(tap)
    arena.addRecognizer(drag)

    arena.handleEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    arena.handleEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1100 }))

    expect(tap.state).toBe('recognized')
    expect(drag.state).toBe('failed')
    expect(onTap).toHaveBeenCalledTimes(1)
    arena.dispose()
  })

  it('should let drag win when pointer moves beyond slop', () => {
    const arena = createGestureArena()
    const tap = createTapRecognizer()
    const drag = createDragRecognizer()
    const onDragStart = vi.fn()
    drag.onDragStart = onDragStart

    arena.addRecognizer(tap)
    arena.addRecognizer(drag)

    arena.handleEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    arena.handleEvent(makePointerEvent('move', { localPosition: { x: 50 + TOUCH_SLOP + 5, y: 50 }, timestamp: 1100 }))

    expect(tap.state).toBe('failed')
    expect(drag.state).toBe('changed')
    expect(onDragStart).toHaveBeenCalledTimes(1)
    arena.dispose()
  })

  it('should handle empty arena gracefully', () => {
    const arena = createGestureArena()
    arena.handleEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 } }))
    arena.dispose()
  })

  it('should remove recognizer and allow remaining to compete', () => {
    const arena = createGestureArena()
    const tap = createTapRecognizer()
    const drag = createDragRecognizer()
    const onTap = vi.fn()
    tap.onTap = onTap

    arena.addRecognizer(tap)
    arena.addRecognizer(drag)
    arena.removeRecognizer(drag)

    arena.handleEvent(makePointerEvent('down', { localPosition: { x: 50, y: 50 }, timestamp: 1000 }))
    arena.handleEvent(makePointerEvent('up', { localPosition: { x: 50, y: 50 }, timestamp: 1100 }))

    expect(tap.state).toBe('recognized')
    expect(onTap).toHaveBeenCalledTimes(1)
    arena.dispose()
  })
})
