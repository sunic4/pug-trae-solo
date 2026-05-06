import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { Color } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'

type SliderComponent = {
  readonly kind: 'slider'
  readonly value: number
  readonly onValueChange: (value: number) => void
  readonly valueRange: readonly [number, number]
  readonly trackColor: Color
  readonly thumbColor: Color
} & ComponentBase

function Slider(
  value: number,
  onValueChange: (value: number) => void,
  valueRange: [number, number] = [0, 1],
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  trackColor: Color = { r: 189, g: 189, b: 189, a: 1 },
  thumbColor: Color = PrimaryColor,
): SliderComponent {
  const measurePolicy = ConstrainedMeasurePolicy(200, 24)
  return {
    kind: 'slider',
    modifier,
    value,
    onValueChange,
    valueRange,
    trackColor,
    thumbColor,
    measurePolicy,
  }
}

function sliderValueFromPosition(
  positionX: number,
  trackWidth: number,
  valueRange: readonly [number, number],
): number {
  const ratio = Math.max(0, Math.min(1, positionX / trackWidth))
  return valueRange[0] + ratio * (valueRange[1] - valueRange[0])
}

export type { SliderComponent }
export { Slider, sliderValueFromPosition }
