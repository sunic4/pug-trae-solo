import type {
  ClickableElement,
  LongPressableElement,
  DraggableElement,
  TransformableElement,
  ScrollableElement,
  PointerInputElement,
  KeyboardInputElement,
} from '@/layout/modifier'
import type { GestureCallback, DragDirection } from '@/input/gesture-recognizer'
import type { TransformCallback } from '@/input/pinch-recognizer'
import type { PointerInputHandler } from '@/input/pointer-event'
import type { KeyboardEventHandler } from '@/input/keyboard'

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
