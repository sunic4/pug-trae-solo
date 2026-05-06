import { linearMeasurePolicy } from '@/layout/measure-policy'
import { DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Arrangement, Alignment } from '@/layout/types'

type ColumnComponent = {
  readonly kind: 'column'
  readonly arrangement: Arrangement
  readonly alignment: Alignment
  readonly children: ComponentNode[]
} & ComponentBase

function Column(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  arrangement: Arrangement = 'start',
  alignment: Alignment = 'start',
  children: ComponentNode[] = [],
): ColumnComponent {
  const measurePolicy = linearMeasurePolicy('vertical', arrangement, alignment)
  return {
    kind: 'column',
    modifier,
    arrangement,
    alignment,
    children,
    measurePolicy,
  }
}

export type { ColumnComponent }
export { Column }
