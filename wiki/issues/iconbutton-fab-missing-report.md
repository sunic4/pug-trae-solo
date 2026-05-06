---
id: "iconbutton-fab-missing"
type: issue
status: reported
title: "组件库缺少 IconButton 和 FAB 组件"
depends_on: []
severity: major
created: "2025-05-01T22:40"
updated: "2025-05-01T22:40"
stale: false
---

## 问题描述

当前组件库仅包含基础 Button 组件，缺少 IconButton（图标按钮）和 FAB（浮动操作按钮）。这两个是 Material Design 最核心的交互组件。

## 期望行为

- **IconButton**: 正方形/圆形按钮，只含图标内容，支持 `onClick`
- **FAB**: 圆形浮动按钮（右下角定位），含图标，带阴影和主题色

## 影响范围

- Material Design 风格应用无法实现工具栏操作
- 列表项中的删除/编辑操作无法用标准图标按钮实现
- 缺少主操作入口（FAB 按钮）
