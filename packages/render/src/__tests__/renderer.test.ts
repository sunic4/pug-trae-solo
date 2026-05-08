// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { createMockCtx, createMockCanvas } from './mocks'
import type { Color, Point, DrawCommand } from '../types'
import { createFillRect, createFillCircle, createFillText, createSetAlpha } from '../draw-command'
import { createDrawScope } from '../draw-scope'
import { createCanvasHost } from '../canvas-host'

const color: Color = { r: 255, g: 0, b: 0, a: 1 }
const point: Point = { x: 50, y: 60 }
const rect = { x: 10, y: 20, width: 100, height: 50 }

describe('DrawCommand', () => {
  describe('when calling createFillRect', () => {
    it('should return correct type and bounds, and execute calls ctx.fillRect', () => {
      const ctx = createMockCtx()
      const cmd = createFillRect(ctx, rect, color)
      expect(cmd.type).toBe('fillRect')
      expect(cmd.bounds).toEqual(rect)
      cmd.execute()
      expect(ctx.fillRect).toHaveBeenCalledWith(10, 20, 100, 50)
    })
  })

  describe('when calling createFillCircle', () => {
    it('should return correct type, and execute calls ctx.arc + ctx.fill', () => {
      const ctx = createMockCtx()
      const cmd = createFillCircle(ctx, point, 30, color)
      expect(cmd.type).toBe('fillCircle')
      cmd.execute()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.arc).toHaveBeenCalledWith(50, 60, 30, 0, Math.PI * 2)
      expect(ctx.fill).toHaveBeenCalled()
    })
  })

  describe('when calling createFillText', () => {
    it('should return correct type, and execute calls ctx.fillText', () => {
      const ctx = createMockCtx()
      const cmd = createFillText(ctx, 'hello', point, color, 16)
      expect(cmd.type).toBe('fillText')
      cmd.execute()
      expect(ctx.fillText).toHaveBeenCalledWith('hello', 50, 60)
    })
  })

  describe('when calling createSetAlpha', () => {
    it('should return correct type, and execute sets ctx.globalAlpha', () => {
      const ctx = createMockCtx()
      const cmd = createSetAlpha(ctx, 0.5)
      expect(cmd.type).toBe('setAlpha')
      cmd.execute()
      expect(ctx.globalAlpha).toBe(0.5)
    })
  })
})

describe('DrawScope', () => {
  describe('when calling createDrawScope', () => {
    it('should create a DrawScope instance', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      expect(scope).toBeDefined()
      expect(scope.getCommands()).toEqual([])
    })
  })

  describe('when calling fillRect', () => {
    it('should add a fillRect type command', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      scope.fillRect(rect, color)
      const commands = scope.getCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]!.type).toBe('fillRect')
    })
  })

  describe('when calling multiple draw methods', () => {
    it('should add multiple commands', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      scope.fillRect(rect, color)
      scope.setAlpha(0.5)
      scope.fillCircle(point, 10, color)
      const commands = scope.getCommands()
      expect(commands).toHaveLength(3)
      expect(commands[0]!.type).toBe('fillRect')
      expect(commands[1]!.type).toBe('setAlpha')
      expect(commands[2]!.type).toBe('fillCircle')
    })
  })

  describe('when calling getCommands', () => {
    it('should return a shallow copy', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      scope.fillRect(rect, color)
      const first = scope.getCommands()
      const second = scope.getCommands()
      expect(first).not.toBe(second)
      expect(first).toEqual(second)
    })
  })

  describe('when using save and restore', () => {
    it('should add paired save and restore commands', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      scope.save()
      scope.fillRect(rect, color)
      scope.restore()
      const commands = scope.getCommands()
      expect(commands).toHaveLength(3)
      expect(commands[0]!.type).toBe('save')
      expect(commands[1]!.type).toBe('fillRect')
      expect(commands[2]!.type).toBe('restore')
    })
  })
})

describe('CanvasHost', () => {
  describe('when calling createCanvasHost', () => {
    it('should use provided context', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)
      expect(host.ctx).toBe(ctx)
    })
  })

  describe('when calling render', () => {
    it('should execute all commands', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)
      const cmd1: DrawCommand = {
        type: 'fillRect',
        rect,
        color,
        bounds: rect,
        execute: vi.fn(),
      }
      const cmd2: DrawCommand = {
        type: 'setAlpha',
        alpha: 0.5,
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        execute: vi.fn(),
      }
      host.render([cmd1, cmd2])
      expect(cmd1.execute).toHaveBeenCalled()
      expect(cmd2.execute).toHaveBeenCalled()
    })
  })

  describe('when calling render after dispose', () => {
    it('should throw an error', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)
      host.dispose()
      expect(() => host.render([])).toThrow('CanvasHost has been disposed')
    })
  })

  describe('when calling clear', () => {
    it('should call ctx.clearRect with canvas dimensions', () => {
      const ctx = createMockCtx()
      const canvas = createMockCanvas()
      const host = createCanvasHost(canvas, ctx)
      host.clear()
      expect(ctx.clearRect).toHaveBeenCalled()
    })
  })
})
