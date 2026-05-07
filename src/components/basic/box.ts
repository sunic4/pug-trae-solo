import { BoxAlignmentMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'
import type { ChildLayout, MeasuredSizeMap, DrawPolicy } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'

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
  const mod = normalizeModifier(modifier)
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  return {
    kind: 'box',
    alignment,
    modifier: mod,
    children: [...children],
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutBoxChildren(this.children, contentArea, measuredSizes, this.alignment)
    },
    getChildren(): ComponentNode[] {
      return [...this.children]
    },
  }
}

export type { BoxComponent }
export { Box }
