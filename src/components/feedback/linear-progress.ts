import { Modifier, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier, Color } from '@/components/shared/imports'
import { PrimaryColor, TrackColor } from '@/theme/colors'
import { ConstrainedMeasurePolicy } from '@/components/shared/measure-policies'

type LinearProgressIndicatorComponent = {
  readonly kind: 'linear-progress-indicator'
  readonly progress: number
  readonly determinate: boolean
  readonly color: Color
  readonly trackColor: Color
  readonly height: number
} & ComponentBase

function LinearProgressIndicator(
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  progress: number = 0,
  determinate: boolean = false,
  color: Color = PrimaryColor,
  trackColor: Color = TrackColor,
  height: number = 4,
): LinearProgressIndicatorComponent {
  const progressModifier = Modifier.extendFrom(modifier)
    .background(trackColor, height / 2)
    .freeze()
  const measurePolicy = ConstrainedMeasurePolicy(200, height)
  return {
    kind: 'linear-progress-indicator',
    modifier: progressModifier,
    progress,
    determinate,
    color,
    trackColor,
    height,
    measurePolicy,
  }
}

export type { LinearProgressIndicatorComponent }
export { LinearProgressIndicator }
