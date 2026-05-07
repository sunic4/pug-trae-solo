---
id: "appcontext-unified-root-architecture"
type: architecture
status: accepted
title: "AppContext 统一根上下文 — setContent(canvas, fn) 入口 + CompositionContext"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./reactive-state-snapshot-context-based.md"
  - "./composable-tracking-runtime-hoc.md"
  - "./rendering-architecture-hybrid-mode.md"
  - "./layout-engine-custom-linear-column-row.md"
  - "./component-model-pure-function-call-chain.md"
  - "./modifier-chain-builder-freeze-pattern.md"
  - "./gesture-system-custom-with-modifier.md"
  - "./animation-system-property-driven.md"
created: "2026-04-30 17:45"
updated: "2026-05-07 00:00"
stale: false
---

# ADR: AppContext 统一根上下文 — setContent + CompositionContext

## 背景

在完成全部基础 ADR 后，并完成 Emit-based Composition 架构升级后，应用入口和根上下文的设计需要更新以匹配新架构：

> **应用的入口函数是什么？如何将 canvas 元素与 Composable 函数连接？CompositionContext 如何流转？**

## 决策结果

### 核心契约

```
✅ setContent(canvas, (rootCtx) => { ... }) 为唯一应用入口
✅ 第一个参数是 HTMLCanvasElement（或 CSS 选择器）
✅ 第二个参数是根组合函数，接收 CompositionContext
✅ 内部自动创建 ComposerContext（snapshot + recomposer）
✅ 内部通过 composable() HOC 包装根函数
✅ 返回 AppHost 对象（requestRender / destroy / canvas / appContext）
✅ 渲染循环自动启动（requestAnimationFrame）
✅ dispose 时销毁所有资源
```

### 完整类型定义

```typescript
interface AppHost {
  requestRender: () => void
  destroy: () => void
  canvas: HTMLCanvasElement
  appContext: ComposerContext
}

/**
 * 设置根组件（唯一组合入口）
 * @param canvas Canvas 元素
 * @param appComposable 根组合函数，接收 CompositionContext
 */
function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: CompositionContext) => void,
): AppHost;
```

### 内部实现原理

```typescript
export function setContent(
  canvas: HTMLCanvasElement,
  appComposable: (ctx: CompositionContext) => void,
): AppHost {
  const dpr = window.devicePixelRatio || 1
  let width = canvas.clientWidth
  let height = canvas.clientHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  const ctx2d = canvas.getContext('2d')
  ctx2d.scale(dpr, dpr)

  const host = createCanvasHost(canvas, ctx2d)
  const appCtx = createAppContext({ canvas })
  let rootCtx: CompositionContext | null = null

  const wrappedComposable = composable<{}>((ctx: CompositionContext) => {
    rootCtx = ctx
    appComposable(rootCtx)
  })

  function render(): void {
    if (!needsRender) return
    needsRender = false
    host.clear()
    if (rootCtx && rootCtx.rootNodeId !== null) {
      const commands = renderEmittedTree(
        host.ctx,
        rootCtx.emittedNodes,
        rootCtx.rootNodeId,
        width,
        height,
      )
      host.render(commands)
    }
  }

  function requestRender(): void {
    needsRender = true
    requestAnimationFrame(render)
  }

  const originalScheduleRecompose = appCtx.recomposer.scheduleRecompose
  appCtx.recomposer.scheduleRecompose = (scope) => {
    originalScheduleRecompose(scope)
    requestRender()
  }

  window.addEventListener('resize', handleResize)
  render()

  function destroy(): void {
    window.removeEventListener('resize', handleResize)
  }

  return { requestRender, destroy, canvas, appContext: appCtx }
}
```

### Context 层次关系

```
AppHost (setContent 返回值)
  └── appContext: ComposerContext { snapshot, recomposer }
        ↑ 传入 composable() HOC
        ↓
        composable() 内部创建:
        └── compositionCtx: CompositionContextImpl
              ├── extends ComposerContext (snapshot, recomposer)
              ├── emitLeaf() / startGroup() / endGroup()
              ├── emittedNodes: Map<NodeId, EmittedNode>
              └── rootNodeId: NodeId | null
                    ↑ 传入用户根函数
                    ↓
                    用户代码 (appComposable):
                    (rootCtx: CompositionContext) => {
                      remember(rootCtx, () => ...)
                      Column(rootCtx, ...) { ... }
                      Text(rootCtx, ...)
                    }
```

### 使用示例

```typescript
import {
  setContent,
  composable,
  remember,
  mutableStateOf,
  Column, Row, Text, Button,
  Modifier,
} from 'pug-canvas-ui';

const canvas = document.getElementById('app-canvas') as HTMLCanvasElement;

const app = setContent(canvas, (rootCtx) => {
  const count = remember(rootCtx, () => mutableStateOf(0));
  const isEnabled = remember(rootCtx, () => mutableStateOf(true));

  Column(rootCtx, Modifier.create()
    .fillMaxWidth().fillMaxHeight()
    .padding(24)
    .freeze(),
    'spacedBy(12)',
    'center',
  () => {

    Text(rootCtx, 'Canvas UI Demo', Modifier.create().freeze(), {
      fontSize: 28,
      fontWeight: 'bold',
      color: { r: 33, g: 33, b: 33, a: 1 },
    });

    Text(rootCtx, `Count: ${count.value}`, Modifier.create().freeze(), {
      fontSize: 48,
      color: { r: 103, g: 80, b: 164, a: 1 },
    });

    Row(rootCtx, Modifier.create().fillMaxWidth().freeze(), 'spacedBy(12)', 'center', () => {

      Button(rootCtx, '-', () => count.value--,
        Modifier.create().size(56, 56).freeze());

      Button(rootCtx, '+', () => count.value++,
        Modifier.create().size(56, 56).freeze());

      Button(rootCtx, isEnabled.value ? 'Disable' : 'Enable',
        () => { isEnabled.value = !isEnabled.value; });
    });

    if (!isEnabled.value) {
      Text(rootCtx, '⚠️ 功能已禁用', Modifier.create().freeze(), {
        fontSize: 14,
        color: { r: 183, g: 28, b: 28, a: 1 },
      });
    }
  });
});

window.addEventListener('resize', () => {
  app.requestRender();
});

window.addEventListener('unload', () => {
  app.destroy();
});
```

### composable() 自定义组件

```typescript
const MyCard = composable<{ title: string; body: string }>((ctx, { title, body }) => {
  Surface(ctx, () => {
    Column(ctx, Modifier.create().padding(16).freeze(), 'spacedBy(8)', 'start', () => {
      Text(ctx, title, Modifier.create().freeze(), {
        fontSize: 18,
        fontWeight: 'bold',
      });
      Text(ctx, body, Modifier.create().freeze(), {
        fontSize: 14,
      });
    });
  }, {
    modifier: Modifier.create().fillMaxWidth().padding(8).freeze(),
    color: { r: 255, g: 255, b: 255, a: 1 },
    elevation: 2,
    borderRadius: 8,
    alignment: 'start',
  });
});

// 在 setContent 中使用：
setContent(canvas, (rootCtx) => {
  Column(rootCtx, Modifier.create().padding(16).freeze(), 'spacedBy(16)', 'start', () => {
    MyCard({ title: 'Hello', body: 'World' }, rootCtx.appContext);
    MyCard({ title: 'Foo', body: 'Bar' }, rootCtx.appContext);
  });
});
```

## 正面影响

1. **API 极简**：
   - 一行代码启动应用：`setContent(canvas, (ctx) => { ... })`
   - 类似 Android `ComposeView.setContent { }` 但更简洁
   - 无需手动 `new AppContext()` + `.setContent()` + `.start()` 三步

2. **CompositionContext 自动注入**：
   - 用户不需要了解 ComposerContext vs CompositionContext 区别
   - `composable()` HOC 自动处理 Context 转换
   - `remember(ctx, ...)` 直接使用传入的 ctx

3. **生命周期自动化**：
   - 渲染循环自动启动
   - resize 自动处理
   - dispose 清理所有资源
   - recomposer.scheduleRecompose 自动触发 requestRender

4. **测试友好性极佳**：
   ```typescript
   test('should emit correct nodes', () => {
     const canvas = document.createElement('canvas')
     const host = setContent(canvas, (rootCtx) => {
       Text(rootCtx, 'Hello')
     })
     expect(host.canvas).toBe(canvas)
     expect(host.appContext).toBeDefined()
     host.destroy()
   })
   ```

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| AppHost 较"轻" | 比 AppContext 类更薄，功能集中在闭包中 | 提供 AppHost 完整接口文档 |
| Canvas 必须已挂载 | setContent 需要 DOM 中已有 canvas 元素 | 文档说明；或在 onMounted 后调用 |
| 单实例模式 | 一个 canvas 对应一个 setContent 调用 | 如需多 Canvas，多次调用 setContent |

## 实现约束

1. **setContent 是唯一入口**：不允许其他方式设置根组件
2. **canvas 参数必须是有效元素**：抛出明确的错误信息
3. **destroy 必须幂等**：多次调用不会报错
4. **requestRender 安全**：可在任何时候调用触发重绘
5. **resize 自动响应**：监听 window.resize 事件

## 相关文档

- 上游 ADR:
  - [`reactive-state-snapshot-context-based.md`](./reactive-state-snapshot-context-based.md)
  - [`composable-tracking-runtime-hoc.md`](./composable-tracking-runtime-hoc.md)
  - [`rendering-architecture-hybrid-mode.md`](./rendering-architecture-hybrid-mode.md)
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:00 | 用户 + AI | 确认 AppContext 作为统一根对象；禁用 static；setContent() 为入口；零全局变量 |
| 2026-05-07 00:00 | 用户 + AI | **重大升级**：入口简化为 `setContent(canvas, (rootCtx) => void)`；引入 CompositionContext 流转；AppHost 替代 AppContext 作为公开 API |
