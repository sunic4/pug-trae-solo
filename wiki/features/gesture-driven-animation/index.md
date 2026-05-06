---
id: "feat-27"
type: feature
status: done
title: "手势驱动动画 (Drag跟随/惯性滑动/Spring回弹)"
origin_type: req
depends_on: ["feat-11", "feat-13"]
created: "2026-05-01 19:00"
updated: "2026-05-01 19:00"
stale: false
---

# feat-27: 手势驱动动画 (Drag跟随/惯性滑动/Spring回弹)

## 实现思路概述

基于 feat-11 (手势识别器) 和 feat-13 (属性动画框架)，实现手势驱动的动画能力。

1. **DraggableState** — 可拖拽状态容器，支持 dragTo/fling/settle 三种驱动方式
2. **DecaySpec** — 衰减动画规格，用于惯性滑动 (fling)，速度按指数衰减
3. **AnchoredDraggable** — 锚点拖拽，拖拽结束后自动弹到最近锚点 (Spring回弹)

### 手势驱动动画模型

```
手势按下 → dragTo(delta) → 实时跟随
手势抬起 → fling(velocity, decaySpec) → 惯性滑动
到达边界 → settle(springSpec) → Spring回弹到锚点
```

### Decay 衰减模型

```
v(t) = v0 × e^(-friction × t)
x(t) = x0 + v0 / friction × (1 - e^(-friction × t))
```

friction 越大，衰减越快，滑动距离越短。

### AnchoredDraggable 锚点模型

```
锚点: { left: 0, center: 150, right: 300 }
拖拽偏移 → 释放 → Spring动画到最近锚点
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/animation/gesture-animation.ts` | DraggableState + DecaySpec + AnchoredDraggable |
| 新建 | `src/animation/__tests__/gesture-animation.test.ts` | 手势驱动动画单元测试 |
| 修改 | `src/animation/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### gesture-animation.ts

```typescript
interface DecaySpec extends AnimationSpec<number> {
  friction: number
}

interface DraggableState {
  readonly offset: number
  readonly isAnimationRunning: boolean
  dragTo(delta: number): void
  fling(velocity: number, spec?: DecaySpec): Promise<void>
  settle(target: number, spec?: AnimationSpec<number>): Promise<void>
  snapTo(value: number): void
  stop(): void
}

interface AnchorConfig {
  readonly anchors: ReadonlyMap<number, string>
  readonly initialAnchor: number
}

interface AnchoredDraggable {
  readonly offset: number
  readonly currentAnchor: number
  readonly currentAnchorLabel: string
  dragTo(delta: number): void
  fling(velocity: number, decaySpec?: DecaySpec, springSpec?: AnimationSpec<number>): Promise<void>
  settle(springSpec?: AnimationSpec<number>): Promise<void>
  snapTo(anchor: number): void
  dispose(): void
}

function decay(options?: { friction?: number }): DecaySpec
function createDraggableState(initialOffset?: number, onChange?: (offset: number) => void): DraggableState
function createAnchoredDraggable(config: AnchorConfig, springSpec?: AnimationSpec<number>): AnchoredDraggable
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 策略 | Mock requestAnimationFrame 驱动动画帧 |
| 关键路径 | 1) dragTo 实时跟随 2) fling 惯性衰减 3) settle Spring回弹 4) AnchoredDraggable 锚点选择 |
| 边界测试 | 1) 零速度 fling 2) 零摩擦力 3) 无锚点匹配 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| requestAnimationFrame 不精确 | 使用 performance.now() 计算实际经过时间 |
| Decay 动画无限运行 | 设置速度阈值 (< 0.5px/s) 终止 |
| 多次 fling 竞争 | 新 fling 自动 stop 前一个 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] DraggableState 正确跟随 dragTo
- [x] DecaySpec 正确衰减速度
- [x] AnchoredDraggable 正确选择最近锚点
- [x] impl-checklist.yaml 所有条目 = done
