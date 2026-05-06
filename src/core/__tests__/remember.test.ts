import { describe, it, expect } from 'vitest'
import { remember } from '@/core/remember'
import { createRecomposer } from '@/core/recomposer'
import { createSnapshot } from '@/core/snapshot'
import type { ComposerContext } from '@/core/types'

function createTestContext() {
  const recomposer = createRecomposer()
  const snapshot = createSnapshot()
  const ctx: ComposerContext = { recomposer, snapshot }
  return { ctx, recomposer }
}

describe('remember', () => {
  describe('when there is no current scope', () => {
    it('should execute calc and return the result directly', () => {
      const { ctx } = createTestContext()
      const result = remember(ctx, () => 42)
      expect(result).toBe(42)
    })

    it('should execute calc every time without caching', () => {
      const { ctx } = createTestContext()
      let callCount = 0
      const calc = () => {
        callCount++
        return callCount
      }
      remember(ctx, calc)
      remember(ctx, calc)
      expect(callCount).toBe(2)
    })
  })

  describe('when there is a scope and no keys', () => {
    it('should calculate on first call and return cached value on subsequent calls', () => {
      const { ctx, recomposer } = createTestContext()
      const scope = recomposer.createScope(() => {})

      recomposer.pushScope(scope)

      let callCount = 0
      const calc = () => {
        callCount++
        return 'cached'
      }

      const first = remember(ctx, calc)
      expect(first).toBe('cached')
      expect(callCount).toBe(1)

      const second = remember(ctx, calc)
      expect(second).toBe('cached')
      expect(callCount).toBe(1)

      recomposer.popScope()
    })
  })

  describe('when there is a scope and keys are unchanged', () => {
    it('should return the cached value without recalculating', () => {
      const { ctx, recomposer } = createTestContext()
      const scope = recomposer.createScope(() => {})

      recomposer.pushScope(scope)

      let callCount = 0
      const calc = () => {
        callCount++
        return 'from-calc'
      }

      const first = remember(ctx, calc, [1, 'a'])
      expect(first).toBe('from-calc')
      expect(callCount).toBe(1)

      const second = remember(ctx, calc, [1, 'a'])
      expect(second).toBe('from-calc')
      expect(callCount).toBe(1)

      recomposer.popScope()
    })
  })

  describe('when there is a scope and keys have changed', () => {
    it('should recalculate and update the cache', () => {
      const { ctx, recomposer } = createTestContext()
      const scope = recomposer.createScope(() => {})

      recomposer.pushScope(scope)

      let callCount = 0
      const calc = () => {
        callCount++
        return `result-${callCount}`
      }

      const first = remember(ctx, calc, [1])
      expect(first).toBe('result-1')
      expect(callCount).toBe(1)

      const second = remember(ctx, calc, [2])
      expect(second).toBe('result-2')
      expect(callCount).toBe(2)

      recomposer.popScope()
    })

    it('should recalculate when keys length differs', () => {
      const { ctx, recomposer } = createTestContext()
      const scope = recomposer.createScope(() => {})

      recomposer.pushScope(scope)

      let callCount = 0
      const calc = () => {
        callCount++
        return callCount
      }

      remember(ctx, calc, [1, 2])
      expect(callCount).toBe(1)

      remember(ctx, calc, [1])
      expect(callCount).toBe(2)

      recomposer.popScope()
    })
  })

  describe('when remember is called in different scopes', () => {
    it('should maintain independent caches per scope', () => {
      const { ctx, recomposer } = createTestContext()
      const scopeA = recomposer.createScope(() => {})
      const scopeB = recomposer.createScope(() => {})

      let callCountA = 0
      const calcA = () => {
        callCountA++
        return `scope-a-${callCountA}`
      }

      let callCountB = 0
      const calcB = () => {
        callCountB++
        return `scope-b-${callCountB}`
      }

      recomposer.pushScope(scopeA)
      const resultA1 = remember(ctx, calcA)
      expect(resultA1).toBe('scope-a-1')
      recomposer.popScope()

      recomposer.pushScope(scopeB)
      const resultB1 = remember(ctx, calcB)
      expect(resultB1).toBe('scope-b-1')
      recomposer.popScope()

      recomposer.pushScope(scopeA)
      const resultA2 = remember(ctx, calcA)
      expect(resultA2).toBe('scope-a-1')
      expect(callCountA).toBe(1)
      recomposer.popScope()

      recomposer.pushScope(scopeB)
      const resultB2 = remember(ctx, calcB)
      expect(resultB2).toBe('scope-b-1')
      expect(callCountB).toBe(1)
      recomposer.popScope()
    })
  })
})
