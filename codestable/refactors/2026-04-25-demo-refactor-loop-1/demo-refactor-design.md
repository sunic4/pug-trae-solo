---
doc_type: refactor-design
refactor: 2026-04-25-demo-refactor-loop-1
status: draft
scope: apps/demo 目录
summary: 优化 DetailsPage.ts 中的重复代码，移除重复的参数获取
---

# demo 应用重构设计

## 1. 本次范围

从扫描清单中勾选了以下优化点：
- 1. 优化 DetailsPage.ts：移除重复的参数获取，直接使用已有的 `pageType` 变量

明确不做的条目：
- 2. 优化 App.ts：考虑使用更明确的响应式机制处理依赖追踪
- 3. 统一组件 API：统一组件的属性命名和使用方式

预估总工作量：低
总风险档位：低

## 2. 前置依赖

- 测试覆盖：确保 demo 应用有足够的测试覆盖
- 调用方搜索：搜索所有使用 DetailsPage 的地方，确保重构后不会破坏现有功能

## 3. 执行顺序

### 步骤 1：优化 DetailsPage.ts

- **引用方法**：M-L2-02 代码简化
- **具体操作**：
  1. 修改 `apps/demo/src/components/pages/DetailsPage.ts` 文件
  2. 移除 `getPageTitle` 函数中重复的参数获取
  3. 直接使用函数开头已经获取的 `pageType` 变量
- **退出信号**：TypeScript 类型检查通过
- **验证责任**：AI 自证
- **回滚**：git revert 相关更改

## 4. 风险与看点

### 高风险步骤

无

### 容易出错的点

- **参数获取**：需要确保移除重复的参数获取后，`pageType` 变量仍然能正确获取到页面类型
