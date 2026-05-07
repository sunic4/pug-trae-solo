import { Surface } from '@/components/layout/surface'
import type { SurfaceOptions } from '@/components/layout/surface'
import { Text } from '@/components/basic/text'
import { Modifier, DEFAULT_MODIFIER, OnPrimaryColor, PrimaryColor, normalizeModifier } from '@/components/shared/imports'
import { clickable } from '@/input/gesture-modifier'
import { defaultTextStyle } from '@/renderer/text-style'
import type { ReadonlyModifier, Color } from '@/components/shared/imports'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { CompositionContext } from '@/core/composition-context'

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
