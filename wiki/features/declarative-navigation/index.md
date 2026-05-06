---
id: "feat-23"
type: feature
status: done
title: "声明式导航路由 (NavHost/NavController)"
origin_type: req
depends_on: ["feat-18", "feat-21"]
created: "2026-05-01 19:20"
updated: "2026-05-01 19:20"
stale: false
---

# feat-23: 声明式导航路由 (NavHost/NavController)

## 实现思路概述

基于 feat-18 (布局组件) 和 feat-21 (反馈组件)，实现声明式导航路由系统，参考 Jetpack Compose Navigation 设计。

1. **NavController** — 导航状态控制器，管理路由栈，支持 navigate/pop/replace
2. **NavGraph** — 导航图，定义路由到目的地的映射
3. **NavHost** — 导航宿主组件，渲染当前目的地内容

### 导航模型

```
NavController 管理路由栈:
  backStack = ["home", "detail", "settings"]
  currentRoute = "settings"

navigate("profile") → backStack.push("profile")
popBackStack()      → backStack.pop() → "detail"
replace("about")    → backStack.pop() + push("about")
```

### NavHost 渲染

```
NavHost(navController, navGraph) {
  根据 navController.currentRoute 从 navGraph 查找目的地
  渲染目的地内容
}
```

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/navigation/nav-controller.ts` | NavController + NavGraph + NavHost |
| 新建 | `src/components/navigation/__tests__/navigation.test.ts` | 导航单元测试 |
| 新建 | `src/components/navigation/index.ts` | 模块导出 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## 接口与类型定义

### nav-controller.ts

```typescript
interface NavDestination {
  readonly route: string
  readonly content: ComponentNode[]
}

interface NavGraph {
  readonly startRoute: string
  readonly destinations: ReadonlyMap<string, NavDestination>
  findDestination(route: string): NavDestination | undefined
}

interface NavController {
  readonly currentRoute: string
  readonly backStack: readonly string[]
  readonly canPop: boolean
  navigate(route: string): void
  popBackStack(): boolean
  replace(route: string): void
  popTo(route: string): boolean
}

interface NavHostComponent {
  readonly kind: 'nav-host'
  readonly navController: NavController
  readonly navGraph: NavGraph
  readonly modifier: ReadonlyModifier
  readonly currentDestination: NavDestination | undefined
}

function createNavGraph(startRoute: string, destinations: NavDestination[]): NavGraph
function createNavController(startRoute: string): NavController
function NavHost(navController: NavController, navGraph: NavGraph, modifier?: ReadonlyModifier): NavHostComponent
```

## 测试策略

| 项目 | 内容 |
|------|------|
| 测试金字塔 | 单元 100% |
| Mock 策略 | 无需 mock |
| 关键路径 | 1) navigate/pop 2) replace 3) popTo 4) NavHost 渲染 |
| 边界测试 | 1) pop 空栈 2) navigate 到未知路由 3) popTo 不存在的路由 |

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| 路由栈无限增长 | 设置最大栈深度 (默认 50) |
| 未知路由处理 | NavHost 返回 undefined destination |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] NavController 正确管理路由栈
- [x] NavGraph 正确查找目的地
- [x] NavHost 正确渲染当前目的地
- [x] impl-checklist.yaml 所有条目 = done
