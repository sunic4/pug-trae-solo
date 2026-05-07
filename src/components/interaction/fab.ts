import { Surface } from '@/components/layout/surface'
import type { SurfaceOptions } from '@/components/layout/surface'
import { Modifier, DEFAULT_MODIFIER, PrimaryColor, normalizeModifier } from '@/components/shared/imports'
import { clickable } from '@/input/gesture-modifier'
import type { ReadonlyModifier, Color } from '@/components/shared/imports'
import type { GestureCallback } from '@/input/gesture-recognizer'
import type { CompositionContext } from '@/core/composition-context'

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
