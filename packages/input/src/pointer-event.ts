import type { Point } from '@pug-canvas-ui/render'
import type { HitTestableNode, HitTestResult } from './hit-test'
import type { PointerEventType, PointerEventData, PointerInputHandler } from '@pug-canvas-ui/types'

export type { PointerEventType, PointerEventData, PointerInputHandler }

interface NativePointerEvent {
  readonly pointerId: number
  readonly type: string
  readonly clientX: number
  readonly clientY: number
  readonly pressure: number
  readonly tiltX: number
  readonly tiltY: number
  readonly timeStamp: number
  readonly buttons: number
  readonly isPrimary: boolean
}

interface CanvasRect {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

function toPointerEventType(type: string): PointerEventType {
  switch (type) {
    case 'pointerdown':
      return 'down'
    case 'pointermove':
      return 'move'
    case 'pointerup':
      return 'up'
    case 'pointercancel':
      return 'cancel'
    default:
      throw new Error(`Unsupported pointer event type: ${type}`)
  }
}

function resolveCanvasPosition(clientX: number, clientY: number, canvasRect: CanvasRect): Point {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1
  return {
    x: (clientX - canvasRect.left) * dpr,
    y: (clientY - canvasRect.top) * dpr,
  }
}

function createPointerEventData(
  nativeEvent: NativePointerEvent,
  canvasRect: CanvasRect,
  localPosition: Point,
  position?: Point,
): PointerEventData {
  const resolvedPosition = position ?? resolveCanvasPosition(nativeEvent.clientX, nativeEvent.clientY, canvasRect)
  return {
    pointerId: nativeEvent.pointerId,
    type: toPointerEventType(nativeEvent.type),
    position: resolvedPosition,
    localPosition,
    pressure: nativeEvent.pressure,
    tiltX: nativeEvent.tiltX,
    tiltY: nativeEvent.tiltY,
    timestamp: nativeEvent.timeStamp,
    buttons: nativeEvent.buttons,
    isPrimary: nativeEvent.isPrimary,
  }
}

export type {
  HitTestResult,
  HitTestableNode,
  NativePointerEvent,
  CanvasRect,
}

export { toPointerEventType, createPointerEventData, resolveCanvasPosition }
