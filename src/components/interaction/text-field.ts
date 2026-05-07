import type { TextStyle, Color, DrawScope, Rect } from '@/renderer/types'
import { BackgroundColor, PrimaryColor } from '@/theme/colors'
import { defaultTextStyle } from '@/renderer/text-style'
import { Modifier, DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

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
  const normalizedMod = normalizeModifier(modifier)
  const textFieldModifier = Modifier.extendFrom(normalizedMod)
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
    drawPolicy: textFieldDrawPolicy(value, placeholder, textStyle, cursorColor),
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { TextFieldComponent }
export { TextField }
