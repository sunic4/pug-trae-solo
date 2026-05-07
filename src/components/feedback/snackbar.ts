import { PrimaryColor } from '@/theme/colors'
import { clickable } from '@/input/gesture-modifier'
import { Modifier, DEFAULT_MODIFIER, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult, ComponentBase, Color, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

function snackbarDrawPolicy(message: string, contentColor: Color, action: string | null, actionColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    scope.fillText(message, { x: bounds.x + 24, y: bounds.y + 14 + DEFAULT_FONT_SIZE }, contentColor, DEFAULT_FONT_SIZE)
    if (action) {
      const actionX = bounds.x + bounds.width - textPixelWidth(action, DEFAULT_FONT_SIZE) - 24
      scope.fillText(action, { x: actionX, y: bounds.y + 14 + DEFAULT_FONT_SIZE }, actionColor, DEFAULT_FONT_SIZE)
    }
  }
}

type SnackbarDuration = 'short' | 'long' | 'indefinite'

type SnackbarOptions = {
  readonly modifier?: ReadonlyModifier
  readonly onActionClick?: (() => void) | null
  readonly duration?: SnackbarDuration
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly actionColor?: Color
}

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
  action: string | null = null,
  options: SnackbarOptions = {},
): SnackbarComponent {
  const {
    modifier = DEFAULT_MODIFIER,
    onActionClick = null,
    duration = 'short',
    backgroundColor = { r: 50, g: 50, b: 50, a: 1 },
    contentColor = { r: 255, g: 255, b: 255, a: 1 },
    actionColor = PrimaryColor,
  } = options
  const normalizedModifier = normalizeModifier(modifier)
  const builder = Modifier.extendFrom(normalizedModifier)
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
    drawPolicy: snackbarDrawPolicy(message, contentColor, action, actionColor),
    getChildren: leafGetChildren,
    layoutChildren: leafLayoutChildren,
  }
}

export type { SnackbarComponent, SnackbarDuration, SnackbarOptions }
export { Snackbar }
