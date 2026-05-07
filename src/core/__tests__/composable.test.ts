import { describe, it, expect, vi } from 'vitest'
import { composable, createAppContext } from '@/core/composable'
import { mutableStateOf } from '@/core/state'
import { createSnapshot } from '@/core/snapshot'
import { createRecomposer, RecomposeScopeImpl } from '@/core/recomposer'
import type { CompositionContext } from '@/core/composition-context'

describe('composable', () => {
  describe('when called with a function', () => {
    it('should return a function that executes fn with ctx as first param and props as second', () => {
      const ctx = createAppContext()
      const fn = vi.fn((_ctx: CompositionContext, _props: { count: number }) => {})
      const composed = composable(fn)

      const result = composed({ count: 1 }, ctx)

      expect(fn).toHaveBeenCalledOnce()
      expect(fn).toHaveBeenCalledWith(expect.objectContaining({
        snapshot: ctx.snapshot,
        recomposer: ctx.recomposer,
      }), { count: 1 })
      expect(result).toBeNull()
    })
  })

  describe('when composable executes', () => {
    it('should call pushScope and popScope in pairs', () => {
      const snapshot = createSnapshot()
      const recomposer = createRecomposer()
      const ctx = { snapshot, recomposer }
      const pushSpy = vi.spyOn(recomposer, 'pushScope')
      const popSpy = vi.spyOn(recomposer, 'popScope')

      const composed = composable((_ctx: CompositionContext, _props: object) => {})
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

      const composed = composable((compositionCtx: CompositionContext, _props: object) => {
        void compositionCtx.snapshot.read(state)
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
      const ctx = { snapshot, recomposer }
      const popSpy = vi.spyOn(recomposer, 'popScope')

      const composed = composable((_ctx: CompositionContext, _props: object) => {
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
