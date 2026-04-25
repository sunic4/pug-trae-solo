---
doc_type: refactor-scan
refactor: 2026-04-25-refactor-loop-4
status: draft
scope: Stack 组件
---

# Stack 组件重构扫描清单

## 总览

本次扫描范围涵盖了 Stack 组件的实现：
- `packages/components/src/stack.ts` - Stack 组件实现

扫描发现了 3 个优化点，按分类分布如下：
- L1 行为等价迁移信号：1 个
- L2 代码级重构信号：2 个

按风险分布：
- 低风险：3 个

建议优先处理的优化点：
1. 统一组件 API 设计，只从 props 中获取 appContext
2. 优化 children 处理逻辑
3. 添加 markLayoutDirty() 调用

## 优化点清单

### 1. 统一组件 API 设计

**分类**：L1 行为等价迁移信号
**风险**：低
**文件**：`packages/components/src/stack.ts`
**描述**：Stack 组件的构造函数接受单独的 appContext 参数，与统一的组件 API 设计不一致。
**建议**：修改构造函数，只从 props 中获取 appContext，不再接受单独的 appContext 参数。
**影响范围**：Stack 组件
**验证方式**：运行测试套件，确保组件创建和使用方式正确

### 2. 优化 children 处理逻辑

**分类**：L2 代码级重构信号
**风险**：低
**文件**：`packages/components/src/stack.ts`
**描述**：Stack 组件的构造函数中处理 children 的逻辑可以优化，使其更简洁。
**建议**：优化 children 处理逻辑，添加对单个子节点的支持。
**影响范围**：Stack 组件
**验证方式**：运行测试套件，确保 children 处理逻辑正确

### 3. 添加 markLayoutDirty() 调用

**分类**：L2 代码级重构信号
**风险**：低
**文件**：`packages/components/src/stack.ts`
**描述**：Stack 组件的构造函数中没有调用 markLayoutDirty() 方法，这可能会导致布局计算不正确。
**建议**：在构造函数中添加 markLayoutDirty() 调用。
**影响范围**：Stack 组件
**验证方式**：运行测试套件，确保布局计算正确
