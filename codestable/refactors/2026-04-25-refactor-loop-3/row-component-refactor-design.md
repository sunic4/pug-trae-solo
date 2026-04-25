---
doc_type: refactor-design
refactor: 2026-04-25-refactor-loop-3
status: draft
scope: Row 组件
summary: 统一组件 API 设计，优化 children 处理逻辑
---

# Row 组件重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 统一组件 API 设计，只从 props 中获取 appContext
- 2. 优化 children 处理逻辑

明确不做的条目：无

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 Row 组件有足够的测试覆盖
- 调用方搜索：搜索所有使用 Row 组件的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：统一组件 API 设计

- **引用方法**：M-L1-01 依赖迁移
- **具体操作**：
  1. 修改 `packages/components/src/row.ts` 中的构造函数，只从 props 中获取 appContext
  2. 更新 RowComponent 工厂函数，确保只传递 props
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：优化 children 处理逻辑

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/components/src/row.ts` 中的构造函数，优化 children 处理逻辑
  2. 修改 RowProps 接口，添加对单个子节点的支持
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **children 处理逻辑**：需要确保所有类型的 children 都能正确处理，包括单个节点和节点数组
