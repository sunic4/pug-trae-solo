import type { Rect, Point, Color, DrawContext, DrawCommand, DrawScope, VectorPath, BlendMode, Shadow, TextLayoutResult, TextStyle } from './types'
import type { NinePatchConfig } from './image-loader'
import {
  createFillRect,
  createStrokeRect,
  createFillCircle,
  createStrokeCircle,
  createFillText,
  createDrawLine,
  createFillRoundRect,
  createStrokeRoundRect,
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
} from './draw-command'

class DrawScopeImpl implements DrawScope {
  private _commands: DrawCommand[] = []
  private _ctx: DrawContext

  constructor(ctx: DrawContext) {
    this._ctx = ctx
  }

  fillRect(rect: Rect, color: Color): void {
    this._commands.push(createFillRect(this._ctx, rect, color))
  }

  strokeRect(rect: Rect, color: Color, strokeWidth?: number): void {
    this._commands.push(createStrokeRect(this._ctx, rect, color, strokeWidth))
  }

  fillCircle(center: Point, radius: number, color: Color): void {
    this._commands.push(createFillCircle(this._ctx, center, radius, color))
  }

  strokeCircle(center: Point, radius: number, color: Color, strokeWidth?: number): void {
    this._commands.push(createStrokeCircle(this._ctx, center, radius, color, strokeWidth))
  }

  fillText(text: string, position: Point, color: Color, fontSize?: number): void {
    this._commands.push(createFillText(this._ctx, text, position, color, fontSize))
  }

  drawLine(start: Point, end: Point, color: Color, strokeWidth?: number): void {
    this._commands.push(createDrawLine(this._ctx, start, end, color, strokeWidth))
  }

  fillRoundRect(rect: Rect, radius: number, color: Color): void {
    this._commands.push(createFillRoundRect(this._ctx, rect, radius, color))
  }

  strokeRoundRect(rect: Rect, radius: number, color: Color, strokeWidth?: number): void {
    this._commands.push(createStrokeRoundRect(this._ctx, rect, radius, color, strokeWidth))
  }

  fillPath(path: VectorPath, color: Color): void {
    this._commands.push(createFillPath(this._ctx, path, color))
  }

  strokePath(path: VectorPath, color: Color, strokeWidth?: number): void {
    this._commands.push(createStrokePath(this._ctx, path, color, strokeWidth))
  }

  setAlpha(alpha: number): void {
    this._commands.push(createSetAlpha(this._ctx, alpha))
  }

  setBlendMode(mode: BlendMode): void {
    this._commands.push(createSetBlendMode(this._ctx, mode))
  }

  setShadow(shadow: Shadow): void {
    this._commands.push(createSetShadow(this._ctx, shadow))
  }

  drawMultilineText(layout: TextLayoutResult, position: Point, style: TextStyle): void {
    this._commands.push(createDrawMultilineText(this._ctx, layout, position, style))
  }

  drawImage(source: CanvasImageSource, dest: Rect, src?: Rect): void {
    this._commands.push(createDrawImage(this._ctx, source, dest, src))
  }

  drawNinePatch(source: CanvasImageSource, imageWidth: number, imageHeight: number, dest: Rect, config: NinePatchConfig): void {
    this._commands.push(createDrawNinePatch(this._ctx, source, imageWidth, imageHeight, dest, config))
  }

  save(): void {
    this._commands.push(createSave(this._ctx))
  }

  restore(): void {
    this._commands.push(createRestore(this._ctx))
  }

  getCommands(): DrawCommand[] {
    return this._commands.slice()
  }
}


function createDrawScope(ctx: DrawContext): DrawScope {
  return new DrawScopeImpl(ctx)
}

export { DrawScopeImpl, createDrawScope }
