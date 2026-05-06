---
id: "feat-28"
type: feature
status: done
title: "无障碍支持 (Semantics/ScreenReader/ARIA)"
origin_type: req
depends_on: ["feat-15", "feat-24"]
created: "2026-05-01 19:25"
updated: "2026-05-01 19:25"
stale: false
---

# feat-28: 无障碍支持 (Semantics/ScreenReader/ARIA)

## 实现思路概述

基于 feat-15 (原子组件) 和 feat-24 (平台适配)，实现无障碍基础设施。

1. **SemanticsNode** — 语义节点，描述组件的无障碍属性 (role/label/state/description)
2. **SemanticsTree** — 语义树，维护组件层级关系，支持遍历和查找
3. **AccessibilityManager** — 无障碍管理器，桥接语义树与平台无障碍 API

### 语义节点模型

```
SemanticsNode {
  id, role, label, value, hint, enabled, selected, checked, focused
  children, parent
}
```

### ARIA 映射

```
role: button → role="button"
role: text   → role="text"
label        → aria-label
enabled      → aria-disabled
checked      → aria-checked
selected     → aria-selected
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/platform/accessibility.ts` | SemanticsNode + SemanticsTree + AccessibilityManager |
| 新建 | `src/platform/__tests__/accessibility.test.ts` | 无障碍单元测试 |
| 修改 | `src/platform/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### accessibility.ts

```typescript
type SemanticsRole = 'button' | 'text' | 'image' | 'checkbox' | 'switch' | 'slider' | 'link' | 'header' | 'list' | 'listItem' | 'navigation' | 'dialog'

interface SemanticsProperties {
  readonly role?: SemanticsRole
  readonly label?: string
  readonly value?: string
  readonly hint?: string
  readonly enabled?: boolean
  readonly checked?: boolean | 'mixed'
  readonly selected?: boolean
  readonly focused?: boolean
}

interface SemanticsNode {
  readonly id: number
  readonly properties: SemanticsProperties
  readonly children: SemanticsNode[]
  parent: SemanticsNode | null
  addChild(node: SemanticsNode): void
  removeChild(id: number): void
  find(id: number): SemanticsNode | undefined
  toAriaAttributes(): Record<string, string>
}

interface SemanticsTree {
  readonly root: SemanticsNode
  find(id: number): SemanticsNode | undefined
  collectLabels(): string[]
  traverse(visitor: (node: SemanticsNode, depth: number) => void): void
}

interface AccessibilityManager {
  readonly tree: SemanticsTree
  announce(message: string): void
  focusNode(id: number): void
  getAriaTree(): Record<string, string>[]
}

function createSemanticsNode(properties?: SemanticsProperties): SemanticsNode
function createSemanticsTree(rootProperties?: SemanticsProperties): SemanticsTree
function createAccessibilityManager(tree?: SemanticsTree): AccessibilityManager
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 环境依赖 | 无需 mock |
| 关键路径 | 1) 语义节点创建/遍历 2) ARIA 属性映射 3) 语义树遍历 |
| 边界测试 | 1) 空属性节点 2) 空语义树 3) 嵌套深层节点 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| ARIA 属性不完整 | 按需扩展，当前覆盖核心属性 |
| 平台差异 | 抽象层隔离，平台特定实现可替换 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] SemanticsNode 正确维护层级
- [x] ARIA 属性映射正确
- [x] SemanticsTree 正确遍历
- [x] impl-checklist.yaml 所有条目 = done
