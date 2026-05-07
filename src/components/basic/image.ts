import type { NinePatchConfig } from '@/renderer/image-loader'
import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/components/shared/imports'
import type { CompositionContext } from '@/core/composition-context'

function Image(
  ctx: CompositionContext,
  src: string,
  width: number,
  height: number,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  ninePatch: NinePatchConfig | null = null,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  ctx.emitLeaf(
    { src, width, height, ninePatch },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
  )
}

export { Image }
