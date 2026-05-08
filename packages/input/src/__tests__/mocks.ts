import type { NativePointerEvent, CanvasRect } from '../pointer-event'

function createMockPointerEvent(overrides: Partial<NativePointerEvent> = {}): NativePointerEvent {
  return {
    pointerId: 0,
    type: 'pointerdown',
    clientX: 0,
    clientY: 0,
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    timeStamp: 0,
    buttons: 0,
    isPrimary: false,
    ...overrides,
  }
}

function createMockCanvasRect(overrides: Partial<CanvasRect> = {}): CanvasRect {
  return {
    left: 0,
    top: 0,
    width: 800,
    height: 600,
    ...overrides,
  }
}

export { createMockPointerEvent, createMockCanvasRect }
