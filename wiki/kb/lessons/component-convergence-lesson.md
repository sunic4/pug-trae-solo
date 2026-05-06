---
title: "组件库收敛重构经验（两轮）"
type: knowledge
status: verified
category: lesson
source: "cc-fix (两轮) - 2026-05-02"
see_also: ["content-slot-component", "component-convergence-rules"]
created: "2026-05-02T10:30"
updated: "2026-05-06"
---

# 组件库收敛重构经验

## 一句话总结

经过两轮系统性收敛，组件从 31 个精简至 28 个，核心原则是 Composition-over-Inheritance + MeasurePolicy 复用 + 内容参数化。

## 第一轮收敛（初始）

### 1. Modifier 拷贝模式是最普遍的重复

17 个组件中逐字重复 `Modifier.create() + for loop + then()` 模式。解决方案是在 Modifier 类上新增 `extendFrom(base)` 静态方法，将 4 行样板代码压缩为 1 行。这启示我们：当同一段代码在 3+ 个地方出现时，应立即抽取工具方法。

### 2. MeasurePolicy 参数化复用

按"布局策略"分类后只有 4 种模式：
- FixedSize: 固定宽高（Spacer, Image）
- Square: 正方形约束（FAB）
- Constrained: 最小尺寸约束（Checkbox, CircularProgressIndicator）
- BoxAlignment: 子节点对齐委托（Box, Surface, Card, Popup）

参数化基类比每个组件独立实现减少了约 60% 的 MeasurePolicy 代码。

### 3. Card 是 Surface 的预设变体

Card 只是 Surface 的默认参数不同（elevation=1, borderRadius=8），Card 工厂函数内部直接调用 Surface。这启示：当两个组件结构相同只是默认值不同时，一个应该是另一个的便捷工厂。

### 4. 类型归属影响全局 import 链

ComponentNode 从 box.ts 抽取到独立的 types.ts，遵循单一职责原则。

### 5. 向后兼容的重导出策略

动画组件迁移时原文件改为重导出，确保现有 import 路径不受影响。这种渐进式迁移策略对大型代码库尤为重要。

## 第二轮收敛（Composition-over-Inheritance）

### 6. Content-Slot 统一模型（P0）

Button: `label` → `children[]`, FAB: `icon` → `children[]`, 删除 IconButton。详见 [content-slot-component](./patterns/content-slot-component.md)

### 7. 功能等价组件合并（P1）

删除 Switch、RadioButton（与 Checkbox 功能等价）。详见 [component-convergence-rules](./component-convergence-rules.md)

### 8. MeasurePolicy 去重（P2）

Popup 内联策略 → 复用 BoxAlignmentMeasurePolicy（-40 行）

## 收敛统计

| 指标 | 第一轮后 | 第二轮后 |
|------|---------|---------|
| 组件总数 | 31 | **28** |
| 删除文件 | 0 | 3 |
| 改造文件 | 22 | 2 |
| 简化文件 | 0 | 1 |
| 测试通过 | 714 | **705** |
| 类型错误 | 0 | **0** |

## 当前组件清单（28 个）

| 分类 | 数量 | 组件 |
|------|------|------|
| basic | 4 | Box, Text, Image, Spacer |
| interaction | 6 | Button(children), FAB(children), Checkbox, Slider, TextField |
| layout | 3 | Column, Row, Surface |
| container | 5 | Card(Surface), Scaffold, TopAppBar, TabRow, BottomNavigation |
| feedback | 3 | CircularProgress, LinearProgress, Snackbar |
| overlay | 4 | Dialog, ModalBottomSheet, DropdownMenu, Popup |
| lazy | 2 | LazyColumn, LazyRow |
| navigation | 1 | NavHost |
