---
id: "animation-system-property-driven"
type: architecture
status: accepted
title: "动画系统 — 属性动画优先 (Compose 风格)"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
created: "2026-04-30 17:28"
updated: "2026-04-30 17:29"
stale: false
---

# ADR: 动画系统 — 属性动画优先

## 背景

Canvas UI 需要流畅的动画系统，且必须与响应式状态系统深度集成。

## 决策结果

**属性动画优先模型**（参考 Compose `androidx.compose.animation`）

### 核心 API

```typescript
// Animatable<T>: 可动画值容器
class Animatable<T> {
  constructor(initialValue: T, typeConverter: VectorConverter<T>)
  
  animateTo(targetValue: T, spec: AnimationSpec<T>): Promise<void>
  snapTo(targetValue: T): void
  
  get value(): T // ← 自动触发重组
}

// animate*AsState: 状态→动画自动桥接
function animateFloatAsState(
  targetValue: Float,
  animationSpec?: AnimationSpec<Float>
): State<Float>

function animateColorAsState(
  targetValue: Color,
  animationSpec?: AnimationSpec<Color>
): State<Color>

function animateDpAsState(...): State<Dp>

// updateTransition: 多属性协同过渡
function updateTransition(
  targetState: S,
  label?: string
): Transition<S>

interface Transition<S> {
  <T> animateFloat(
    key: () => T,
    targetValueByState: (S) => T,
    spec?: AnimationSpec<Float>
  ): State<T>
}

// 使用示例
const FadingButton = composable<{ pressed: boolean }>(({ pressed }) => {
  const alpha by animateFloatAsState(if (pressed) 0.6f else 1f, tween(100))
  const scale by animateFloatAsState(if (pressed) 0.95f else 1f, spring())
  
  return Button({
    modifier: Modifier.graphicsLayer {
      this.alpha = alpha;
      this.scaleX = scale;
      this.scaleY = scale;
    }
  });
});
```

### AnimationSpec 族系

| Spec | 适用场景 | 参数 |
|------|---------|------|
| `tween(duration, easing)` | 固定时长 | durationMillis, easing |
| `spring(dampingRatio, stiffness)` | 物理弹性 | dampingRatio, stiffness |
| `keyframes { at(...) using ... }` | 多阶段 | 关键帧定义 |
| `repeatable(iterations, animation)` | 循环 | 次数, 动作 |
| `infiniteRepeatable(...)` | 无限循环 | 同上无终止 |

### 与 Snapshot 系统集成

```
Animatable.value 变更 → 触发 Snapshot.write() → 标记 RecomposeScope 脏 → 下一帧重组 → 渲染新值
```

## 正面影响

- ✅ 声明式、零命令式帧控制
- ✅ 与状态系统无缝集成
- ✅ Compose API 一致性
- ✅ 支持 Spring 物理/关键帧/循环等完整规格

## 实现约束

1. **基于 requestAnimationFrame** 驱动动画帧
2. **Animatable 必须在 composable 内部使用**（通过 remember）
3. **支持取消和快照**（dispose 时停止）

## 可逆性评估

🟢 **可逆** (~6 文件，~800 行代码)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:29 | 用户 + AI | 属性动画优先，Compose 风格 API |
