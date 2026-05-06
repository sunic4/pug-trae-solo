---
id: "composition-over-inheritance"
type: issue
status: fixed
title: "组合替代继承：消除项目中所有 class extends 继承关系"
depends_on: []
severity: major
created: "2026-05-05T00:00"
updated: "2026-05-05T01:00"
stale: false
---

## 问题描述

项目中存在 6 处 `class extends` 继承关系，违反"组合优于继承"设计原则。继承导致子类与父类紧耦合，限制了独立演化和灵活组合的能力。

## 原继承关系清单

| # | 子类 | 父类 | 文件 |
|---|------|------|------|
| 1 | `MutableSnapshotImpl` | `SnapshotImpl` | `src/core/snapshot.ts` |
| 2 | `RowMeasurePolicy` | `LinearMeasurePolicy` | `src/components/layout/row.ts` |
| 3 | `ColumnMeasurePolicy` | `LinearMeasurePolicy` | `src/components/layout/column.ts` |
| 4 | `TapGestureRecognizer` | `BaseGestureRecognizer` | `src/input/gesture-recognizer.ts` |
| 5 | `LongPressGestureRecognizer` | `BaseGestureRecognizer` | `src/input/gesture-recognizer.ts` |
| 6 | `DragGestureRecognizer` | `BaseGestureRecognizer` | `src/input/gesture-recognizer.ts` |

## 修复方案

### 1. 布局策略 — 工厂函数替代继承

`RowMeasurePolicy` / `ColumnMeasurePolicy` 仅传递 `orientation` 参数给父类构造函数，没有任何行为覆写。直接删除子类，使用已有的 `linearMeasurePolicy()` 工厂函数。

- 删除 `RowMeasurePolicy` 类，`Row()` 函数直接调用 `linearMeasurePolicy('horizontal', ...)`
- 删除 `ColumnMeasurePolicy` 类，`Column()` 函数直接调用 `linearMeasurePolicy('vertical', ...)`

### 2. 手势识别器 — 组合状态机替代抽象基类

提取 `GestureRecognizerState` 接口和 `createGestureRecognizerState()` 工厂函数作为可组合的状态机模块，封装 `state`、`disposed`、`transitionState()` 逻辑。

- 删除 `abstract class BaseGestureRecognizer`
- `TapGestureRecognizer` / `LongPressGestureRecognizer` / `DragGestureRecognizer` 直接 `implements GestureRecognizer`，通过组合持有 `GestureRecognizerState`
- `PinchGestureRecognizer` 同步重构，使用相同的 `GestureRecognizerState` 组合

### 3. 快照系统 — 组合 SnapshotStore 替代继承

提取 `SnapshotStore` 接口和 `createSnapshotStore()` 工厂函数作为可组合的数据存储模块，封装 `stateMap`、`stateRefs`、`readObserver`、`writeObserver`、`stateIdGenerator`。

- 提取 `SnapshotValueResolver` 接口，替代 `instanceof SnapshotImpl` 检查
- `SnapshotImpl` 和 `MutableSnapshotImpl` 各自组合 `SnapshotStore`，独立实现 `Snapshot` / `MutableSnapshot` 接口
- 消除 `super.write()` / `super.takeMutableSnapshot()` 调用

## 期望行为

- 所有类通过组合（composition）和委托（delegation）实现代码复用，而非继承
- 每个类独立实现接口，共享逻辑通过组合小型可复用模块获得
- 消除 `abstract class` 和 `extends` 关键字的使用
- 保持公共 API 不变，所有测试通过

## 回归验证

- typecheck: 通过 (0 errors)
- test: 701 tests passed (38 files)
- build: 成功 (ESM + CJS + DTS)
