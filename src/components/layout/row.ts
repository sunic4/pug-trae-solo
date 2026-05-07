import { linearMeasurePolicy } from '@/layout/measure-policy'
import { DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { Arrangement, Alignment } from '@/layout/types'
import { layoutRowChildren } from '@/components/shared/layout-helpers'
import type { CompositionContext } from '@/core/composition-context'

function Row(
  ctx: CompositionContext,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  arrangement: Arrangement = 'start',
  alignment: Alignment = 'start',
  childrenFn?: () => void,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = linearMeasurePolicy('horizontal', arrangement, alignment)
  ctx.emitNode(
    { arrangement, alignment },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutRowChildren(selfChildrenIds, contentArea, measuredSizes, arrangement, alignment)
    },
  )
  if (childrenFn) {
    childrenFn()
  }
  ctx.endGroup()
}

export { Row }
