import { Surface } from '../layout/surface'
import type { SurfaceOptions } from '../layout/surface'
import { Text } from '../basic/text'
import { Modifier, DEFAULT_MODIFIER, OnPrimaryColor, PrimaryColor, normalizeModifier } from '../shared/imports'
import { clickable } from '@pug-canvas-ui/input'
import { defaultTextStyle } from '@pug-canvas-ui/render'
import type { ReadonlyModifier, Color } from '../shared/imports'
import type { GestureCallback } from '@pug-canvas-ui/input'
import type { CompositionContext } from '@pug-canvas-ui/core'

type ButtonOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
  readonly contentColor?: Color
}

function Button(
  ctx: CompositionContext,
  onClick: GestureCallback,
  content: string | (() => void) = () => {},
  options: ButtonOptions = {},
): void {
  const { modifier = DEFAULT_MODIFIER, backgroundColor = PrimaryColor } = options
  const normalizedMod = normalizeModifier(modifier)

  const surfaceOptions: SurfaceOptions = {
    modifier: Modifier.extendFrom(normalizedMod)
      .then(clickable(onClick))
      .padding(16, 8)
      .freeze(),
    color: backgroundColor,
    elevation: 0,
    borderRadius: 8,
    alignment: 'center',
  }

  const contentFn: () => void = typeof content === 'string'
    ? () => { Text(ctx, content, DEFAULT_MODIFIER, { ...defaultTextStyle(), color: OnPrimaryColor }) }
    : content

  Surface(ctx, contentFn, surfaceOptions)
}

export type { ButtonOptions }
export { Button }
