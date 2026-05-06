---
id: "component-convergence"
type: issue
status: fixed
title: "组件库代码重复与结构收敛"
depends_on: []
severity: major
created: "2026-05-02T09:40"
updated: "2026-05-02T10:05"
stale: false
---

## 问题描述

组件库存在 6 类代码重复和结构问题，影响可维护性和一致性：

1. **Card 与 Surface 完全重复** — CardMeasurePolicy 与 SurfaceMeasurePolicy 代码一字不差，Card 本质是 Surface 的预设变体
2. **MeasurePolicy 大量重复** — 10 个组件的 MeasurePolicy 可归并为 3 个参数化基类（FixedSize / Square / Constrained）
3. **Modifier 拷贝模式 17 处重复** — `Modifier.create() + for loop + then()` 样板代码在 17 个组件中逐字重复
4. **ComponentNode 归属不当** — 全局基础类型定义在 box.ts 中，被 12+ 个组件引用
5. **动画组件位置违反约定** — Crossfade/AnimatedContent 在 animation/ 而非 components/ 下
6. **FAB 与 IconButton 混合文件** — 两个独立组件共享 icon-button.ts

## 修复方案

### P0: Modifier.extendFrom 工具方法
- 在 `src/layout/modifier.ts` 新增 `Modifier.extendFrom(base)` 静态方法
- 替换 17 处 `Modifier.create() + for loop + then()` 样板代码
- 涉及文件: Button, Checkbox, IconButton, FAB, RadioButton, Switch, TextField, Surface, Card, TopAppBar, TabRow, BottomNavigation, Scaffold, Dialog, DropdownMenu, ModalBottomSheet, Snackbar, LinearProgressIndicator

### P1: Card 委托 Surface + 通用 MeasurePolicy
- Card 工厂函数内部调用 Surface，消除 CardMeasurePolicy 重复
- 新增 `src/components/shared/measure-policies.ts`，包含:
  - `FixedSizeMeasurePolicy(width, height)` — 替代 Spacer/Image 的独立实现
  - `SquareMeasurePolicy(size)` — 替代 IconButton/FAB 的独立实现
  - `ConstrainedMeasurePolicy(minW, minH)` — 替代 Checkbox/RadioButton/CircularProgressIndicator 的独立实现
  - `BoxAlignmentMeasurePolicy(alignment)` — 替代 Box/Surface/Card 的独立实现

### P2: ComponentNode 迁移 + FAB 拆分
- 新增 `src/components/basic/types.ts`，定义 ComponentNode
- 11 个文件 import 从 `../basic/box` 改为 `../basic/types`
- FAB 从 icon-button.ts 拆分到 `src/components/interaction/fab.ts`

### P3: 动画组件迁移 + 聚合导出
- Crossfade/AnimatedContent 移至 `src/components/transition/index.ts`
- `src/animation/transition.ts` 改为重导出（向后兼容）
- `src/components/index.ts` 从空导出改为聚合所有子模块导出

## 回归验证

- typecheck: 零错误
- vitest: 38 files, 714 tests passed
