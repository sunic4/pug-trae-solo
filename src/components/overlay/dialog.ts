import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, createMeasureResult, textPixelWidth, constrainWidth, constrainHeight, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'

function dialogDrawPolicy(title: string, buttons: readonly DialogButton[], scrimColor: Color, titleColor: Color, buttonColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    scope.fillRect(bounds, scrimColor)
    const dw = Math.min(bounds.width - 48, 300)
    const dh = 140
    const dx = bounds.x + (bounds.width - dw) / 2
    const dy = bounds.y + (bounds.height - dh) / 2
    scope.fillRoundRect({ x: dx, y: dy, width: dw, height: dh }, 12, { r: 255, g: 255, b: 255, a: 1 })
    scope.fillText(title, { x: dx + 20, y: dy + 28 }, titleColor, 16)
    let bx = dx + dw - 16
    for (let i = buttons.length - 1; i >= 0; i--) {
      const btn = buttons[i]!
      const tw = textPixelWidth(btn.label, 14)
      bx -= tw + 8
      scope.fillText(btn.label, { x: bx, y: dy + dh - 20 }, buttonColor, 14)
      bx -= 8
    }
  }
}

interface DialogButton {
  readonly label: string
  readonly onClick: () => void
}

type DialogOptions = {
  readonly content?: ComponentNode[]
  readonly buttons?: DialogButton[]
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
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
  options: DialogOptions & { readonly title: string; readonly onDismiss: () => void },
): DialogComponent {
  const {
    title,
    onDismiss: onDismissRequest,
    content = [],
    buttons = [],
    modifier = DEFAULT_MODIFIER,
    backgroundColor = { r: 255, g: 255, b: 255, a: 1 },
  } = options
  const normalizedModifier = normalizeModifier(modifier)
  const dialogModifier = Modifier.extendFrom(normalizedModifier)
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
    drawPolicy: dialogDrawPolicy(title, buttons, { r: 0, g: 0, b: 0, a: 0.5 }, { r: 33, g: 33, b: 33, a: 1 }, { r: 33, g: 150, b: 243, a: 1 }),
    getChildren(): ComponentNode[] {
      return this.content
    },
    layoutChildren(contentArea: Rect, measuredSizes: MeasuredSizeMap): ChildLayout[] {
      const dw = Math.min(contentArea.width - 48, 300)
      const dh = 140
      const dx = contentArea.x + (contentArea.width - dw) / 2
      const dy = contentArea.y + (contentArea.height - dh) / 2
      const dialogContentArea: Rect = { x: dx, y: dy, width: dw, height: dh }
      return this.content.map(child => {
        const size = measuredSizes.get(child) ?? { width: dw, height: dh }
        return { node: child, x: dialogContentArea.x, y: dialogContentArea.y, width: size.width, height: size.height }
      })
    },
  }
}

export type { DialogComponent, DialogButton, DialogOptions }
export { Dialog }
