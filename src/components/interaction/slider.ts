import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier } from '@/components/shared/imports'
import type { Color, DrawScope, Rect } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

function sliderDrawPolicy(value: number, trackColor: Color, thumbColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const trackH = 4
    const thumbR = 10
    const cy = bounds.y + bounds.height / 2
    const fillW = (bounds.width - thumbR * 2) * value

    scope.fillRoundRect(
      { x: bounds.x + thumbR, y: cy - trackH / 2, width: bounds.width - thumbR * 2, height: trackH },
      2,
      trackColor,
    )
    scope.fillCircle(
      { x: bounds.x + thumbR + fillW, y: cy },
      thumbR,
      thumbColor,
    )
  }
}

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
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(200, 24)
  return {
    kind: 'slider',
    modifier: mod,
    value,
    onValueChange,
    valueRange,
    trackColor,
    thumbColor,
    measurePolicy,
    drawPolicy: sliderDrawPolicy(value, trackColor, thumbColor),
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
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
