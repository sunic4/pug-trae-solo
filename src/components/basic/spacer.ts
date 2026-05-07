import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/components/shared/imports'
import type { CompositionContext } from '@/core/composition-context'

function Spacer(
  ctx: CompositionContext,
  width: number = 0,
  height: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  ctx.emitLeaf(
    { width, height },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
  )
}

export { Spacer }
