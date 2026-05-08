import type { Color } from './base-types'
import type { GestureCallback, DragDirection } from './gesture-types'
import type { TransformCallback } from './transform-types'
import type { PointerInputHandler } from './pointer-types'
import type { KeyboardEventHandler } from './keyboard-types'
import type { Rect, ChildLayout, MeasuredSizeMap } from './base-types'

type PaddingElement = {
  readonly kind: 'layout'
  readonly name: 'padding'
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

type SizeElement = {
  readonly kind: 'layout'
  readonly name: 'size'
  readonly width: number
  readonly height: number
}

type WidthElement = {
  readonly kind: 'layout'
  readonly name: 'width'
  readonly value: number
}

type HeightElement = {
  readonly kind: 'layout'
  readonly name: 'height'
  readonly value: number
}

type FillMaxSizeElement = {
  readonly kind: 'layout'
  readonly name: 'fillMaxSize'
  readonly fraction: number
}

type FillMaxWidthElement = {
  readonly kind: 'layout'
  readonly name: 'fillMaxWidth'
  readonly fraction: number
}

type FillMaxHeightElement = {
  readonly kind: 'layout'
  readonly name: 'fillMaxHeight'
  readonly fraction: number
}

type BackgroundElement = {
  readonly kind: 'draw'
  readonly name: 'background'
  readonly color: Color
  readonly borderRadius: number
}

type ClipElement = {
  readonly kind: 'draw'
  readonly name: 'clip'
  readonly borderRadius: number
}

type OffsetElement = {
  readonly kind: 'layout'
  readonly name: 'offset'
  readonly x: number
  readonly y: number
}

type AbsoluteOffsetElement = {
  readonly kind: 'layout'
  readonly name: 'absoluteOffset'
  readonly x: number
  readonly y: number
}

type ShadowElement = {
  readonly kind: 'draw'
  readonly name: 'shadow'
  readonly elevation: number
}

type ClickableElement = {
  readonly kind: 'input'
  readonly name: 'clickable'
  readonly onClick: GestureCallback
  readonly onLongClick: GestureCallback | null
}

type LongPressableElement = {
  readonly kind: 'input'
  readonly name: 'longPressable'
  readonly onLongPress: GestureCallback
}

type DraggableElement = {
  readonly kind: 'input'
  readonly name: 'draggable'
  readonly direction: DragDirection
  readonly onDragStart: GestureCallback
  readonly onDrag: GestureCallback
  readonly onDragEnd: GestureCallback
}

type TransformableElement = {
  readonly kind: 'input'
  readonly name: 'transformable'
  readonly onTransformStart: TransformCallback
  readonly onTransform: TransformCallback
  readonly onTransformEnd: TransformCallback
}

type ScrollableElement = {
  readonly kind: 'input'
  readonly name: 'scrollable'
  readonly direction: DragDirection
  readonly onScroll: GestureCallback
  readonly onFling: GestureCallback | null
}

type PointerInputElement = {
  readonly kind: 'input'
  readonly name: 'pointerInput'
  readonly handler: PointerInputHandler
}

type KeyboardInputElement = {
  readonly kind: 'input'
  readonly name: 'keyboardInput'
  readonly onKeyEvent: KeyboardEventHandler
}

type ModifierElement =
  | PaddingElement
  | SizeElement
  | WidthElement
  | HeightElement
  | FillMaxSizeElement
  | FillMaxWidthElement
  | FillMaxHeightElement
  | BackgroundElement
  | ClipElement
  | OffsetElement
  | AbsoluteOffsetElement
  | ShadowElement
  | ClickableElement
  | LongPressableElement
  | DraggableElement
  | TransformableElement
  | ScrollableElement
  | PointerInputElement
  | KeyboardInputElement

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
  LayoutChildrenFn,
}
