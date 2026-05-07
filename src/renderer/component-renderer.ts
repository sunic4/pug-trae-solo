import type { DrawContext, DrawCommand, DrawScope, Rect } from '@/renderer/types'
import { createDrawScope } from '@/renderer/draw-scope'
import type { ComponentNode, DrawPolicy, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import { NOOP_DRAW_POLICY } from '@/components/basic/types'
import type { Constraints } from '@/layout/types'
import { createMeasurable, createMeasureResult } from '@/layout/measure'
import type { ReadonlyModifier, FillMaxSizeElement, FillMaxWidthElement, FillMaxHeightElement, SizeElement, WidthElement, HeightElement } from '@/layout/modifier'

function extractPadding(modifier: ReadonlyModifier): { left: number; top: number; right: number; bottom: number } {
  const p = modifier.findPadding()
  if (p === null) return { left: 0, top: 0, right: 0, bottom: 0 }
  return { left: p.left, top: p.top, right: p.right, bottom: p.bottom }
}

function applyDrawModifiers(scope: DrawScope, modifier: ReadonlyModifier, bounds: Rect): void {
  const shadows = modifier.findShadows()
  for (const s of shadows) {
    scope.setShadow({
      blur: s.elevation * 2,
      offsetX: 0,
      offsetY: s.elevation / 2,
      color: { r: 0, g: 0, b: 0, a: Math.min(0.3, s.elevation * 0.04) },
    })
  }
  const backgrounds = modifier.findBackgrounds()
  for (const bg of backgrounds) {
    if (bg.borderRadius > 0) {
      scope.fillRoundRect(bounds, bg.borderRadius, bg.color)
    } else {
      scope.fillRect(bounds, bg.color)
    }
  }
  if (shadows.length > 0) {
    scope.setShadow({ blur: 0, offsetX: 0, offsetY: 0, color: { r: 0, g: 0, b: 0, a: 0 } })
  }
}

function subtractPadding(bounds: Rect, padding: { left: number; top: number; right: number; bottom: number }): Rect {
  return {
    x: bounds.x + padding.left,
    y: bounds.y + padding.top,
    width: Math.max(0, bounds.width - padding.left - padding.right),
    height: Math.max(0, bounds.height - padding.top - padding.bottom),
  }
}

function applySizeModifiers(
  modifier: ReadonlyModifier,
  measured: { width: number; height: number },
  availableWidth: number,
  availableHeight: number,
): { width: number; height: number } {
  let result = { width: measured.width, height: measured.height }

  for (let i = 0; i < modifier.size; i++) {
    const el = modifier.get(i)
    if (el.kind !== 'layout') continue

    if (el.name === 'size') {
      const sizeEl = el as SizeElement
      result.width = sizeEl.width
      result.height = sizeEl.height
    } else if (el.name === 'width') {
      const widthEl = el as WidthElement
      result.width = widthEl.value
    } else if (el.name === 'height') {
      const heightEl = el as HeightElement
      result.height = heightEl.value
    } else if (el.name === 'fillMaxSize') {
      const fraction = (el as FillMaxSizeElement).fraction
      result.width = Math.max(result.width, availableWidth * fraction)
      result.height = Math.max(result.height, availableHeight * fraction)
    } else if (el.name === 'fillMaxWidth') {
      const fraction = (el as FillMaxWidthElement).fraction
      result.width = Math.max(result.width, availableWidth * fraction)
    } else if (el.name === 'fillMaxHeight') {
      const fraction = (el as FillMaxHeightElement).fraction
      result.height = Math.max(result.height, availableHeight * fraction)
    }
  }

  return result
}

function measureNode(
  node: ComponentNode,
  constraints: Constraints,
  measuredSizes: MeasuredSizeMap,
): { width: number; height: number } {
  const padding = extractPadding(node.modifier)

  const children = node.getChildren()
  const childMeasurables = children.map(child =>
    createMeasurable((childConstraints) => {
      const result = measureNode(child, childConstraints, measuredSizes)
      return createMeasureResult(result.width, result.height)
    }),
  )

  // Adjust constraints for padding
  const adjustedConstraints: Constraints = {
    minWidth: Math.max(0, constraints.minWidth - padding.left - padding.right),
    maxWidth: Math.max(0, constraints.maxWidth - padding.left - padding.right),
    minHeight: Math.max(0, constraints.minHeight - padding.top - padding.bottom),
    maxHeight: Math.max(0, constraints.maxHeight - padding.top - padding.bottom),
  }

  const result = node.measurePolicy.measure(childMeasurables, adjustedConstraints)

  // Add padding back to measured size
  const finalWidth = result.width + padding.left + padding.right
  const finalHeight = result.height + padding.top + padding.bottom

  measuredSizes.set(node, { width: finalWidth, height: finalHeight })
  return { width: finalWidth, height: finalHeight }
}

function renderNode(
  scope: DrawScope,
  node: ComponentNode,
  x: number,
  y: number,
  availableWidth: number,
  availableHeight: number,
  measuredSizes: MeasuredSizeMap,
): { width: number; height: number } {
  const constraints: Constraints = {
    minWidth: 0,
    maxWidth: availableWidth,
    minHeight: 0,
    maxHeight: availableHeight,
  }
  const measured = measureNode(node, constraints, measuredSizes)
  const size = applySizeModifiers(node.modifier, measured, availableWidth, availableHeight)
  measuredSizes.set(node, size)

  const bounds: Rect = { x, y, width: size.width, height: size.height }

  scope.save()
  applyDrawModifiers(scope, node.modifier, bounds)
  node.drawPolicy(scope, bounds)

  const padding = extractPadding(node.modifier)
  const contentArea = subtractPadding(bounds, padding)

  // Use the component's own layoutChildren method (which is already correctly implemented!)
  const childLayouts = node.layoutChildren(contentArea, measuredSizes)
  for (const cl of childLayouts) {
    renderNode(scope, cl.node, cl.x, cl.y, cl.width, cl.height, measuredSizes)
  }

  scope.restore()

  return size
}

function renderComponentTree(
  ctx: DrawContext,
  root: ComponentNode,
  width: number,
  height: number,
): DrawCommand[] {
  const scope = createDrawScope(ctx)
  const measuredSizes: MeasuredSizeMap = new Map()
  renderNode(scope, root, 0, 0, width, height, measuredSizes)
  return scope.getCommands()
}

export { renderComponentTree, NOOP_DRAW_POLICY }
