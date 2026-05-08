import type { Point } from './base-types'
import type { GestureState } from './gesture-types'

interface TransformEvent {
  readonly type: 'transformStart' | 'transform' | 'transformEnd'
  readonly state: GestureState
  readonly scale: number
  readonly rotation: number
  readonly focalPoint: Point
  readonly pointerIds: readonly [number, number]
  readonly timestamp: number
}

type TransformCallback = (event: TransformEvent) => void

export type { TransformEvent, TransformCallback }
