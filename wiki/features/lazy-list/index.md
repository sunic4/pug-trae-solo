---
id: "feat-19"
type: feature
status: done
title: "虚拟列表 LazyColumn/LazyRow"
origin_type: req
depends_on: ["feat-15", "feat-07"]
created: "2026-05-01 20:00"
updated: "2026-05-01 20:10"
stale: false
---

# feat-19: 虚拟列表 LazyColumn/LazyRow

## 实现思路概述

基于线性布局算法和 Constraints 测量系统，实现虚拟化列表组件。核心思路是只测量和布局可见区域内的 item，通过 firstVisibleItemIndex + scrollOffset 实现滚动状态管理。

1. **LazyColumn** — 垂直虚拟列表，支持 itemCount/itemSize/spacing/contentPadding/滚动状态
2. **LazyRow** — 水平虚拟列表，与 LazyColumn 对称设计
3. **computeVisibleItems** — 计算可见 item 的辅助函数，返回 LazyItemInfo 数组

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/lazy/lazy-column.ts` | LazyColumn 垂直虚拟列表 |
| 新建 | `src/components/lazy/lazy-row.ts` | LazyRow 水平虚拟列表 |
| 新建 | `src/components/lazy/index.ts` | 虚拟列表组件导出 |
| 新建 | `src/components/__tests__/lazy-components.test.ts` | 虚拟列表单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

```typescript
interface LazyItemInfo {
  readonly index: number
  readonly key: string
  readonly offset: number
  readonly size: number
}

interface LazyColumnComponent {
  readonly kind: 'lazy-column'
  readonly modifier: ReadonlyModifier
  readonly itemCount: number
  readonly itemSize: number | null
  readonly spacing: number
  readonly contentPadding: number
  readonly firstVisibleItemIndex: number
  readonly firstVisibleItemScrollOffset: number
  readonly visibleItems: readonly LazyItemInfo[]
  readonly measurePolicy: MeasurePolicy
}

interface LazyRowComponent {
  readonly kind: 'lazy-row'
  readonly modifier: ReadonlyModifier
  readonly itemCount: number
  readonly itemSize: number | null
  readonly spacing: number
  readonly contentPadding: number
  readonly firstVisibleItemIndex: number
  readonly firstVisibleItemScrollOffset: number
  readonly visibleItems: readonly LazyItemInfo[]
  readonly measurePolicy: MeasurePolicy
}
```

## 测试策略

- 测试金字塔: 单元测试 100%
- 关键路径覆盖:
  1. LazyColumn 创建与默认参数
  2. LazyColumn 自定义 itemSize/spacing/contentPadding
  3. LazyColumn 滚动状态管理
  4. LazyRow 创建与默认参数
  5. computeVisibleItems 计算正确性
  6. computeLazyRowVisibleItems 计算正确性
- 边界测试:
  1. 零 itemCount 的测量
  2. 大 itemCount + scrollOffset 的可见项计算

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] LazyColumn 正确计算可见项
- [x] LazyRow 正确计算可见项
- [x] computeVisibleItems 正确处理滚动偏移
- [x] impl-checklist.yaml 所有条目 = done
