import { describe, it, expect } from 'vitest'


import { createMockCtx } from '@/test-utils'
import { VectorPathBuilder, createVectorPathBuilder } from '@/renderer/path'
import type { BlendMode, DrawCommand, Shadow, DrawScope, Color } from '@/renderer/types'
import { createFillPath, createStrokePath, createSetBlendMode, createSetShadow } from '@/renderer/draw-command'
import { createDrawScope } from '@/renderer/draw-scope'

const color: Color = { r: 255, g: 0, b: 0, a: 1 }

describe('VectorPathBuilder', () => {
  describe('when building a path with moveTo and lineTo', () => {
    it('should create a path with correct commands and bounds', () => {
      const path = createVectorPathBuilder()
        .moveTo(10, 20)
        .lineTo(100, 20)
        .lineTo(100, 80)
        .closePath()
        .build()

      expect(path.commands).toHaveLength(4)
      expect(path.commands[0]?.type).toBe('moveTo')
      expect(path.commands[1]?.type).toBe('lineTo')
      expect(path.commands[2]?.type).toBe('lineTo')
      expect(path.commands[3]?.type).toBe('closePath')
      expect(path.bounds.x).toBe(10)
      expect(path.bounds.y).toBe(20)
      expect(path.bounds.width).toBe(90)
      expect(path.bounds.height).toBe(60)
    })
  })

  describe('when building an empty path', () => {
    it('should return zero bounds', () => {
      const path = createVectorPathBuilder().build()
      expect(path.commands).toHaveLength(0)
      expect(path.bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 })
    })
  })

  describe('when building a path with quadraticCurveTo', () => {
    it('should include control point in bounds', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .quadraticCurveTo(50, -10, 100, 0)
        .build()

      expect(path.commands).toHaveLength(2)
      expect(path.commands[1]?.type).toBe('quadraticCurveTo')
      expect(path.bounds.y).toBe(-10)
    })
  })

  describe('when building a path with bezierCurveTo', () => {
    it('should include control points in bounds', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .bezierCurveTo(10, 50, 90, 50, 100, 0)
        .build()

      expect(path.commands).toHaveLength(2)
      expect(path.commands[1]?.type).toBe('bezierCurveTo')
      expect(path.bounds.height).toBe(50)
    })
  })

  describe('when building a path with arcTo', () => {
    it('should include tangent points in bounds', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .arcTo(50, 0, 50, 50, 10)
        .build()

      expect(path.commands).toHaveLength(2)
      expect(path.commands[1]?.type).toBe('arcTo')
    })
  })

  describe('when calling build multiple times', () => {
    it('should reset builder state after each build', () => {
      const builder = createVectorPathBuilder()
      const path1 = builder.moveTo(0, 0).lineTo(10, 10).build()
      const path2 = builder.moveTo(100, 100).lineTo(200, 200).build()

      expect(path1.commands).toHaveLength(2)
      expect(path2.commands).toHaveLength(2)
      expect(path1.bounds.x).toBe(0)
      expect(path2.bounds.x).toBe(100)
    })
  })
})

describe('Path DrawCommands', () => {
  describe('when calling createFillPath', () => {
    it('should execute path and fill on canvas context', () => {
      const path = createVectorPathBuilder()
        .moveTo(10, 20)
        .lineTo(50, 20)
        .lineTo(50, 60)
        .closePath()
        .build()

      const ctx = createMockCtx()
      const cmd = createFillPath(ctx, path, color)
      expect(cmd.type).toBe('fillPath')
      expect(cmd.bounds).toEqual(path.bounds)

      cmd.execute()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(10, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 20)
      expect(ctx.lineTo).toHaveBeenCalledWith(50, 60)
      expect(ctx.closePath).toHaveBeenCalled()
      expect(ctx.fill).toHaveBeenCalled()
    })
  })

  describe('when calling createStrokePath', () => {
    it('should execute path and stroke on canvas context', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .lineTo(100, 100)
        .build()

      const ctx = createMockCtx()
      const cmd = createStrokePath(ctx, path, color, 2)
      expect(cmd.type).toBe('strokePath')

      cmd.execute()
      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.lineWidth).toBe(2)
      expect(ctx.stroke).toHaveBeenCalled()
    })
  })

  describe('when path contains quadraticCurveTo', () => {
    it('should call ctx.quadraticCurveTo with correct args', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .quadraticCurveTo(50, 50, 100, 0)
        .build()

      const ctx = createMockCtx()
      const cmd = createFillPath(ctx, path, color)
      cmd.execute()
      expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(50, 50, 100, 0)
    })
  })

  describe('when path contains bezierCurveTo', () => {
    it('should call ctx.bezierCurveTo with correct args', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .bezierCurveTo(25, 100, 75, 100, 100, 0)
        .build()

      const ctx = createMockCtx()
      const cmd = createFillPath(ctx, path, color)
      cmd.execute()
      expect(ctx.bezierCurveTo).toHaveBeenCalledWith(25, 100, 75, 100, 100, 0)
    })
  })

  describe('when path contains arcTo', () => {
    it('should call ctx.arcTo with correct args', () => {
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .arcTo(50, 0, 50, 50, 10)
        .build()

      const ctx = createMockCtx()
      const cmd = createFillPath(ctx, path, color)
      cmd.execute()
      expect(ctx.arcTo).toHaveBeenCalledWith(50, 0, 50, 50, 10)
    })
  })
})

describe('BlendMode DrawCommand', () => {
  describe('when calling createSetBlendMode', () => {
    it('should set globalCompositeOperation on context', () => {
      const ctx = createMockCtx()
      const cmd = createSetBlendMode(ctx, 'multiply')
      expect(cmd.type).toBe('setBlendMode')

      cmd.execute()
      expect(ctx.globalCompositeOperation).toBe('multiply')
    })
  })
})

describe('Shadow DrawCommand', () => {
  describe('when calling createSetShadow', () => {
    it('should set shadow properties on context', () => {
      const shadow: Shadow = {
        blur: 10,
        offsetX: 5,
        offsetY: 5,
        color: { r: 0, g: 0, b: 0, a: 0.5 },
      }
      const ctx = createMockCtx()
      const cmd = createSetShadow(ctx, shadow)
      expect(cmd.type).toBe('setShadow')

      cmd.execute()
      expect(ctx.shadowBlur).toBe(10)
      expect(ctx.shadowOffsetX).toBe(5)
      expect(ctx.shadowOffsetY).toBe(5)
      expect(ctx.shadowColor).toBe('rgba(0,0,0,0.5)')
    })
  })

  describe('when shadow blur is zero', () => {
    it('should still set shadow properties', () => {
      const shadow: Shadow = {
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        color: { r: 0, g: 0, b: 0, a: 0 },
      }
      const ctx = createMockCtx()
      const cmd = createSetShadow(ctx, shadow)

      cmd.execute()
      expect(ctx.shadowBlur).toBe(0)
    })
  })
})

describe('DrawScope vector graphics methods', () => {
  describe('when calling fillPath on DrawScope', () => {
    it('should add a fillPath command', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .lineTo(10, 10)
        .build()

      scope.fillPath(path, color)
      const commands = scope.getCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]?.type).toBe('fillPath')
    })
  })

  describe('when calling strokePath on DrawScope', () => {
    it('should add a strokePath command', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .lineTo(10, 10)
        .build()

      scope.strokePath(path, color, 3)
      const commands = scope.getCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]?.type).toBe('strokePath')
    })
  })

  describe('when calling setBlendMode on DrawScope', () => {
    it('should add a setBlendMode command', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      scope.setBlendMode('screen')
      const commands = scope.getCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]?.type).toBe('setBlendMode')
    })
  })

  describe('when calling setShadow on DrawScope', () => {
    it('should add a setShadow command', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      const shadow: Shadow = { blur: 5, offsetX: 2, offsetY: 2, color: { r: 0, g: 0, b: 0, a: 1 } }
      scope.setShadow(shadow)
      const commands = scope.getCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]?.type).toBe('setShadow')
    })
  })

  describe('when combining path with blend mode and shadow', () => {
    it('should produce correct command sequence', () => {
      const ctx = createMockCtx()
      const scope = createDrawScope(ctx)
      const path = createVectorPathBuilder()
        .moveTo(0, 0)
        .lineTo(50, 50)
        .build()
      const shadow: Shadow = { blur: 8, offsetX: 3, offsetY: 3, color: { r: 0, g: 0, b: 0, a: 0.3 } }

      scope.save()
      scope.setBlendMode('multiply')
      scope.setShadow(shadow)
      scope.fillPath(path, color)
      scope.restore()

      const commands = scope.getCommands()
      expect(commands).toHaveLength(5)
      expect(commands[0]?.type).toBe('save')
      expect(commands[1]?.type).toBe('setBlendMode')
      expect(commands[2]?.type).toBe('setShadow')
      expect(commands[3]?.type).toBe('fillPath')
      expect(commands[4]?.type).toBe('restore')
    })
  })
})
