import { Modifier, DEFAULT_MODIFIER, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, normalizeModifier } from '@/components/shared/imports'
import type { Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy } from '@/components/basic/types'
import type { CompositionContext } from '@/core/composition-context'

function dropdownMenuDrawPolicy(items: readonly DropdownMenuItem[], itemColor: Color, disabledColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const itemHeight = 48
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const y = bounds.y + i * itemHeight
      const color = item.enabled === false ? disabledColor : itemColor
      scope.fillText(item.label, { x: bounds.x + 16, y: y + 28 }, color, 14)
    }
  }
}

interface DropdownMenuItem {
  readonly label: string
  readonly onClick?: () => void
  readonly enabled?: boolean
}

function computeMaxLabelWidth(items: DropdownMenuItem[]): number {
  return items.reduce((max, item) => {
    const w = textPixelWidth(item.label, 14)
    return w > max ? w : max
  }, 0)
}

function dropdownMenuMeasurePolicy(items: DropdownMenuItem[]): MeasurePolicy {
  const maxLabelWidth = computeMaxLabelWidth(items)
  const hPadding = 32
  const itemHeight = 48
  return createMeasurePolicy({
    measure(_measurables: Measurable[], constraints: Constraints): MeasureResult {
      const width = constrainWidth(constraints, Math.max(maxLabelWidth + hPadding, 120))
      const height = constrainHeight(constraints, items.length * itemHeight)
      return createMeasureResult(width, height)
    },
    minIntrinsicWidth(): number {
      return maxLabelWidth + hPadding
    },
    minIntrinsicHeight(): number {
      return items.length * itemHeight
    },
  })
}

function DropdownMenu(
  ctx: CompositionContext,
  items: DropdownMenuItem[],
  expanded: boolean,
  onDismissRequest: () => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): void {
  const normalizedMod = normalizeModifier(modifier)
  const menuModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 8)
    .freeze()
  const measurePolicy = dropdownMenuMeasurePolicy(items)
  ctx.emitNode(
    { items, expanded, onDismissRequest, backgroundColor },
    menuModifier,
    measurePolicy,
    dropdownMenuDrawPolicy(items, { r: 33, g: 33, b: 33, a: 1 }, { r: 158, g: 158, b: 158, a: 1 }),
  )
}

export type { DropdownMenuItem }
export { DropdownMenu }
