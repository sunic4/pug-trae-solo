import { Modifier, DEFAULT_MODIFIER } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, ReadonlyModifier } from '@/components/shared/imports'
import { PrimaryColor } from '@/theme/colors'
import { EqualSplitMeasurePolicy } from '@/components/shared/equal-split-measure-policy'
import type { SelectableItem } from '@/components/shared/selectable-item'

type TabConfig = SelectableItem

type TabRowComponent = {
  readonly kind: 'tab-row'
  readonly tabs: TabConfig[]
  readonly selectedIndex: number
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly indicatorColor: Color
  readonly children: ComponentNode[]
} & ComponentBase

function TabRow(
  tabs: TabConfig[],
  selectedIndex: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  backgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 },
  contentColor: Color = { r: 33, g: 33, b: 33, a: 1 },
  indicatorColor: Color = PrimaryColor,
  children: ComponentNode[] = [],
): TabRowComponent {
  const tabRowModifier = Modifier.extendFrom(modifier)
    .background(backgroundColor)
    .freeze()
  const measurePolicy = EqualSplitMeasurePolicy(tabs.length, 48, 72)
  return {
    kind: 'tab-row',
    modifier: tabRowModifier,
    tabs,
    selectedIndex,
    backgroundColor,
    contentColor,
    indicatorColor,
    children,
    measurePolicy,
  }
}

export type { TabRowComponent, TabConfig }
export { TabRow }
