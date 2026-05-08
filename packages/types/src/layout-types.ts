import type { Rect, ChildLayout, MeasuredSizeMap } from './base-types'

interface ModifierElement {
  readonly kind: string
  readonly name: string
}

interface PaddingElement {
  readonly kind: string
  readonly name: string
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

interface BackgroundElement {
  readonly kind: string
  readonly name: string
  readonly color: { readonly r: number; readonly g: number; readonly b: number; readonly a: number }
  readonly borderRadius: number
}

interface ShadowElement {
  readonly kind: string
  readonly name: string
  readonly elevation: number
}

interface SizeElement {
  readonly kind: string
  readonly name: string
  readonly width: number
  readonly height: number
}

interface WidthElement {
  readonly kind: string
  readonly name: string
  readonly value: number
}

interface HeightElement {
  readonly kind: string
  readonly name: string
  readonly value: number
}

interface FillMaxSizeElement {
  readonly kind: string
  readonly name: string
  readonly fraction: number
}

interface FillMaxWidthElement {
  readonly kind: string
  readonly name: string
  readonly fraction: number
}

interface FillMaxHeightElement {
  readonly kind: string
  readonly name: string
  readonly fraction: number
}

interface ReadonlyModifier {
  readonly size: number
  get(index: number): ModifierElement
  filterByKind(kind: ModifierElement['kind']): ReadonlyModifier
  findPadding(): PaddingElement | null
  findBackgrounds(): readonly BackgroundElement[]
  findShadows(): readonly ShadowElement[]
  findSizeElement(): SizeElement | null
  findWidthElement(): WidthElement | null
  findHeightElement(): HeightElement | null
  findFillMaxSizeElement(): FillMaxSizeElement | null
  findFillMaxWidthElement(): FillMaxWidthElement | null
  findFillMaxHeightElement(): FillMaxHeightElement | null
}

type LayoutChildrenFn = (
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  childrenIds: readonly number[],
) => ChildLayout[]

export type {
  ModifierElement,
  PaddingElement,
  BackgroundElement,
  ShadowElement,
  SizeElement,
  WidthElement,
  HeightElement,
  FillMaxSizeElement,
  FillMaxWidthElement,
  FillMaxHeightElement,
  ReadonlyModifier,
  LayoutChildrenFn,
}
