import { PrimaryColor } from '@/theme/colors'
import { clickable } from '@/input/gesture-modifier'
import { Modifier, DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, Color, ReadonlyModifier } from '@/components/shared/imports'

type SnackbarDuration = 'short' | 'long' | 'indefinite'

type SnackbarComponent = {
  readonly kind: 'snackbar'
  readonly message: string
  readonly action: string | null
  readonly onActionClick: (() => void) | null
  readonly duration: SnackbarDuration
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly actionColor: Color
} & ComponentBase

function snackbarMeasurePolicy(message: string, action: string | null): MeasurePolicy {
  const hPadding = 24
  const vPadding = 14
  const actionWidth = action ? textPixelWidth(action, DEFAULT_FONT_SIZE) + 24 : 0
  const textWidth = textPixelWidth(message, DEFAULT_FONT_SIZE)
  const totalWidth = textWidth + actionWidth + hPadding
  const height = DEFAULT_FONT_SIZE * LINE_HEIGHT_RATIO + vPadding

  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const width = constrainWidth(constraints, totalWidth)
      const constrainedHeight = constrainHeight(constraints, height)
      return createMeasureResult(width, constrainedHeight)
    },
    minIntrinsicWidth(): number {
      return totalWidth
    },
    minIntrinsicHeight(): number {
      return height
    },
  })
}

function Snackbar(
  message: string,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  action: string | null = null,
  onActionClick: (() => void) | null = null,
  duration: SnackbarDuration = 'short',
  backgroundColor: Color = { r: 50, g: 50, b: 50, a: 1 },
  contentColor: Color = { r: 255, g: 255, b: 255, a: 1 },
  actionColor: Color = PrimaryColor,
): SnackbarComponent {
  const builder = Modifier.extendFrom(modifier)
  if (action && onActionClick) {
    builder.then(clickable(() => onActionClick()))
  }
  const snackbarModifier = builder
    .background(backgroundColor, 4)
    .freeze()
  const measurePolicy = snackbarMeasurePolicy(message, action)
  return {
    kind: 'snackbar',
    modifier: snackbarModifier,
    message,
    action,
    onActionClick,
    duration,
    backgroundColor,
    contentColor,
    actionColor,
    measurePolicy,
  }
}

export type { SnackbarComponent, SnackbarDuration }
export { Snackbar }
