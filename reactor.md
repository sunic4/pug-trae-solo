# 重构规范

## 重构规则

- 重组代替继承
- 必须消除重复代码
- 必须消除 any, unknown, as
- 必须消除内联 import
- 统一 `@/` 作为根目录导入
- 确保功能完整，精简代码
- 必须消除重复功能的组件，要求单一职责

## 涉及范围

- 演示示例：`example/`
- 测试代码：`tests/`
- 源码：`src/`

## Check 渲染验证流程

1. 停止所有服务：`npx kill-port 3000`
2. 启动 dev server：`npm run dev`（端口 3000）
3. 运行全部 Playwright E2E 测试：`npx playwright test --reporter=list`
4. **逐页查看所有截图**
5. 修复问题后回到步骤 3，直到**所有页面截图均符合预期**

> 按 check 流程识别并修复所有渲染问题。
> 目标是修复组件渲染问题，不以任何理由简化或绕过，符合最佳实践无条件执行。
> 所有截图保存到 `tests/screenshots/`。
> 未完成的项目无需考虑兼容性。
> **重构后必须执行 check 验证。**
> **E2E 测试的每个截图都必须目视检查，发现渲染问题立即修复。**

## E2E 测试约定

- 端口统一使用 `playwright.config.ts` 的 baseURL（端口 3000），禁止硬编码端口号
- Canvas 点击事件使用 `dispatchEvent('pointerdown/up')` 方式，禁止使用 `.click({ position })`
- 禁止 `as` 类型断言
- 截图路径统一为 `tests/screenshots/`
- 引用不存在的 HTML 页面的测试文件应删除
