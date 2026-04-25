---
doc_type: refactor-design
refactor: 2026-04-25-refactor-loop-13
status: draft
scope: signal.ts 文件
summary: 优化 signal 函数，优化 trackDependencies 函数，优化订阅者管理，优化全局依赖跟踪栈，优化代码结构
---

# signal.ts 文件重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 优化 signal 函数，添加对 initialValue 的类型检查
- 2. 优化 trackDependencies 函数，添加对 fn 和 onDependencyChange 的类型检查
- 3. 优化订阅者管理，添加更多的辅助方法
- 4. 优化全局依赖跟踪栈，添加工具函数
- 5. 优化代码结构，添加更多的注释

明确不做的条目：无

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 Signal 系统有足够的测试覆盖
- 调用方搜索：搜索所有使用 Signal 系统的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：优化 signal 函数

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/reactivity/src/signal.ts` 中的 signal 函数，添加对 initialValue 的类型检查
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：优化 trackDependencies 函数

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/reactivity/src/signal.ts` 中的 trackDependencies 函数，添加对 fn 和 onDependencyChange 的类型检查
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 3：优化订阅者管理

- **引用方法**：M-L2-03 代码完善
- **具体操作**：
  1. 修改 `packages/reactivity/src/signal.ts` 中的 Signal 接口，添加 clearSubscribers 方法
  2. 实现 clearSubscribers 方法
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 4：优化全局依赖跟踪栈

- **引用方法**：M-L2-03 代码完善
- **具体操作**：
  1. 修改 `packages/reactivity/src/signal.ts`，添加工具函数来管理依赖跟踪栈，如 clearDependencyStack 等
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 5：优化代码结构

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/reactivity/src/signal.ts` 中的代码结构，使其更加清晰和可维护
  2. 添加更多的注释
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **类型检查**：需要确保添加的类型检查不会破坏现有功能
- **订阅者管理**：需要确保添加的辅助方法不会影响现有功能
- **依赖跟踪**：需要确保添加的工具函数不会影响依赖跟踪的正确性
