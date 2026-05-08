import { Modifier } from '@pug-canvas-ui/layout'
import type { ReadonlyModifier } from '@pug-canvas-ui/layout'

export { NOOP_DRAW_POLICY } from '@pug-canvas-ui/render'
export { DEFAULT_MODIFIER } from './constants'
export { defaultTextStyle, LINE_HEIGHT_RATIO, DEFAULT_FONT_SIZE, textPixelWidth } from '@pug-canvas-ui/render'
export { PrimaryColor, OnPrimaryColor } from '@pug-canvas-ui/theme'
export { Modifier, createShadow } from '@pug-canvas-ui/layout'
export type { ReadonlyModifier } from '@pug-canvas-ui/layout'
export type { Color } from '@pug-canvas-ui/render'
export type { MeasurePolicy, Measurable, Constraints, MeasureResult } from '@pug-canvas-ui/layout'
export { constrainWidth, constrainHeight } from '@pug-canvas-ui/layout'
export { createMeasureResult } from '@pug-canvas-ui/layout'
export { createMeasurePolicy } from '@pug-canvas-ui/layout'
export { ConstrainedMeasurePolicy, SquareMeasurePolicy, BoxAlignmentMeasurePolicy } from './measure-policies'
export { LinearMeasurePolicy } from '@pug-canvas-ui/layout'

function normalizeModifier(source: ReadonlyModifier): ReadonlyModifier {
  return Modifier.extendFrom(source).freeze()
}

export { normalizeModifier }
