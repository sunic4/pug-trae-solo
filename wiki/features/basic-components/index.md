---
id: "feat-18"
type: feature
status: done
title: "基础组件库 (Box/Text/Image/Spacer) — L0 原子组件"
origin_type: req
depends_on: ["feat-06", "feat-13", "feat-14", "feat-17"]
created: "2026-05-01 17:53"
updated: "2026-05-07 00:00"
stale: false
---

# feat-18: 基础组件库 (Box/Text/Image/Spacer)

## 实现思路概述

基于已实现的核心系统（布局引擎、文本渲染、图像加载、Modifier），实现 L0 层原子级声明式组件。

**Emit-based 组件模型（来自 ADR #5 升级版）**：
- ctx-first 参数：`fn(ctx: CompositionContext, ...props): void`
- 返回 void，通过 `ctx.emitLeaf()` 发射叶子节点
- Box 通过 `ctx.startGroup()` / `ctx.endGroup()` 发射容器节点
- 纯函数调用链，禁止 JSX

### 组件列表（L0 原子层）

1. **Text** — 文本叶子组件，`ctx.emitLeaf()` 发射，支持 TextStyle + 单行/多行
2. **Image** — 图像叶子组件，`ctx.emitLeaf()` 发射，支持 src + NinePatch
3. **Spacer** — 占位叶子组件，`ctx.emitLeaf()` 发射，占据指定空间
4. **Box** — 容器组件，`ctx.startGroup()` / `ctx.endGroup()` 发射，支持 alignment + children

### 组件签名（实际 API）

```typescript
function Text(
  ctx: CompositionContext,
  text: string,
  modifier?: ReadonlyModifier,
  style?: TextStyle,
): void;

function Image(
  ctx: CompositionContext,
  src: ImageSource,
  modifier?: ReadonlyModifier,
  options?: ImageOptions,
): void;

function Spacer(
  ctx: CompositionContext,
  width?: number,
  height?: number,
  modifier?: ReadonlyModifier,
): void;

function Box(
  ctx: CompositionContext,
  contentFn?: () => void,
  modifier?: ReadonlyModifier,
  alignment?: Alignment,
): void;
```

### 内部 emit 模式

所有 L0 基础组件遵循统一模式：

```typescript
function Text(ctx: CompositionContext, text, modifier, style): void {
  const mod = normalizeModifier(modifier)
  const measurePolicy = textMeasurePolicy(text, style)
  const drawPolicy = textDrawPolicy(text, style)
  ctx.emitLeaf({ text, style }, mod, measurePolicy, drawPolicy)
}
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/basic/text.ts` | Text 文本组件 |
| 新建 | `src/components/basic/image.ts` | Image 图像组件 |
| 新建 | `src/components/basic/box.ts` | Box 容器组件 |
| 新建 | `src/components/basic/spacer.ts` | Spacer 占位组件 |
| 新建 | `src/components/basic/index.ts` | 基础组件导出 |
| 新建 | `src/components/__tests__/basic-components.test.ts` | 基础组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] Text 正确渲染文本（emitLeaf 模式）
- [x] Image 正确加载和绘制图像（emitLeaf 模式）
- [x] Spacer 正确占据空间（emitLeaf 模式）
- [x] Box 正确布局子组件（startGroup/endGroup 模式）
- [x] impl-checklist.yaml 所有条目 = done
