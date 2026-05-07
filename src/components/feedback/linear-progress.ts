import { Modifier, DEFAULT_MODIFIER, ConstrainedMeasurePolicy, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ReadonlyModifier, Color } from '@/components/shared/imports'
import { PrimaryColor, TrackColor } from '@/theme/colors'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

function linearProgressDrawPolicy(progress: number, color: Color, trackColor: Color, barHeight: number): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const y = bounds.y + (bounds.height - barHeight) / 2
    scope.fillRoundRect(
      { x: bounds.x, y, width: bounds.width, height: barHeight },
      barHeight / 2,
      trackColor,
    )
    const fillWidth = Math.max(0, bounds.width * Math.min(1, Math.max(0, progress)))
    if (fillWidth > 0) {
      scope.fillRoundRect(
        { x: bounds.x, y, width: fillWidth, height: barHeight },
        barHeight / 2,
        color,
      )
    }
  }
}

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
  const normalizedMod = normalizeModifier(modifier)
  const progressModifier = Modifier.extendFrom(normalizedMod)
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
    drawPolicy: linearProgressDrawPolicy(progress, color, trackColor, height),
    getChildren: leafGetChildren,
    layoutChildren: leafLayoutChildren,
  }
}

export type { LinearProgressIndicatorComponent }
export { LinearProgressIndicator }
