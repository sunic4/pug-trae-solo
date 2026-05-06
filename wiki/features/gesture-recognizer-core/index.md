---
id: "feat-11a"
type: feature
status: done
title: "手势识别器核心 (Base + Tap/LongPress/Drag + GestureArena)"
origin_type: req
depends_on: ["feat-10"]
created: "2026-05-01 17:12"
updated: "2026-05-01 17:12"
stale: false
---

# feat-11a: 手势识别器核心

## 实现思路概述

基于 ADR #7 (手势系统 — 自研手势识别器 + Modifier 声明式集成)，实现手势识别器的核心基础设施和三种最常用的手势识别器。

```
PointerEvent → Hit Test → GestureArena → Recognizer → Callback/State
   [feat-10]              [feat-11a]       [feat-11a]    [feat-11a]
```

本功能覆盖：

1. **手势识别器基础类型** — GestureState 状态机、GestureEvent 事件、GestureRecognizer 接口
2. **GestureArena** — 手势冲突仲裁器，解决多个识别器竞争同一指针序列的问题
3. **TapGestureRecognizer** — 点击 + 双击识别（down+up < 300ms，位移 < 18px）
4. **LongPressGestureRecognizer** — 长按识别（按住 > 500ms，位移 < 18px）
5. **DragGestureRecognizer** — 拖拽识别（移动 > 18px 后开始跟踪，支持方向约束）
6. **VelocityTracker** — 速度追踪器，为 Fling 手势提供速度数据

设计原则（来自 ADR #7）：
- 基于 Pointer Events Level 2
- 零 DOM 依赖（纯坐标计算）
- 手势互斥表可自定义
- 状态机驱动，每个识别器独立维护状态

### 状态机模型

所有手势识别器遵循统一的状态机：

```
possible → recognized (Tap/LongPress)
possible → began → changed → ended (Drag)
possible → failed (超时/位移过大/条件不满足)
any → cancelled (系统取消)
```

### GestureArena 仲裁策略

当多个识别器竞争同一指针序列时：
1. 第一个识别为 `recognized`/`began` 的识别器胜出
2. 胜出后，其余竞争者被强制设为 `failed`
3. 支持 `eager` 优先级（如 Tap 优先于 LongPress）

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/input/gesture-recognizer.ts` | 核心类型 + GestureArena + Tap/LongPress/Drag 识别器 + VelocityTracker |
| 新建 | `src/input/__tests__/gesture-recognizer.test.ts` | 手势识别器单元测试 |
| 修改 | `src/input/index.ts` | 模块公共 API 导出 |
| 修改 | `src/index.ts` | 顶层公共 API 导出 |

## 接口与类型定义

### gesture-recognizer.ts

```typescript
type GestureState = 'possible' | 'recognized' | 'began' | 'changed' | 'ended' | 'cancelled' | 'failed'

interface GestureEvent {
  readonly type: 'tap' | 'doubleTap' | 'longPress' | 'dragStart' | 'drag' | 'dragEnd'
  readonly state: GestureState
  readonly position: Point
  readonly localPosition: Point
  readonly pointerId: number
  readonly timestamp: number
  readonly delta?: Point
  readonly velocity?: Point
}

type GestureCallback = (event: GestureEvent) => void

interface GestureRecognizer {
  readonly state: GestureState
  readonly eager: boolean
  addPointerEvent(event: PointerEventData): void
  reset(): void
  dispose(): void
}

interface GestureArena {
  addRecognizer(recognizer: GestureRecognizer): void
  removeRecognizer(recognizer: GestureRecognizer): void
  handleEvent(event: PointerEventData): void
  dispose(): void
}

// TapGestureRecognizer
interface TapGestureRecognizer extends GestureRecognizer {
  onTap: GestureCallback | null
  onDoubleTap: GestureCallback | null
  readonly doubleTapTimeout: number
  readonly touchSlop: number
}

// LongPressGestureRecognizer
interface LongPressGestureRecognizer extends GestureRecognizer {
  onLongPress: GestureCallback | null
  readonly delay: number
  readonly touchSlop: number
}

// DragGestureRecognizer
type DragDirection = 'all' | 'horizontal' | 'vertical'

interface DragGestureRecognizer extends GestureRecognizer {
  onDragStart: GestureCallback | null
  onDrag: GestureCallback | null
  onDragEnd: GestureCallback | null
  readonly direction: DragDirection
  readonly touchSlop: number
}

// VelocityTracker
interface VelocityTracker {
  addPosition(time: number, position: Point): void
  getVelocity(): Point
  reset(): void
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | 手动构造 PointerEventData，无需 mock |
| 关键路径 | 1) Tap 单击/双击识别 2) LongPress 超时触发 3) Drag 拖拽+速度追踪 4) GestureArena 冲突仲裁 |
| 边界测试 | 1) 指针位移刚好在 touchSlop 边界 2) 空竞技场无识别器 3) 识别器 dispose 后不再响应 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| 手势状态机复杂度 | 统一状态转换，禁止非法跳转 |
| 多指触控 pointerId 混淆 | 每个 PointerEventData 携带 pointerId，识别器按 pointerId 分组 |
| GestureArena 死锁 | eager 优先级 + 超时自动 fail |
| VelocityTracker 精度 | 采样窗口限制 + 加权平均 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] TapGestureRecognizer 正确识别单击和双击
- [x] LongPressGestureRecognizer 正确识别长按（>500ms）
- [x] DragGestureRecognizer 正确识别拖拽并追踪速度
- [x] GestureArena 正确仲裁冲突手势
- [x] VelocityTracker 正确计算速度
- [x] impl-checklist.yaml 所有条目 = done
