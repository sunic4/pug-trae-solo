import type { Snapshot } from '@/core/types'
import type { Recomposer } from '@/core/types'
import type { ComposerContext } from '@/core/types'
import type { MeasurePolicy } from '@/layout/types'
import type { DrawPolicy, ChildLayout, MeasuredSizeMap } from '@/components/basic/types'
import type { Rect } from '@/renderer/types'
import type { ReadonlyModifier } from '@/layout/modifier'

type NodeId = number

type LayoutChildrenFn = (
  contentArea: Rect,
  measuredSizes: MeasuredSizeMap,
  childrenIds: readonly number[],
) => ChildLayout[]

type EmittedNode = {
  readonly id: NodeId
  readonly data: unknown
  readonly modifier: ReadonlyModifier
  readonly measurePolicy: MeasurePolicy
  readonly drawPolicy: DrawPolicy
  readonly layoutChildren: LayoutChildrenFn | null
  readonly parentId: NodeId | null
  childrenIds: NodeId[]
}

interface CompositionContext extends ComposerContext {
  emitNode(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy?: DrawPolicy,
    layoutChildren?: LayoutChildrenFn,
  ): void
  emitLeaf(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy?: DrawPolicy,
  ): void
  endGroup(): void
  readonly emittedNodes: Map<NodeId, EmittedNode>
  rootNodeId: NodeId | null
}

class CompositionContextImpl implements CompositionContext {
  readonly snapshot: Snapshot
  readonly recomposer: Recomposer

  private _nextId: NodeId = 0
  private _nodes: Map<NodeId, EmittedNode> = new Map()
  private _groupStack: Array<{ nodeId: NodeId; childrenIdsRef: NodeId[] }> = []
  _rootNodeId: NodeId | null = null

  constructor(snapshot: Snapshot, recomposer: Recomposer) {
    this.snapshot = snapshot
    this.recomposer = recomposer
  }

  get emittedNodes(): Map<NodeId, EmittedNode> {
    return this._nodes
  }

  get rootNodeId(): NodeId | null {
    return this._rootNodeId
  }

  emitNode(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy?: DrawPolicy,
    layoutChildren?: LayoutChildrenFn,
  ): void {
    const id = this._nextId++
    const parentId = this._groupStack.length > 0
      ? this._groupStack[this._groupStack.length - 1]!.nodeId
      : null

    const isContainer = layoutChildren !== undefined
    const childrenIdsRef: NodeId[] = []

    const node: EmittedNode = {
      id,
      data,
      modifier,
      measurePolicy,
      drawPolicy: drawPolicy ?? (() => {}),
      layoutChildren: layoutChildren ?? null,
      parentId,
      childrenIds: childrenIdsRef,
    }

    this._nodes.set(id, node)
    this._attachToParent(id, parentId)

    if (isContainer) {
      this._groupStack.push({ nodeId: id, childrenIdsRef })
    }

    if (this._rootNodeId === null) {
      this._rootNodeId = id
    }
  }

  emitLeaf(
    data: unknown,
    modifier: ReadonlyModifier,
    measurePolicy: MeasurePolicy,
    drawPolicy?: DrawPolicy,
  ): void {
    const id = this._nextId++
    const parentId = this._groupStack.length > 0
      ? this._groupStack[this._groupStack.length - 1]!.nodeId
      : null

    const node: EmittedNode = {
      id,
      data,
      modifier,
      measurePolicy,
      drawPolicy: drawPolicy ?? (() => {}),
      layoutChildren: null,
      parentId,
      childrenIds: [],
    }

    this._nodes.set(id, node)
    this._attachToParent(id, parentId)
  }

  endGroup(): void {
    if (this._groupStack.length === 0) {
      throw new Error('endGroup() called without matching emitNode with layoutChildren')
    }
    this._groupStack.pop()
  }

  private _attachToParent(id: NodeId, parentId: NodeId | null): void {
    if (parentId !== null) {
      const parent = this._nodes.get(parentId)!
      parent.childrenIds.push(id)
    }
  }
}

export type { CompositionContext, EmittedNode, NodeId, LayoutChildrenFn }
export { CompositionContextImpl }
