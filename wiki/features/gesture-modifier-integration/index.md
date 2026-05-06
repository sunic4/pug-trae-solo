---
id: "feat-11b"
type: feature
status: done
title: "Pinch 识别器 + 手势 Modifier 集成"
origin_type: req
depends_on: ["feat-11a"]
created: "2026-05-01 17:18"
updated: "2026-05-01 17:18"
stale: false
---

# feat-11b: Pinch 识别器 + 手势 Modifier 集成

## 实现思路概述

基于 feat-11a 的手势识别器核心基础设施，实现：

1. **PinchGestureRecognizer** — 双指缩放/旋转识别器，追踪两指间距离变化和旋转角度
2. **手势 Modifier 集成** — 将手势识别器通过 Modifier 声明式 API 暴露给组件层

核心设计（来自 ADR #7）：

```typescript
Modifier.clickable(onClick)
Modifier.longPressable(onLongPress)
Modifier.draggable(onDragStart, onDrag, onDragEnd)
Modifier.transformable(onTransform)
Modifier.scrollable(state, orientation)
Modifier.pointerInput(block)
```

### Pinch 识别器设计

- 追踪两个指针的位置变化
- 计算缩放因子 = 当前距离 / 初始距离
- 计算旋转角度 = 当前角度 - 初始角度
- 焦点 = 两指中点
- 最小缩放阈值防止误触

### Modifier 集成设计

手势 Modifier 是 `kind: 'input'` 类型的 ModifierElement，携带手势识别器实例和回调。
PointerEventDispatcher 通过 HandlerResolver 查找节点上的 input Modifier，将事件传递给手势识别器。

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/input/pinch-recognizer.ts` | PinchGestureRecognizer (缩放+旋转) |
| 新建 | `src/input/gesture-modifier.ts` | 手势 Modifier 元素定义 |
| 新建 | `src/input/__tests__/gesture-modifier.test.ts` | Pinch + Modifier 集成测试 |
| 修改 | `src/layout/modifier.ts` | 添加手势 Modifier 方法 |
| 修改 | `src/input/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### pinch-recognizer.ts

```typescript
interface TransformEvent {
  readonly type: 'transformStart' | 'transform' | 'transformEnd'
  readonly state: GestureState
  readonly scale: number
  readonly rotation: number
  readonly focalPoint: Point
  readonly pointerIds: [number, number]
  readonly timestamp: number
}

type TransformCallback = (event: TransformEvent) => void

interface PinchGestureRecognizer extends GestureRecognizer {
  onTransformStart: TransformCallback | null
  onTransform: TransformCallback | null
  onTransformEnd: TransformCallback | null
  readonly minScaleDistance: number
}
```

### gesture-modifier.ts

```typescript
interface ClickableElement extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'clickable'
  readonly onClick: GestureCallback
  readonly onLongClick: GestureCallback | null
}

interface DraggableElement extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'draggable'
  readonly direction: DragDirection
  readonly onDragStart: GestureCallback
  readonly onDrag: GestureCallback
  readonly onDragEnd: GestureCallback
}

interface TransformableElement extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'transformable'
  readonly onTransformStart: TransformCallback
  readonly onTransform: TransformCallback
  readonly onTransformEnd: TransformCallback
}

interface ScrollableElement extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'scrollable'
  readonly direction: DragDirection
  readonly onScroll: GestureCallback
  readonly onFling: GestureCallback | null
}

interface PointerInputElement extends ModifierElement {
  readonly kind: 'input'
  readonly name: 'pointerInput'
  readonly handler: PointerInputHandler
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 85% : 集成 15% |
| Mock 策略 | 手动构造 PointerEventData |
| 关键路径 | 1) Pinch 双指缩放识别 2) Modifier.clickable 创建正确元素 3) Modifier.draggable 创建正确元素 |
| 边界测试 | 1) 单指不触发 Pinch 2) 空 Modifier 链 3) 多个手势 Modifier 叠加 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| 多指触控 pointerId 管理 | Pinch 严格追踪两个 pointerId |
| Modifier 方法与现有方法冲突 | 命名隔离：clickable/longPressable/draggable/transformable/scrollable |
| 手势 Modifier 与 PointerInputModifier 关系 | PointerInputElement 是底层，手势 Modifier 是高层封装 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] PinchGestureRecognizer 正确识别双指缩放和旋转
- [x] Modifier.clickable/longPressable/draggable/transformable/scrollable 创建正确元素
- [x] impl-checklist.yaml 所有条目 = done
