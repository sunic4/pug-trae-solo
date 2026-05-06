import type { TextStyle } from '@/renderer/types'
import { defaultTextStyle } from '@/renderer/text-style'
import { DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, ReadonlyModifier } from '@/components/shared/imports'

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
  const measurePolicy = textMeasurePolicy(text, style)
  return {
    kind: 'text',
    modifier,
    text,
    style,
    measurePolicy,
  }
}

export type { TextComponent }
export { Text }
