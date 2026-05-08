import { describe, it, expect, vi } from 'vitest'
import { createRecomposer } from '../recomposer'

describe('Recomposer', () => {
  describe('when createRecomposer is called', () => {
    it('should return a RecomposerImpl instance with currentScope null', () => {
      const recomposer = createRecomposer()
      expect(recomposer.currentScope).toBeNull()
    })
  })

  describe('when pushScope and popScope are used', () => {
    it('should manage the scope stack and return the top via currentScope', () => {
      const recomposer = createRecomposer()
      const scopeA = recomposer.createScope(() => {})
      const scopeB = recomposer.createScope(() => {})

      recomposer.pushScope(scopeA)
      expect(recomposer.currentScope?.id).toBe(scopeA.id)

      recomposer.pushScope(scopeB)
      expect(recomposer.currentScope?.id).toBe(scopeB.id)

      recomposer.popScope()
      expect(recomposer.currentScope?.id).toBe(scopeA.id)

      recomposer.popScope()
      expect(recomposer.currentScope).toBeNull()
    })
  })

  describe('when pushScope is called with a scope id already on the stack', () => {
    it('should throw a circular recomposition detection error', () => {
      const recomposer = createRecomposer()
      const scope = recomposer.createScope(() => {})

      recomposer.pushScope(scope)
      expect(() => recomposer.pushScope(scope)).toThrow(
        `Circular recomposition detected: scope ${scope.id} is already on the stack`,
      )
    })
  })

  describe('when popScope is called on an empty stack', () => {
    it('should throw an error', () => {
      const recomposer = createRecomposer()
      expect(() => recomposer.popScope()).toThrow('Cannot pop from empty scope stack')
    })
  })

  describe('when invalidate is called on a scope', () => {
    it('should mark the scope as invalidated and schedule it for recomposition', () => {
      const recomposer = createRecomposer()
      const fn = vi.fn()
      const scope = recomposer.createScope(fn)

      scope.invalidate()
      expect(fn).not.toHaveBeenCalled()

      recomposer.performRecompose()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('when performRecompose is called', () => {
    it('should execute recompose on all pending scopes and clear the pending set', () => {
      const recomposer = createRecomposer()
      const fnA = vi.fn()
      const fnB = vi.fn()
      const scopeA = recomposer.createScope(fnA)
      const scopeB = recomposer.createScope(fnB)

      scopeA.invalidate()
      scopeB.invalidate()

      recomposer.performRecompose()
      expect(fnA).toHaveBeenCalledTimes(1)
      expect(fnB).toHaveBeenCalledTimes(1)

      recomposer.performRecompose()
      expect(fnA).toHaveBeenCalledTimes(1)
      expect(fnB).toHaveBeenCalledTimes(1)
    })

    it('should not re-execute scopes that were not invalidated', () => {
      const recomposer = createRecomposer()
      const fn = vi.fn()
      recomposer.createScope(fn)

      recomposer.performRecompose()
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('when createScope is called', () => {
    it('should allocate a unique id and register the scope in the scope map', () => {
      const recomposer = createRecomposer()
      const scopeA = recomposer.createScope(() => {})
      const scopeB = recomposer.createScope(() => {})

      expect(scopeA.id).not.toBe(scopeB.id)
      expect(typeof scopeA.id).toBe('number')
      expect(typeof scopeB.id).toBe('number')

      const fnA = vi.fn()
      const registeredScope = recomposer.createScope(fnA)
      registeredScope.invalidate()
      recomposer.performRecompose()
      expect(fnA).toHaveBeenCalledTimes(1)
    })
  })

  describe('when addDependency is called on a scope', () => {
    it('should add the state dependency without throwing', () => {
      const recomposer = createRecomposer()
      const scope = recomposer.createScope(() => {})

      expect(() => scope.addDependency(1)).not.toThrow()
      expect(() => scope.addDependency(2)).not.toThrow()
      expect(() => scope.addDependency(1)).not.toThrow()
    })

    it('should not affect recompose behavior when dependencies are added', () => {
      const recomposer = createRecomposer()
      const fn = vi.fn()
      const scope = recomposer.createScope(fn)

      scope.addDependency(10)
      scope.addDependency(20)
      scope.invalidate()

      recomposer.performRecompose()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('RecomposeScopeImpl', () => {
  describe('when recompose is called without invalidate', () => {
    it('should not execute the scope function', () => {
      const recomposer = createRecomposer()
      const fn = vi.fn()
      const scope = recomposer.createScope(fn)

      scope.recompose()
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('when invalidate then recompose is called', () => {
    it('should execute the scope function and reset the invalidated flag', () => {
      const recomposer = createRecomposer()
      const fn = vi.fn()
      const scope = recomposer.createScope(fn)

      scope.invalidate()
      scope.recompose()
      expect(fn).toHaveBeenCalledTimes(1)

      scope.recompose()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
