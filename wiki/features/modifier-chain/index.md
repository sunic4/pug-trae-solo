---
id: "feat-09"
type: feature
status: done
title: "Modifier 链式修饰符系统"
origin_type: req
depends_on: ["feat-06", "feat-04"]
created: "2026-05-01 16:20"
updated: "2026-05-01 16:20"
stale: false
---

# feat-09: Modifier 链式修饰符系统

## 实现思路概述

基于 ADR #6 (Builder + Freeze 混合模式)，实现 Modifier 链式修饰符系统：

1. **Modifier** — Builder 类，支持 `then()` 链式调用 + `freeze()` 冻结
2. **Modifier.Element** — 修饰符元素基类（Layout/Draw/Input 三大类）
3. **基础元素** — Padding/Size/FillMaxSize/Background/Clip
4. **ReadonlyModifier** — 冻结后的只读接口，组件只接收此类型

设计原则（来自 ADR #6）：
- 构建阶段可变数组 O(1) append，构建后 freeze 为只读
- 元素顺序重要：从外到内执行（padding 先于 background）
- 组件只接收 ReadonlyModifier

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/layout/modifier.ts` | Modifier 类 + Element 类型 + 基础元素 |
| 修改 | `src/layout/types.ts` | 新增 Modifier/ReadonlyModifier 类型 |
| 修改 | `src/layout/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出 |

## 接口与类型引用

### modifier.ts

```typescript
interface ModifierElement {
  readonly kind: 'layout' | 'draw' | 'input'
  readonly name: string
}

interface PaddingElement extends ModifierElement {
  readonly kind: 'layout'
  readonly name: 'padding'
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

interface SizeElement extends ModifierElement {
  readonly kind: 'layout'
  readonly name: 'size'
  readonly width: number
  readonly height: number
}

interface FillMaxSizeElement extends ModifierElement {
  readonly kind: 'layout'
  readonly name: 'fillMaxSize'
  readonly fraction: number
}

interface BackgroundElement extends ModifierElement {
  readonly kind: 'draw'
  readonly name: 'background'
  readonly color: Color
  readonly borderRadius?: number
}

interface ClipElement extends ModifierElement {
  readonly kind: 'draw'
  readonly name: 'clip'
  readonly borderRadius: number
}

interface ReadonlyModifier {
  readonly size: number
  get(index: number): ModifierElement
  filterByKind(kind: ModifierElement['kind']): ReadonlyModifier
}

class Modifier implements ReadonlyModifier {
  static create(): Modifier
  then(element: ModifierElement): this
  padding(all: number): this
  padding(horizontal: number, vertical: number): this
  size(width: number, height: number): this
  fillMaxSize(fraction?: number): this
  background(color: Color, borderRadius?: number): this
  clip(borderRadius: number): this
  freeze(): ReadonlyModifier
  get size(): number
  get(index: number): ModifierElement
  filterByKind(kind: ModifierElement['kind']): ReadonlyModifier
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 90% : 集成 10% |
| Mock 策略 | 无外部依赖 |
| 关键路径 | 1) Modifier 链式构建 2) freeze 冻结 3) filterByKind 过滤 |
| 边界测试 | 1) 空 Modifier 2) freeze 后 then 抛错 3) 单元素链 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Modifier 支持 then/链式调用/freeze
- [x] 基础元素 Padding/Size/FillMaxSize/Background/Clip
