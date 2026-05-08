import { Surface } from '../layout/surface'
import { Modifier, DEFAULT_MODIFIER, PrimaryColor, normalizeModifier } from '../shared/imports'
import { clickable } from '@pug-canvas-ui/input'
import type { ReadonlyModifier, Color } from '../shared/imports'
import type { GestureCallback } from '@pug-canvas-ui/input'
import type { CompositionContext } from '@pug-canvas-ui/core'

type FabOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly size?: number
  readonly elevation?: number
}

function FAB(
  ctx: CompositionContext,
  onClick: GestureCallback,
  childrenFn?: () => void,
  options: FabOptions = {},
): void {
  const {
    modifier = DEFAULT_MODIFIER,
    backgroundColor = PrimaryColor,
    size = 56,
    elevation = 6,
  } = options
  const normalizedMod = normalizeModifier(modifier)
  const radius = size / 2

  Surface(ctx, childrenFn, {
    modifier: Modifier.extendFrom(normalizedMod)
      .then(clickable(onClick))
      .layoutSize(size, size)
      .freeze(),
    color: backgroundColor,
    elevation,
    borderRadius: radius,
    alignment: 'center',
  })
}

export type { FabOptions }
export { FAB }
