import { Modifier, DEFAULT_MODIFIER, createMeasurePolicy, createMeasureResult, leafGetChildren, leafLayoutChildren, normalizeModifier } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, Color, MeasurePolicy, Measurable, Constraints, MeasureResult, ReadonlyModifier } from '@/components/shared/imports'
import type { DrawScope, Rect } from '@/renderer/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { PrimaryColor } from '@/theme/colors'
import { EqualSplitMeasurePolicy } from '@/components/shared/equal-split-measure-policy'
import type { SelectableItem } from '@/components/shared/selectable-item'

function tabRowDrawPolicy(tabs: readonly TabConfig[], selectedIndex: number, contentColor: Color, indicatorColor: Color): DrawPolicy {
  return (scope: DrawScope, bounds: Rect): void => {
    const tabWidth = bounds.width / tabs.length
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]!
      const tx = bounds.x + tabWidth * i
      const color = i === selectedIndex ? indicatorColor : contentColor
      scope.fillText(tab.label, { x: tx + tabWidth / 2 - 20, y: bounds.y + 28 }, color, 14)
    }
    const indicatorX = bounds.x + tabWidth * selectedIndex
    scope.fillRect(
      { x: indicatorX, y: bounds.y + bounds.height - 3, width: tabWidth, height: 3 },
      indicatorColor,
    )
  }
}

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
  const normalizedMod = normalizeModifier(modifier)
  const tabRowModifier = Modifier.extendFrom(normalizedMod)
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
    drawPolicy: tabRowDrawPolicy(tabs, selectedIndex, contentColor, indicatorColor),
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { TabRowComponent, TabConfig }
export { TabRow }
