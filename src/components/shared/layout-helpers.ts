import type { ComponentNode, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { Alignment, Arrangement } from '@/layout/types'

function layoutColumnChildren(
  children: readonly ComponentNode[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  if (children.length === 0) return []

  const layouts: ChildLayout[] = []
  const sizes = children.map(c => measuredSizes.get(c) ?? { width: contentArea.width, height: 48 })
  const totalHeight = sizes.reduce((sum, s) => sum + s.height, 0)
  const remaining = Math.max(0, contentArea.height - totalHeight)

  let yOffset = 0
  if (arrangement === 'center') {
    yOffset = remaining / 2
  } else if (arrangement === 'end') {
    yOffset = remaining
  }

  const spacing = arrangement === 'spaceBetween' && children.length > 1
    ? remaining / (children.length - 1)
    : 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i]!
    const size = sizes[i]!
    let x = contentArea.x
    if (alignment === 'center') {
      x = contentArea.x + (contentArea.width - size.width) / 2
    } else if (alignment === 'end') {
      x = contentArea.x + contentArea.width - size.width
    }
    layouts.push({
      node: child,
      x,
      y: contentArea.y + yOffset,
      width: size.width,
      height: size.height,
    })
    yOffset += size.height
    if (arrangement === 'spaceBetween' && i < children.length - 1) {
      yOffset += spacing
    }
  }

  return layouts
}

function layoutRowChildren(
  children: readonly ComponentNode[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  arrangement: Arrangement,
  alignment: Alignment = 'start',
): ChildLayout[] {
  if (children.length === 0) return []

  const layouts: ChildLayout[] = []
  const sizes = children.map(c => measuredSizes.get(c) ?? { width: 48, height: contentArea.height })
  const totalWidth = sizes.reduce((sum, s) => sum + s.width, 0)
  const remaining = Math.max(0, contentArea.width - totalWidth)

  let xOffset = 0
  if (arrangement === 'center') {
    xOffset = remaining / 2
  } else if (arrangement === 'end') {
    xOffset = remaining
  }

  const spacing = arrangement === 'spaceBetween' && children.length > 1
    ? remaining / (children.length - 1)
    : 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i]!
    const size = sizes[i]!
    let y = contentArea.y
    if (alignment === 'center') {
      y = contentArea.y + (contentArea.height - size.height) / 2
    } else if (alignment === 'end') {
      y = contentArea.y + contentArea.height - size.height
    }
    layouts.push({
      node: child,
      x: contentArea.x + xOffset,
      y,
      width: size.width,
      height: size.height,
    })
    xOffset += size.width
    if (arrangement === 'spaceBetween' && i < children.length - 1) {
      xOffset += spacing
    }
  }

  return layouts
}

function layoutBoxChildren(
  children: readonly ComponentNode[],
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  alignment: Alignment,
): ChildLayout[] {
  return children.map(child => {
    const size = measuredSizes.get(child) ?? { width: contentArea.width, height: contentArea.height }
    let x = contentArea.x
    let y = contentArea.y

    if (alignment === 'center') {
      x = contentArea.x + (contentArea.width - size.width) / 2
      y = contentArea.y + (contentArea.height - size.height) / 2
    } else if (alignment === 'end') {
      x = contentArea.x + contentArea.width - size.width
      y = contentArea.y + contentArea.height - size.height
    }

    return { node: child, x, y, width: size.width, height: size.height }
  })
}

export { layoutColumnChildren, layoutRowChildren, layoutBoxChildren }
