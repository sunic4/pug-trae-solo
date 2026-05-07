import type {
  Rect,
  Point,
  Color,
  DrawContext,
  DrawCommand,
  VectorPath,
  BlendMode,
  Shadow,
  TextLayoutResult,
  TextStyle,
  FillRectCommand,
  StrokeRectCommand,
  FillCircleCommand,
  StrokeCircleCommand,
  FillTextCommand,
  DrawLineCommand,
  FillRoundRectCommand,
  StrokeRoundRectCommand,
  FillPathCommand,
  StrokePathCommand,
  ClipRectCommand,
  SaveCommand,
  RestoreCommand,
  SetAlphaCommand,
  SetBlendModeCommand,
  SetShadowCommand,
  DrawImageCommand,
  DrawNinePatchCommand,
  FillMultilineTextCommand,
} from '@/renderer/types'
import type { NinePatchConfig, NinePatchRegion } from '@/renderer/image-loader'
import { computeNinePatchRegions, computeNinePatchDestRegions } from '@/renderer/image-loader'
import {
  colorToString,
  rectBounds,
  circleBounds,
  lineBounds,
} from '@/renderer/types'
import { textPixelWidth } from '@/components/shared/constants'

const EMPTY_BOUNDS: Readonly<Rect> = Object.freeze({ x: 0, y: 0, width: 0, height: 0 })

const NINE_PATCH_REGION_KEYS = [
  'topLeft', 'topCenter', 'topRight',
  'middleLeft', 'middleCenter', 'middleRight',
  'bottomLeft', 'bottomCenter', 'bottomRight',
] satisfies readonly (keyof NinePatchRegion)[]

function requireNonNegative(value: number, name: string): void {
  if (value < 0) {
    throw new Error(`${name} must be non-negative, got ${value}`)
  }
}

function requirePositive(value: number, name: string): void {
  if (value <= 0) {
    throw new Error(`${name} must be positive, got ${value}`)
  }
}

function requireAlphaRange(value: number): void {
  if (value < 0 || value > 1) {
    throw new Error(`alpha must be between 0 and 1, got ${value}`)
  }
}

function executePathCommands(ctx: DrawContext, path: VectorPath): void {
  ctx.beginPath()
  for (const cmd of path.commands) {
    const a = cmd.args
    switch (cmd.type) {
      case 'moveTo':
        ctx.moveTo(a[0]!, a[1]!)
        break
      case 'lineTo':
        ctx.lineTo(a[0]!, a[1]!)
        break
      case 'quadraticCurveTo':
        ctx.quadraticCurveTo(a[0]!, a[1]!, a[2]!, a[3]!)
        break
      case 'bezierCurveTo':
        ctx.bezierCurveTo(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, a[5]!)
        break
      case 'arcTo':
        ctx.arcTo(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!)
        break
      case 'arc':
        ctx.arc(a[0]!, a[1]!, a[2]!, a[3]!, a[4]!, a[5] !== 0)
        break
      case 'closePath':
        ctx.closePath()
        break
    }
  }
}

function createFillRect(ctx: DrawContext, rect: Rect, color: Color): FillRectCommand {
  return {
    type: 'fillRect',
    rect,
    color,
    bounds: rectBounds(rect),
    execute(): void {
      ctx.fillStyle = colorToString(color)
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    },
  }
}

function createStrokeRect(ctx: DrawContext, rect: Rect, color: Color, strokeWidth: number = 1): StrokeRectCommand {
  requireNonNegative(strokeWidth, 'strokeWidth')
  return {
    type: 'strokeRect',
    rect,
    color,
    strokeWidth,
    bounds: rectBounds(rect),
    execute(): void {
      ctx.strokeStyle = colorToString(color)
      ctx.lineWidth = strokeWidth
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    },
  }
}

function createFillCircle(ctx: DrawContext, center: Point, radius: number, color: Color): FillCircleCommand {
  requireNonNegative(radius, 'radius')
  return {
    type: 'fillCircle',
    center,
    radius,
    color,
    bounds: circleBounds(center, radius),
    execute(): void {
      ctx.fillStyle = colorToString(color)
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
      ctx.fill()
    },
  }
}

function createStrokeCircle(ctx: DrawContext, center: Point, radius: number, color: Color, strokeWidth: number = 1): StrokeCircleCommand {
  requireNonNegative(radius, 'radius')
  requireNonNegative(strokeWidth, 'strokeWidth')
  return {
    type: 'strokeCircle',
    center,
    radius,
    color,
    strokeWidth,
    bounds: circleBounds(center, radius),
    execute(): void {
      ctx.strokeStyle = colorToString(color)
      ctx.lineWidth = strokeWidth
      ctx.beginPath()
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
      ctx.stroke()
    },
  }
}

function createFillText(ctx: DrawContext, text: string, position: Point, color: Color, fontSize: number = 14): FillTextCommand {
  requirePositive(fontSize, 'fontSize')
  return {
    type: 'fillText',
    text,
    position,
    color,
    fontSize,
    bounds: { x: position.x, y: position.y, width: textPixelWidth(text, fontSize), height: fontSize },
    execute(): void {
      ctx.fillStyle = colorToString(color)
      ctx.font = `${fontSize}px sans-serif`
      ctx.fillText(text, position.x, position.y)
    },
  }
}

function createDrawLine(ctx: DrawContext, start: Point, end: Point, color: Color, strokeWidth: number = 1): DrawLineCommand {
  requireNonNegative(strokeWidth, 'strokeWidth')
  return {
    type: 'drawLine',
    start,
    end,
    color,
    strokeWidth,
    bounds: lineBounds(start, end, strokeWidth),
    execute(): void {
      ctx.strokeStyle = colorToString(color)
      ctx.lineWidth = strokeWidth
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    },
  }
}

function createFillRoundRect(ctx: DrawContext, rect: Rect, radius: number, color: Color): FillRoundRectCommand {
  requireNonNegative(radius, 'radius')
  return {
    type: 'fillRoundRect',
    rect,
    radius,
    color,
    bounds: rectBounds(rect),
    execute(): void {
      ctx.fillStyle = colorToString(color)
      ctx.beginPath()
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius)
      ctx.fill()
    },
  }
}

function createStrokeRoundRect(ctx: DrawContext, rect: Rect, radius: number, color: Color, strokeWidth: number = 1): StrokeRoundRectCommand {
  requireNonNegative(radius, 'radius')
  requireNonNegative(strokeWidth, 'strokeWidth')
  return {
    type: 'strokeRoundRect',
    rect,
    radius,
    color,
    strokeWidth,
    bounds: rectBounds(rect),
    execute(): void {
      ctx.strokeStyle = colorToString(color)
      ctx.lineWidth = strokeWidth
      ctx.beginPath()
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius)
      ctx.stroke()
    },
  }
}

function createClipRect(ctx: DrawContext, rect: Rect): ClipRectCommand {
  return {
    type: 'clipRect',
    rect,
    bounds: rectBounds(rect),
    execute(): void {
      ctx.beginPath()
      ctx.rect(rect.x, rect.y, rect.width, rect.height)
      ctx.clip()
    },
  }
}

function createSave(ctx: DrawContext): SaveCommand {
  return {
    type: 'save',
    bounds: EMPTY_BOUNDS,
    execute(): void { ctx.save() },
  }
}

function createRestore(ctx: DrawContext): RestoreCommand {
  return {
    type: 'restore',
    bounds: EMPTY_BOUNDS,
    execute(): void { ctx.restore() },
  }
}

function createSetAlpha(ctx: DrawContext, alpha: number): SetAlphaCommand {
  requireAlphaRange(alpha)
  return {
    type: 'setAlpha',
    alpha,
    bounds: EMPTY_BOUNDS,
    execute(): void { ctx.globalAlpha = alpha },
  }
}

function createFillPath(ctx: DrawContext, path: VectorPath, color: Color): FillPathCommand {
  return {
    type: 'fillPath',
    path,
    color,
    bounds: path.bounds,
    execute(): void {
      ctx.fillStyle = colorToString(color)
      executePathCommands(ctx, path)
      ctx.fill()
    },
  }
}

function createStrokePath(ctx: DrawContext, path: VectorPath, color: Color, strokeWidth: number = 1): StrokePathCommand {
  requireNonNegative(strokeWidth, 'strokeWidth')
  return {
    type: 'strokePath',
    path,
    color,
    strokeWidth,
    bounds: path.bounds,
    execute(): void {
      ctx.strokeStyle = colorToString(color)
      ctx.lineWidth = strokeWidth
      executePathCommands(ctx, path)
      ctx.stroke()
    },
  }
}

function createSetBlendMode(ctx: DrawContext, mode: BlendMode): SetBlendModeCommand {
  return {
    type: 'setBlendMode',
    mode,
    bounds: EMPTY_BOUNDS,
    execute(): void { ctx.globalCompositeOperation = mode },
  }
}

function createSetShadow(ctx: DrawContext, shadow: Shadow): SetShadowCommand {
  return {
    type: 'setShadow',
    shadow,
    bounds: EMPTY_BOUNDS,
    execute(): void {
      ctx.shadowBlur = shadow.blur
      ctx.shadowOffsetX = shadow.offsetX
      ctx.shadowOffsetY = shadow.offsetY
      ctx.shadowColor = colorToString(shadow.color)
    },
  }
}

function createDrawImage(
  ctx: DrawContext,
  source: CanvasImageSource,
  dest: Rect,
  src?: Rect,
): DrawImageCommand {
  return {
    type: 'drawImage',
    source,
    dest,
    src: src ?? undefined,
    bounds: rectBounds(dest),
    execute(): void {
      if (src !== undefined) {
        ctx.drawImage(source, src.x, src.y, src.width, src.height, dest.x, dest.y, dest.width, dest.height)
      } else {
        ctx.drawImage(source, dest.x, dest.y, dest.width, dest.height)
      }
    },
  }
}

function createDrawNinePatch(
  ctx: DrawContext,
  source: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  dest: Rect,
  config: NinePatchConfig,
): DrawNinePatchCommand {
  return {
    type: 'drawNinePatch',
    source,
    imageWidth,
    imageHeight,
    dest,
    config,
    bounds: rectBounds(dest),
    execute(): void {
      const srcRegions = computeNinePatchRegions(imageWidth, imageHeight, config, dest.width, dest.height)
      const dstRegions = computeNinePatchDestRegions(dest.width, dest.height, config)
      for (const key of NINE_PATCH_REGION_KEYS) {
        const s = srcRegions[key]
        const d = dstRegions[key]
        if (d.width <= 0 || d.height <= 0) continue
        const dx = dest.x + d.x
        const dy = dest.y + d.y
        ctx.drawImage(source, s.x, s.y, s.width, s.height, dx, dy, d.width, d.height)
      }
    },
  }
}

function createDrawMultilineText(
  ctx: DrawContext,
  layout: TextLayoutResult,
  position: Point,
  style: TextStyle,
): FillMultilineTextCommand {
  return {
    type: 'fillMultilineText',
    layout,
    position,
    style,
    bounds: { x: position.x, y: position.y, width: layout.width, height: layout.height },
    execute(): void {
      ctx.fillStyle = colorToString(style.color)
      ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
      for (const line of layout.lines) {
        ctx.fillText(line.text, position.x + line.x, position.y + line.y + style.fontSize)
      }
    },
  }
}

export { executePathCommands }

export {
  createFillRect,
  createStrokeRect,
  createFillCircle,
  createStrokeCircle,
  createFillText,
  createDrawLine,
  createFillRoundRect,
  createStrokeRoundRect,
  createClipRect,
  createSave,
  createRestore,
  createSetAlpha,
  createFillPath,
  createStrokePath,
  createSetBlendMode,
  createSetShadow,
  createDrawMultilineText,
  createDrawImage,
  createDrawNinePatch,
}
