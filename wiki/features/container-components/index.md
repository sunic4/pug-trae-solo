---
id: "feat-18"
type: feature
status: done
title: "容器组件 (Card/Scaffold/TopAppBar/TabRow/BottomNavigation)"
origin_type: req
depends_on: ["feat-15", "feat-16"]
created: "2026-05-01 20:00"
updated: "2026-05-01 20:10"
stale: false
---

# feat-18: 容器组件 (Card/Scaffold/TopAppBar/TabRow/BottomNavigation)

## 实现思路概述

基于已实现的 Box/Surface 组件模式和 Modifier 链系统，实现 5 个 Material 风格容器组件。

1. **Card** — Material 卡片容器，Box + background + clip + elevation(shadow)，默认圆角 8、elevation 1
2. **Scaffold** — 屏幕级脚手架，支持 topBar/content/bottomBar/snackbarHost 四个槽位
3. **TopAppBar** — 顶部应用栏，支持 title/navigationIcon/actions，固定高度 56
4. **TabRow** — 标签行，支持 TabConfig 数组 + selectedIndex + indicatorColor
5. **BottomNavigation** — 底部导航栏，支持 BottomNavItem 数组 + selectedIndex + shadow

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/container/card.ts` | Card 卡片组件 |
| 新建 | `src/components/container/scaffold.ts` | Scaffold 脚手架组件 |
| 新建 | `src/components/container/top-app-bar.ts` | TopAppBar 顶部应用栏 |
| 新建 | `src/components/container/tab-row.ts` | TabRow 标签行 |
| 新建 | `src/components/container/bottom-navigation.ts` | BottomNavigation 底部导航 |
| 新建 | `src/components/container/index.ts` | 容器组件导出 |
| 新建 | `src/components/__tests__/container-components.test.ts` | 容器组件单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

```typescript
interface CardComponent {
  readonly kind: 'card'
  readonly modifier: ReadonlyModifier
  readonly color: Color
  readonly elevation: number
  readonly borderRadius: number
  readonly alignment: Alignment
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}

interface ScaffoldComponent {
  readonly kind: 'scaffold'
  readonly modifier: ReadonlyModifier
  readonly topBar: ComponentNode | null
  readonly content: ComponentNode[]
  readonly bottomBar: ComponentNode | null
  readonly snackbarHost: ComponentNode | null
  readonly backgroundColor: Color
  readonly measurePolicy: MeasurePolicy
}

interface TopAppBarComponent {
  readonly kind: 'top-app-bar'
  readonly modifier: ReadonlyModifier
  readonly title: string
  readonly navigationIcon: ComponentNode | null
  readonly actions: ComponentNode[]
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly elevation: number
  readonly measurePolicy: MeasurePolicy
}

interface TabConfig {
  readonly label: string
  readonly selected: boolean
  readonly onSelect: () => void
}

interface TabRowComponent {
  readonly kind: 'tab-row'
  readonly modifier: ReadonlyModifier
  readonly tabs: TabConfig[]
  readonly selectedIndex: number
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly indicatorColor: Color
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}

interface BottomNavItem {
  readonly label: string
  readonly selected: boolean
  readonly onSelect: () => void
}

interface BottomNavigationComponent {
  readonly kind: 'bottom-navigation'
  readonly modifier: ReadonlyModifier
  readonly items: BottomNavItem[]
  readonly selectedIndex: number
  readonly backgroundColor: Color
  readonly contentColor: Color
  readonly selectedItemColor: Color
  readonly children: ComponentNode[]
  readonly measurePolicy: MeasurePolicy
}
```

## 测试策略

- 测试金字塔: 单元测试 100%
- 关键路径覆盖:
  1. Card 创建与默认参数
  2. Card 自定义 color/elevation/borderRadius
  3. Scaffold 创建与各槽位组合
  4. TopAppBar 创建与 title/navigationIcon/actions
  5. TabRow 创建与 tabs/selectedIndex
  6. BottomNavigation 创建与 items/selectedIndex
  7. 容器组件组合 (Scaffold + TopAppBar + BottomNavigation)
- 边界测试:
  1. Scaffold 无 topBar/bottomBar
  2. TabRow/BottomNavigation 空 items

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Card 正确组合 background/clip/shadow
- [x] Scaffold 正确分配 topBar/content/bottomBar 空间
- [x] TopAppBar 正确计算标题宽度
- [x] TabRow 正确等分标签宽度
- [x] BottomNavigation 正确等分导航项宽度
- [x] impl-checklist.yaml 所有条目 = done
