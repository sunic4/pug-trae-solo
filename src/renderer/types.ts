import type { NinePatchConfig } from '@/renderer/image-loader'

type NodeId = number

type CommandType =
  | 'fillRect'
  | 'strokeRect'
  | 'fillCircle'
  | 'strokeCircle'
  | 'fillText'
  | 'strokeText'
  | 'clipRect'
  | 'save'
  | 'restore'
  | 'setAlpha'
  | 'drawLine'
  | 'fillRoundRect'
  | 'strokeRoundRect'
  | 'fillPath'
  | 'strokePath'
  | 'setBlendMode'
  | 'setShadow'
  | 'drawImage'
  | 'drawNinePatch'
  | 'fillMultilineText'
  | 'batchFill'
  | 'batchStroke'
  | 'batchText'

type PathCommandType =
  | 'moveTo'
  | 'lineTo'
  | 'quadraticCurveTo'
  | 'bezierCurveTo'
  | 'arcTo'
  | 'closePath'

type BlendMode =
  | 'source-over'
  | 'source-atop'
  | 'source-in'
  | 'source-out'
  | 'destination-over'
  | 'destination-atop'
  | 'destination-in'
  | 'destination-out'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'xor'

interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface Point {
  readonly x: number
  readonly y: number
}

interface Color {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

interface FillRectCommand {
  readonly type: 'fillRect'
  readonly rect: Rect
  readonly color: Color
  readonly bounds: Rect
  execute(): void
}

interface StrokeRectCommand {
  readonly type: 'strokeRect'
  readonly rect: Rect
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface FillCircleCommand {
  readonly type: 'fillCircle'
  readonly center: Point
  readonly radius: number
  readonly color: Color
  readonly bounds: Rect
  execute(): void
}

interface StrokeCircleCommand {
  readonly type: 'strokeCircle'
  readonly center: Point
  readonly radius: number
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface FillTextCommand {
  readonly type: 'fillText'
  readonly text: string
  readonly position: Point
  readonly color: Color
  readonly fontSize: number
  readonly bounds: Rect
  execute(): void
}

interface StrokeTextCommand {
  readonly type: 'strokeText'
  readonly text: string
  readonly position: Point
  readonly color: Color
  readonly fontSize: number
  readonly bounds: Rect
  execute(): void
}

interface DrawLineCommand {
  readonly type: 'drawLine'
  readonly start: Point
  readonly end: Point
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface FillRoundRectCommand {
  readonly type: 'fillRoundRect'
  readonly rect: Rect
  readonly radius: number
  readonly color: Color
  readonly bounds: Rect
  execute(): void
}

interface StrokeRoundRectCommand {
  readonly type: 'strokeRoundRect'
  readonly rect: Rect
  readonly radius: number
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface FillPathCommand {
  readonly type: 'fillPath'
  readonly path: VectorPath
  readonly color: Color
  readonly bounds: Rect
  execute(): void
}

interface StrokePathCommand {
  readonly type: 'strokePath'
  readonly path: VectorPath
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface ClipRectCommand {
  readonly type: 'clipRect'
  readonly rect: Rect
  readonly bounds: Rect
  execute(): void
}

interface SaveCommand {
  readonly type: 'save'
  readonly bounds: Rect
  execute(): void
}

interface RestoreCommand {
  readonly type: 'restore'
  readonly bounds: Rect
  execute(): void
}

interface SetAlphaCommand {
  readonly type: 'setAlpha'
  readonly alpha: number
  readonly bounds: Rect
  execute(): void
}

interface SetBlendModeCommand {
  readonly type: 'setBlendMode'
  readonly mode: BlendMode
  readonly bounds: Rect
  execute(): void
}

interface SetShadowCommand {
  readonly type: 'setShadow'
  readonly shadow: Shadow
  readonly bounds: Rect
  execute(): void
}

interface DrawImageCommand {
  readonly type: 'drawImage'
  readonly source: CanvasImageSource
  readonly dest: Rect
  readonly src: Rect | undefined
  readonly bounds: Rect
  execute(): void
}

interface DrawNinePatchCommand {
  readonly type: 'drawNinePatch'
  readonly source: CanvasImageSource
  readonly imageWidth: number
  readonly imageHeight: number
  readonly dest: Rect
  readonly config: NinePatchConfig
  readonly bounds: Rect
  execute(): void
}

interface FillMultilineTextCommand {
  readonly type: 'fillMultilineText'
  readonly layout: TextLayoutResult
  readonly position: Point
  readonly style: TextStyle
  readonly bounds: Rect
  execute(): void
}

interface BatchFillCommand {
  readonly type: 'batchFill'
  readonly commands: ReadonlyArray<DrawCommand>
  readonly color: Color
  readonly bounds: Rect
  execute(): void
}

interface BatchStrokeCommand {
  readonly type: 'batchStroke'
  readonly commands: ReadonlyArray<DrawCommand>
  readonly color: Color
  readonly strokeWidth: number
  readonly bounds: Rect
  execute(): void
}

interface BatchTextCommand {
  readonly type: 'batchText'
  readonly commands: ReadonlyArray<DrawCommand>
  readonly styleStr: string
  readonly bounds: Rect
  execute(): void
}

type DrawCommand =
  | FillRectCommand
  | StrokeRectCommand
  | FillCircleCommand
  | StrokeCircleCommand
  | FillTextCommand
  | StrokeTextCommand
  | DrawLineCommand
  | FillRoundRectCommand
  | StrokeRoundRectCommand
  | FillPathCommand
  | StrokePathCommand
  | ClipRectCommand
  | SaveCommand
  | RestoreCommand
  | SetAlphaCommand
  | SetBlendModeCommand
  | SetShadowCommand
  | DrawImageCommand
  | DrawNinePatchCommand
  | FillMultilineTextCommand
  | BatchFillCommand
  | BatchStrokeCommand
  | BatchTextCommand

interface DrawContext {
  fillStyle: string | CanvasGradient | CanvasPattern
  strokeStyle: string | CanvasGradient | CanvasPattern
  lineWidth: number
  globalAlpha: number
  globalCompositeOperation: GlobalCompositeOperation
  font: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowColor: string
  fillRect(x: number, y: number, width: number, height: number): void
  strokeRect(x: number, y: number, width: number, height: number): void
  clearRect(x: number, y: number, width: number, height: number): void
  beginPath(): void
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void
  fill(fillRule?: CanvasFillRule): void
  stroke(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
  closePath(): void
  rect(x: number, y: number, width: number, height: number): void
  clip(fillRule?: CanvasFillRule): void
  save(): void
  restore(): void
  roundRect(x: number, y: number, width: number, height: number, radii?: number | DOMPointInit | Iterable<number | DOMPointInit>): void
  drawImage(image: CanvasImageSource, dx: number, dy: number): void
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void
  drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void
  fillText(text: string, x: number, y: number, maxWidth?: number): void
  strokeText(text: string, x: number, y: number, maxWidth?: number): void
  measureText(text: string): TextMetrics
  translate(x: number, y: number): void
  scale(x: number, y: number): void
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void
  setLineDash(segments: number[]): void
}

interface Shadow {
  readonly blur: number
  readonly offsetX: number
  readonly offsetY: number
  readonly color: Color
}

interface PathCommand {
  readonly type: PathCommandType
  readonly args: ReadonlyArray<number>
}

interface VectorPath {
  readonly commands: ReadonlyArray<PathCommand>
  readonly bounds: Rect
}

interface DrawScope {
  fillRect(rect: Rect, color: Color): void
  strokeRect(rect: Rect, color: Color, strokeWidth?: number): void
  fillCircle(center: Point, radius: number, color: Color): void
  strokeCircle(center: Point, radius: number, color: Color, strokeWidth?: number): void
  fillText(text: string, position: Point, color: Color, fontSize?: number): void
  drawLine(start: Point, end: Point, color: Color, strokeWidth?: number): void
  fillRoundRect(rect: Rect, radius: number, color: Color): void
  strokeRoundRect(rect: Rect, radius: number, color: Color, strokeWidth?: number): void
  fillPath(path: VectorPath, color: Color): void
  strokePath(path: VectorPath, color: Color, strokeWidth?: number): void
  setAlpha(alpha: number): void
  setBlendMode(mode: BlendMode): void
  setShadow(shadow: Shadow): void
  drawMultilineText(layout: TextLayoutResult, position: Point, style: TextStyle): void
  drawImage(source: CanvasImageSource, dest: Rect, src?: Rect): void
  drawNinePatch(source: CanvasImageSource, imageWidth: number, imageHeight: number, dest: Rect, config: NinePatchConfig): void
  save(): void
  restore(): void
  getCommands(): DrawCommand[]
}

interface CanvasHost {
  readonly canvas: HTMLCanvasElement
  readonly ctx: DrawContext
  render(commands: DrawCommand[]): void
  renderLayers(root: LayerNode): void
  clear(): void
  dispose(): void
  setBatchEnabled(enabled: boolean): void
}

interface LayerNode {
  readonly id: NodeId
  parent: LayerNode | null
  children: LayerNode[]
  cachedCommands: DrawCommand[]
  dirty: boolean
  bounds: Rect
  markDirty(): void
  markClean(): void
  updateCommands(commands: DrawCommand[]): void
  addChild(child: LayerNode): void
  removeChild(child: LayerNode): void
}

interface LayerTree {
  root: LayerNode | null
  insert(parent: LayerNode | null, node: LayerNode): void
  remove(node: LayerNode): void
  collectDirty(): LayerNode[]
}

interface DirtyRegion {
  readonly rects: ReadonlyArray<Rect>
  add(rect: Rect): void
  merge(): Rect
  clear(): void
  isEmpty(): boolean
}

interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  color: Color
  lineHeight?: number
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right'
  maxLines?: number
  overflow?: 'clip' | 'ellipsis'
}

interface TextLine {
  readonly text: string
  readonly x: number
  readonly y: number
  readonly width: number
}

interface TextLayoutResult {
  readonly lines: ReadonlyArray<TextLine>
  readonly width: number
  readonly height: number
  readonly didOverflow: boolean
}

interface TextMeasurer {
  measure(text: string, style: TextStyle, maxWidth?: number): TextLayoutResult
}

function colorToString(c: Color): string {
  return `rgba(${c.r},${c.g},${c.b},${c.a})`
}

function rectBounds(rect: Rect): Rect {
  return rect
}

function circleBounds(center: Point, radius: number): Rect {
  return {
    x: center.x - radius,
    y: center.y - radius,
    width: radius * 2,
    height: radius * 2,
  }
}

function lineBounds(start: Point, end: Point, strokeWidth: number): Rect {
  const halfStroke = strokeWidth / 2
  return {
    x: Math.min(start.x, end.x) - halfStroke,
    y: Math.min(start.y, end.y) - halfStroke,
    width: Math.abs(end.x - start.x) + strokeWidth,
    height: Math.abs(end.y - start.y) + strokeWidth,
  }
}

export type {
  NodeId,
  CommandType,
  PathCommandType,
  BlendMode,
  Rect,
  Point,
  Color,
  DrawContext,
  Shadow,
  PathCommand,
  VectorPath,
  DrawCommand,
  FillRectCommand,
  StrokeRectCommand,
  FillCircleCommand,
  StrokeCircleCommand,
  FillTextCommand,
  StrokeTextCommand,
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
  BatchFillCommand,
  BatchStrokeCommand,
  BatchTextCommand,
  DrawScope,
  CanvasHost,
  LayerNode,
  LayerTree,
  DirtyRegion,
  TextStyle,
  TextLine,
  TextLayoutResult,
  TextMeasurer,
}

export {
  colorToString,
  rectBounds,
  circleBounds,
  lineBounds,
}
