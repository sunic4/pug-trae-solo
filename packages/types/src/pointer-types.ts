import type { Point } from './base-types'

type PointerEventType = 'down' | 'move' | 'up' | 'cancel'

interface PointerEventData {
  readonly pointerId: number
  readonly type: PointerEventType
  readonly position: Point
  readonly localPosition: Point
  readonly pressure: number
  readonly tiltX: number
  readonly tiltY: number
  readonly timestamp: number
  readonly buttons: number
  readonly isPrimary: boolean
}

type PointerInputHandler = (event: PointerEventData) => void

export type { PointerEventType, PointerEventData, PointerInputHandler }
