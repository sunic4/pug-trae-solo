import type {
  StateId,
  SnapshotId,
  ScopeId,
  MutableState,
  ReadObserver,
  WriteObserver,
  Snapshot,
  MutableSnapshot,
} from '@/core/types'
import type { IdGenerator } from '@/core/id-generator'
import { createIdGenerator } from '@/core/id-generator'
import { MutableStateImpl } from '@/core/state'

const MAX_DEPTH = 5

function createSnapshotIdGenerator(): () => SnapshotId {
  let nextId: SnapshotId = 0
  return () => nextId++
}

const nextSnapshotId = createSnapshotIdGenerator()

interface StateWriteAction {
  applyTo(snapshot: Snapshot): void
}

interface SnapshotStore {
  hasValue(stateId: StateId): boolean
  getValue<T>(state: MutableState<T>): T | undefined
  setValue<T>(stateId: StateId, state: MutableState<T>, value: T): void
  getWriteActions(): StateWriteAction[]
  readObserver: ReadObserver | null
  writeObserver: WriteObserver | null
  stateIdGenerator: IdGenerator
  clear(): void
}

function createSnapshotStore(snapshotId: SnapshotId, stateIdGenerator?: IdGenerator): SnapshotStore {
  const overriddenStates = new Set<StateId>()
  const cleanupFunctions: Array<() => void> = []
  const writeActions: StateWriteAction[] = []

  return {
    readObserver: null,
    writeObserver: null,
    stateIdGenerator: stateIdGenerator ?? createIdGenerator(),

    hasValue(stateId: StateId): boolean {
      return overriddenStates.has(stateId)
    },

    getValue<T>(state: MutableState<T>): T | undefined {
      if (!overriddenStates.has(state.id)) return undefined
      if (state instanceof MutableStateImpl) {
        return state.getOverride(snapshotId)
      }
      return undefined
    },

    setValue<T>(stateId: StateId, state: MutableState<T>, value: T): void {
      overriddenStates.add(stateId)
      if (state instanceof MutableStateImpl) {
        state.setOverride(snapshotId, value)
        cleanupFunctions.push(() => state.clearOverride(snapshotId))
      }
      const capturedState = state
      const capturedValue = value
      writeActions.push({
        applyTo(snapshot: Snapshot): void {
          snapshot.write(capturedState, capturedValue)
        },
      })
    },

    getWriteActions(): StateWriteAction[] {
      return writeActions
    },

    clear(): void {
      for (const cleanup of cleanupFunctions) {
        cleanup()
      }
      overriddenStates.clear()
      cleanupFunctions.length = 0
      writeActions.length = 0
      this.readObserver = null
      this.writeObserver = null
    },
  }
}

interface SnapshotOperations {
  resolveValue<T>(state: MutableState<T>): T
  read<T>(state: MutableState<T>): T
  write<T>(state: MutableState<T>, value: T): void
  withReadObserver<T>(observer: ReadObserver, fn: () => T): T
  setWriteObserver(observer: WriteObserver | null): void
  nextStateId(): StateId
}

function createSnapshotOperations(store: SnapshotStore, parent: Snapshot | null): SnapshotOperations {
  function resolveValueFromStore<T>(state: MutableState<T>): T {
    const stateId = state.id
    if (store.hasValue(stateId)) {
      return store.getValue(state) ?? state.value
    }
    if (parent) {
      return parent.resolveValue(state)
    }
    if (state instanceof MutableStateImpl) {
      return state.readRaw()
    }
    return state.value
  }

  return {
    resolveValue: resolveValueFromStore,

    read<T>(state: MutableState<T>): T {
      if (store.readObserver) {
        store.readObserver(state)
      }
      return resolveValueFromStore(state)
    },

    write<T>(state: MutableState<T>, value: T): void {
      const stateId = state.id
      store.setValue(stateId, state, value)
      if (store.writeObserver) {
        store.writeObserver(state, value)
      }
    },

    withReadObserver<T>(observer: ReadObserver, fn: () => T): T {
      const prev = store.readObserver
      store.readObserver = observer
      try {
        return fn()
      } finally {
        store.readObserver = prev
      }
    },

    setWriteObserver(observer: WriteObserver | null): void {
      store.writeObserver = observer
    },

    nextStateId(): StateId {
      return store.stateIdGenerator.nextId()
    },
  }
}

function computeNestingDepth(parent: Snapshot | null): number {
  let depth = 0
  let current = parent
  while (current) {
    depth++
    current = current.parent
  }
  return depth
}

class SnapshotImpl implements Snapshot {
  readonly id: SnapshotId
  readonly parent: Snapshot | null
  private readonly _ops: SnapshotOperations

  constructor(parent: Snapshot | null, id?: SnapshotId, stateIdGenerator?: IdGenerator, sharedStore?: SnapshotStore) {
    this.id = id ?? nextSnapshotId()
    this.parent = parent
    const store = sharedStore ?? createSnapshotStore(this.id, stateIdGenerator)
    this._ops = createSnapshotOperations(store, parent)
  }

  resolveValue<T>(state: MutableState<T>): T {
    return this._ops.resolveValue(state)
  }

  read<T>(state: MutableState<T>): T {
    return this._ops.read(state)
  }

  write<T>(state: MutableState<T>, value: T): void {
    this._ops.write(state, value)
  }

  takeMutableSnapshot(): MutableSnapshot {
    const depth = computeNestingDepth(this)
    if (depth >= MAX_DEPTH) {
      throw new Error(`Snapshot nesting depth exceeds maximum of ${MAX_DEPTH}`)
    }
    return new MutableSnapshotImpl(this)
  }

  withReadObserver<T>(observer: ReadObserver, fn: () => T): T {
    return this._ops.withReadObserver(observer, fn)
  }

  setWriteObserver(observer: WriteObserver | null): void {
    this._ops.setWriteObserver(observer)
  }

  nextStateId(): StateId {
    return this._ops.nextStateId()
  }
}

class MutableSnapshotImpl implements MutableSnapshot {
  private readonly _inner: SnapshotImpl
  private readonly _store: SnapshotStore
  private _affectedScopes: Set<ScopeId>
  private _disposed: boolean

  constructor(parent: Snapshot) {
    const snapshotId = nextSnapshotId()
    this._store = createSnapshotStore(snapshotId)
    this._inner = new SnapshotImpl(parent, snapshotId, undefined, this._store)
    this._affectedScopes = new Set()
    this._disposed = false
  }

  get id(): SnapshotId {
    return this._inner.id
  }

  get parent(): Snapshot | null {
    return this._inner.parent
  }

  resolveValue<T>(state: MutableState<T>): T {
    return this._inner.resolveValue(state)
  }

  addAffectedScope(id: ScopeId): void {
    if (!this._disposed) {
      this._affectedScopes.add(id)
    }
  }

  read<T>(state: MutableState<T>): T {
    return this._inner.read(state)
  }

  write<T>(state: MutableState<T>, value: T): void {
    if (this._disposed) {
      throw new Error('Cannot write to a disposed snapshot')
    }
    this._inner.write(state, value)
  }

  takeMutableSnapshot(): MutableSnapshot {
    if (this._disposed) {
      throw new Error('Cannot take mutable snapshot from a disposed snapshot')
    }
    return this._inner.takeMutableSnapshot()
  }

  withReadObserver<T>(observer: ReadObserver, fn: () => T): T {
    return this._inner.withReadObserver(observer, fn)
  }

  setWriteObserver(observer: WriteObserver | null): void {
    this._inner.setWriteObserver(observer)
  }

  nextStateId(): StateId {
    return this._inner.nextStateId()
  }

  apply(): ScopeId[] {
    if (this._disposed) {
      throw new Error('Cannot apply a disposed snapshot')
    }
    if (this.parent) {
      const actions = this._store.getWriteActions()
      for (const action of actions) {
        action.applyTo(this.parent)
      }
    }
    this._disposed = true
    return [...this._affectedScopes]
  }

  dispose(): void {
    this._store.clear()
    this._affectedScopes.clear()
    this._disposed = true
  }
}

function createSnapshot(): Snapshot {
  return new SnapshotImpl(null)
}

export { SnapshotImpl, MutableSnapshotImpl, createSnapshot }
