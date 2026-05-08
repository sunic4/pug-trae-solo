import { describe, it, expect, vi } from 'vitest'
import { derivedStateOf } from '../derived-state'

describe('DerivedState', () => {
  describe('when created via derivedStateOf', () => {
    it('should execute calc on first read of value', () => {
      const calc = vi.fn(() => 10)
      const derived = derivedStateOf(calc)
      expect(calc).not.toHaveBeenCalled()
      expect(derived.value).toBe(10)
      expect(calc).toHaveBeenCalledTimes(1)
    })
  })

  describe('when reading value consecutively', () => {
    it('should not re-execute calc', () => {
      const calc = vi.fn(() => 'hello')
      const derived = derivedStateOf(calc)
      void derived.value
      void derived.value
      void derived.value
      expect(calc).toHaveBeenCalledTimes(1)
    })
  })

  describe('when markStale is called', () => {
    it('should re-execute calc on next value read', () => {
      const calc = vi.fn(() => 42)
      const derived = derivedStateOf(calc)
      void derived.value
      expect(calc).toHaveBeenCalledTimes(1)
      derived.markStale()
      void derived.value
      expect(calc).toHaveBeenCalledTimes(2)
    })
  })

  describe('when addDependency is called', () => {
    it('should add state id to dependencies set', () => {
      const derived = derivedStateOf(() => 1)
      derived.addDependency(100)
      derived.addDependency(200)
      derived.addDependency(100)
      expect(derived.dependencies).toEqual(new Set([100, 200]))
    })
  })

  describe('when calc returns different values after markStale', () => {
    it('should update value to the latest calc result', () => {
      let counter = 0
      const derived = derivedStateOf(() => ++counter)
      expect(derived.value).toBe(1)
      derived.markStale()
      expect(derived.value).toBe(2)
      derived.markStale()
      expect(derived.value).toBe(3)
    })
  })
})
