---
id: "feat-18"
type: feature
status: done
title: "容器组件 (Scaffold/TopAppBar/BottomNav/TabRow) — L1 组合组件"
origin_type: req
depends_on: ["feat-15", "feat-16"]
created: "2026-05-01 20:00"
updated: "2026-05-07 00:00"
stale: false
---

# feat-18: 容器组件 (Scaffold/TopAppBar/BottomNav/TabRow/Card)

## 实现思路概述

基于 L0 组件（Box/Surface/Column/Row/Text/Button）和 Modifier 链系统，实现 L1 层 Material 风格容器组件。

**L1 组合组件特征**：
- 自身也是 ctx-first + void 返回
- 内部组合多个 L0 组件调用
- 通过 composable() HOC 包装后可复用

### 组件列表（L1 组合层）

1. **Card** — Material 卡片，Surface + clip + elevation + borderRadius
   > **⚠️ 已从公共 API 移除**（2026-05-07 API 精简）。Card 仍作为内部组件存在于 `src/components/container/card.ts`，但不再从 `src/index.ts` 导出。Demo 应用通过 `theme/app-theme.ts` 中的 `M.card()` 工具函数（基于 Surface 封装）实现等效效果。如需公开 Card，从 `src/index.ts` 添加导出即可。
2. **Scaffold** — 屏幕级脚手架，topBar/content/bottomBar/snackbarHost 四槽位
3. **TopAppBar** — 顶部应用栏，Row(navigationIcon + title + actions)，固定高度 56
4. **TabRow** — 标签行，Surface + Row(Tab[] + indicator)
5. **BottomNavigation** — 底部导航栏，Row(BottomNavItem[])

### 组件签名（实际 API）

```typescript
function Scaffold(
  ctx: CompositionContext,
  topBar?: () => void,
  content?: () => void,
  bottomBar?: () => void,
  snackbarHost?: () => void,
  options?: ScaffoldOptions,
): void;

function TopAppBar(
  ctx: CompositionContext,
  title: string,
  options?: TopAppBarOptions,
): void;

function TabRow(
  ctx: CompositionContext,
  tabs: SelectableItem[],
  selectedIndex?: number,
  modifier?: ReadonlyModifier,
  options?: TabRowOptions,
): void;

function BottomNavigation(
  ctx: CompositionContext,
  items: BottomNavItem[],
  selectedIndex?: number,
  modifier?: ReadonlyModifier,
  options?: BottomNavOptions,
): void;
```

### 使用示例

```typescript
setContent(canvas, (rootCtx) => {
  Scaffold(rootCtx,
    () => {  // topBar
      TopAppBar(rootCtx, 'My App', {
        navigationIcon: () => Icon(rootCtx, 'menu'),
      });
    },
    () => {  // content
      Column(rootCtx, Modifier.create().padding(16).freeze(), 'start', 'start', () => {
        Text(rootCtx, 'Hello World');
      });
    },
    () => {  // bottomBar
      BottomNavigation(rootCtx, [
        { label: 'Home', selected: true, onSelect: () => {} },
        { label: 'Settings', selected: false, onSelect: () => {} },
      ]);
    },
  );
});
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/container/card.ts` | Card 卡片组件（**内部使用，不公开导出**） |
| 新建 | `src/components/container/scaffold.ts` | Scaffold 脚手架组件 |
| 新建 | `src/components/container/top-app-bar.ts` | TopAppBar 顶部应用栏 |
| 新建 | `src/components/container/tab-row.ts` | TabRow 标签行 |
| 新建 | `src/components/container/bottom-navigation.ts` | BottomNavigation 底部导航 |
| 新建 | `src/components/container/index.ts` | 容器组件导出（Card 不再 re-export 到公共 API） |
| 新建 | `src/components/__tests__/container-components.test.ts` | 容器组件单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新（**Card 已移除**） |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] 所有组件签名：ctx-first + void 返回
- [x] Card 正确组合 background/clip/shadow（**内部组件，不公开导出**）
- [x] Scaffold 正确分配 topBar/content/bottomBar 空间
- [x] TopAppBar 正确计算标题宽度
- [x] TabRow 正确等分标签宽度 + indicator
- [x] BottomNavigation 正确等分导航项宽度
- [x] impl-checklist.yaml 所有条目 = done
