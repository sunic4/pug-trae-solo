import { BoxAlignmentMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '../shared/imports'
import type { ReadonlyModifier } from '../shared/imports'
import type { Alignment } from '@pug-canvas-ui/layout'
import type { ChildLayout, MeasuredSizeMap } from '@pug-canvas-ui/render'
import type { Rect } from '@pug-canvas-ui/render'
import { layoutBoxChildren } from '../shared/layout-helpers'
import type { CompositionContext } from '@pug-canvas-ui/core'

function Box(
  ctx: CompositionContext,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  alignment: Alignment = 'center',
  childrenFn?: () => void,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  ctx.emitNode(
    { alignment },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutBoxChildren(selfChildrenIds, contentArea, measuredSizes, alignment)
    },
  )
  if (childrenFn) {
    childrenFn()
  }
  ctx.endGroup()
}

export { Box }
