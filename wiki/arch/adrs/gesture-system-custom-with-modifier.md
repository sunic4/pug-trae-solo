---
id: "gesture-system-custom-with-modifier"
type: architecture
status: accepted
title: "手势系统 — 自研手势识别器 + Modifier 声明式集成"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./modifier-chain-builder-freeze-pattern.md"
created: "2026-04-30 17:25"
updated: "2026-04-30 17:26"
stale: false
---

# ADR: 手势系统 — 自研 + Modifier 集成

## 背景

Canvas UI 运行时需要完整的手势交互能力，且必须零 DOM 依赖。

## 决策结果

**自研手势识别器 + 通过 Modifier 声明式集成**

### 核心设计

```typescript
// 内置手势 Modifier
Modifier.clickable(onClick)
Modifier.scrollable(state, orientation)
Modifier.draggable(state)
Modifier.pointerInput(block) // 高级组合手势
```

### 支持的手势类型

| 手势 | Modifier | 触发条件 |
|------|----------|---------|
| Tap | `clickable` | 指下+抬起 < 300ms，位移 < 18dp |
| LongPress | `longPressable` | 按住 > 500ms，位移 < 18dp |
| Drag (1指) | `draggable` | 移动 > 18dp 后开始跟踪 |
| Pinch (2指) | `transformable` | 双指距离变化 |
| Fling | `scrollable` | 快速滑动后松手（带惯性） |

### 架构流程

```
PointerEvent → Hit Test → Gesture Interceptor → Recognizer → Callback/State
```

## 正面影响

- ✅ 零 DOM 依赖（纯 Canvas 坐标计算）
- ✅ 与 Modifier 系统一（声明式、可组合）
- ✅ Compose API 兼容
- ✅ 手势冲突内置解决机制

## 实现约束

1. **基于 Pointer Events Level 2**
2. **命中测试使用 LayoutNode 树**
3. **手势互斥表可自定义**

## 可逆性评估

🟡 **部分可逆** (~8 文件，~1500 行代码)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 17:26 | 用户 + AI | 自研手势 + Modifier 集成 |
