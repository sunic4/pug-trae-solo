import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { MeasurePolicy, Measurable, Constraints, MeasureResult } from '@/layout/types'
import { DEFAULT_MODIFIER, normalizeModifier } from '@/components/shared/imports'
import type { ReadonlyModifier } from '@/layout/modifier'
import { createMeasureResult } from '@/layout/measure'
import { constrainWidth, constrainHeight } from '@/layout/constraints'
import { createMeasurePolicy } from '@/layout/simple-measure-policy'
import { NOOP_DRAW_POLICY } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { CompositionContext } from '@/core/composition-context'

type LazyDirection = 'vertical' | 'horizontal'

interface LazyItemInfo {
  readonly index: number
  readonly key: string
  readonly offset: number
  readonly size: number
}

function lazyLayoutMeasurePolicy(
  direction: LazyDirection,
  itemCount: number,
  itemSize: number | null,
  spacing: number,
  contentPadding: number,
  firstVisibleItemIndex: number,
  firstVisibleItemScrollOffset: number,
): MeasurePolicy {
  return createMeasurePolicy({
    measure(measurables: Measurable[], constraints: Constraints): MeasureResult {
      const isVertical = direction === 'vertical'
      const itemDim = itemSize ?? 48
      const totalSpacing = itemCount > 1 ? (itemCount - 1) * spacing : 0
      const totalContentDim = itemCount * itemDim + totalSpacing + contentPadding * 2

      const visibleStart = firstVisibleItemIndex * (itemDim + spacing) - firstVisibleItemScrollOffset + contentPadding
      const viewportDim = isVertical ? constraints.maxHeight : constraints.maxWidth
      const visibleEnd = visibleStart + viewportDim

      for (let i = 0; i < itemCount; i++) {
        const itemStart = i * (itemDim + spacing) + contentPadding
        const itemEnd = itemStart + itemDim

        if (itemEnd > visibleStart && itemStart < visibleEnd) {
          const measurableIdx = i - firstVisibleItemIndex
          if (measurableIdx >= 0 && measurableIdx < measurables.length) {
            const childConstraints: Constraints = itemSize !== null
              ? isVertical
                ? { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: itemDim, maxHeight: itemDim }
                : { minWidth: itemDim, maxWidth: itemDim, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
              : isVertical
                ? { minWidth: constraints.minWidth, maxWidth: constraints.maxWidth, minHeight: 0, maxHeight: itemDim }
                : { minWidth: 0, maxWidth: itemDim, minHeight: constraints.minHeight, maxHeight: constraints.maxHeight }
            const m = measurables[measurableIdx]!
            m.measure(childConstraints)
          }
        }
      }

      if (isVertical) {
        const width = constrainWidth(constraints, constraints.maxWidth)
        const height = constrainHeight(constraints, Math.min(totalContentDim, constraints.maxHeight))
        return createMeasureResult(width, height)
      } else {
        const width = constrainWidth(constraints, Math.min(totalContentDim, constraints.maxWidth))
        const height = constrainHeight(constraints, constraints.maxHeight)
        return createMeasureResult(width, height)
      }
    },
    minIntrinsicWidth(measurables: Measurable[]): number {
      if (direction === 'horizontal') {
        const itemDim = itemSize ?? 48
        const totalSpacing = itemCount > 1 ? (itemCount - 1) * spacing : 0
        return itemCount * itemDim + totalSpacing + contentPadding * 2
      }
      if (measurables.length === 0) return 0
      let maxWidth = 0
      for (const m of measurables) {
        const placeable = m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity })
        if (placeable.measureResult.width > maxWidth) maxWidth = placeable.measureResult.width
      }
      return maxWidth
    },
    minIntrinsicHeight(measurables: Measurable[]): number {
      if (direction === 'vertical') {
        const itemDim = itemSize ?? 48
        const totalSpacing = itemCount > 1 ? (itemCount - 1) * spacing : 0
        return itemCount * itemDim + totalSpacing + contentPadding * 2
      }
      if (measurables.length === 0) return 0
      let maxHeight = 0
      for (const m of measurables) {
        const placeable = m.measure({ minWidth: 0, maxWidth: Infinity, minHeight: 0, maxHeight: Infinity })
        if (placeable.measureResult.height > maxHeight) maxHeight = placeable.measureResult.height
      }
      return maxHeight
    },
  })
}

function computeVisibleItems(
  direction: LazyDirection,
  itemCount: number,
  itemSize: number | null,
  spacing: number,
  contentPadding: number,
  firstVisibleItemIndex: number,
  firstVisibleItemScrollOffset: number,
  viewportDim: number,
  keyPrefix: string,
): LazyItemInfo[] {
  const itemDim = itemSize ?? 48
  const items: LazyItemInfo[] = []
  let offset = contentPadding

  for (let i = 0; i < itemCount; i++) {
    const itemStart = offset - firstVisibleItemScrollOffset
    const itemEnd = itemStart + itemDim

    if (itemEnd > 0 && itemStart < viewportDim) {
      items.push({
        index: i,
        key: `${keyPrefix}-${i}`,
        offset: itemStart,
        size: itemDim,
      })
    }
    offset += itemDim + spacing
  }

  return items
}

function LazyColumn(
  ctx: CompositionContext,
  itemCount: number,
  itemFn?: (index: number) => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  itemSize: number | null = null,
  spacing: number = 0,
  contentPadding: number = 0,
  firstVisibleItemIndex: number = 0,
  firstVisibleItemScrollOffset: number = 0,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = lazyLayoutMeasurePolicy(
    'vertical', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset,
  )
  ctx.emitNode(
    { kind: 'LazyColumn', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
  )
  if (itemFn) {
    const visibleItems = computeVisibleItems(
      'vertical', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset, 600, 'lazy-column-item',
    )
    for (const item of visibleItems) {
      itemFn(item.index)
    }
  }
  ctx.endGroup()
}

function LazyRow(
  ctx: CompositionContext,
  itemCount: number,
  itemFn?: (index: number) => void,
  modifier: ReadonlyModifier = DEFAULT_MODIFIER,
  itemSize: number | null = null,
  spacing: number = 0,
  contentPadding: number = 0,
  firstVisibleItemIndex: number = 0,
  firstVisibleItemScrollOffset: number = 0,
): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = lazyLayoutMeasurePolicy(
    'horizontal', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset,
  )
  ctx.emitNode(
    { kind: 'LazyRow', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset },
    mod,
    measurePolicy,
    NOOP_DRAW_POLICY,
  )
  if (itemFn) {
    const visibleItems = computeVisibleItems(
      'horizontal', itemCount, itemSize, spacing, contentPadding, firstVisibleItemIndex, firstVisibleItemScrollOffset, 360, 'lazy-row-item',
    )
    for (const item of visibleItems) {
      itemFn(item.index)
    }
  }
  ctx.endGroup()
}

export type { LazyItemInfo }
export { LazyColumn, LazyRow, lazyLayoutMeasurePolicy as LazyLayoutMeasurePolicy, computeVisibleItems }
