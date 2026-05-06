import type { TextStyle, Color } from '@/renderer/types'
import { BackgroundColor, PrimaryColor } from '@/theme/colors'
import { defaultTextStyle } from '@/renderer/text-style'
import { Modifier, DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, ReadonlyModifier } from '@/components/shared/imports'

type TextFieldComponent = {
  readonly kind: 'text-field'
  readonly value: string
  readonly onValueChange: (value: string) => void
  readonly placeholder: string
  readonly singleLine: boolean
  readonly textStyle: TextStyle
  readonly backgroundColor: Color
  readonly cursorColor: Color
} & ComponentBase

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
  value: string,
  onValueChange: (value: string) => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  placeholder: string = '',
  singleLine: boolean = true,
  textStyle: TextStyle = defaultTextStyle(),
  backgroundColor: Color = BackgroundColor,
  cursorColor: Color = PrimaryColor,
): TextFieldComponent {
  const textFieldModifier = Modifier.extendFrom(modifier)
    .background(backgroundColor, 4)
    .freeze()
  const measurePolicy = textFieldMeasurePolicy(value, placeholder, singleLine, textStyle)
  return {
    kind: 'text-field',
    modifier: textFieldModifier,
    value,
    onValueChange,
    placeholder,
    singleLine,
    textStyle,
    backgroundColor,
    cursorColor,
    measurePolicy,
  }
}

export type { TextFieldComponent }
export { TextField }
