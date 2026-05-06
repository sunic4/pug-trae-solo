---
id: "feat-10"
type: feature
status: done
title: "Pointer Event 封装与命中测试"
origin_type: req
depends_on: ["feat-09"]
created: "2026-05-01 16:44"
updated: "2026-05-01 17:00"
stale: false
---

# feat-10: Pointer Event 封装与命中测试

## 实现思路概述

基于 ADR #7 (手势系统 — 自研手势识别器 + Modifier 声明式集成)，实现手势系统的前半段基础设施：

```
PointerEvent → Hit Test → Gesture Interceptor → Recognizer → Callback/State
   [feat-10]              [feat-10]              [feat-11]     [feat-11]
```

本功能覆盖 **PointerEvent 封装** + **命中测试** + **事件分发** 三部分，为 feat-11 手势识别器提供输入基础。

核心设计：

1. **PointerEventData** — 将浏览器原生 PointerEvent 转换为 Canvas 坐标系下的纯数据对象，屏蔽 DOM 依赖
2. **HitTest** — 基于 LayoutNode 树进行深度优先逆序遍历，找到最深层命中的节点，返回节点 + 本地坐标
3. **PointerEventDispatcher** — 挂载到 Canvas 元素，监听原生 pointer 事件，执行 hit test 后分发给命中节点链上的 input Modifier 处理器

设计原则（来自 ADR #7）：
- 基于 Pointer Events Level 2
- 命中测试使用 LayoutNode 树
- 零 DOM 依赖（纯 Canvas 坐标计算）
- 事件冒泡：从命中节点沿 parent 链向上传递

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/input/pointer-event.ts` | PointerEventType + PointerEventData + HitTestResult 类型定义 |
| 新建 | `src/input/hit-test.ts` | 命中测试算法 (基于 LayoutNode 树深度优先逆序遍历) |
| 新建 | `src/input/pointer-dispatcher.ts` | 事件分发器 (Canvas DOM → PointerEventData → HitTest → 分发) |
| 新建 | `src/input/__tests__/pointer-event.test.ts` | PointerEventData 构造 + HitTest + Dispatcher 单元测试 |
| 修改 | `src/input/index.ts` | 模块公共 API 导出 |
| 修改 | `src/index.ts` | 顶层公共 API 导出 |

## 接口与类型定义

### pointer-event.ts

```typescript
type PointerEventType = 'down' | 'move' | 'up' | 'cancel'

interface PointerEventData {
  readonly pointerId: number
  readonly type: PointerEventType
  readonly position: Point
  readonly localPosition: Point
  readonly pressure: number
  readonly tiltX: number
  readonly tiltY: number
  readonly timestamp: number
  readonly buttons: number
  readonly isPrimary: boolean
}

interface HitTestResult {
  readonly node: LayoutNode
  readonly localPosition: Point
}

interface PointerInputHandler {
  (event: PointerEventData): void
}

interface PointerInputModifier extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'pointerInput'
  readonly handler: PointerInputHandler
}

function createPointerEventData(
  nativeEvent: PointerEvent,
  canvasRect: DOMRect,
  localPosition?: Point,
): PointerEventData

function toPointerEventType(type: string): PointerEventType
```

### hit-test.ts

```typescript
interface HitTestableNode {
  readonly id: number
  readonly position: { x: number; y: number }
  readonly measureResult: MeasureResult | null
  readonly children: HitTestableNode[]
  readonly parent: HitTestableNode | null
}

function hitTest(
  root: HitTestableNode,
  x: number,
  y: number,
): HitTestResult | null

function isPointInNode(
  node: HitTestableNode,
  x: number,
  y: number,
): boolean
```

### pointer-dispatcher.ts

```typescript
interface PointerEventDispatcher {
  attach(canvas: HTMLCanvasElement): void
  detach(): void
  setRootNode(root: LayoutNode | null): void
  setHandlerResolver(resolver: PointerHandlerResolver): void
  dispose(): void
}

type PointerHandlerResolver = (
  node: LayoutNode,
) => PointerInputHandler | null

function createPointerEventDispatcher(): PointerEventDispatcher
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | Canvas/DOM 事件用 mock；LayoutNode 用真实对象 |
| 关键路径 | 1) PointerEventData 构造与坐标转换 2) HitTest 深度优先逆序遍历找到最深节点 3) Dispatcher 事件分发冒泡 |
| 边界测试 | 1) 空树 hitTest 返回 null 2) 点击空白区域返回 null 3) 节点无 measureResult 跳过 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| LayoutNode 接口与 HitTestableNode 不完全匹配 | 定义最小约束接口，LayoutNode 天然满足 |
| Canvas DPR 缩放影响坐标 | createPointerEventData 内部处理 DPR |
| 多指触控 pointerId 区分 | PointerEventData 包含 pointerId + isPrimary |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] PointerEventData 正确封装浏览器事件 + 坐标转换
- [x] HitTest 深度优先逆序遍历找到最深层命中节点
- [x] PointerEventDispatcher 挂载/卸载 Canvas 事件监听
- [x] 事件冒泡：从命中节点沿 parent 链向上传递
- [x] impl-checklist.yaml 所有条目 = done
