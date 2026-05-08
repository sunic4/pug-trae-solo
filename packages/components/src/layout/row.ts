import { linearMeasurePolicy } from '@pug-canvas-ui/layout'
import { DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '../shared/imports'
import type { ReadonlyModifier } from '../shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@pug-canvas-ui/render'
import type { Rect } from '@pug-canvas-ui/render'
import type { Arrangement, Alignment } from '@pug-canvas-ui/layout'
import { layoutRowChildren } from '../shared/layout-helpers'
import type { CompositionContext } from '@pug-canvas-ui/core'

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
