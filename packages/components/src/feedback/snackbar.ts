import { Surface } from '../layout/surface'
import { Text } from '../basic/text'
import { Row } from '../layout/row'
import { Spacer } from '../basic/spacer'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier, defaultTextStyle } from '../shared/imports'
import { clickable } from '@pug-canvas-ui/input'
import type { ReadonlyModifier, Color } from '../shared/imports'
import { PrimaryColor } from '@pug-canvas-ui/theme'
import type { CompositionContext } from '@pug-canvas-ui/core'

type SnackbarOptions = {
  readonly modifier?: ReadonlyModifier
  readonly onActionClick?: (() => void) | null
  readonly duration?: 'short' | 'long' | 'indefinite'
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly actionColor?: Color
}

function Snackbar(
  ctx: CompositionContext,
  message: string,
  action: string | null = null,
  options: SnackbarOptions = {},
): void {
  const {
    modifier = DEFAULT_MODIFIER,
    onActionClick = null,
    backgroundColor = { r: 50, g: 50, b: 50, a: 1 },
    contentColor = { r: 255, g: 255, b: 255, a: 1 },
    actionColor = PrimaryColor,
  } = options
  const normalizedMod = normalizeModifier(modifier)

  const builder = Modifier.extendFrom(normalizedMod)
  if (action && onActionClick) {
    builder.then(clickable(() => onActionClick()))
  }

  Surface(
    ctx,
    () => {
      Row(ctx, DEFAULT_MODIFIER, 'center', 'center', () => {
        Text(ctx, message, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 14, color: contentColor })
        if (action) {
          Spacer(ctx, 24, 0)
          Text(ctx, action, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 14, color: actionColor })
        }
      })
    },
    {
      modifier: builder.background(backgroundColor, 4).freeze(),
      color: backgroundColor,
      elevation: 0,
      borderRadius: 4,
      alignment: 'start',
    },
  )
}

export type { SnackbarOptions }
export { Snackbar }
