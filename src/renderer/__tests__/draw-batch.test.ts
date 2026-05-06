import { describe, it, expect } from 'vitest'
import {
  computeBatchKey,
  areBatchKeysEqual,
  buildBatchGroups,
  batchCommands,
  createBatchFill,
  createBatchStroke,
  createBatchText,
} from '@/renderer/draw-batch'

import type { DrawCommand, Color, FillRectCommand, FillCircleCommand, StrokeRectCommand, FillTextCommand, SaveCommand, SetAlphaCommand, RestoreCommand } from '@/renderer/types'
import { createMockCtx } from '@/test-utils'

function makeFillRect(rect: { x: number; y: number; width: number; height: number }, color: Color): FillRectCommand {
  return { type: 'fillRect', rect, color, bounds: rect, execute: () => {} }
}

function makeFillCircle(center: { x: number; y: number }, radius: number, color: Color): FillCircleCommand {
  return { type: 'fillCircle', center, radius, color, bounds: { x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2 }, execute: () => {} }
}

function makeStrokeRect(rect: { x: number; y: number; width: number; height: number }, color: Color, strokeWidth: number): StrokeRectCommand {
  return { type: 'strokeRect', rect, color, strokeWidth, bounds: rect, execute: () => {} }
}

function makeFillText(text: string, position: { x: number; y: number }, color: Color, fontSize: number, bounds: { x: number; y: number; width: number; height: number }): FillTextCommand {
  return { type: 'fillText', text, position, color, fontSize, bounds, execute: () => {} }
}

function makeSave(): SaveCommand {
  return { type: 'save', bounds: { x: 0, y: 0, width: 0, height: 0 }, execute: () => {} }
}

function makeSetAlpha(alpha: number): SetAlphaCommand {
  return { type: 'setAlpha', alpha, bounds: { x: 0, y: 0, width: 0, height: 0 }, execute: () => {} }
}

function makeRestore(): RestoreCommand {
  return { type: 'restore', bounds: { x: 0, y: 0, width: 0, height: 0 }, execute: () => {} }
}

describe('computeBatchKey', () => {
  it('assigns fill group to fillRect', () => {
    const cmd = makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 255, g: 0, b: 0, a: 1 })
    expect(computeBatchKey(cmd).groupType).toBe('fill')
  })

  it('assigns fill group to fillCircle', () => {
    const cmd = makeFillCircle({ x: 0, y: 0 }, 10, { r: 0, g: 255, b: 0, a: 1 })
    expect(computeBatchKey(cmd).groupType).toBe('fill')
  })

  it('assigns stroke group to strokeRect', () => {
    const cmd = makeStrokeRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 0, g: 0, b: 255, a: 1 }, 2)
    expect(computeBatchKey(cmd).groupType).toBe('stroke')
  })

  it('assigns text group to fillText', () => {
    const cmd = makeFillText('hello', { x: 0, y: 0 }, { r: 0, g: 0, b: 0, a: 1 }, 16, { x: 0, y: 0, width: 5, height: 16 })
    expect(computeBatchKey(cmd).groupType).toBe('text')
  })

  it('assigns other group to save/restore', () => {
    const cmd = makeSave()
    expect(computeBatchKey(cmd).groupType).toBe('other')
  })

  it('assigns other group to setAlpha', () => {
    const cmd = makeSetAlpha(0.5)
    expect(computeBatchKey(cmd).groupType).toBe('other')
  })
})

describe('areBatchKeysEqual', () => {
  it('matches same type and color', () => {
    const redColor: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmd1 = makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, redColor)
    const cmd2 = makeFillCircle({ x: 0, y: 0 }, 10, redColor)
    expect(areBatchKeysEqual(computeBatchKey(cmd1), computeBatchKey(cmd2))).toBe(true)
  })

  it('rejects different colors', () => {
    const k1 = computeBatchKey(makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 255, g: 0, b: 0, a: 1 }))
    const k2 = computeBatchKey(makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 0, g: 0, b: 255, a: 1 }))
    expect(areBatchKeysEqual(k1, k2)).toBe(false)
  })

  it('rejects different group types', () => {
    const k1 = computeBatchKey(makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 255, g: 0, b: 0, a: 1 }))
    const k2 = computeBatchKey(makeStrokeRect({ x: 0, y: 0, width: 10, height: 10 }, { r: 255, g: 0, b: 0, a: 1 }, 1))
    expect(areBatchKeysEqual(k1, k2)).toBe(false)
  })

  it('rejects other groups', () => {
    const k1 = computeBatchKey(makeSave())
    const k2 = computeBatchKey(makeRestore())
    expect(areBatchKeysEqual(k1, k2)).toBe(false)
  })
})

describe('buildBatchGroups', () => {
  it('returns empty for empty input', () => {
    expect(buildBatchGroups([])).toEqual([])
  })

  it('groups consecutive same-color fills', () => {
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeFillRect({ x: 10, y: 0, width: 10, height: 10 }, red),
      makeFillCircle({ x: 5, y: 20 }, 5, red),
    ]
    const groups = buildBatchGroups(cmds)
    expect(groups.length).toBe(1)
    expect(groups[0]!.commands.length).toBe(3)
  })

  it('splits on color change', () => {
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const blue: Color = { r: 0, g: 0, b: 255, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeFillRect({ x: 10, y: 0, width: 10, height: 10 }, blue),
    ]
    const groups = buildBatchGroups(cmds)
    expect(groups.length).toBe(2)
  })

  it('splits on other-type commands', () => {
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeSave(),
      makeFillRect({ x: 10, y: 0, width: 10, height: 10 }, red),
    ]
    const groups = buildBatchGroups(cmds)
    expect(groups.length).toBe(3)
  })
})

describe('batchCommands', () => {
  it('returns same array for single command', () => {
    const ctx = createMockCtx()
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
    ]
    expect(batchCommands(ctx, cmds)).toHaveLength(1)
  })

  it('reduces multiple same-color fills to one batch', () => {
    const ctx = createMockCtx()
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeFillRect({ x: 10, y: 0, width: 10, height: 10 }, red),
      makeFillRect({ x: 20, y: 0, width: 10, height: 10 }, red),
    ]
    const result = batchCommands(ctx, cmds)
    expect(result.length).toBe(1)
  })

  it('keeps other commands ungrouped', () => {
    const ctx = createMockCtx()
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeSave(),
      makeSetAlpha(0.5),
      makeRestore(),
    ]
    const result = batchCommands(ctx, cmds)
    expect(result.length).toBe(4)
  })
})

describe('createBatchFill', () => {
  it('creates batch command with correct bounds', () => {
    const ctx = createMockCtx()
    const red: Color = { r: 255, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillRect({ x: 0, y: 0, width: 10, height: 10 }, red),
      makeFillRect({ x: 30, y: 0, width: 10, height: 10 }, red),
    ]
    const batch = createBatchFill(ctx, cmds, red)
    expect(batch.bounds.x).toBe(0)
    expect(batch.bounds.width).toBe(40)
    expect(batch.bounds.height).toBe(10)
  })
})

describe('createBatchStroke', () => {
  it('creates batch stroke command', () => {
    const ctx = createMockCtx()
    const blue: Color = { r: 0, g: 0, b: 255, a: 1 }
    const cmds: DrawCommand[] = [
      makeStrokeRect({ x: 0, y: 0, width: 10, height: 10 }, blue, 1),
    ]
    const batch = createBatchStroke(ctx, cmds, blue, 1)
    expect(batch.type).toBe('batchStroke')
  })
})

describe('createBatchText', () => {
  it('creates batch text command', () => {
    const ctx = createMockCtx()
    const black: Color = { r: 0, g: 0, b: 0, a: 1 }
    const cmds: DrawCommand[] = [
      makeFillText('a', { x: 0, y: 0 }, black, 14, { x: 0, y: 0, width: 10, height: 14 }),
    ]
    const batch = createBatchText(ctx, cmds, '14px sans-serif')
    expect(batch.type).toBe('batchText')
  })
})
