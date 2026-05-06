---
id: "feat-13"
type: feature
status: done
title: "属性动画框架 (AnimationSpec/Animatable/animateAsState)"
origin_type: req
depends_on: ["feat-01", "feat-02"]
created: "2026-05-01 15:30"
updated: "2026-05-01 15:30"
stale: false
---

# feat-13: 属性动画框架 (AnimationSpec/Animatable/animateAsState)

## 实现思路概述

基于 ADR #8 (属性动画优先)，实现 Compose 风格属性动画框架：

1. **AnimationSpec** — 动画规格族系 (Tween/Spring/Keyframes/Repeatable)
2. **Animatable<T>** — 可动画值容器，驱动 requestAnimationFrame 循环
3. **animateFloatAsState** — 状态→动画自动桥接

设计原则（来自 ADR #8）：
- 属性动画优先，Animatable.value 变更触发 Snapshot.write → 重组
- 基于 requestAnimationFrame 驱动动画帧
- Animatable 必须在 composable 内部使用（通过 remember）
- 支持取消和快照（dispose 时停止）

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/animation/animation-spec.ts` | AnimationSpec 类型 + tween/spring/keyframes 工厂 |
| 新建 | `src/animation/animatable.ts` | Animatable 类 + animateFloatAsState |
| 修改 | `src/animation/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### animation-spec.ts

```typescript
type Easing = (fraction: number) => number
type AnimationResult = { value: number; done: boolean }

interface AnimationSpec<T> {
  getValueFromNanos(playTimeNanos: number, start: T, end: T, startNanos: number): AnimationResult
}

interface TweenSpec<T> extends AnimationSpec<T> {
  durationMillis: number
  easing: Easing
}

interface SpringSpec<T> extends AnimationSpec<T> {
  dampingRatio: number
  stiffness: number
}

function tween(options?: { durationMillis?: number; easing?: Easing }): TweenSpec<number>
function spring(options?: { dampingRatio?: number; stiffness?: number }): SpringSpec<number>
function keyframes(config: KeyframesConfig): AnimationSpec<number>
```

### animatable.ts

```typescript
class Animatable<T> {
  constructor(initialValue: T)
  get value(): T
  get isRunning(): boolean
  animateTo(target: T, spec?: AnimationSpec<T>): Promise<void>
  snapTo(value: T): void
  stop(): void
}

function animateFloatAsState(targetValue: number, spec?: AnimationSpec<number>): State<number>
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 90% : 集成 10% |
| Mock 策略 | Mock requestAnimationFrame |
| 关键路径 | 1) Tween 插值计算 2) Spring 物理模拟 3) Animatable 状态管理 |
| 边界测试 | 1) duration=0 2) snapTo 中断动画 3) 相同目标值 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Tween/Spring/Keyframes 正确计算插值
- [x] Animatable 支持动画循环和取消
