---
id: "feat-22"
type: feature
status: done
title: "进度指示器与 Snackbar — L0 反馈组件"
origin_type: req
depends_on: ["feat-15", "feat-13"]
created: "2026-05-01 18:40"
updated: "2026-05-07 00:00"
stale: false
---

# feat-22: 进度指示器与 Snackbar

## 实现思路概述

基于 L0 布局组件和基础组件，实现反馈类组件。全部为 L0 层原子组件，使用 ctx.emitLeaf() 模式。

### 组件签名（实际 API）

```typescript
function CircularProgressIndicator(
  ctx: CompositionContext,
  progress?: number,
  modifier?: ReadonlyModifier,
  options?: CircularProgressOptions,
): void;

function LinearProgressIndicator(
  ctx: CompositionContext,
  progress?: number,
  modifier?: ReadonlyModifier,
  options?: LinearProgressOptions,
): void;

function Snackbar(
  ctx: CompositionContext,
  message: string,
  actionLabel?: string,
  onActionClick?: () => void,
  modifier?: ReadonlyModifier,
  duration?: number,
): void;
```

**关键设计点**：
- 所有组件第一个参数为 `ctx: CompositionContext`
- 返回 `void`
- CircularProgress 和 LinearProgress 通过 `ctx.emitLeaf()` 发射
- Snackbar 为 L1 组合组件（内部组合 Surface + Text + Button），同样 ctx-first + void

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/feedback/circular-progress.ts` | CircularProgressIndicator |
| 新建 | `src/components/feedback/linear-progress.ts` | LinearProgressIndicator |
| 新建 | `src/components/feedback/snackbar.ts` | Snackbar 消息提示 |
| 新建 | `src/components/feedback/index.ts` | 反馈组件导出 |
| 新建 | `src/components/__tests__/feedback-components.test.ts` | 反馈组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] CircularProgressIndicator 正确管理进度值
- [x] LinearProgressIndicator 正确管理进度值
- [x] Snackbar 正确组合消息和操作按钮
- [x] impl-checklist.yaml 所有条目 = done
