import { describe, it, expect, vi } from 'vitest'
import { composable, createAppContext } from '@/core/composable'
import { mutableStateOf } from '@/core/state'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer, RecomposeScopeImpl } from '@/core/recomposer'
import type { ComposerContext } from '@/core/types'

describe('composable', () => {
  describe('when called with a function', () => {
    it('should return a function that executes fn and returns the result', () => {
      const ctx = createAppContext()
      const fn = vi.fn((_props: { count: number }, _ctx: ComposerContext) => ({ kind: 'test' }))
      const composed = composable(fn)

      const result = composed({ count: 1 }, ctx)

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenCalledWith({ count: 1 }, ctx)
      expect(result).toEqual({ kind: 'test' })
    })
  })

  describe('when composable executes', () => {
    it('should call pushScope and popScope in pairs', () => {
      const snapshot = createSnapshot()
      const recomposer = createRecomposer()
      const ctx: ComposerContext = { snapshot, recomposer }
      const pushSpy = vi.spyOn(recomposer, 'pushScope')
      const popSpy = vi.spyOn(recomposer, 'popScope')

      const composed = composable((_props: object, _ctx: ComposerContext) => null)
      composed({}, ctx)

      expect(pushSpy).toHaveBeenCalledOnce()
      expect(popSpy).toHaveBeenCalledOnce()
    })
  })

  describe('when reading state.value inside composable', () => {
    it('should track dependency to scope', () => {
      const addDependencySpy = vi.spyOn(RecomposeScopeImpl.prototype, 'addDependency')
      const ctx = createAppContext()
      const state = mutableStateOf(42, ctx.snapshot)

      const composed = composable((_props: object, _ctx: ComposerContext) => {
        void state.value
        return null
      })
      composed({}, ctx)

      expect(addDependencySpy).toHaveBeenCalledWith(state.id)
      addDependencySpy.mockRestore()
    })
  })

  describe('when fn throws an exception', () => {
    it('should still popScope correctly', () => {
      const snapshot = createSnapshot()
      const recomposer = createRecomposer()
      const ctx: ComposerContext = { snapshot, recomposer }
      const popSpy = vi.spyOn(recomposer, 'popScope')

      const composed = composable((_props: object, _ctx: ComposerContext) => {
        throw new Error('test error')
      })

      expect(() => composed({}, ctx)).toThrow('test error')
      expect(popSpy).toHaveBeenCalledOnce()
    })
  })

  describe('createAppContext', () => {
    it('should create a valid ComposerContext with non-null snapshot and recomposer', () => {
      const ctx = createAppContext()

      expect(ctx.snapshot).not.toBeNull()
      expect(ctx.snapshot).toBeDefined()
      expect(ctx.recomposer).not.toBeNull()
      expect(ctx.recomposer).toBeDefined()
    })
  })
})
