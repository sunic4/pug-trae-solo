import { Modifier, DEFAULT_MODIFIER, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap, ComponentNode } from '@/components/basic/types'

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

type DropdownMenuComponent = {
  readonly kind: 'dropdown-menu'
  readonly items: DropdownMenuItem[]
  readonly expanded: boolean
  readonly onDismissRequest: () => void
  readonly backgroundColor: Color
} & ComponentBase

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
  items: DropdownMenuItem[],
  expanded: boolean,
  onDismissRequest: () => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
): DropdownMenuComponent {
  const normalizedMod = normalizeModifier(modifier)
  const menuModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor, 8)
    .freeze()
  const measurePolicy = dropdownMenuMeasurePolicy(items)
  return {
    kind: 'dropdown-menu',
    modifier: menuModifier,
    items,
    expanded,
    onDismissRequest,
    backgroundColor,
    measurePolicy,
    drawPolicy: dropdownMenuDrawPolicy(items, { r: 33, g: 33, b: 33, a: 1 }, { r: 158, g: 158, b: 158, a: 1 }),
    getChildren: leafGetChildren,
    layoutChildren: leafLayoutChildren,
  }
}

export type { DropdownMenuComponent, DropdownMenuItem }
export { DropdownMenu }
