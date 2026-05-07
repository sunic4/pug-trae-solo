import { Surface } from '@/components/layout/surface'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { Text } from '@/components/basic/text'
import { Spacer } from '@/components/basic/spacer'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { Color, ReadonlyModifier } from '@/components/shared/imports'
import { PrimaryColor } from '@/theme/colors'
import type { SelectableItem } from '@/components/shared/selectable-item'
import type { CompositionContext } from '@/core/composition-context'

type TabRowOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly indicatorColor?: Color
}

function TabRow(
  ctx: CompositionContext,
  tabs: SelectableItem[],
  selectedIndex: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  options?: TabRowOptions,
): void {
  const resolvedOptions: TabRowOptions = options ?? {}
  const {
    backgroundColor = { r: 255, g: 255, b: 255, a: 1 },
    contentColor = { r: 33, g: 33, b: 33, a: 1 },
    indicatorColor = PrimaryColor,
  } = resolvedOptions
  const normalizedMod = normalizeModifier(modifier)

  Surface(
    ctx,
    () => {
      Column(ctx, DEFAULT_MODIFIER, 'start', 'start', () => {
        Row(ctx, DEFAULT_MODIFIER, 'center', 'center', () => {
          for (const tab of tabs) {
            const color = tab.selected ? indicatorColor : contentColor
            Text(ctx, tab.label, DEFAULT_MODIFIER, { fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'normal', color })
          }
        })
        Surface(ctx, () => {
          Spacer(ctx, 0, 3)
        }, {
          modifier: Modifier.create()
            .fillMaxWidth(tabs.length > 0 ? 1 / tabs.length : 0)
            .freeze(),
          color: indicatorColor,
          elevation: 0,
          borderRadius: 0,
          alignment: 'start',
        })
      })
    },
    {
      modifier: Modifier.extendFrom(normalizedMod)
        .setHeight(48)
        .freeze(),
      color: backgroundColor,
      elevation: 0,
      borderRadius: 0,
      alignment: 'start',
    },
  )
}

export { TabRow }
