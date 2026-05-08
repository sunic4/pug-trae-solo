import type { StateId, MutableState, Snapshot, SnapshotId } from './types'
import type { CompositionContext } from './composition-context'
import { remember } from './remember'

class MutableStateImpl<T> implements MutableState<T> {
  private _value: T
  private readonly _id: StateId
  private readonly _snapshot: Snapshot
  private _overrides = new Map<SnapshotId, T>()

  constructor(initialValue: T, snapshot: Snapshot) {
    this._value = initialValue
    this._id = snapshot.nextStateId()
    this._snapshot = snapshot
  }

  get id(): StateId {
    return this._id
  }

  get value(): T {
    this._snapshot.read(this)
    return this._value
  }

  set value(newValue: T) {
    if (Object.is(this._value, newValue)) return
    this._value = newValue
    this._snapshot.write(this, newValue)
  }

  readRaw(): T {
    return this._value
  }

  writeRaw(newValue: T): void {
    this._value = newValue
  }

  getOverride(snapshotId: SnapshotId): T | undefined {
    return this._overrides.get(snapshotId)
  }

  setOverride(snapshotId: SnapshotId, value: T): void {
    this._overrides.set(snapshotId, value)
  }

  clearOverride(snapshotId: SnapshotId): void {
    this._overrides.delete(snapshotId)
  }
}

function mutableStateOf<T>(initialValue: T, snapshot: Snapshot): MutableState<T> {
  return new MutableStateImpl(initialValue, snapshot)
}

function useState<T>(ctx: CompositionContext, initialValue: T): MutableState<T> {
  return remember(ctx, () => mutableStateOf(initialValue, ctx.snapshot))
}

export { MutableStateImpl, mutableStateOf, useState }
