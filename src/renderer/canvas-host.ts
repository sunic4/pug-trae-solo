import type { CanvasHost, DrawCommand, DrawContext, LayerNode } from '@/renderer/types'
import { createDirtyRegion } from '@/renderer/dirty-region'
import { batchCommands } from '@/renderer/draw-batch'

class CanvasHostImpl implements CanvasHost {
  readonly canvas: HTMLCanvasElement
  readonly ctx: DrawContext
  private _disposed = false
  private _batchEnabled = true

  constructor(canvas: HTMLCanvasElement, ctx?: DrawContext) {
    this.canvas = canvas
    if (ctx !== undefined) {
      this.ctx = ctx
    } else {
      const canvasCtx = canvas.getContext('2d')
      if (canvasCtx === null) {
        throw new Error('Failed to acquire 2d context from canvas')
      }
      this.ctx = canvasCtx
    }
  }

  setBatchEnabled(enabled: boolean): void {
    this._batchEnabled = enabled
  }

  render(commands: DrawCommand[]): void {
    if (this._disposed) {
      throw new Error('CanvasHost has been disposed')
    }
    const cmds = this._batchEnabled ? batchCommands(this.ctx, commands) : commands
    for (const cmd of cmds) {
      cmd.execute()
    }
  }

  renderLayers(root: LayerNode): void {
    if (this._disposed) {
      throw new Error('CanvasHost has been disposed')
    }
    const dirtyNodes = this._collectDirtyNodes(root)
    if (dirtyNodes.length === 0) return

    const dirtyRegion = createDirtyRegion()
    for (const node of dirtyNodes) {
      dirtyRegion.add(node.bounds)
    }

    const mergedRect = dirtyRegion.merge()
    if (mergedRect.width <= 0 || mergedRect.height <= 0) return

    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(mergedRect.x, mergedRect.y, mergedRect.width, mergedRect.height)
    this.ctx.clip()
    this.ctx.clearRect(mergedRect.x, mergedRect.y, mergedRect.width, mergedRect.height)

    this._renderNodeRecursive(root)

    this.ctx.restore()

    root.markClean()
  }

  clear(): void {
    if (this._disposed) {
      throw new Error('CanvasHost has been disposed')
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  dispose(): void {
    this._disposed = true
  }

  private _collectDirtyNodes(node: LayerNode): LayerNode[] {
    const result: LayerNode[] = []
    if (node.dirty) {
      result.push(node)
    }
    for (const child of node.children) {
      result.push(...this._collectDirtyNodes(child))
    }
    return result
  }

  private _renderNodeRecursive(node: LayerNode): void {
    for (const cmd of node.cachedCommands) {
      cmd.execute()
    }
    for (const child of node.children) {
      this._renderNodeRecursive(child)
    }
  }
}


function createCanvasHost(canvas: HTMLCanvasElement, ctx?: DrawContext): CanvasHost {
  return new CanvasHostImpl(canvas, ctx)
}

export { CanvasHostImpl, createCanvasHost }
