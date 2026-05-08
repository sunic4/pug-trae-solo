import type { Point } from '@pug-canvas-ui/render'
import type { PointerEventData } from './pointer-event'
import type { GestureState, TransformEvent, TransformCallback } from '@pug-canvas-ui/types'
import { createGestureRecognizerState, computeDistance } from './gesture-recognizer'
import type { GestureRecognizerState } from './gesture-recognizer'

export type { TransformEvent, TransformCallback }

const MIN_SCALE_DISTANCE = 10
const MIN_ROTATION_RADIANS = 0.1

class PinchGestureRecognizer {
  private _stateMachine: GestureRecognizerState
  private _pointer1: { id: number; position: Point } | null = null
  private _pointer2: { id: number; position: Point } | null = null
  private _initialDistance = 0
  private _initialAngle = 0
  readonly eager = false

  onTransformStart: TransformCallback | null = null
  onTransform: TransformCallback | null = null
  onTransformEnd: TransformCallback | null = null
  readonly minScaleDistance: number = MIN_SCALE_DISTANCE

  constructor() {
    this._stateMachine = createGestureRecognizerState()
  }

  get state(): GestureState {
    return this._stateMachine.state
  }

  addPointerEvent(event: PointerEventData): void {
    if (this._stateMachine.disposed) return
    if (this._stateMachine.state === 'failed' || this._stateMachine.state === 'cancelled') return

    switch (event.type) {
      case 'down': {
        this._onDown(event)
        break
      }
      case 'move': {
        this._onMove(event)
        break
      }
      case 'up':
      case 'cancel': {
        this._onUpOrCancel(event)
        break
      }
    }
  }

  reset(): void {
    this._stateMachine.resetState()
    this._pointer1 = null
    this._pointer2 = null
    this._initialDistance = 0
    this._initialAngle = 0
  }

  dispose(): void {
    this._stateMachine.markDisposed()
    this.onTransformStart = null
    this.onTransform = null
    this.onTransformEnd = null
  }

  private _onDown(event: PointerEventData): void {
    if (this._pointer1 === null) {
      this._pointer1 = { id: event.pointerId, position: event.localPosition }
    } else if (this._pointer2 === null && event.pointerId !== this._pointer1.id) {
      this._pointer2 = { id: event.pointerId, position: event.localPosition }
      this._initialDistance = computeDistance(this._pointer1.position, this._pointer2.position)
      this._initialAngle = this._computeAngle(this._pointer1.position, this._pointer2.position)
      this._stateMachine.transitionState('possible')
    }
  }

  private _onMove(event: PointerEventData): void {
    this._updatePointer(event)
    if (this._pointer1 === null || this._pointer2 === null) return

    const currentDistance = computeDistance(this._pointer1.position, this._pointer2.position)
    const scale = this._initialDistance > 0 ? currentDistance / this._initialDistance : 1
    const rotation = this._computeAngle(this._pointer1.position, this._pointer2.position) - this._initialAngle
    const focalPoint = this._computeMidpoint(this._pointer1.position, this._pointer2.position)

    if (this._stateMachine.state === 'possible') {
      const distanceChange = Math.abs(currentDistance - this._initialDistance)
      const rotationChange = Math.abs(rotation)
      if (distanceChange < this.minScaleDistance && rotationChange < MIN_ROTATION_RADIANS) return
      this._stateMachine.transitionState('began')
      if (this.onTransformStart !== null) {
        this.onTransformStart({
          type: 'transformStart',
          state: 'began',
          scale: 1,
          rotation: 0,
          focalPoint,
          pointerIds: [this._pointer1.id, this._pointer2.id],
          timestamp: event.timestamp,
        })
      }
    }

    this._stateMachine.transitionState('changed')
    if (this.onTransform !== null) {
      this.onTransform({
        type: 'transform',
        state: 'changed',
        scale,
        rotation,
        focalPoint,
        pointerIds: [this._pointer1.id, this._pointer2.id],
        timestamp: event.timestamp,
      })
    }
  }

  private _onUpOrCancel(event: PointerEventData): void {
    const isCancel = event.type === 'cancel'
    if (this._pointer1 !== null && event.pointerId === this._pointer1.id) {
      this._pointer1 = null
    }
    if (this._pointer2 !== null && event.pointerId === this._pointer2.id) {
      this._pointer2 = null
    }

    if (this._stateMachine.state === 'began' || this._stateMachine.state === 'changed') {
      if (isCancel) {
        this._stateMachine.transitionState('cancelled')
      } else {
        this._stateMachine.transitionState('ended')
        if (this.onTransformEnd !== null && this._pointer1 !== null && this._pointer2 !== null) {
          const focalPoint = this._computeMidpoint(this._pointer1.position, this._pointer2.position)
          this.onTransformEnd({
            type: 'transformEnd',
            state: 'ended',
            scale: 1,
            rotation: 0,
            focalPoint,
            pointerIds: [this._pointer1.id, this._pointer2.id],
            timestamp: event.timestamp,
          })
        } else if (this.onTransformEnd !== null) {
          this.onTransformEnd({
            type: 'transformEnd',
            state: 'ended',
            scale: 1,
            rotation: 0,
            focalPoint: event.localPosition,
            pointerIds: [event.pointerId, event.pointerId],
            timestamp: event.timestamp,
          })
        }
      }
    } else if (this._stateMachine.state === 'possible' && isCancel) {
      this._stateMachine.transitionState('cancelled')
    }
  }

  private _updatePointer(event: PointerEventData): void {
    if (this._pointer1 !== null && event.pointerId === this._pointer1.id) {
      this._pointer1 = { id: event.pointerId, position: event.localPosition }
    }
    if (this._pointer2 !== null && event.pointerId === this._pointer2.id) {
      this._pointer2 = { id: event.pointerId, position: event.localPosition }
    }
  }

  private _computeAngle(a: Point, b: Point): number {
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  private _computeMidpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }
}


function createPinchRecognizer(): PinchGestureRecognizer {
  return new PinchGestureRecognizer()
}

export { PinchGestureRecognizer, MIN_SCALE_DISTANCE, createPinchRecognizer }
