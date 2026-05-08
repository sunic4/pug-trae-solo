import type { IdGenerator } from '@pug-canvas-ui/core'
import { createIdGenerator } from '@pug-canvas-ui/core'

type FocusState = 'active' | 'inactive' | 'deactivated'

interface FocusRequester {
  readonly id: number
  requestFocus(): void
  freeFocus(): void
}

interface FocusManager {
  readonly currentFocus: FocusRequester | null
  requestFocus(requester: FocusRequester): boolean
  freeFocus(): void
  moveFocus(direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'): boolean
  addRequester(requester: FocusRequester): void
  removeRequester(requester: FocusRequester): void
  dispose(): void
}

class FocusRequesterImpl implements FocusRequester {
  private _id: number = -1
  private _manager: FocusManager | null

  get id(): number {
    return this._id
  }

  constructor(manager: FocusManager | null = null) {
    this._manager = manager
  }

  _setId(id: number): void {
    this._id = id
  }

  setManager(manager: FocusManager): void {
    this._manager = manager
  }

  requestFocus(): void {
    if (this._manager !== null) {
      this._manager.requestFocus(this)
    }
  }

  freeFocus(): void {
    if (this._manager !== null) {
      this._manager.freeFocus()
    }
  }
}

class FocusManagerImpl implements FocusManager {
  private _idGenerator: IdGenerator
  private _currentFocus: FocusRequester | null = null
  private _requesters: FocusRequester[] = []
  private _disposed = false

  constructor(idGenerator?: IdGenerator) {
    this._idGenerator = idGenerator ?? createIdGenerator()
  }

  get currentFocus(): FocusRequester | null {
    return this._currentFocus
  }

  requestFocus(requester: FocusRequester): boolean {
    if (this._disposed) return false
    if (!this._requesters.includes(requester)) return false
    if (this._currentFocus === requester) return true
    this._currentFocus = requester
    return true
  }

  freeFocus(): void {
    if (this._disposed) return
    this._currentFocus = null
  }

  moveFocus(direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'): boolean {
    if (this._disposed) return false
    if (this._requesters.length === 0) return false

    if (direction === 'next' || direction === 'down' || direction === 'right') {
      if (this._currentFocus === null) {
        this._currentFocus = this._requesters[0]!
        return true
      }
      const idx = this._requesters.indexOf(this._currentFocus)
      if (idx < 0) {
        this._currentFocus = this._requesters[0]!
        return true
      }
      const nextIdx = (idx + 1) % this._requesters.length
      this._currentFocus = this._requesters[nextIdx]!
      return true
    }

    if (direction === 'previous' || direction === 'up' || direction === 'left') {
      if (this._currentFocus === null) {
        this._currentFocus = this._requesters[this._requesters.length - 1]!
        return true
      }
      const idx = this._requesters.indexOf(this._currentFocus)
      if (idx < 0) {
        this._currentFocus = this._requesters[this._requesters.length - 1]!
        return true
      }
      const prevIdx = (idx - 1 + this._requesters.length) % this._requesters.length
      this._currentFocus = this._requesters[prevIdx]!
      return true
    }

    return false
  }

  addRequester(requester: FocusRequester): void {
    if (this._disposed) return
    if (!this._requesters.includes(requester)) {
      if (requester instanceof FocusRequesterImpl && requester.id < 0) {
        requester._setId(this._idGenerator.nextId())
      }
      this._requesters.push(requester)
    }
  }

  removeRequester(requester: FocusRequester): void {
    this._requesters = this._requesters.filter(r => r !== requester)
    if (this._currentFocus === requester) {
      this._currentFocus = null
    }
  }

  dispose(): void {
    this._disposed = true
    this._currentFocus = null
    this._requesters = []
  }
}


function createFocusRequester(manager: FocusManager | null = null): FocusRequester {
  return new FocusRequesterImpl(manager)
}


function createFocusManager(idGenerator?: IdGenerator): FocusManager {
  return new FocusManagerImpl(idGenerator)
}

export type { FocusState, FocusRequester, FocusManager }

export { createFocusRequester, createFocusManager }
