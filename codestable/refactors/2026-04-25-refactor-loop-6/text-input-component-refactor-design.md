---
doc_type: refactor-design
refactor: 2026-04-25-refactor-loop-6
status: draft
scope: TextInput 组件
summary: 统一组件 API 设计，使用 getThemeFromContext 函数获取主题，优化 onClick 方法绑定方式，优化 onKeyDown 方法实现
---

# TextInput 组件重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 统一组件 API 设计，只从 props 中获取 appContext
- 2. 使用 getThemeFromContext 函数获取主题
- 3. 优化 onClick 方法绑定方式
- 4. 优化 onKeyDown 方法实现

明确不做的条目：无

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 TextInput 组件有足够的测试覆盖
- 调用方搜索：搜索所有使用 TextInput 组件的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：统一组件 API 设计

- **引用方法**：M-L1-01 依赖迁移
- **具体操作**：
  1. 修改 `packages/components/src/text-input.ts` 中的构造函数，只从 props 中获取 appContext
  2. 更新 TextInputComponent 工厂函数，确保只传递 props
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：使用 getThemeFromContext 函数获取主题

- **引用方法**：M-L2-01 代码优化
- **具体操作**：
  1. 修改 `packages/components/src/text-input.ts`，导入 getThemeFromContext 函数
  2. 修改 draw 方法，使用 getThemeFromContext 函数从 appContext 中获取主题
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 3：优化 onClick 方法绑定方式

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `packages/components/src/text-input.ts` 中的 onClick 方法，使用箭头函数或在构造函数中直接定义
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 4：优化 onKeyDown 方法实现

- **引用方法**：M-L2-03 代码完善
- **具体操作**：
  1. 修改 `packages/components/src/text-input.ts` 中的 onKeyDown 方法，支持更多键盘按键
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **主题获取**：需要确保在没有 appContext 的情况下仍然能获取到默认主题
- **事件处理**：需要确保 onClick 方法的绑定方式正确，不影响事件处理逻辑
- **键盘输入**：需要确保 onKeyDown 方法的实现正确，支持更多键盘按键
