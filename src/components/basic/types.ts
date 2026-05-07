import type { ReadonlyModifier } from '@/layout/modifier'
import type { MeasurePolicy } from '@/layout/types'
import type { DrawScope, Rect } from '@/renderer/types'

type DrawPolicy = (scope: DrawScope, bounds: Rect) => void

type ChildLayout = {
  readonly nodeId: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

type MeasuredSizeMap = Map<number, { readonly width: number; readonly height: number }>

const NOOP_DRAW_POLICY: DrawPolicy = () => {}

export type { DrawPolicy, ChildLayout, MeasuredSizeMap }
export { NOOP_DRAW_POLICY }
