import type { ScopeId, StateId, RecomposeScope, Recomposer } from './types'
import type { RememberKey } from './remember'

class RecomposeScopeImpl implements RecomposeScope {
  readonly id: ScopeId
  private readonly _composeFunction: () => void
  private readonly _recomposer: Recomposer
  private _invalidated = false
  private readonly _dependencies: Set<StateId> = new Set()
  private _rememberCache: object | null = null
  private _rememberCacheInitialized = false
  private _sideEffects: Array<() => void> = []
  private _lastInputs: readonly RememberKey[] | null = null

  constructor(id: ScopeId, fn: () => void, recomposer: Recomposer) {
    this.id = id
    this._composeFunction = fn
    this._recomposer = recomposer
  }

  invalidate(): void {
    this._invalidated = true
    this._recomposer.scheduleRecompose(this)
  }

  recompose(): void {
    if (!this._invalidated) return
    this._invalidated = false
    this._sideEffects = []
    try {
      this._composeFunction()
    } catch (error) {
      this._sideEffects = []
      throw error
    }
    const effects = this._sideEffects
    this._sideEffects = []
    const errors: Error[] = []
    for (const effect of effects) {
      try {
        effect()
      } catch (effectError) {
        errors.push(effectError instanceof Error ? effectError : new Error(String(effectError)))
      }
    }
    if (errors.length > 0) {
      throw errors.length === 1
        ? errors[0]
        : new AggregateError(errors, 'Multiple side effects failed during recomposition')
    }
  }

  execute(): void {
    this._invalidated = true
    this.recompose()
  }

  addDependency(stateId: StateId): void {
    this._dependencies.add(stateId)
    this._recomposer.registerDependency(this.id, stateId)
  }

  getRememberCache<T extends object>(guard: (value: object) => value is T): T | null {
    if (!this._rememberCacheInitialized || this._rememberCache === null) return null
    const cached = this._rememberCache
    return guard(cached) ? cached : null
  }

  setRememberCache<T extends object>(cache: T): void {
    this._rememberCache = cache
    this._rememberCacheInitialized = true
  }

  addSideEffect(effect: () => void): void {
    this._sideEffects.push(effect)
  }

  inputsUnchanged(inputs: readonly RememberKey[]): boolean {
    if (this._lastInputs === null) {
      this._lastInputs = inputs
      return false
    }
    const prev = this._lastInputs
    if (inputs.length !== prev.length) {
      this._lastInputs = inputs
      return false
    }
    const skip = inputs.every((input, i) => input === prev[i])
    this._lastInputs = inputs
    return skip
  }
}

class RecomposerImpl implements Recomposer {
  private readonly _scopeStack: RecomposeScopeImpl[] = []
  private readonly _pendingScopes: Set<ScopeId> = new Set()
  private readonly _scopeMap: Map<ScopeId, RecomposeScopeImpl> = new Map()
  private readonly _nextId: () => ScopeId
  private readonly _stateToScopes: Map<StateId, Set<ScopeId>> = new Map()

  constructor(nextId: () => ScopeId) {
    this._nextId = nextId
  }

  get currentScope(): RecomposeScope | null {
    if (this._scopeStack.length === 0) return null
    return this._scopeStack[this._scopeStack.length - 1] ?? null
  }

  pushScope(scope: RecomposeScope): void {
    for (const existing of this._scopeStack) {
      if (existing.id === scope.id) {
        throw new Error(`Circular recomposition detected: scope ${scope.id} is already on the stack`)
      }
    }
    if (!(scope instanceof RecomposeScopeImpl)) {
      throw new Error('Recomposer.pushScope only accepts RecomposeScopeImpl instances')
    }
    this._scopeStack.push(scope)
  }

  popScope(): void {
    if (this._scopeStack.length === 0) {
      throw new Error('Cannot pop from empty scope stack')
    }
    this._scopeStack.pop()
  }

  scheduleRecompose(scope: RecomposeScope): void {
    this._pendingScopes.add(scope.id)
  }

  performRecompose(): void {
    const pending = [...this._pendingScopes]
    this._pendingScopes.clear()
    const errors: Error[] = []
    for (const scopeId of pending) {
      const scope = this._scopeMap.get(scopeId)
      if (!scope) {
        throw new Error(`Recompose scope ${scopeId} not found in scope registry`)
      }
      try {
        scope.recompose()
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
      }
    }
    if (errors.length > 0) {
      throw errors.length === 1
        ? errors[0]
        : new AggregateError(errors, 'Multiple scopes failed during recomposition')
    }
  }

  createScope(fn: () => void): RecomposeScopeImpl {
    const id = this._nextId()
    const scope = new RecomposeScopeImpl(id, fn, this)
    this._scopeMap.set(id, scope)
    return scope
  }

  registerDependency(scopeId: ScopeId, stateId: StateId): void {
    let scopes = this._stateToScopes.get(stateId)
    if (!scopes) {
      scopes = new Set()
      this._stateToScopes.set(stateId, scopes)
    }
    scopes.add(scopeId)
  }

  invalidateScopesForState(stateId: StateId): void {
    const scopes = this._stateToScopes.get(stateId)
    if (!scopes) return
    for (const scopeId of scopes) {
      const scope = this._scopeMap.get(scopeId)
      if (scope) scope.invalidate()
    }
  }
}

function createRecomposer(): RecomposerImpl {
  let nextScopeId: ScopeId = 0
  return new RecomposerImpl(() => nextScopeId++)
}

export { RecomposeScopeImpl, RecomposerImpl, createRecomposer }
