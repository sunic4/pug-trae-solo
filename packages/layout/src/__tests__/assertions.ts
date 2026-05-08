import type { ModifierElement, PaddingElement, FillMaxSizeElement, BackgroundElement, ReadonlyModifier } from '../modifier'

function assertPaddingElement(el: ModifierElement): asserts el is PaddingElement {
  if (el.kind !== 'layout' || el.name !== 'padding') {
    throw new Error(`Expected PaddingElement, got ${el.kind}/${el.name}`)
  }
}

function assertFillMaxSizeElement(el: ModifierElement): asserts el is FillMaxSizeElement {
  if (el.kind !== 'layout' || el.name !== 'fillMaxSize') {
    throw new Error(`Expected FillMaxSizeElement, got ${el.kind}/${el.name}`)
  }
}

function assertBackgroundElement(el: ModifierElement): asserts el is BackgroundElement {
  if (el.kind !== 'draw' || el.name !== 'background') {
    throw new Error(`Expected BackgroundElement, got ${el.kind}/${el.name}`)
  }
}

function hasModifierElement(modifier: ReadonlyModifier, kind: ModifierElement['kind'], name: string): boolean {
  const elements = modifier.filterByKind(kind)
  for (let i = 0; i < elements.size; i++) {
    if (elements.get(i).name === name) return true
  }
  return false
}

export { assertPaddingElement, assertFillMaxSizeElement, assertBackgroundElement, hasModifierElement }
