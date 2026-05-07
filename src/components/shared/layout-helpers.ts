import type { ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { Alignment, Arrangement } from '@/layout/types'

function layoutColumnChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  if (childIds.length === 0) return []

  const layouts: ChildLayout[] = []
  const sizes = childIds.map(id => measuredSizes.get(id) ?? { width: contentArea.width, height: 48 })
  const totalHeight = sizes.reduce((sum, s) => sum + s.height, 0)
  const remaining = Math.max(0, contentArea.height - totalHeight)

  let yOffset = 0
  if (arrangement === 'center') {
    yOffset = remaining / 2
  } else if (arrangement === 'end') {
    yOffset = remaining
  }

  const spacing = arrangement === 'spaceBetween' && childIds.length > 1
    ? remaining / (childIds.length - 1)
    : 0

  for (let i = 0; i < childIds.length; i++) {
    const childId = childIds[i]!
    const size = sizes[i]!
    let x = contentArea.x
    if (alignment === 'center') {
      x = contentArea.x + (contentArea.width - size.width) / 2
    } else if (alignment === 'end') {
      x = contentArea.x + contentArea.width - size.width
    }
    layouts.push({
      nodeId: childId,
      x,
      y: contentArea.y + yOffset,
      width: size.width,
      height: size.height,
    })
    yOffset += size.height
    if (arrangement === 'spaceBetween' && i < childIds.length - 1) {
      yOffset += spacing
    }
  }

  return layouts
}

function layoutRowChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  if (childIds.length === 0) return []

  const layouts: ChildLayout[] = []
  const sizes = childIds.map(id => measuredSizes.get(id) ?? { width: 48, height: contentArea.height })
  const totalWidth = sizes.reduce((sum, s) => sum + s.width, 0)
  const remaining = Math.max(0, contentArea.width - totalWidth)

  let xOffset = 0
  if (arrangement === 'center') {
    xOffset = remaining / 2
  } else if (arrangement === 'end') {
    xOffset = remaining
  }

  const spacing = arrangement === 'spaceBetween' && childIds.length > 1
    ? remaining / (childIds.length - 1)
    : 0

  for (let i = 0; i < childIds.length; i++) {
    const childId = childIds[i]!
    const size = sizes[i]!
    let y = contentArea.y
    if (alignment === 'center') {
      y = contentArea.y + (contentArea.height - size.height) / 2
    } else if (alignment === 'end') {
      y = contentArea.y + contentArea.height - size.height
    }
    layouts.push({
      nodeId: childId,
      x: contentArea.x + xOffset,
      y,
      width: size.width,
      height: size.height,
    })
    xOffset += size.width
    if (arrangement === 'spaceBetween' && i < childIds.length - 1) {
      xOffset += spacing
    }
  }

  return layouts
}

function layoutBoxChildren(
  childIds: readonly number[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  alignment: Alignment,
): ChildLayout[] {
  return childIds.map(childId => {
    const size = measuredSizes.get(childId) ?? { width: contentArea.width, height: contentArea.height }
    let x = contentArea.x
    let y = contentArea.y

    if (alignment === 'center') {
      x = contentArea.x + (contentArea.width - size.width) / 2
      y = contentArea.y + (contentArea.height - size.height) / 2
    } else if (alignment === 'end') {
      x = contentArea.x + contentArea.width - size.width
      y = contentArea.y + contentArea.height - size.height
    }

    return { nodeId: childId, x, y, width: size.width, height: size.height }
  })
}

export { layoutColumnChildren, layoutRowChildren, layoutBoxChildren }
