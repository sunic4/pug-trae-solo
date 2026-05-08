import type { Point } from './base-types'

type GestureState = 'possible' | 'recognized' | 'began' | 'changed' | 'ended' | 'cancelled' | 'failed'

interface GestureEvent {
  readonly type: 'tap' | 'doubleTap' | 'longPress' | 'dragStart' | 'drag' | 'dragEnd'
  readonly state: GestureState
  readonly position: Point
  readonly localPosition: Point
  readonly pointerId: number
  readonly timestamp: number
  readonly delta?: Point
  readonly velocity?: Point
}

type GestureCallback = (event: GestureEvent) => void

type DragDirection = 'all' | 'horizontal' | 'vertical'

export type { GestureState, GestureEvent, GestureCallback, DragDirection }
