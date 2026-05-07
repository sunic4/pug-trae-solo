import type { TextStyle, Color, DrawScope, Rect } from '@/renderer/types'
import { BackgroundColor, PrimaryColor } from '@/theme/colors'
import { defaultTextStyle } from '@/renderer/text-style'
import { Modifier, DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, normalizeModifier } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawPolicy } from '@/components/basic/types'
import type { CompositionContext } from '@/core/composition-context'

function textFieldDrawPolicy(value: string, placeholder: string, textStyle: TextStyle, cursorColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const displayText = value || placeholder
    const textColor = value ? textStyle.color : { r: 158, g: 158, b: 158, a: 1 }
    if (displayText.length > 0) {
      scope.fillText(displayText, { x: bounds.x + 16, y: bounds.y + textStyle.fontSize + 8 }, textColor, textStyle.fontSize)
    }
    scope.fillRect(
      { x: bounds.x, y: bounds.y + bounds.height - 2, width: bounds.width, height: 2 },
      cursorColor,
    )
  }
}

function textFieldMeasurePolicy(value: string, placeholder: string, singleLine: boolean, textStyle: TextStyle): MeasurePolicy {
  const fontSize = textStyle.fontSize ?? DEFAULT_FONT_SIZE
  const lh = fontSize * LINE_HEIGHT_RATIO
  const hPadding = 32
  const vPadding = 16
  const displayText = value || placeholder
  const textWidth = textPixelWidth(displayText, fontSize)
  const minWidth = Math.max(textWidth + hPadding, 120)

  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      if (singleLine) {
        const width = constrainWidth(constraints, minWidth)
        const height = constrainHeight(constraints, lh + vPadding)
        return createMeasureResult(width, height)
      }

      const maxWidth = constraints.maxWidth - hPadding
      const lines = maxWidth > 0 ? Math.ceil(textWidth / maxWidth) || 1 : 1
      const width = constrainWidth(constraints, minWidth)
      const height = constrainHeight(constraints, lines * lh + vPadding)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return textWidth + hPadding
    },
    minIntrinsicHeight(): number {
      return lh + vPadding
    },
  })
}

function TextField(
  ctx: CompositionContext,
  value: string,
  onValueChange: (value: string) => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  placeholder: string = '',
  singleLine: boolean = true,
  textStyle: TextStyle = defaultTextStyle(),
  backgroundColor: Color = BackgroundColor,
  cursorColor: Color = PrimaryColor,
): void {
  const normalizedMod = normalizeModifier(modifier)
  const textFieldModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 4)
    .freeze()
  const measurePolicy = textFieldMeasurePolicy(value, placeholder, singleLine, textStyle)
  ctx.emitLeaf(
    { value, onValueChange, placeholder, singleLine, textStyle, backgroundColor, cursorColor },
    textFieldModifier,
    measurePolicy,
    textFieldDrawPolicy(value, placeholder, textStyle, cursorColor),
  )
}

export { TextField }
