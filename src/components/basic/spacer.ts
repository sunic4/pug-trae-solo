import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER } from '@/components/shared/imports'
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
  const measurePolicy = ConstrainedMeasurePolicy(width, height)
  return {
    kind: 'spacer',
    modifier,
    width,
    height,
    measurePolicy,
  }
}

export type { SpacerComponent }
export { Spacer }
