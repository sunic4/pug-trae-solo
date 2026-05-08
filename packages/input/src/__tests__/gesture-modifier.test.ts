import { describe, it, expect, vi } from 'vitest'
import { createPinchRecognizer } from '../pinch-recognizer'
import { clickable, longPressable, draggable, transformable, scrollable, pointerInput } from '../gesture-modifier'
import type { PointerEventData } from '../pointer-event'
import { Modifier } from '@pug-canvas-ui/layout'


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

describe('PinchGestureRecognizer', () => {
  it('should not start with single pointer', () => {
    const recognizer = createPinchRecognizer()
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 50, y: 50 } }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 60, y: 50 } }))
    expect(recognizer.state).toBe('possible')
    recognizer.dispose()
  })

  it('should begin transform when two pointers move beyond min scale distance', () => {
    const recognizer = createPinchRecognizer()
    const onTransformStart = vi.fn()
    const onTransform = vi.fn()
    recognizer.onTransformStart = onTransformStart
    recognizer.onTransform = onTransform

    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 40, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 1, localPosition: { x: 60, y: 50 }, timestamp: 1000 }))

    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 20, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 1, localPosition: { x: 80, y: 50 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('changed')
    expect(onTransformStart).toHaveBeenCalledTimes(1)
    expect(onTransform.mock.calls.length).toBeGreaterThanOrEqual(1)
    expect(onTransform.mock.calls[0]![0].scale).toBeGreaterThan(1)
    recognizer.dispose()
  })

  it('should compute rotation between two pointers', () => {
    const recognizer = createPinchRecognizer()
    const onTransform = vi.fn()
    recognizer.onTransformStart = vi.fn()
    recognizer.onTransform = onTransform

    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 40, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 1, localPosition: { x: 60, y: 50 }, timestamp: 1000 }))

    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 50, y: 40 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 1, localPosition: { x: 50, y: 60 }, timestamp: 1100 }))

    expect(onTransform).toHaveBeenCalled()
    const event = onTransform.mock.calls[0]![0]
    expect(Math.abs(event.rotation)).toBeGreaterThan(0)
    recognizer.dispose()
  })

  it('should end transform when one pointer is lifted', () => {
    const recognizer = createPinchRecognizer()
    const onTransformEnd = vi.fn()
    recognizer.onTransformStart = vi.fn()
    recognizer.onTransform = vi.fn()
    recognizer.onTransformEnd = onTransformEnd

    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 40, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 1, localPosition: { x: 60, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 20, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 1, localPosition: { x: 80, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('up', { pointerId: 0, localPosition: { x: 20, y: 50 }, timestamp: 1200 }))

    expect(recognizer.state).toBe('ended')
    expect(onTransformEnd).toHaveBeenCalledTimes(1)
    recognizer.dispose()
  })

  it('should be cancelled on cancel event during transform', () => {
    const recognizer = createPinchRecognizer()
    recognizer.onTransformStart = vi.fn()
    recognizer.onTransform = vi.fn()

    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 40, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 1, localPosition: { x: 60, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 20, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 1, localPosition: { x: 80, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('cancel', { pointerId: 0, localPosition: { x: 20, y: 50 }, timestamp: 1200 }))

    expect(recognizer.state).toBe('cancelled')
    recognizer.dispose()
  })

  it('should not start if distance change is below min scale distance', () => {
    const recognizer = createPinchRecognizer()
    recognizer.onTransformStart = vi.fn()

    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 0, localPosition: { x: 40, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('down', { pointerId: 1, localPosition: { x: 60, y: 50 }, timestamp: 1000 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 0, localPosition: { x: 41, y: 50 }, timestamp: 1100 }))
    recognizer.addPointerEvent(makePointerEvent('move', { pointerId: 1, localPosition: { x: 59, y: 50 }, timestamp: 1100 }))

    expect(recognizer.state).toBe('possible')
    recognizer.dispose()
  })
})

describe('Gesture Modifier factories', () => {
  it('should create clickable element', () => {
    const onClick = vi.fn()
    const el = clickable(onClick)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('clickable')
    expect(el.onClick).toBe(onClick)
    expect(el.onLongClick).toBeNull()
  })

  it('should create clickable element with long click', () => {
    const onClick = vi.fn()
    const onLongClick = vi.fn()
    const el = clickable(onClick, onLongClick)
    expect(el.onLongClick).toBe(onLongClick)
  })

  it('should create longPressable element', () => {
    const onLongPress = vi.fn()
    const el = longPressable(onLongPress)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('longPressable')
    expect(el.onLongPress).toBe(onLongPress)
  })

  it('should create draggable element', () => {
    const onStart = vi.fn()
    const onDrag = vi.fn()
    const onEnd = vi.fn()
    const el = draggable('all', onStart, onDrag, onEnd)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('draggable')
    expect(el.direction).toBe('all')
  })

  it('should create transformable element', () => {
    const onStart = vi.fn()
    const onTransform = vi.fn()
    const onEnd = vi.fn()
    const el = transformable(onStart, onTransform, onEnd)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('transformable')
  })

  it('should create scrollable element', () => {
    const onScroll = vi.fn()
    const el = scrollable('vertical', onScroll)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('scrollable')
    expect(el.direction).toBe('vertical')
    expect(el.onFling).toBeNull()
  })

  it('should create pointerInput element', () => {
    const handler = vi.fn()
    const el = pointerInput(handler)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('pointerInput')
    expect(el.handler).toBe(handler)
  })
})

describe('Modifier gesture methods', () => {
  it('should add clickable via Modifier chain', () => {
    const onClick = vi.fn()
    const mod = Modifier.create().then(clickable(onClick)).freeze()
    expect(mod.size).toBe(1)
    const el = mod.get(0)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('clickable')
  })

  it('should add draggable via Modifier chain', () => {
    const onStart = vi.fn()
    const onDrag = vi.fn()
    const onEnd = vi.fn()
    const mod = Modifier.create().then(draggable('horizontal', onStart, onDrag, onEnd)).freeze()
    expect(mod.size).toBe(1)
    const el = mod.get(0)
    expect(el.kind).toBe('input')
    expect(el.name).toBe('draggable')
  })

  it('should add multiple gesture modifiers', () => {
    const onClick = vi.fn()
    const onDrag = vi.fn()
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    const mod = Modifier.create()
      .then(clickable(onClick))
      .then(draggable('all', onDragStart, onDrag, onDragEnd))
      .freeze()
    expect(mod.size).toBe(2)
    const inputMods = mod.filterByKind('input')
    expect(inputMods.size).toBe(2)
  })

  it('should combine layout and gesture modifiers', () => {
    const onClick = vi.fn()
    const mod = Modifier.create()
      .padding(16)
      .fillMaxWidth()
      .then(clickable(onClick))
      .background({ r: 255, g: 255, b: 255, a: 1 })
      .freeze()
    expect(mod.size).toBe(4)
    const inputMods = mod.filterByKind('input')
    expect(inputMods.size).toBe(1)
    const layoutMods = mod.filterByKind('layout')
    expect(layoutMods.size).toBe(2)
    const drawMods = mod.filterByKind('draw')
    expect(drawMods.size).toBe(1)
  })
})
