import { describe, it, expect } from 'vitest'
import { mutableStateOf, MutableStateImpl } from '../state'
import type { MutableState, Snapshot, SnapshotId, MutableSnapshot, ReadObserver, WriteObserver, StateId } from '../types'

class TestSnapshot implements Snapshot {
  id: SnapshotId = 0
  parent: Snapshot | null = null
  readCount = 0
  writeCount = 0
  private _nextId: StateId = 0

  read<E>(state: MutableState<E>): E {
    this.readCount++
    if (state instanceof MutableStateImpl) {
      return state.readRaw()
    }
    throw new Error('TestSnapshot.read: state is not a MutableStateImpl')
  }

  write<E>(_state: MutableState<E>, _value: E): void {
    this.writeCount++
  }

  resolveValue<E>(state: MutableState<E>): E {
    return this.read(state)
  }

  takeMutableSnapshot(): MutableSnapshot {
    throw new Error('Not implemented')
  }

  withReadObserver<E>(observer: ReadObserver, fn: () => E): E {
    return fn()
  }

  nextStateId(): StateId {
    return this._nextId++
  }

  setWriteObserver(_observer: WriteObserver | null): void {}
}

function asMutableStateImpl<T>(state: MutableState<T>): MutableStateImpl<T> {
  if (!(state instanceof MutableStateImpl)) {
    throw new Error('Expected MutableStateImpl')
  }
  return state
}

describe('MutableState', () => {
  describe('when created via mutableStateOf', () => {
    it('should have the correct initial value', () => {
      const snapshot = new TestSnapshot()
      const state = asMutableStateImpl(mutableStateOf(42, snapshot))
      expect(state.readRaw()).toBe(42)
    })
  })

  describe('when reading value via getter', () => {
    it('should call snapshot.read()', () => {
      const snapshot = new TestSnapshot()
      const state = mutableStateOf('hello', snapshot)
      void state.value
      expect(snapshot.readCount).toBe(1)
    })
  })

  describe('when setting a different value', () => {
    it('should call snapshot.write()', () => {
      const snapshot = new TestSnapshot()
      const state = mutableStateOf(0, snapshot)
      state.value = 1
      expect(snapshot.writeCount).toBe(1)
      expect(state.value).toBe(1)
    })
  })

  describe('when setting the same value', () => {
    it('should not call snapshot.write()', () => {
      const snapshot = new TestSnapshot()
      const state = mutableStateOf(0, snapshot)
      state.value = 0
      expect(snapshot.writeCount).toBe(0)
    })
  })

  describe('when using readRaw and writeRaw', () => {
    it('should bypass snapshot tracking', () => {
      const snapshot = new TestSnapshot()
      const state = asMutableStateImpl(mutableStateOf(10, snapshot))
      expect(state.readRaw()).toBe(10)
      expect(snapshot.readCount).toBe(0)
      state.writeRaw(20)
      expect(state.readRaw()).toBe(20)
      expect(snapshot.writeCount).toBe(0)
    })
  })

  describe('when creating multiple states', () => {
    it('should have unique ids', () => {
      const snapshot = new TestSnapshot()
      const state1 = asMutableStateImpl(mutableStateOf(1, snapshot))
      const state2 = asMutableStateImpl(mutableStateOf(2, snapshot))
      expect(state1.id).not.toBe(state2.id)
    })
  })
})
