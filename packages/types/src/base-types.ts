interface Point {
  readonly x: number
  readonly y: number
}

interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface Color {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

type PathCommandType = 'moveTo' | 'lineTo' | 'quadraticCurveTo' | 'bezierCurveTo' | 'arcTo' | 'arc' | 'closePath'

interface PathCommand {
  readonly type: PathCommandType
  readonly args: readonly number[]
}

type ChildLayout = {
  readonly nodeId: number
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

type MeasuredSizeMap = Map<number, { readonly width: number; readonly height: number }>

export type { Point, Rect, Color, PathCommandType, PathCommand, ChildLayout, MeasuredSizeMap }
