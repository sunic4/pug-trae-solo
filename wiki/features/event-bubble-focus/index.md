---
id: "feat-12"
type: feature
status: done
title: "事件冒泡、拦截与焦点管理"
origin_type: req
depends_on: ["feat-10", "feat-11"]
created: "2026-05-01 17:29"
updated: "2026-05-01 17:29"
stale: false
---

# feat-12: 事件冒泡、拦截与焦点管理

## 实现思路概述

基于 feat-10 (PointerEvent + HitTest + Dispatcher) 和 feat-11 (手势识别器)，实现事件传播的高级机制：

1. **事件冒泡与拦截** — 事件从命中节点沿 parent 链向上传播，支持中途拦截(consume)和拦截(intercept)
2. **焦点管理** — FocusRequester/FocusManager 管理焦点节点，支持焦点请求、转移和清除

### 事件传播模型

```
Capture Phase (parent → child): intercept 检查
  ↓
Target Phase: 命中节点处理
  ↓
Bubble Phase (child → parent): consume 检查
```

### 焦点管理模型

- FocusManager 维护全局焦点状态
- FocusRequester 绑定到组件，可请求/释放焦点
- 焦点转移支持方向性（Tab/Shift+Tab 或方向键）

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/input/event-bubble.ts` | 事件传播 + consume/intercept 机制 |
| 新建 | `src/input/focus-manager.ts` | FocusManager + FocusRequester + FocusState |
| 新建 | `src/input/__tests__/event-bubble-focus.test.ts` | 冒泡/拦截/焦点 单元测试 |
| 修改 | `src/input/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### event-bubble.ts

```typescript
interface EventPropagation {
  readonly target: HitTestableNode
  readonly event: PointerEventData
  consumed: boolean
  intercepted: boolean
  stopPropagation(): void
  consume(): void
  intercept(): void
}

interface EventBubbleDispatcher {
  dispatch(root: HitTestableNode, event: PointerEventData, hitResult: HitTestResult, handlerResolver: PointerHandlerResolver): void
}
```

### focus-manager.ts

```typescript
type FocusState = 'active' | 'inactive' | 'deactivated'

interface FocusRequester {
  readonly id: number
  requestFocus(): void
  freeFocus(): void
}

interface FocusManager {
  readonly currentFocus: FocusRequester | null
  requestFocus(requester: FocusRequester): boolean
  freeFocus(): void
  moveFocus(direction: 'next' | 'previous' | 'up' | 'down' | 'left' | 'right'): boolean
  addRequester(requester: FocusRequester): void
  removeRequester(requester: FocusRequester): void
  dispose(): void
}
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 90% : 集成 10% |
| Mock 策略 | 手动构造 PointerEventData 和 HitTestableNode |
| 关键路径 | 1) 事件冒泡从子到父 2) consume 阻止继续冒泡 3) intercept 在捕获阶段拦截 4) 焦点请求和释放 5) 焦点转移 |
| 边界测试 | 1) 空树无命中节点 2) 焦点管理器无请求者 3) 重复请求同一焦点 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| 冒泡性能（深树） | 限制最大深度 + 提前终止 |
| 焦点环（循环引用） | 访问标记防环 |
| 多焦点请求冲突 | 最后请求者胜出 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 事件从命中节点沿 parent 链冒泡
- [x] consume 阻止事件继续冒泡
- [x] intercept 在捕获阶段拦截事件
- [x] FocusManager 正确管理焦点请求和释放
- [x] impl-checklist.yaml 所有条目 = done
