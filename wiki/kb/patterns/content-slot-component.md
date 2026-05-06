---
title: "Content-Slot 组件模型 — Composition over Inheritance"
type: knowledge
status: verified
category: pattern
source: "cc-fix - 2026-05-02"
see_also: ["component-convergence-rules", "component-convergence-lesson"]
cross_project: true
cross_project_tags: ["ui-components", "composition", "api-design"]
created: "2026-05-02T10:30"
updated: "2026-05-02T10:30"
---

# Content-Slot 组件模型

## 一句话总结

交互组件统一使用 `children: ComponentNode[]` 作为内容槽，不使用 `label`/`icon` 等专用字符串参数。文本内容由调用方组合 `Text()` 子组件传入。

## 问题/场景

Compose 风格 UI 运行时中，Button、FAB 等交互组件最初使用专用参数传递内容：

```typescript
function Button(onClick, label: string, ...): ButtonComponent    // ❌ 旧：label 字符串
function FAB(onClick, icon: string, ...): FabComponent           // ❌ 旧：icon 字符串
```

这导致：
1. **无法组合复杂内容** — 想在按钮里放图标+文字需要新建组件变体（IconButton）
2. **组件爆炸** — 每种内容组合都需要一个独立组件类型
3. **与 Compose 设计哲学矛盾** — Compose 的核心就是 Composition over Inheritance

## 解决方案

所有可容纳子内容的组件统一使用 `children: ComponentNode[]`：

```typescript
interface ButtonComponent {
  readonly kind: 'button'
  readonly modifier: ReadonlyModifier
  readonly onClick: GestureCallback
  readonly children: ComponentNode[]          // ✅ content-slot
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly measurePolicy: MeasurePolicy
}

interface FabComponent {
  readonly kind: 'fab'
  readonly modifier: ReadonlyModifier
  readonly onClick: GestureCallback
  readonly children: ComponentNode[]          // ✅ content-slot
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly size: number
  readonly elevation: number
  readonly measurePolicy: MeasurePolicy
}
```

**使用方式**：

```typescript
import { Button, FAB, Text } from './components'

// 文本按钮
Button(onClick, [Text('Save')])

// 图标按钮（原 IconButton）
Button(onClick, [Text('🔍')])

// 图标+文字混合
Button(onClick, [Text('➕'), Text(' Add')])

// FAB
FAB(onClick, [Text('+')])
```

## 为什么这样做

1. **单一组件覆盖所有场景** — Button 同时替代了 Button + IconButton
2. **调用方控制内容结构** — 文本/图标/组合由使用者决定，不是组件内部硬编码
3. **与 Box/Column/Row 一致** — 所有容器类组件都用 children，交互组件不应例外
4. **Compose 原生模式** — Jetpack Compose 的 `Button(content = { ... })` 就是这个设计

## 适用场景

- ✅ 所有可包含子内容的交互组件（Button, FAB, Card, ListItem 等）
- ✅ 容器组件（Surface, Scaffold, Dialog 等）
- ✅ 任何"有内容区域"的组件

## 局限性 / 不适用场景

- ❌ **叶子节点组件** — Text, Image, Spacer, Checkbox, Slider, TextField 等自身不承载子组件的组件保持专用参数
- ❌ **纯视觉指示器** — CircularProgressIndicator, LinearProgressIndicator 无 children

## 反例

```typescript
// ❌ 反例：专用参数导致组件分裂
function Button(label: string) { ... }
function IconButton(icon: string) { ... }       // 本不该存在
function TextIconButton(icon: string, label: string) { ... }  // 更不该存在

// ✅ 正例：一个 Button 覆盖全部
function Button(children: ComponentNode[]) { ... }
// 调用方自由组合
Button(onClick, [Text('📷'), Text(' Upload')])
```
