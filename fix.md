# 开发者工作流

> 如何在 `pug-canvas-ui` 中高效开发：从写代码到验证渲染的完整闭环。

编码规则、目录结构、命令速查见 [AGENTS.md](AGENTS.md)。本文档只讲**流程和实操**。

---

## 一、日常循环

```
写代码 → npm test → tsc --noEmit → npm run dev → playwright test → 查截图
```

每步必须通过再进入下一步。UI 相关改动必须走完全链路。

---

## 二、新增组件

### 2.1 文件模板

```typescript
// src/components/xxx/my-component.ts
import { ConstrainedMeasurePolicy, Modifier, NOOP_DRAW_POLICY } from '@/components/shared/imports'
import type { ComponentBase, ComponentNode, ReadonlyModifier } from '@/components/shared/imports'
import { leafGetChildren, leafLayoutChildren } from '@/components/basic/types'

type MyComponent = { readonly kind: 'my' } & ComponentBase

function MyComponent(modifier: ReadonlyModifier = DEFAULT_MODIFIER): MyComponent {
  return {
    kind: 'my',
    modifier,
    measurePolicy: ConstrainedMeasurePolicy(0, 48),
    drawPolicy: NOOP_DRAW_POLICY,
    layoutChildren: leafLayoutChildren,
    getChildren: leafGetChildren,
  }
}

export type { MyComponent }
export { MyComponent }
```

### 2.2 选型表

| 组件类型 | MeasurePolicy | layoutChildren | 场景 |
|----------|---------------|----------------|------|
| 叶子（Text/Box/Spacer） | ConstrainedMeasurePolicy | leafLayoutChildren | 无子节点 |
| 线性容器（Column/Row） | LinearMeasurePolicy | layoutColumnChildren / layoutRowChildren | 子节点排列 |
| 卡片容器（Surface） | LinearMeasurePolicy('vertical') | layoutColumnChildren | 多个子元素堆叠 |
| 对齐容器（Box+alignment） | BoxAlignmentMeasurePolicy | layoutBoxChildren | 单子元素居中 |

### 2.3 后续步骤

1. 在对应目录 `index.ts` + `src/components/index.ts` 加导出
2. 在 `src/components/__tests__/` 写测试文件
3. `npm test` + `npm run typecheck`
4. 在 example 页面中使用，跑 Check 流程（第四节）

---

## 三、新增页面

### 3.1 页面模板

```typescript
// example/pages/my-page.ts
import { composable } from '@/core/composable'
import type { ComposerContext, ComposableNode } from '@/core/types'
import { Column } from '@/components/layout/column'
import { Text } from '@/components/basic/text'
import { Spacer } from '@/components/basic/spacer'
import { Surface } from '@/components/layout/surface'
import { Modifier } from '@/layout/modifier'
import { headingStyle, bodyStyle, AppColors } from '../theme/app-theme'

function MyPage(_props: {}, _ctx: ComposerContext): ComposableNode | null {
  return Column(Modifier.create().padding(12).fillMaxSize().freeze(), 'start', 'start', [
    Text('标题', Modifier.create().freeze(), headingStyle(22)),
    Spacer(0, 16),
    Surface(Modifier.create().fillMaxWidth().padding(12).freeze(), AppColors.cardBg, 0, 8, 'start', [
      Text('内容', Modifier.create().freeze(), bodyStyle(14)),
    ]),
  ])
}

export const MyPageComposable = composable<{}>(MyPage)
```

### 3.2 注册路由

编辑 [`example/app.ts`](example/app.ts)：
- import `MyPageComposable`
- `TAB_LABELS` 加标签名
- switch-case 加分支
- BottomNavigation items 加一项

### 3.3 布局约束

页面可用高度 = Canvas 高度（800px） - TopAppBar（~48px） - BottomNavigation（~56px）。内容超出会被截断，注意控制 Spacer 和 padding 总量。

---

## 四、Check 渲染验证（UI 改动必做）

### 4.1 执行

```bash
npx kill-port 3000
npm run dev
npx playwright test --reporter=list
```

### 4.2 逐页检查截图

| 截图 | 页面 | 重点检查 |
|------|------|---------|
| `tests/screenshots/example-app.png` | 首页 | 标题、卡片无重叠、底部导航完整 |
| `tests/screenshots/complete-interaction.png` | 交互 | Slider/Checkbox/Button/Snackbar |
| `tests/screenshots/complete-layout.png` | 布局 | 4 个区块全部可见、无截断 |
| `tests/screenshots/complete-feedback.png` | 反馈 | Progress/Dialog/Snackbar |
| `tests/screenshots/complete-list.png` | 列表 | 卡片完整 |

发现问题 → 修复 → 回到 4.1 重跑。

### 4.3 排查速查

| 现象 | 方向 |
|------|------|
| 内容只占上半屏 | fillMaxSize 未生效 → 检查 component-renderer.ts 的 applyFillSize |
| 子元素重叠 | 容器用了 Box 布局 → 改为 Column/Row |
| 底部截断 | 内容超高 → 减小 padding/font-size/Spacer |
| 点击无效 | 用了 .click() → 改用 dispatchEvent('pointerdown/up') |
| 文字拥挤 | Spacer < 8px → 增大间距 |

---

## 五、E2E 测试规范

### 5.1 Canvas 交互正确写法

```typescript
const canvas = page.locator('#canvas')
const box = await canvas.boundingBox()
if (box) {
  await canvas.dispatchEvent('pointerdown', { clientX: box.x + offset, clientY: box.y + box.height - 28 })
  await canvas.dispatchEvent('pointerup')
}
```

禁止 `.click({ position })` 和 `.mouse.click()`——Canvas 元素会导致超时。

### 5.2 截图规则

- 路径统一 `tests/screenshots/`
- 禁止硬编码端口号（用 `page.goto('/')` 相对路径）
- 禁止 `as HTMLCanvasElement`
- 等待策略：`waitForLoadState('networkidle')` + `waitForTimeout(500~2000)`

---

## 六、已清理 & 待清理

### 6.1 已完成

| 动作 | 内容 |
|------|------|
| 删除 example/debug-* | 6 个 debug 遗留文件（debug-app, debug-all-pages, debug-simple 及其 HTML） |
| 修复 Surface 布局 | Box→Column，解决子元素重叠 |
| 修复 fillMaxSize | component-renderer.ts 新增 applyFillSize |
| 修复 Layout 截断 | 压缩间距适配可用空间 |
| 修复 E2E 测试 | 端口硬编码→相对路径、as 断言移除、click→dispatchEvent |

### 6.2 可选清理（不影响功能）

| 项目 | 文件 | 理由 |
|------|------|------|
| 死代码 | `src/components/container/card.ts` | Card=Surface 别名，零使用 |
| 重复文档 | `test.md` | 与 reactor.md 完全重叠 |
| 孤立脚本 | `tests/screenshot-demo.ts` | 非 .spec.ts，不会被 Playwright 执行 |
| 冗余锁文件 | `pnpm-lock.yaml` | 项目使用 npm |

### 6.3 E2E 测试可精简

当前 16 个文件中约 13 个在做同一件事（5 页截图）。核心保留 3 个即可：

| 保留文件 | 用途 |
|---------|------|
| `example.spec.ts` | 冒烟测试（3 tests） |
| `complete-demo-verification.spec.ts` | 5 页截图基线（5 tests） |
| `check-page.spec.ts` | 控制台错误检查（1 test） |
