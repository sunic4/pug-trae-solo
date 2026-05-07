import { ConstrainedMeasurePolicy, DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/components/shared/imports'
import type { Color, DrawScope, Rect } from '@/renderer/types'
import { PrimaryColor } from '@/theme/colors'
import type { DrawPolicy } from '@/components/basic/types'
import type { CompositionContext } from '@/core/composition-context'

function circularProgressDrawPolicy(progress: number, determinate: boolean, color: Color, strokeWidth: number): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const cx = bounds.x + bounds.width / 2
    const cy = bounds.y + bounds.height / 2
    const radius = Math.min(bounds.width, bounds.height) / 2 - strokeWidth / 2

    scope.strokeCircle({ x: cx, y: cy }, radius, { r: 224, g: 224, b: 224, a: 1 }, strokeWidth)

    if (determinate && progress > 0) {
      const clampedProgress = Math.min(1, Math.max(0, progress))
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + clampedProgress * Math.PI * 2

      scope.fillPath(
        {
          commands: [
            { type: 'moveTo', args: [cx, cy] },
            { type: 'arc', args: [cx, cy, radius, startAngle, endAngle, 0] },
            { type: 'closePath', args: [] },
          ],
          bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
        },
        color,
      )
    }
  }
}

function CircularProgressIndicator(
  ctx: CompositionContext,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  progress: number = 0,
  determinate: boolean = false,
  color: Color = PrimaryColor,
  strokeWidth: number = 4,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = ConstrainedMeasurePolicy(36, 36)
  ctx.emitNode(
    { progress, determinate, color, strokeWidth },
    mod,
    measurePolicy,
    circularProgressDrawPolicy(progress, determinate, color, strokeWidth),
  )
}

export { CircularProgressIndicator }
