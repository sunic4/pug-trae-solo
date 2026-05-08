import type { PathCommand, Rect, VectorPath } from './types'

class VectorPathImpl implements VectorPath {
  readonly commands: ReadonlyArray<PathCommand>
  readonly bounds: Rect

  constructor(commands: ReadonlyArray<PathCommand>, bounds: Rect) {
    this.commands = commands
    this.bounds = bounds
  }
}

class VectorPathBuilder {
  private _commands: PathCommand[] = []
  private _minX = Infinity
  private _minY = Infinity
  private _maxX = -Infinity
  private _maxY = -Infinity
  private _currentX = 0
  private _currentY = 0

  moveTo(x: number, y: number): VectorPathBuilder {
    this._commands.push({ type: 'moveTo', args: [x, y] })
    this._currentX = x
    this._currentY = y
    this._updateBounds(x, y)
    return this
  }

  lineTo(x: number, y: number): VectorPathBuilder {
    this._commands.push({ type: 'lineTo', args: [x, y] })
    this._currentX = x
    this._currentY = y
    this._updateBounds(x, y)
    return this
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): VectorPathBuilder {
    this._commands.push({ type: 'quadraticCurveTo', args: [cpx, cpy, x, y] })
    this._updateBounds(cpx, cpy)
    this._currentX = x
    this._currentY = y
    this._updateBounds(x, y)
    return this
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): VectorPathBuilder {
    this._commands.push({ type: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] })
    this._updateBounds(cp1x, cp1y)
    this._updateBounds(cp2x, cp2y)
    this._currentX = x
    this._currentY = y
    this._updateBounds(x, y)
    return this
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): VectorPathBuilder {
    this._commands.push({ type: 'arcTo', args: [x1, y1, x2, y2, radius] })
    this._updateBounds(x1, y1)
    this._updateBounds(x2, y2)
    this._currentX = x2
    this._currentY = y2
    return this
  }

  closePath(): VectorPathBuilder {
    this._commands.push({ type: 'closePath', args: [] })
    return this
  }

  build(): VectorPath {
    const commands: ReadonlyArray<PathCommand> = [...this._commands]
    const bounds: Rect = this._commands.length === 0
      ? { x: 0, y: 0, width: 0, height: 0 }
      : {
          x: this._minX,
          y: this._minY,
          width: this._maxX - this._minX,
          height: this._maxY - this._minY,
        }
    this._commands = []
    this._minX = Infinity
    this._minY = Infinity
    this._maxX = -Infinity
    this._maxY = -Infinity
    return new VectorPathImpl(commands, bounds)
  }

  private _updateBounds(x: number, y: number): void {
    if (x < this._minX) this._minX = x
    if (y < this._minY) this._minY = y
    if (x > this._maxX) this._maxX = x
    if (y > this._maxY) this._maxY = y
  }
}


function createVectorPathBuilder(): VectorPathBuilder {
  return new VectorPathBuilder()
}

export { VectorPathImpl, VectorPathBuilder, createVectorPathBuilder }
