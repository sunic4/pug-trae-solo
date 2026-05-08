import type { NinePatchConfig } from '@pug-canvas-ui/render'
import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '../shared/imports'
import type { ReadonlyModifier } from '../shared/imports'
import type { CompositionContext } from '@pug-canvas-ui/core'

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
  ctx.emitNode(
    { src, width, height, ninePatch },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
  )
}

export { Image }
