import type { ReadonlyModifier } from '@/layout/modifier'
import type { MeasurePolicy, Alignment, Arrangement } from '@/layout/types'
import type { DrawScope, Rect, Color } from '@/renderer/types'

type DrawPolicy = (scope: DrawScope, bounds: Rect) => void

interface ChildLayout {
  readonly node: ComponentNode
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface ComponentBase {
  readonly modifier: ReadonlyModifier
  readonly measurePolicy: MeasurePolicy
  readonly drawPolicy: DrawPolicy
  layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[]
  getChildren(): ComponentNode[]
}

type MeasuredSizeMap = Map<ComponentNode, { readonly width: number; readonly height: number }>

type ComponentNode = ComponentBase & {
  readonly kind: string
}

const NOOP_DRAW_POLICY: DrawPolicy = () => {}

const EMPTY_CHILDREN: ComponentNode[] = []
const EMPTY_LAYOUT: ChildLayout[] = []

function leafGetChildren(): ComponentNode[] {
  return EMPTY_CHILDREN
}

function leafLayoutChildren(): ChildLayout[] {
  return EMPTY_LAYOUT
}

export type { ComponentBase, ComponentNode, DrawPolicy, ChildLayout, MeasuredSizeMap }
export { NOOP_DRAW_POLICY, leafGetChildren, leafLayoutChildren }
