import type { TextStyle, DrawScope, Rect } from '@/renderer/types'
import { defaultTextStyle } from '@/renderer/text-style'
import { DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawPolicy, ComponentNode } from '@/components/basic/types'

function textMeasurePolicy(text: string, style: TextStyle): MeasurePolicy {
  if (style.fontSize <= 0) {
    throw new Error(`TextStyle.fontSize must be positive, received: ${style.fontSize}`)
  }

  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const fontSize = style.fontSize
      const lh = fontSize * LINE_HEIGHT_RATIO
      const textPixelW = textPixelWidth(text, fontSize)

      if (text.length === 0) {
        return createMeasureResult(
          constrainWidth(constraints, 0),
          constrainHeight(constraints, 0),
        )
      }

      const maxWidth = constraints.maxWidth > 0 ? constraints.maxWidth : Infinity
      const lines = Math.max(1, Math.ceil(textPixelW / maxWidth))
      const width = Math.min(textPixelW, maxWidth)
      const height = lines * lh
      return createMeasureResult(
        constrainWidth(constraints, width),
        constrainHeight(constraints, height),
      )
    },
    minIntrinsicWidth(): number {
      return textPixelWidth(text, style.fontSize)
    },
    minIntrinsicHeight(): number {
      return text.length === 0 ? 0 : style.fontSize * LINE_HEIGHT_RATIO
    },
  })
}

function textDrawPolicy(text: string, style: TextStyle): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    if (text.length === 0) return
    scope.fillText(text, { x: bounds.x, y: bounds.y + style.fontSize }, style.color, style.fontSize)
  }
}

type TextComponent = {
  readonly kind: 'text'
  readonly text: string
  readonly style: TextStyle
} & ComponentBase

function Text(
  text: string,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  style: TextStyle = defaultTextStyle(),
): TextComponent {
  const mod = normalizeModifier(modifier)
  const measurePolicy = textMeasurePolicy(text, style)
  const drawPolicy = textDrawPolicy(text, style)
  return {
    kind: 'text',
    modifier: mod,
    text,
    style,
    measurePolicy,
    drawPolicy,
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { TextComponent }
export { Text }
