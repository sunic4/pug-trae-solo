import { linearMeasurePolicy } from '@/layout/measure-policy'
import { DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { Arrangement, Alignment } from '@/layout/types'
import { layoutColumnChildren } from '@/components/shared/layout-helpers'

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
  const mod = normalizeModifier(modifier)
  const measurePolicy = linearMeasurePolicy('vertical', arrangement, alignment)
  return {
    kind: 'column',
    modifier: mod,
    arrangement,
    alignment,
    children,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutColumnChildren(this.children, contentArea, measuredSizes, this.arrangement, this.alignment)
    },
    getChildren(): ComponentNode[] {
      return this.children
    },
  }
}

export type { ColumnComponent }
export { Column }
