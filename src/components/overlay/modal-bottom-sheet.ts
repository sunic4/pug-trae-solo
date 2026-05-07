import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'
import type { CompositionContext } from '@/core/composition-context'

function modalBottomSheetMeasurePolicy(peekHeight: number): MeasurePolicy {
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const width = constrainWidth(constraints, constraints.maxWidth * 0.9)
      const height = constrainHeight(constraints, peekHeight)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return 280
    },
    minIntrinsicHeight(): number {
      return peekHeight
    },
  })
}

function ModalBottomSheet(
  ctx: CompositionContext,
  onDismissRequest: () => void,
  contentFn?: () => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  peekHeight: number = 200,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): void {
  const normalizedMod = normalizeModifier(modifier)
  const sheetModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 16)
    .freeze()
  const measurePolicy = modalBottomSheetMeasurePolicy(peekHeight)
  ctx.emitNode(
    { onDismissRequest, peekHeight, backgroundColor },
    sheetModifier,
    measurePolicy,
    NOOP_DRAW_POLICY,
    (contentArea: Rect, measuredSizes: MeasuredSizeMap, selfChildrenIds: readonly number[]): ChildLayout[] => {
      return layoutBoxChildren(selfChildrenIds, contentArea, measuredSizes, 'center')
    },
  )
  if (contentFn) contentFn()
  ctx.endGroup()
}

export { ModalBottomSheet }
