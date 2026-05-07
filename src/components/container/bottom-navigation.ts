import { Modifier, DEFAULT_MODIFIER, createShadow, createMeasurePolicy, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { PrimaryColor } from '@/theme/colors'
import { EqualSplitMeasurePolicy } from '@/components/shared/equal-split-measure-policy'
import type { SelectableItem } from '@/components/shared/selectable-item'

function bottomNavDrawPolicy(items: readonly BottomNavItem[], selectedColor: Color, unselectedColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const itemWidth = bounds.width / items.length
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const ix = bounds.x + itemWidth * i
      const color = item.selected ? selectedColor : unselectedColor
      scope.fillText(item.label, { x: ix + itemWidth / 2 - 20, y: bounds.y + 36 }, color, 12)
    }
  }
}

type BottomNavItem = SelectableItem

type BottomNavigationComponent = {
  readonly kind: 'bottom-navigation'
  readonly items: BottomNavItem[]
  readonly selectedIndex: number
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly selectedItemColor: Color
  readonly children: ComponentNode[]
} & ComponentBase

function BottomNavigation(
  items: BottomNavItem[],
  selectedIndex: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
  contentColor: Color = { r: 117, g: 117, b: 117, a: 1 },
  selectedItemColor: Color = PrimaryColor,
  children: ComponentNode[] = [],
): BottomNavigationComponent {
  const normalizedMod = normalizeModifier(modifier)
  const bottomNavModifier = Modifier.extendFrom(normalizedMod)
    .background(backgroundColor)
    .then(createShadow(8))
    .freeze()
  const measurePolicy = EqualSplitMeasurePolicy(items.length, 56, 56)
  return {
    kind: 'bottom-navigation',
    modifier: bottomNavModifier,
    items,
    selectedIndex,
    backgroundColor,
    contentColor,
    selectedItemColor,
    children,
    measurePolicy,
    drawPolicy: bottomNavDrawPolicy(items, selectedItemColor, contentColor),
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { BottomNavigationComponent, BottomNavItem }
export { BottomNavigation }
