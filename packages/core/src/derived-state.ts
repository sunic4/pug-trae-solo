import type { StateId, DerivedState, Snapshot, MutableState } from './types'

class DerivedStateImpl<T> implements DerivedState<T> {
  private _value!: T
  private _stale = true
  private readonly _compute: () => T
  private readonly _dependencies: Set<StateId> = new Set()
  private readonly _snapshot: Snapshot | null
  private _registered = false

  constructor(compute: () => T, snapshot?: Snapshot) {
    this._compute = compute
    this._snapshot = snapshot ?? null
  }

  get value(): T {
    if (this._stale) {
      this._recompute()
    }
    return this._value
  }

  get dependencies(): ReadonlySet<StateId> {
    return this._dependencies
  }

  markStale(): void {
    this._stale = true
  }

  addDependency(stateId: StateId): void {
    this._dependencies.add(stateId)
  }

  private _recompute(): void {
    this._dependencies.clear()

    if (this._snapshot !== null) {
      const readObserver = <V>(state: MutableState<V>) => {
        this._dependencies.add(state.id)
      }
      this._value = this._snapshot.withReadObserver(readObserver, this._compute)
      this._registerWriteObserver()
    } else {
      this._value = this._compute()
    }

    this._stale = false
  }

  private _registerWriteObserver(): void {
    if (this._registered || this._snapshot === null) return

    const writeObserver = <V>(state: MutableState<V>) => {
      const stateId = state.id
      if (this._dependencies.has(stateId)) {
        this._stale = true
      }
    }

    this._snapshot.setWriteObserver(writeObserver)
    this._registered = true
  }
}

function derivedStateOf<T>(compute: () => T, snapshot?: Snapshot): DerivedState<T> {
  return new DerivedStateImpl(compute, snapshot)
}

export { DerivedStateImpl, derivedStateOf }
