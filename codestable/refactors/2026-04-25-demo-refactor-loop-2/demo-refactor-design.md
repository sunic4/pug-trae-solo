---
doc_type: refactor-design
refactor: 2026-04-25-demo-refactor-loop-2
status: draft
scope: apps/demo 目录
summary: 优化 NavigationBar.ts 中的代码重复，提取重复的按钮属性
---

# demo 应用重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 优化 NavigationBar.ts：提取重复的按钮属性，减少代码重复
- 2. 优化 NavigationBar.ts：提取硬编码值为常量

明确不做的条目：
- 3. 优化 HomePage.ts：提取重复的按钮属性

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 demo 应用有足够的测试覆盖
- 调用方搜索：搜索所有使用 NavigationBar 的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：优化 NavigationBar.ts - 提取重复的按钮属性

- **引用方法**：M-L2-01 提取常量
- **具体操作**：
  1. 修改 `apps/demo/src/components/NavigationBar.ts` 文件
  2. 提取重复的按钮属性为常量
  3. 使用这些常量来简化 ButtonComponent 的配置
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

### 步骤 2：优化 NavigationBar.ts - 提取硬编码值为常量

- **引用方法**：M-L2-01 提取常量
- **具体操作**：
  1. 修改 `apps/demo/src/components/NavigationBar.ts` 文件
  2. 提取硬编码值（如高度、padding 等）为常量
  3. 使用这些常量来替代硬编码值
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **常量命名**：需要确保常量命名清晰，易于理解
- **属性提取**：需要确保提取的常量能覆盖所有需要的场景
