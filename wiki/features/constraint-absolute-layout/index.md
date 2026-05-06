---
id: "feat-17"
type: feature
status: done
title: "约束布局与绝对定位"
origin_type: req
depends_on: ["feat-06"]
created: "2026-05-01 17:48"
updated: "2026-05-01 17:48"
stale: false
---

# feat-17: 约束布局与绝对定位

## 实现思路概述

基于 feat-06 (Constraints + Measure/Layout 两阶段布局引擎)，实现约束布局基础版和绝对定位能力。

1. **IntrinsicSize 计算** — min/max preferred size，用于布局协商
2. **Box 布局策略** — 子组件在父容器内对齐（Stack 模式）
3. **绝对定位** — 通过 Modifier.offset() 实现绝对偏移定位
4. **百分比约束** — 父约束的百分比作为子约束

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/layout/box-layout.ts` | Box 布局策略 + IntrinsicSize 计算 |
| 新建 | `src/layout/__tests__/box-layout.test.ts` | 布局策略 单元测试 |
| 修改 | `src/layout/measure-policy.ts` | 添加 IntrinsicSize 方法 |
| 修改 | `src/layout/modifier.ts` | 添加 offset/absoluteOffset 百分比约束方法 |
| 修改 | `src/layout/index.ts` | 模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Box 布局正确对齐子组件
- [x] IntrinsicSize 正确计算
- [x] 绝对定位 offset 正确工作
- [x] impl-checklist.yaml 所有条目 = done
