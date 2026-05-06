import type { ModifierElement } from '@/layout/modifier'
import type { GestureCallback, DragDirection } from '@/input/gesture-recognizer'
import type { TransformCallback } from '@/input/pinch-recognizer'
import type { PointerInputHandler } from '@/input/pointer-event'
import type { KeyboardEventHandler } from '@/input/keyboard'

type ClickableElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'clickable'
  readonly onClick: GestureCallback
  readonly onLongClick: GestureCallback | null
}

type LongPressableElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'longPressable'
  readonly onLongPress: GestureCallback
}

type DraggableElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'draggable'
  readonly direction: DragDirection
  readonly onDragStart: GestureCallback
  readonly onDrag: GestureCallback
  readonly onDragEnd: GestureCallback
}

type TransformableElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'transformable'
  readonly onTransformStart: TransformCallback
  readonly onTransform: TransformCallback
  readonly onTransformEnd: TransformCallback
}

type ScrollableElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'scrollable'
  readonly direction: DragDirection
  readonly onScroll: GestureCallback
  readonly onFling: GestureCallback | null
}

type PointerInputElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'pointerInput'
  readonly handler: PointerInputHandler
}

type KeyboardInputElement = ModifierElement & {
  readonly kind: 'input'
  readonly name: 'keyboardInput'
  readonly onKeyEvent: KeyboardEventHandler
}


function clickable(
  onClick: GestureCallback,
  onLongClick: GestureCallback | null = null,
): ClickableElement {
  return { kind: 'input', name: 'clickable', onClick, onLongClick }
}


function longPressable(onLongPress: GestureCallback): LongPressableElement {
  return { kind: 'input', name: 'longPressable', onLongPress }
}


function draggable(
  direction: DragDirection,
  onDragStart: GestureCallback,
  onDrag: GestureCallback,
  onDragEnd: GestureCallback,
): DraggableElement {
  return { kind: 'input', name: 'draggable', direction, onDragStart, onDrag, onDragEnd }
}


function transformable(
  onTransformStart: TransformCallback,
  onTransform: TransformCallback,
  onTransformEnd: TransformCallback,
): TransformableElement {
  return { kind: 'input', name: 'transformable', onTransformStart, onTransform, onTransformEnd }
}


function scrollable(
  direction: DragDirection,
  onScroll: GestureCallback,
  onFling: GestureCallback | null = null,
): ScrollableElement {
  return { kind: 'input', name: 'scrollable', direction, onScroll, onFling }
}


function pointerInput(handler: PointerInputHandler): PointerInputElement {
  return { kind: 'input', name: 'pointerInput', handler }
}


function keyboardInputElement(onKeyEvent: KeyboardEventHandler): KeyboardInputElement {
  return { kind: 'input', name: 'keyboardInput', onKeyEvent }
}

export type {
  ClickableElement,
  LongPressableElement,
  DraggableElement,
  TransformableElement,
  ScrollableElement,
  PointerInputElement,
  KeyboardInputElement,
}

export {
  clickable,
  longPressable,
  draggable,
  transformable,
  scrollable,
  pointerInput,
  keyboardInputElement,
}
