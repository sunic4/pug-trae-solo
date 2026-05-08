import type { ChildLayout, MeasuredSizeMap } from '@pug-canvas-ui/render'
import type { Rect } from '@pug-canvas-ui/render'
import type { Alignment, Arrangement } from '@pug-canvas-ui/layout'
import { alignOffset } from '@pug-canvas-ui/layout'

type LayoutDirection = 'horizontal' | 'vertical'

interface LinearLayoutParams {
  childIds: readonly number[]
  contentArea: Rect
  measuredSizes: MeasuredSizeMap
  direction: LayoutDirection
  arrangement: Arrangement
  alignment: Alignment
  defaultChildWidth: number
  defaultChildHeight: number
}

function linearLayoutChildren(params: LinearLayoutParams): ChildLayout[] {
  const { childIds, contentArea, measuredSizes, direction, arrangement, alignment, defaultChildWidth, defaultChildHeight } = params
  if (childIds.length === 0) return []

  const isHorizontal = direction === 'horizontal'
  const mainContent = isHorizontal ? contentArea.width : contentArea.height
  const crossContent = isHorizontal ? contentArea.height : contentArea.width

  const layouts: ChildLayout[] = []
  const sizes = childIds.map(id => measuredSizes.get(id) ?? { width: defaultChildWidth, height: defaultChildHeight })
  const totalMain = sizes.reduce((sum, s) => sum + (isHorizontal ? s.width : s.height), 0)
  const remaining = Math.max(0, mainContent - totalMain)

  let mainOffset = 0
  if (arrangement === 'center') {
    mainOffset = remaining / 2
  } else if (arrangement === 'end') {
    mainOffset = remaining
  }

  const spacing = arrangement === 'spaceBetween' && childIds.length > 1
    ? remaining / (childIds.length - 1)
    : 0

  for (let i = 0; i < childIds.length; i++) {
    const childId = childIds[i]!
    const size = sizes[i]!
    const childMain = isHorizontal ? size.width : size.height
    const childCross = isHorizontal ? size.height : size.width

    const crossOffset = alignOffset(alignment, crossContent, childCross)

    const mainPos = isHorizontal
      ? { x: contentArea.x + mainOffset, y: contentArea.y + crossOffset }
      : { x: contentArea.x + crossOffset, y: contentArea.y + mainOffset }

    layouts.push({
      nodeId: childId,
      x: mainPos.x,
      y: mainPos.y,
      width: size.width,
      height: size.height,
    })

    mainOffset += childMain
    if (arrangement === 'spaceBetween' && i < childIds.length - 1) {
      mainOffset += spacing
    }
  }

  return layouts
}

function layoutColumnChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  return linearLayoutChildren({
    childIds,
    contentArea,
    measuredSizes,
    direction: 'vertical',
    arrangement,
    alignment,
    defaultChildWidth: contentArea.width,
    defaultChildHeight: 48,
  })
}

function layoutRowChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  return linearLayoutChildren({
    childIds,
    contentArea,
    measuredSizes,
    direction: 'horizontal',
    arrangement,
    alignment,
    defaultChildWidth: 48,
    defaultChildHeight: contentArea.height,
  })
}

function layoutBoxChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  alignment: Alignment,
): ChildLayout[] {
  return childIds.map(childId => {
    const size = measuredSizes.get(childId) ?? { width: contentArea.width, height: contentArea.height }
    const x = contentArea.x + alignOffset(alignment, contentArea.width, size.width)
    const y = contentArea.y + alignOffset(alignment, contentArea.height, size.height)
    return { nodeId: childId, x, y, width: size.width, height: size.height }
  })
}

export { linearLayoutChildren, layoutColumnChildren, layoutRowChildren, layoutBoxChildren }
