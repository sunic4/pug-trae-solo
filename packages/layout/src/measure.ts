import type { Constraints, MeasureResult, Placeable, Measurable } from './types'

class MeasureResultImpl implements MeasureResult {
  readonly width: number
  readonly height: number
  readonly alignmentLines: Map<string, number>

  constructor(width: number, height: number, alignmentLines: Map<string, number> = new Map()) {
    this.width = width
    this.height = height
    this.alignmentLines = alignmentLines
  }
}

class PlaceableImpl implements Placeable {
  readonly measureResult: MeasureResult
  position: { x: number; y: number } = { x: 0, y: 0 }

  constructor(measureResult: MeasureResult) {
    this.measureResult = measureResult
  }

  place(x: number, y: number): void {
    this.position = { x, y }
  }
}

class MeasurableImpl implements Measurable {
  private readonly measureFn: (constraints: Constraints) => MeasureResult

  constructor(measureFn: (constraints: Constraints) => MeasureResult) {
    this.measureFn = measureFn
  }

  measure(constraints: Constraints): Placeable {
    const result = this.measureFn(constraints)
    return new PlaceableImpl(result)
  }
}


function createMeasureResult(
  width: number,
  height: number,
  alignmentLines?: Map<string, number>,
): MeasureResult {
  return new MeasureResultImpl(width, height, alignmentLines)
}


function createMeasurable(measureFn: (constraints: Constraints) => MeasureResult): Measurable {
  return new MeasurableImpl(measureFn)
}

export { MeasureResultImpl, PlaceableImpl, MeasurableImpl, createMeasureResult, createMeasurable }
