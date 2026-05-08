import { Modifier, DEFAULT_MODIFIER, ConstrainedMeasurePolicy, normalizeModifier } from '../shared/imports'
import type { ReadonlyModifier, Color } from '../shared/imports'
import { PrimaryColor, TrackColor } from '@pug-canvas-ui/theme'
import type { DrawScope, Rect } from '@pug-canvas-ui/render'
import type { DrawPolicy } from '@pug-canvas-ui/render'
import type { CompositionContext } from '@pug-canvas-ui/core'

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

function LinearProgressIndicator(
  ctx: CompositionContext,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  progress: number = 0,
  determinate: boolean = false,
  color: Color = PrimaryColor,
  trackColor: Color = TrackColor,
  height: number = 4,
): void {
  const normalizedMod = normalizeModifier(modifier)
  const progressModifier = Modifier.extendFrom(normalizedMod)
    .background(trackColor, height / 2)
    .freeze()
  const measurePolicy = ConstrainedMeasurePolicy(200, height)
  ctx.emitNode(
    { progress, determinate, color, trackColor, height },
    progressModifier,
    measurePolicy,
    linearProgressDrawPolicy(progress, color, trackColor, height),
  )
}

export { LinearProgressIndicator }
