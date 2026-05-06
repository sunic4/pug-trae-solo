---
id: "keyboard-input-missing"
type: issue
status: reported
title: "输入系统缺少键盘输入与 IME 集成"
depends_on: []
severity: major
created: "2025-05-01T22:30"
updated: "2025-05-01T22:30"
stale: false
---

## 问题描述

当前输入系统仅支持 Pointer 事件（触控/鼠标），缺少 Keyboard 事件支持。桌面端无法使用 Tab 导航、回车确认、快捷键等基础交互。

## 复现步骤

1. 在桌面浏览器打开 Canvas 应用
2. 按 Tab 键 → 无焦点切换
3. 按 Enter → 无响应
4. 文本输入框无法接收键盘输入

## 期望行为

- Tab 键切换焦点
- Enter/Escape 等按键触发组件事件
- 快捷键支持（如 Ctrl+S）
- Modal 对话框内 Esc 关闭

## 影响范围

- 桌面端交互完全不可用
- TextField 无法接收文本输入
- 无障碍键盘导航缺失
