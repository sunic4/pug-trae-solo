import { BoxAlignmentMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/components/shared/imports'
import type { Alignment } from '@/layout/types'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'
import type { CompositionContext } from '@/core/composition-context'

function Popup(
  ctx: CompositionContext,
  contentFn?: () => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  alignment: Alignment = 'center',
  offset: { x: number; y: number } = { x: 0, y: 0 },
  onDismissRequest: (() => void) | null = null,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = BoxAlignmentMeasurePolicy(alignment)
  ctx.emitNode(
    { alignment, offset, onDismissRequest },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutBoxChildren(selfChildrenIds, contentArea, measuredSizes, alignment)
    },
  )
  if (contentFn) contentFn()
  ctx.endGroup()
}

export { Popup }
