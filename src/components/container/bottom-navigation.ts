import { Modifier, createShadow, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, ReadonlyModifier } from '@/components/shared/imports'
import { PrimaryColor } from '@/theme/colors'
import { EqualSplitMeasurePolicy } from '@/components/shared/equal-split-measure-policy'
import type { SelectableItem } from '@/components/shared/selectable-item'

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
  const bottomNavModifier = Modifier.extendFrom(modifier)
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
  }
}

export type { BottomNavigationComponent, BottomNavItem }
export { BottomNavigation }
