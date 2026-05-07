import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, NOOP_DRAW_POLICY, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'

type SpacerComponent = {
  readonly kind: 'spacer'
  readonly width: number
  readonly height: number
} & ComponentBase

function Spacer(
  width: number = 0,
  height: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
): SpacerComponent {
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  return {
    kind: 'spacer',
    modifier: mod,
    width,
    height,
    measurePolicy,
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { SpacerComponent }
export { Spacer }
