import type { ReadonlyModifier } from '@/layout/modifier'
import type { MeasurePolicy } from '@/layout/types'

interface ComponentBase {
  readonly modifier: ReadonlyModifier
  readonly measurePolicy: MeasurePolicy
}

type ComponentNode = ComponentBase & {
  readonly kind: string
}

export type { ComponentBase, ComponentNode }
