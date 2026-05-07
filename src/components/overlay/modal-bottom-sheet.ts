import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { Rect } from '@/renderer/types'
import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { layoutBoxChildren } from '@/components/shared/layout-helpers'

type ModalBottomSheetComponent = {
  readonly kind: 'modal-bottom-sheet'
  readonly content: ComponentNode[]
  readonly onDismissRequest: () => void
  readonly peekHeight: number
  readonly backgroundColor: Color
} & ComponentBase

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
  onDismissRequest: () => void,
  content: ComponentNode[] = [],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  peekHeight: number = 200,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): ModalBottomSheetComponent {
  const normalizedMod = normalizeModifier(modifier)
  const sheetModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 16)
    .freeze()
  const measurePolicy = modalBottomSheetMeasurePolicy(peekHeight)
  return {
    kind: 'modal-bottom-sheet',
    modifier: sheetModifier,
    content,
    onDismissRequest,
    peekHeight,
    backgroundColor,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    getChildren(): ComponentNode[] {
      return this.content
    },
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      return layoutBoxChildren(this.content, contentArea, measuredSizes, 'center')
    },
  }
}

export type { ModalBottomSheetComponent }
export { ModalBottomSheet }
