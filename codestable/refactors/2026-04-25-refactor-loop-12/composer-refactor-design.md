---
doc_type: refactor-design
refactor: 2026-04-25-refactor-loop-12
status: draft
scope: composer.ts 文件
summary: 优化构造函数，优化 startCompose 方法，优化 recompose 方法，优化 cleanupUnusedNodes 方法，优化全局 composer 实例的管理，添加更多的辅助方法，优化代码结构
---

# composer.ts 文件重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 优化构造函数，添加对参数的类型检查
- 2. 优化 startCompose 方法，添加更多的错误处理
- 3. 优化 recompose 方法，使用更高效的方式处理脏节点
- 4. 优化 cleanupUnusedNodes 方法，添加更多的清理逻辑
- 5. 优化全局 composer 实例的管理，添加更多的安全性检查
- 6. 添加更多的辅助方法，如 getDirtyNodes、clearDirtyNodes 等
- 7. 优化代码结构，添加更多的注释

明确不做的条目：无

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 Composer 类有足够的测试覆盖
- 调用方搜索：搜索所有使用 Composer 类的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：优化构造函数

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的构造函数，添加对参数的类型检查
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：优化 startCompose 方法

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的 startCompose 方法，添加更多的错误处理
  2. 提高代码的健壮性
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 3：优化 recompose 方法

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的 recompose 方法，使用更高效的方式处理脏节点
  2. 添加对脏节点的过滤
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 4：优化 cleanupUnusedNodes 方法

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的 cleanupUnusedNodes 方法，添加更多的清理逻辑
  2. 确保资源正确释放
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 5：优化全局 composer 实例的管理

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的全局 composer 实例管理，添加更多的安全性检查
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 6：添加更多的辅助方法

- **引用方法**：M-L2-03 代码完善
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts`，添加更多的辅助方法，如 getDirtyNodes、clearDirtyNodes 等
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 7：优化代码结构

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/composer/src/composer.ts` 中的代码结构，使其更加清晰和可维护
  2. 添加更多的注释
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **错误处理**：需要确保添加的错误处理不会破坏现有功能
- **脏节点处理**：需要确保优化后的脏节点处理逻辑与原逻辑结果一致
- **资源管理**：需要确保添加的清理逻辑不会影响现有功能
