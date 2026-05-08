type StateId = number
type SnapshotId = number
type ScopeId = number

interface State<T> {
  readonly value: T
}

type MutableState<T> = {
  value: T
  readonly id: StateId
}

interface ReadObserver {
  <T>(state: MutableState<T>): void
}

interface WriteObserver {
  <T>(state: MutableState<T>, value: T): void
}

interface Snapshot {
  readonly id: SnapshotId
  readonly parent: Snapshot | null
  read<T>(state: MutableState<T>): T
  write<T>(state: MutableState<T>, value: T): void
  resolveValue<T>(state: MutableState<T>): T
  takeMutableSnapshot(): MutableSnapshot
  withReadObserver<T>(observer: ReadObserver, fn: () => T): T
  nextStateId(): StateId
  setWriteObserver(observer: WriteObserver | null): void
}

type MutableSnapshot = Snapshot & {
  apply(): ScopeId[]
  dispose(): void
}

type DerivedState<T> = State<T> & {
  readonly dependencies: ReadonlySet<StateId>
  markStale(): void
  addDependency(stateId: StateId): void
}

interface RecomposeScope {
  readonly id: ScopeId
  invalidate(): void
  recompose(): void
  execute(): void
  addDependency(stateId: StateId): void
  addSideEffect(effect: () => void): void
  getRememberCache<T extends object>(guard: (value: object) => value is T): T | null
  setRememberCache<T extends object>(cache: T): void
}

interface Recomposer {
  currentScope: RecomposeScope | null
  pushScope(scope: RecomposeScope): void
  popScope(): void
  scheduleRecompose(scope: RecomposeScope): void
  performRecompose(): void
  createScope(fn: () => void): RecomposeScope
  registerDependency(scopeId: ScopeId, stateId: StateId): void
  invalidateScopesForState(stateId: StateId): void
}

interface ComposerContext {
  readonly snapshot: Snapshot
  readonly recomposer: Recomposer
}

interface ComposableNode {
  readonly kind: string
}

type ComposableFunction<TProps> = (props: TProps, ctx: ComposerContext) => ComposableNode | null

export type {
  StateId,
  SnapshotId,
  ScopeId,
  State,
  MutableState,
  DerivedState,
  ReadObserver,
  WriteObserver,
  Snapshot,
  MutableSnapshot,
  RecomposeScope,
  Recomposer,
  ComposerContext,
  ComposableNode,
  ComposableFunction,
}
