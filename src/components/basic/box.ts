import { BoxAlignmentMeasurePolicy } from '@/components/shared/measure-policies'
import { DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'

type BoxComponent = {
  readonly kind: 'box'
  readonly alignment: Alignment
  readonly children: readonly ComponentNode[]
} & ComponentBase

function Box(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  alignment: Alignment = 'center',
  children: readonly ComponentNode[] = [],
): BoxComponent {
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  return {
    kind: 'box',
    alignment,
    modifier,
    children: [...children],
    measurePolicy,
  }
}

export type { BoxComponent }
export { Box }
