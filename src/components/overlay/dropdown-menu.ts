import { Modifier, DEFAULT_MODIFIER, textPixelWidth, createMeasurePolicy, constrainWidth, constrainHeight, createMeasureResult } from '@/components/shared/imports'
import type { ComponentBase, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'

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
  const menuModifier = Modifier.extendFrom(modifier)
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
  }
}

export type { DropdownMenuComponent, DropdownMenuItem }
export { DropdownMenu }
