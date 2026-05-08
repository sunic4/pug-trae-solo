import { describe, it, expect } from 'vitest'
import { createSnapshot } from '../snapshot'
import { mutableStateOf } from '../state'

describe('Snapshot', () => {
  describe('when creating a root snapshot', () => {
    it('should have parent as null', () => {
      const snapshot = createSnapshot()
      expect(snapshot.parent).toBeNull()
    })
  })

  describe('when reading a state', () => {
    it('should return the state value', () => {
      const snapshot = createSnapshot()
      const state = mutableStateOf(42, snapshot)
      expect(snapshot.read(state)).toBe(42)
    })
  })

  describe('when writing a state', () => {
    it('should record the value to stateMap', () => {
      const snapshot = createSnapshot()
      const state = mutableStateOf(0, snapshot)
      snapshot.write(state, 99)
      expect(snapshot.read(state)).toBe(99)
    })
  })

  describe('when taking a mutable snapshot', () => {
    it('should create a child snapshot with parent set to current snapshot', () => {
      const snapshot = createSnapshot()
      const mutable = snapshot.takeMutableSnapshot()
      expect(mutable.parent).toBe(snapshot)
    })
  })

  describe('when applying a mutable snapshot', () => {
    it('should merge changes to parent', () => {
      const snapshot = createSnapshot()
      const state = mutableStateOf(10, snapshot)
      const mutable = snapshot.takeMutableSnapshot()
      mutable.write(state, 20)
      mutable.apply()
      expect(snapshot.read(state)).toBe(20)
    })
  })

  describe('when applying a disposed mutable snapshot', () => {
    it('should throw an error', () => {
      const snapshot = createSnapshot()
      const mutable = snapshot.takeMutableSnapshot()
      mutable.dispose()
      expect(() => mutable.apply()).toThrow('Cannot apply a disposed snapshot')
    })
  })

  describe('when nesting depth exceeds 5', () => {
    it('should throw an error', () => {
      const root = createSnapshot()
      let current = root
      for (let i = 0; i < 4; i++) {
        current = current.takeMutableSnapshot()
      }
      expect(() => current.takeMutableSnapshot()).toThrow(
        'Snapshot nesting depth exceeds maximum of 5'
      )
    })
  })

  describe('when using withReadObserver', () => {
    it('should set observer during execution and restore after', () => {
      const snapshot = createSnapshot()
      const state = mutableStateOf(1, snapshot)
      let outerCount = 0
      let innerCount = 0

      snapshot.withReadObserver(
        () => { outerCount++ },
        () => {
          snapshot.withReadObserver(
            () => { innerCount++ },
            () => {
              snapshot.read(state)
            }
          )
          snapshot.read(state)
        }
      )

      expect(innerCount).toBe(1)
      expect(outerCount).toBe(1)
    })
  })

  describe('when reading from a child snapshot', () => {
    it('should check self first then parent', () => {
      const parent = createSnapshot()
      const stateA = mutableStateOf(100, parent)
      const stateB = mutableStateOf(200, parent)
      parent.write(stateA, 111)
      parent.write(stateB, 222)

      const child = parent.takeMutableSnapshot()
      child.write(stateA, 999)

      expect(child.read(stateA)).toBe(999)
      expect(child.read(stateB)).toBe(222)
    })
  })
})
