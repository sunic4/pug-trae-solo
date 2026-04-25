# 项目架构总览

## 项目信息

- **项目名称**: Canvas Compose
- **项目简介**: 基于 Canvas 的声明式 UI 框架，支持组件化开发和响应式状态管理
- **主要功能**: 组件系统、主题系统、渲染系统、事件系统、响应式系统

## 目录结构

```
/
├── apps/               # 应用目录
│   └── demo/           # 示例应用
├── packages/           # 核心包
│   ├── components/     # 组件库
│   ├── composer/       # 组件组合器
│   ├── core/           # 核心功能
│   ├── event/          # 事件系统
│   ├── layout/         # 布局系统
│   ├── reactivity/     # 响应式系统
│   ├── renderer/       # 渲染系统
│   └── theme/          # 主题系统
└── codestable/         # CodeStable 工作流文档
```

## 核心模块

### 1. 核心系统 (core)
- **AppContext**: 依赖注入容器，管理应用级服务
- **测试工具**: 提供测试环境和辅助函数

### 2. 组件系统 (components)
- **基础组件**: Button, Text, Box, Column, Row, Stack, Checkbox, TextInput
- **组件基类**: ComposeNode

### 3. 渲染系统 (renderer)
- **CanvasRenderer**: 基于 Canvas 的渲染器
- **渲染接口**: RendererInterface
- **绘制命令**: DrawCommand

### 4. 主题系统 (theme)
- **ThemeContext**: 主题上下文
- **主题定义**: Theme

### 5. 响应式系统 (reactivity)
- **Signal**: 响应式信号
- **Computed**: 计算属性
- **Effect**: 副作用

### 6. 事件系统 (event)
- **Dispatcher**: 事件分发器
- **Gesture**: 手势识别
- **HitTest**: 点击测试

## 架构特点

1. **依赖注入**: 使用 AppContext 进行依赖管理
2. **组件化**: 基于 ComposeNode 的组件系统
3. **响应式**: 基于 Signal 的状态管理
4. **可扩展性**: 模块化设计，易于扩展
5. **可测试性**: 支持单元测试和集成测试

## 技术栈

- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的前端构建工具
- **Jest**: 测试框架
- **Canvas API**: 底层渲染技术

## 关键流程

### 应用启动流程
1. 创建 AppContext
2. 初始化主题
3. 初始化渲染器
4. 创建根组件
5. 启动渲染循环

### 组件渲染流程
1. 组件树构建
2. 布局计算
3. 绘制命令生成
4. Canvas 渲染
5. 事件处理

## 未来规划

- 支持更多组件类型
- 增强主题系统
- 优化渲染性能
- 增加动画支持
- 提供更多测试工具
