import { Modifier } from '@pug-canvas-ui/layout'
import type { ReadonlyModifier } from '@pug-canvas-ui/layout'

function normalizeModifier(source: ReadonlyModifier): ReadonlyModifier {
  return Modifier.extendFrom(source).freeze()
}

export { normalizeModifier }
