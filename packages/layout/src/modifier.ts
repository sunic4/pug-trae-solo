import type { Color } from '@pug-canvas-ui/render'
import type {
  ModifierElement,
  PaddingElement,
  SizeElement,
  WidthElement,
  HeightElement,
  FillMaxSizeElement,
  FillMaxWidthElement,
  FillMaxHeightElement,
  BackgroundElement,
  ClipElement,
  OffsetElement,
  AbsoluteOffsetElement,
  ShadowElement,
  ClickableElement,
  LongPressableElement,
  DraggableElement,
  TransformableElement,
  ScrollableElement,
  PointerInputElement,
  KeyboardInputElement,
  ReadonlyModifier,
} from '@pug-canvas-ui/types'
import type { GestureCallback, DragDirection, TransformCallback, PointerInputHandler, KeyboardEventHandler } from '@pug-canvas-ui/types'

function createPadding(left: number, top: number, right: number, bottom: number): PaddingElement {
  return { kind: 'layout', name: 'padding', left, top, right, bottom }
}

function createSize(width: number, height: number): SizeElement {
  return { kind: 'layout', name: 'size', width, height }
}

function createWidth(value: number): WidthElement {
  return { kind: 'layout', name: 'width', value }
}

function createHeight(value: number): HeightElement {
  return { kind: 'layout', name: 'height', value }
}

function createFillMaxSize(fraction: number): FillMaxSizeElement {
  return { kind: 'layout', name: 'fillMaxSize', fraction }
}

function createFillMaxWidth(fraction: number): FillMaxWidthElement {
  return { kind: 'layout', name: 'fillMaxWidth', fraction }
}

function createFillMaxHeight(fraction: number): FillMaxHeightElement {
  return { kind: 'layout', name: 'fillMaxHeight', fraction }
}

function createBackground(color: Color, borderRadius: number): BackgroundElement {
  return { kind: 'draw', name: 'background', color, borderRadius }
}

function createClip(borderRadius: number): ClipElement {
  return { kind: 'draw', name: 'clip', borderRadius }
}

function createOffset(x: number, y: number): OffsetElement {
  return { kind: 'layout', name: 'offset', x, y }
}

function createAbsoluteOffset(x: number, y: number): AbsoluteOffsetElement {
  return { kind: 'layout', name: 'absoluteOffset', x, y }
}

function createShadow(elevation: number): ShadowElement {
  return { kind: 'draw', name: 'shadow', elevation }
}

class Modifier implements ReadonlyModifier {
  private _elements: ModifierElement[] = []
  private _frozen = false

  static create(): Modifier {
    return new Modifier()
  }

  static extendFrom(base: ReadonlyModifier): Modifier {
    const builder = new Modifier()
    for (let i = 0; i < base.size; i++) {
      builder.then(base.get(i))
    }
    return builder
  }

  then(element: ModifierElement): this {
    if (this._frozen) {
      throw new Error('Cannot modify a frozen Modifier')
    }
    this._elements.push(element)
    return this
  }

  padding(allOrHorizontal: number, vertical?: number): this {
    if (allOrHorizontal < 0 || (vertical !== undefined && vertical < 0)) {
      throw new Error('Padding values must be non-negative')
    }
    if (vertical !== undefined) {
      return this.then(createPadding(allOrHorizontal, vertical, allOrHorizontal, vertical))
    }
    return this.then(createPadding(allOrHorizontal, allOrHorizontal, allOrHorizontal, allOrHorizontal))
  }

  layoutSize(width: number, height: number): this {
    if (width < 0 || height < 0) {
      throw new Error('Size values must be non-negative')
    }
    return this.then(createSize(width, height))
  }

  setWidth(value: number): this {
    if (value < 0) {
      throw new Error('Width value must be non-negative')
    }
    return this.then(createWidth(value))
  }

  setHeight(value: number): this {
    if (value < 0) {
      throw new Error('Height value must be non-negative')
    }
    return this.then(createHeight(value))
  }

  fillMaxSize(fraction: number = 1): this {
    if (fraction <= 0) {
      throw new Error('Fill fraction must be positive')
    }
    return this.then(createFillMaxSize(fraction))
  }

  fillMaxWidth(fraction: number = 1): this {
    if (fraction <= 0) {
      throw new Error('Fill fraction must be positive')
    }
    return this.then(createFillMaxWidth(fraction))
  }

  fillMaxHeight(fraction: number = 1): this {
    if (fraction <= 0) {
      throw new Error('Fill fraction must be positive')
    }
    return this.then(createFillMaxHeight(fraction))
  }

  background(color: Color, borderRadius: number = 0): this {
    if (borderRadius < 0) {
      throw new Error('Border radius must be non-negative')
    }
    return this.then(createBackground(color, borderRadius))
  }

  clip(borderRadius: number): this {
    if (borderRadius < 0) {
      throw new Error('Border radius must be non-negative')
    }
    return this.then(createClip(borderRadius))
  }

  offset(x: number, y: number): this {
    return this.then(createOffset(x, y))
  }

  absoluteOffset(x: number, y: number): this {
    return this.then(createAbsoluteOffset(x, y))
  }

  shadow(elevation: number): this {
    return this.then(createShadow(elevation))
  }

  freeze(): ReadonlyModifier {
    if (!this._frozen) {
      this._frozen = true
      Object.freeze(this._elements)
      Object.freeze(this)
    }
    return this
  }

  get size(): number {
    return this._elements.length
  }

  get(index: number): ModifierElement {
    const element = this._elements[index]
    if (element === undefined) {
      throw new Error(`Modifier index out of bounds: ${index} (size: ${this._elements.length})`)
    }
    return element
  }

  filterByKind(kind: ModifierElement['kind']): ReadonlyModifier {
    const filtered = Modifier.create()
    for (const el of this._elements) {
      if (el.kind === kind) {
        filtered.then(el)
      }
    }
    return filtered.freeze()
  }

  findPadding(): PaddingElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'padding') {
        return el
      }
    }
    return null
  }

  findBackgrounds(): readonly BackgroundElement[] {
    const result: BackgroundElement[] = []
    for (const el of this._elements) {
      if (el.kind === 'draw' && el.name === 'background') {
        result.push(el)
      }
    }
    return result
  }

  findShadows(): readonly ShadowElement[] {
    const result: ShadowElement[] = []
    for (const el of this._elements) {
      if (el.kind === 'draw' && el.name === 'shadow') {
        result.push(el)
      }
    }
    return result
  }

  findSizeElement(): SizeElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'size') {
        return el
      }
    }
    return null
  }

  findWidthElement(): WidthElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'width') {
        return el
      }
    }
    return null
  }

  findHeightElement(): HeightElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'height') {
        return el
      }
    }
    return null
  }

  findFillMaxSizeElement(): FillMaxSizeElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'fillMaxSize') {
        return el
      }
    }
    return null
  }

  findFillMaxWidthElement(): FillMaxWidthElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'fillMaxWidth') {
        return el
      }
    }
    return null
  }

  findFillMaxHeightElement(): FillMaxHeightElement | null {
    for (const el of this._elements) {
      if (el.kind === 'layout' && el.name === 'fillMaxHeight') {
        return el
      }
    }
    return null
  }
}

export type {
  ModifierElement,
  PaddingElement,
  SizeElement,
  WidthElement,
  HeightElement,
  FillMaxSizeElement,
  FillMaxWidthElement,
  FillMaxHeightElement,
  BackgroundElement,
  ClipElement,
  OffsetElement,
  AbsoluteOffsetElement,
  ShadowElement,
  ClickableElement,
  LongPressableElement,
  DraggableElement,
  TransformableElement,
  ScrollableElement,
  PointerInputElement,
  KeyboardInputElement,
  ReadonlyModifier,
}

export { Modifier, createShadow }
