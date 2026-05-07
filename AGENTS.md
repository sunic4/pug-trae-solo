# AGENTS.md — pug-canvas-ui

## 1. 项目概述

移动端优先的 TypeScript Canvas UI 运行时。参考 Android Jetpack Compose 设计理念，基于 HTML5 Canvas 2D API 实现声明式 UI，零 DOM 依赖，细粒度响应式驱动。

## 2. 技术栈

| 类别 | 选型 |
|------|------|
| 语言 | TypeScript 5.x (Strict Mode) |
| 运行时 | 浏览器 Canvas 2D API |
| 构建 | Vite (dev) + tsup (bundle) |
| 测试 | Vitest (单元) + Playwright (E2E) + MSW (mock) |
| 覆盖率 | c8 (V8 内置) |
| 包管理 | npm |

## 3. 关键约定

> 详细规范见 [codestyle.md](./codestyle.md)

| 约定 | 规则 |
|------|------|
| 组件模型 | 纯函数调用链 + `composable()` HOC，禁止 JSX |
| 状态管理 | 自研 Snapshot + Context，禁止全局变量/static 可变字段 |
| 渲染架构 | Hybrid 混合模式（声明式 API + 轻量 Retained LayoutNode） |
| 布局引擎 | 自研 Column/Row 线性布局，禁止 W3C Flexbox 术语 |
| 数据流 | 单向数据流 + Context 注入，禁止双向绑定 |
| Modifier | Builder + Freeze 模式，组件只接收 ReadonlyModifier |
| 错误处理 | ErrorBoundary + GlobalErrorHandler + 分级恢复，禁止静默吞错 |
| 动画 | 属性驱动（Compose 风格），Animatable 通过 remember 使用 |
| 根上下文 | AppContext 统一根对象，`setContent()` 为唯一组合入口 |
| 文件扩展 | 仅 `.ts`，禁止 `.tsx` |
| 注释策略 | **禁止注释**。优秀的命名就是最好的注释。代码应通过函数名、变量名、类型名自解释。禁止 `/**`、`//`、`/*` 等任何形式的源码内联注释（`.md` 文档除外）。 |

## 4. 目录结构

```
pug-canvas-ui/
├── src/
│   ├── core/              # 响应式核心
│   │   ├── snapshot.ts
│   │   ├── state.ts
│   │   ├── recomposer.ts
│   │   ├── composable.ts
│   │   ├── derived-state.ts
│   │   ├── id-generator.ts
│   │   ├── remember.ts
│   │   └── types.ts
│   ├── renderer/          # Canvas 渲染
│   │   ├── draw-command.ts
│   │   ├── draw-scope.ts
│   │   ├── draw-batch.ts
│   │   ├── layer.ts
│   │   ├── canvas-host.ts
│   │   ├── dirty-region.ts
│   │   ├── image-loader.ts
│   │   ├── path.ts
│   │   ├── text-style.ts
│   │   └── types.ts
│   ├── layout/            # 布局引擎
│   │   ├── box-layout.ts
│   │   ├── constraints.ts
│   │   ├── layout-node.ts
│   │   ├── measure.ts
│   │   ├── measure-policy.ts
│   │   ├── modifier.ts
│   │   └── types.ts
│   ├── input/             # 手势系统
│   │   ├── pointer-event.ts
│   │   ├── pointer-dispatcher.ts
│   │   ├── gesture-recognizer.ts
│   │   ├── pinch-recognizer.ts
│   │   ├── gesture-modifier.ts
│   │   ├── event-bubble.ts
│   │   ├── focus-manager.ts
│   │   ├── hit-test.ts
│   │   └── keyboard.ts
│   ├── animation/         # 动画系统
│   │   ├── animatable.ts
│   │   ├── animation-spec.ts
│   │   ├── transition.ts
│   │   ├── gesture-animation.ts
│   │   └── vector-converter.ts
│   ├── components/        # 组件库
│   │   ├── basic/
│   │   ├── interaction/
│   │   ├── layout/
│   │   ├── container/
│   │   ├── feedback/
│   │   ├── lazy/
│   │   ├── navigation/
│   │   ├── overlay/
│   │   ├── shared/
│   │   └── transition/
│   ├── theme/             # 主题系统
│   │   └── colors.ts
│   ├── platform/          # 平台适配
│   │   ├── accessibility.ts
│   │   ├── density.ts
│   │   ├── memory.ts
│   │   ├── perf-monitor.ts
│   │   ├── safe-area.ts
│   │   └── screen-info.ts
│   └── index.ts           # 公共 API 导出
├── wiki/                  # 项目文档
│   ├── arch/adrs/         # 架构决策记录 (10 篇 ADR)
│   ├── road-map/          # 需求与路线图
│   └── raw/               # 原始输入
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tsup.config.ts
├── codestyle.md
└── AGENTS.md
```

## 5. 常用命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | Vite 开发服务器 |
| `npm run build` | tsup 生产构建 |
| `npm test` | Vitest 运行测试 |
| `npm run typecheck` | `tsc --noEmit` 类型检查 |

## 6. 架构决策索引

| ADR | 标题 | 核心决策 |
|-----|------|---------|
| #1 | 响应式状态系统 | 自研 Snapshot + Context，禁止 global/static |
| #2 | Composable 追踪机制 | 运行时 HOC `composable()`，Context 显式传递 |
| #3 | Canvas 渲染架构 | Hybrid 混合模式，LayoutNode + DrawCommand 缓存 |
| #4 | 布局引擎 | 自研 Column/Row，禁止 W3C Flexbox |
| #5 | 组件模型 | 纯函数调用链，尾随 lambda，禁止 JSX |
| #6 | Modifier 链 | Builder + Freeze 混合模式 |
| #7 | 手势系统 | 自研手势识别器 + Modifier 声明式集成 |
| #8 | 动画系统 | 属性动画优先，Compose 风格 API |
| #9 | AppContext | 统一根上下文，单 Canvas 架构，零全局变量 |
| #10 | 错误处理 | ErrorBoundary + 全局捕获 + 分级恢复 |
| #11 | 测试策略 | 测试金字塔 (单元 65-80% + 集成 15-25% + E2E 5-10%) |
| #12 | 性能优化 | 虚拟化 + 智能缓存 + 增量渲染 |

***任何情况都不应该简化任务,你的目标是高质量完成任务***

## 7. 重要

> 重组代替继承
> 高效利用已有代码,
> 禁止使用any,unknown,as
> 禁止内敛import
> `@/`作为根目录导入
> 禁止绕过或者简化功能
> 遇到端口占用,先停止原有端口,再运行