---
id: "feat-18"
type: feature
status: done
title: "基础组件库 (Box/Text/Image/Spacer)"
origin_type: req
depends_on: ["feat-06", "feat-13", "feat-14", "feat-17"]
created: "2026-05-01 17:53"
updated: "2026-05-01 17:53"
stale: false
---

# feat-18: 基础组件库 (Box/Text/Image/Spacer)

## 实现思路概述

基于已实现的核心系统（布局引擎、文本渲染、图像加载、Modifier），实现声明式组件库的基础组件。

组件模型（来自 ADR #5）：
- 纯函数调用链，禁止 JSX
- `composable()` HOC 包装
- 尾随 lambda 模式

### 组件列表

1. **Box** — 容器组件，支持 alignment + children，基于 boxMeasurePolicy
2. **Text** — 文本组件，支持 TextStyle + 单行/多行
3. **Image** — 图像组件，支持 src + NinePatch
4. **Spacer** — 占位组件，占据指定空间

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/components/basic/box.ts` | Box 容器组件 |
| 新建 | `src/components/basic/text.ts` | Text 文本组件 |
| 新建 | `src/components/basic/image.ts` | Image 图像组件 |
| 新建 | `src/components/basic/spacer.ts` | Spacer 占位组件 |
| 新建 | `src/components/basic/index.ts` | 基础组件导出 |
| 新建 | `src/components/__tests__/basic-components.test.ts` | 基础组件 单元测试 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Box 正确布局子组件
- [x] Text 正确渲染文本
- [x] Image 正确加载和绘制图像
- [x] Spacer 正确占据空间
- [x] impl-checklist.yaml 所有条目 = done
