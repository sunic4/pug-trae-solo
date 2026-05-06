import { Modifier, DEFAULT_MODIFIER, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'

interface DialogButton {
  readonly label: string
  readonly onClick: () => void
}

type DialogComponent = {
  readonly kind: 'dialog'
  readonly title: string
  readonly content: ComponentNode[]
  readonly buttons: DialogButton[]
  readonly onDismissRequest: () => void
  readonly backgroundColor: Color
} & ComponentBase

function dialogMeasurePolicy(title: string, buttonCount: number): MeasurePolicy {
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const titleWidth = textPixelWidth(title, 14)
      const buttonWidth = buttonCount * 80
      const hPadding = 48
      const width = Math.min(constrainWidth(constraints, Math.max(titleWidth + hPadding, buttonWidth + hPadding, 280)), 560)
      const height = constrainHeight(constraints, 120)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return 280
    },
    minIntrinsicHeight(): number {
      return 120
    },
  })
}

function Dialog(
  onDismissRequest: () => void,
  title: string,
  content: ComponentNode[] = [],
  buttons: DialogButton[] = [],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): DialogComponent {
  const dialogModifier = Modifier.extendFrom(modifier)
    .background(backgroundColor, 12)
    .freeze()
  const measurePolicy = dialogMeasurePolicy(title, buttons.length)
  return {
    kind: 'dialog',
    modifier: dialogModifier,
    title,
    content,
    buttons,
    onDismissRequest,
    backgroundColor,
    measurePolicy,
  }
}

export type { DialogComponent, DialogButton }
export { Dialog }
