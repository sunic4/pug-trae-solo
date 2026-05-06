---
id: "feat-21"
type: feature
status: done
title: "布局转场动画 (Crossfade/AnimatedContent)"
origin_type: req
depends_on: ["feat-13", "feat-15"]
created: "2026-05-01 18:50"
updated: "2026-05-01 18:50"
stale: false
---

# feat-21: 布局转场动画

## 实现思路概述

1. **Crossfade** — 淡入淡出转场，支持 targetState/animationSpec，子组件间交叉渐变
2. **AnimatedContent** — 内容转场，支持 targetState/transitionSpec/content 映射

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| 新建 | `src/animation/transition.ts` | Crossfade/AnimatedContent 转场动画 |
| 新建 | `src/animation/__tests__/transition.test.ts` | 转场动画 单元测试 |
| 修改 | `src/animation/index.ts` | 动画模块导出更新 |
| 修改 | `src/index.ts` | 顶层导出更新 |

## DoD 验收标准

- [x] 构建零错误
- [x] 类型检查零 error
- [x] 单元测试 100% 通过
- [x] Crossfade 正确管理目标状态和动画
- [x] AnimatedContent 正确管理内容转场
- [x] impl-checklist.yaml 所有条目 = done
