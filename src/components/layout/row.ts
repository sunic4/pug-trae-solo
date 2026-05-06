import { linearMeasurePolicy } from '@/layout/measure-policy'
import { DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Arrangement, Alignment } from '@/layout/types'

type RowComponent = {
  readonly kind: 'row'
  readonly arrangement: Arrangement
  readonly alignment: Alignment
  readonly children: ComponentNode[]
} & ComponentBase

function Row(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  arrangement: Arrangement = 'start',
  alignment: Alignment = 'start',
  children: ComponentNode[] = [],
): RowComponent {
  const measurePolicy = linearMeasurePolicy('horizontal', arrangement, alignment)
  return {
    kind: 'row',
    modifier,
    arrangement,
    alignment,
    children,
    measurePolicy,
  }
}

export type { RowComponent }
export { Row }
