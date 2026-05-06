import type { DrawContext, DrawCommand, Rect, Color, BatchFillCommand, BatchStrokeCommand, BatchTextCommand } from '@/renderer/types'
import { colorToString } from '@/renderer/types'
import { executePathCommands } from '@/renderer/draw-command'
import { mergeRects } from '@/renderer/dirty-region'

type BatchGroupType = 'fill' | 'stroke' | 'text' | 'image' | 'other'

interface BatchKey {
  groupType: BatchGroupType
  colorKey: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  fontWeight: string
}

interface BatchGroup {
  key: BatchKey
  commands: DrawCommand[]
}

function extractCommandColor(cmd: DrawCommand): Color | null {
  switch (cmd.type) {
    case 'fillRect':
    case 'strokeRect':
    case 'fillCircle':
    case 'strokeCircle':
    case 'fillText':
    case 'strokeText':
    case 'drawLine':
    case 'fillRoundRect':
    case 'strokeRoundRect':
    case 'fillPath':
    case 'strokePath':
      return cmd.color
    default:
      return null
  }
}

function extractCommandStrokeWidth(cmd: DrawCommand): number {
  switch (cmd.type) {
    case 'strokeRect':
    case 'strokeCircle':
    case 'drawLine':
    case 'strokeRoundRect':
    case 'strokePath':
      return cmd.strokeWidth
    default:
      return 0
  }
}

function extractCommandFontSize(cmd: DrawCommand): number {
  switch (cmd.type) {
    case 'fillText':
    case 'strokeText':
      return cmd.fontSize
    default:
      return 0
  }
}

function computeBatchKey(cmd: DrawCommand): BatchKey {
  const baseKey: BatchKey = {
    groupType: 'other',
    colorKey: '',
    strokeWidth: 0,
    fontSize: 0,
    fontFamily: '',
    fontWeight: '',
  }

  switch (cmd.type) {
    case 'fillRect':
    case 'fillRoundRect':
    case 'fillPath':
    case 'fillCircle':
      baseKey.groupType = 'fill'
      baseKey.colorKey = colorToString(cmd.color)
      break
    case 'strokeRect':
    case 'strokeRoundRect':
    case 'strokePath':
    case 'strokeCircle':
    case 'drawLine':
      baseKey.groupType = 'stroke'
      baseKey.colorKey = colorToString(cmd.color)
      baseKey.strokeWidth = cmd.strokeWidth
      break
    case 'fillText':
      baseKey.groupType = 'text'
      baseKey.colorKey = colorToString(cmd.color)
      baseKey.fontSize = cmd.fontSize
      break
    case 'drawImage':
    case 'drawNinePatch':
      baseKey.groupType = 'image'
      break
    default:
      baseKey.groupType = 'other'
      break
  }

  return baseKey
}

function areBatchKeysEqual(a: BatchKey, b: BatchKey): boolean {
  if (a.groupType !== b.groupType) return false
  if (a.groupType === 'other') return false
  return (
    a.colorKey === b.colorKey &&
    a.strokeWidth === b.strokeWidth &&
    a.fontSize === b.fontSize
  )
}

function buildBatchGroups(commands: DrawCommand[]): BatchGroup[] {
  if (commands.length === 0) return []

  const groups: BatchGroup[] = []
  let currentKey = computeBatchKey(commands[0]!)
  let currentCmds: DrawCommand[] = [commands[0]!]

  for (let i = 1; i < commands.length; i++) {
    const cmd = commands[i]!
    const cmdKey = computeBatchKey(cmd)

    if (cmdKey.groupType === 'other') {
      if (currentCmds.length > 0) {
        groups.push({ key: currentKey, commands: currentCmds })
        currentCmds = []
      }
      groups.push({ key: cmdKey, commands: [cmd] })
      if (i + 1 < commands.length) {
        currentKey = computeBatchKey(commands[i + 1]!)
        currentCmds = []
      }
      continue
    }

    if (areBatchKeysEqual(currentKey, cmdKey)) {
      currentCmds.push(cmd)
    } else {
      groups.push({ key: currentKey, commands: currentCmds })
      currentKey = cmdKey
      currentCmds = [cmd]
    }
  }

  if (currentCmds.length > 0) {
    groups.push({ key: currentKey, commands: currentCmds })
  }

  return groups
}

function mergeRectBounds(commands: DrawCommand[]): Rect {
  const bounds = commands
    .filter(cmd => cmd.bounds.width > 0 || cmd.bounds.height > 0)
    .map(cmd => cmd.bounds)
  if (bounds.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  return mergeRects(bounds)
}

function executeShapeBody(ctx: DrawContext, cmd: DrawCommand, paint: () => void): void {
  switch (cmd.type) {
    case 'fillRect':
      ctx.fillRect(cmd.rect.x, cmd.rect.y, cmd.rect.width, cmd.rect.height)
      break
    case 'strokeRect':
      ctx.strokeRect(cmd.rect.x, cmd.rect.y, cmd.rect.width, cmd.rect.height)
      break
    case 'fillCircle':
    case 'strokeCircle':
      ctx.beginPath()
      ctx.arc(cmd.center.x, cmd.center.y, cmd.radius, 0, Math.PI * 2)
      paint()
      break
    case 'fillRoundRect':
    case 'strokeRoundRect':
      ctx.beginPath()
      ctx.roundRect(cmd.rect.x, cmd.rect.y, cmd.rect.width, cmd.rect.height, cmd.radius)
      paint()
      break
    case 'fillPath':
    case 'strokePath':
      executePathCommands(ctx, cmd.path)
      paint()
      break
    case 'drawLine':
      ctx.beginPath()
      ctx.moveTo(cmd.start.x, cmd.start.y)
      ctx.lineTo(cmd.end.x, cmd.end.y)
      paint()
      break
    default:
      cmd.execute()
      break
  }
}

function executeFillBody(ctx: DrawContext, cmd: DrawCommand): void {
  executeShapeBody(ctx, cmd, () => ctx.fill())
}

function executeStrokeBody(ctx: DrawContext, cmd: DrawCommand): void {
  executeShapeBody(ctx, cmd, () => ctx.stroke())
}

function createBatchFill(ctx: DrawContext, commands: DrawCommand[], color: Color): BatchFillCommand {
  const colorStr = colorToString(color)
  return {
    type: 'batchFill',
    commands,
    color,
    bounds: mergeRectBounds(commands),
    execute(): void {
      ctx.fillStyle = colorStr
      for (const cmd of commands) {
        executeFillBody(ctx, cmd)
      }
    },
  }
}

function createBatchStroke(ctx: DrawContext, commands: DrawCommand[], color: Color, strokeWidth: number): BatchStrokeCommand {
  const colorStr = colorToString(color)
  return {
    type: 'batchStroke',
    commands,
    color,
    strokeWidth,
    bounds: mergeRectBounds(commands),
    execute(): void {
      ctx.strokeStyle = colorStr
      ctx.lineWidth = strokeWidth
      for (const cmd of commands) {
        executeStrokeBody(ctx, cmd)
      }
    },
  }
}

function createBatchText(ctx: DrawContext, commands: DrawCommand[], styleStr: string): BatchTextCommand {
  return {
    type: 'batchText',
    commands,
    styleStr,
    bounds: mergeRectBounds(commands),
    execute(): void {
      ctx.font = styleStr
      for (const cmd of commands) {
        if (cmd.type === 'fillText') {
          ctx.fillText(cmd.text, cmd.position.x, cmd.position.y)
        } else {
          cmd.execute()
        }
      }
    },
  }
}

function extractColorFromBatch(commands: DrawCommand[]): { color: Color; strokeWidth: number } {
  const first = commands[0]!
  const color = extractCommandColor(first)
  if (color === null) {
    throw new Error('Cannot extract color from batch: first command has no color')
  }
  const strokeWidth = extractCommandStrokeWidth(first) || 1
  return { color, strokeWidth }
}

function extractTextStyleFromBatch(commands: DrawCommand[]): string {
  const first = commands[0]!
  const fontSize = extractCommandFontSize(first) || 14
  return `${fontSize}px sans-serif`
}

function createBatchFromGroup(ctx: DrawContext, group: BatchGroup): DrawCommand[] {
  const { key, commands } = group
  if (commands.length <= 1 || key.groupType === 'other' || key.groupType === 'image') {
    return commands
  }

  switch (key.groupType) {
    case 'fill': {
      const { color } = extractColorFromBatch(commands)
      return [createBatchFill(ctx, commands, color)]
    }
    case 'stroke': {
      const { color, strokeWidth } = extractColorFromBatch(commands)
      return [createBatchStroke(ctx, commands, color, strokeWidth)]
    }
    case 'text': {
      const styleStr = extractTextStyleFromBatch(commands)
      return [createBatchText(ctx, commands, styleStr)]
    }
    default:
      return commands
  }
}

function batchCommands(ctx: DrawContext, commands: DrawCommand[]): DrawCommand[] {
  if (commands.length <= 1) return commands

  const groups = buildBatchGroups(commands)
  const result: DrawCommand[] = []
  for (const group of groups) {
    result.push(...createBatchFromGroup(ctx, group))
  }
  return result
}

export type { BatchGroupType, BatchKey, BatchGroup }

export {
  computeBatchKey,
  areBatchKeysEqual,
  buildBatchGroups,
  batchCommands,
  createBatchFill,
  createBatchStroke,
  createBatchText,
}
