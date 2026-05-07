import { Surface } from '@/components/layout/surface'
import { Column } from '@/components/layout/column'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { Color, ReadonlyModifier } from '@/components/shared/imports'
import type { CompositionContext } from '@/core/composition-context'

type ScaffoldOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
}

function Scaffold(
  ctx: CompositionContext,
  topBarFn?: (() => void) | null,
  bodyFn?: () => void,
  bottomBarFn?: (() => void) | null,
  options?: ScaffoldOptions,
): void {
  const { modifier = DEFAULT_MODIFIER, backgroundColor = { r: 255, g: 255, b: 255, a: 1 } } = options ?? {}
  const normalizedMod = normalizeModifier(modifier)

  Surface(
    ctx,
    () => {
      Column(ctx, DEFAULT_MODIFIER, 'start', 'start', () => {
        if (topBarFn) topBarFn()
        if (bodyFn) bodyFn()
        if (bottomBarFn) bottomBarFn()
      })
    },
    {
      modifier: Modifier.extendFrom(normalizedMod)
        .fillMaxSize()
        .freeze(),
      color: backgroundColor,
      elevation: 0,
      borderRadius: 0,
      alignment: 'start',
    },
  )
}

export type { ScaffoldOptions }
export { Scaffold }
