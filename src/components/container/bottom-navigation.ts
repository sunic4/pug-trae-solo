import { Surface } from '@/components/layout/surface'
import { Row } from '@/components/layout/row'
import { Text } from '@/components/basic/text'
import { Modifier, DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { Color, ReadonlyModifier } from '@/components/shared/imports'
import { PrimaryColor } from '@/theme/colors'
import type { SelectableItem } from '@/components/shared/selectable-item'
import type { CompositionContext } from '@/core/composition-context'

type BottomNavOptions = {
  readonly modifier?: ReadonlyModifier
  readonly backgroundColor?: Color
  readonly contentColor?: Color
  readonly selectedItemColor?: Color
}

function BottomNavigation(
  ctx: CompositionContext,
  items: SelectableItem[],
  selectedIndex: number = 0,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  options?: BottomNavOptions,
): void {
  const resolvedOptions: BottomNavOptions = options ?? {}
  const {
    backgroundColor = { r: 255, g: 255, b: 255, a: 1 },
    contentColor = { r: 117, g: 117, b: 117, a: 1 },
    selectedItemColor = PrimaryColor,
  } = resolvedOptions
  const normalizedMod = normalizeModifier(modifier)

  Surface(
    ctx,
    () => {
      Row(ctx, DEFAULT_MODIFIER, 'center', 'center', () => {
        for (const item of items) {
          const color = item.selected ? selectedItemColor : contentColor
          Text(ctx, item.label, DEFAULT_MODIFIER, { fontSize: 12, fontFamily: 'sans-serif', fontWeight: 'normal', color })
        }
      })
    },
    {
      modifier: Modifier.extendFrom(normalizedMod)
        .setHeight(56)
        .freeze(),
      color: backgroundColor,
      elevation: 8,
      borderRadius: 0,
      alignment: 'start',
    },
  )
}

export { BottomNavigation }
