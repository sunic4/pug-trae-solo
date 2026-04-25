---
doc_type: refactor-design
refactor: 2026-04-25-refactor-loop-7
status: draft
scope: Button 组件
summary: 统一 appContext 使用方式，优化颜色获取方法，添加按钮状态支持，优化 measure 方法
---

# Button 组件重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 统一 appContext 使用方式，使用 this.appContext 而不是 props.appContext
- 2. 优化颜色获取方法，使用更简洁的代码结构
- 3. 添加按钮状态支持，如 hover 和 active 状态
- 4. 优化 measure 方法，使其更加简洁

明确不做的条目：无

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 Button 组件有足够的测试覆盖
- 调用方搜索：搜索所有使用 Button 组件的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：统一 appContext 使用方式

- **引用方法**：M-L2-01 代码优化
- **具体操作**：
  1. 修改 `packages/components/src/button.ts` 中的 TextComponent 创建代码，使用 this.appContext 而不是 props.appContext
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：优化颜色获取方法

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/components/src/button.ts` 中的 getTextColor、getBackgroundColor 和 getBorderColor 方法，使用更简洁的代码结构
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 3：添加按钮状态支持

- **引用方法**：M-L2-03 代码完善
- **具体操作**：
  1. 修改 `packages/components/src/button.ts`，添加对 hover 和 active 状态的支持
  2. 添加相应的事件处理逻辑
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 4：优化 measure 方法

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/components/src/button.ts` 中的 measure 方法，使用更简洁的代码结构
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **状态管理**：需要确保按钮状态的正确管理，避免状态冲突
- **颜色计算**：需要确保优化后的颜色获取方法与原方法结果一致
- **尺寸计算**：需要确保优化后的 measure 方法与原方法结果一致
