import { Modifier } from '@/layout/modifier'
import type { ReadonlyModifier } from '@/layout/modifier'

function normalizeModifier(source: ReadonlyModifier): ReadonlyModifier {
  return Modifier.extendFrom(source).freeze()
}

export { normalizeModifier }
