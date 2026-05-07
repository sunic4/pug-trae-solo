import { Surface } from '@/components/layout/surface'
import type { SurfaceOptions } from '@/components/layout/surface'
import { Text } from '@/components/basic/text'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier, defaultTextStyle } from '@/components/shared/imports'
import type { Color, ReadonlyModifier } from '@/components/shared/imports'
import type { CompositionContext } from '@/core/composition-context'

type TopAppBarOptions = {
  readonly modifier?: ReadonlyModifier
  readonly navigationIcon?: (() => void) | null
  readonly actions?: () => void
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly elevation?: number
}

function TopAppBar(
  ctx: CompositionContext,
  title: string,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  options?: TopAppBarOptions,
): void {
  const resolvedOptions: TopAppBarOptions = options ?? {}
  const {
    navigationIcon = null,
    actions = undefined,
    backgroundColor = { r: 255, g: 255, b: 255, a: 1 },
    contentColor = { r: 33, g: 33, b: 33, a: 1 },
    elevation = 0,
  } = resolvedOptions
  const normalizedMod = normalizeModifier(modifier)

  Surface(
    ctx,
    () => {
      Text(ctx, title, DEFAULT_MODIFIER, { ...defaultTextStyle(), fontSize: 18, color: contentColor })
      if (navigationIcon) navigationIcon()
      if (actions) actions()
    },
    {
      modifier: Modifier.extendFrom(normalizedMod)
        .setHeight(56)
        .freeze(),
      color: backgroundColor,
      elevation,
      borderRadius: 0,
      alignment: 'start',
    },
  )
}

export type { TopAppBarOptions }
export { TopAppBar }
