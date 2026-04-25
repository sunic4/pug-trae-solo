# AppContext 架构设计 - 产品需求文档

## Overview
- **Summary**: 设计并实现统一的 AppContext 架构，用于替代当前代码库中过度使用的全局状态和对象，采用依赖注入模式提高代码可测试性和可维护性。
- **Purpose**: 解决当前代码库中全局状态过多、模块耦合度高、测试困难等问题，建立清晰的模块边界和职责。
- **Target Users**: 开发人员，特别是需要维护和扩展此代码库的工程师。

## Goals
- 创建统一的 AppContext 接口和实现，作为应用的核心上下文
- 实现依赖注入机制，替代全局对象访问
- 明确模块边界和职责，提高代码可读性和可维护性
- 简化组件 API，支持更好的测试能力
- 保持向后兼容，确保现有功能不受影响

## Non-Goals (Out of Scope)
- 重写整个渲染引擎
- 改变现有的信号和响应式系统
- 修改核心组件的基础实现
- 引入新的第三方依赖

## Background & Context
当前代码库中存在多个全局对象：
- `packages/composer/src/composer.ts` 中的 `globalComposer`
- `packages/theme/src/theme-context.ts` 中的 `globalThemeContext`
- `apps/demo/src/utils/renderUtils.ts` 中的 `globalComposer` 和 `globalRootNode`

这些全局对象导致：
- 模块间耦合度高，难以测试
- 状态管理混乱，难以追踪
- 代码复用性差，难以扩展

## Functional Requirements
- **FR-1**: 创建 AppContext 接口，包含主题、组件组合器、渲染器等核心服务
- **FR-2**: 实现依赖注入机制，允许在应用启动时配置和注入依赖
- **FR-3**: 提供 AppContext 创建和管理工具
- **FR-4**: 重构现有组件，使其使用 AppContext 而不是全局对象
- **FR-5**: 确保现有功能保持兼容

## Non-Functional Requirements
- **NFR-1**: 代码可测试性 - 所有组件和服务应支持单元测试
- **NFR-2**: 性能 - 依赖注入不应显著影响应用性能
- **NFR-3**: 可扩展性 - 架构应支持未来功能扩展
- **NFR-4**: 代码可读性 - 模块边界清晰，职责明确

## Constraints
- **Technical**: 保持与现有 TypeScript 类型系统兼容
- **Dependencies**: 利用现有的信号和响应式系统
- **Timeline**: 分阶段实现，确保每个阶段都能正常工作

## Assumptions
- 现有的信号系统 (`@pug/reactivity`) 将继续使用
- 现有的渲染系统 (`@pug/renderer`) 将继续使用
- 现有的组件系统 (`@pug/components`) 将继续使用

## Acceptance Criteria

### AC-1: AppContext 接口定义
- **Given**: 开发环境已设置
- **When**: 查看 AppContext 接口定义
- **Then**: 接口应包含主题、组件组合器、渲染器等核心服务的访问方法
- **Verification**: `human-judgment`

### AC-2: 依赖注入实现
- **Given**: AppContext 已创建
- **When**: 创建组件时传入 AppContext
- **Then**: 组件应能通过 AppContext 访问所需服务，而不是使用全局对象
- **Verification**: `programmatic`

### AC-3: 应用启动流程
- **Given**: AppContext 已配置
- **When**: 启动应用
- **Then**: 应用应正常启动，所有组件能正确访问 AppContext
- **Verification**: `programmatic`

### AC-4: 测试支持
- **Given**: 测试环境已设置
- **When**: 编写组件测试
- **Then**: 应能轻松创建测试用的 AppContext，模拟依赖
- **Verification**: `programmatic`

### AC-5: 向后兼容性
- **Given**: 现有功能正常运行
- **When**: 应用 AppContext 架构
- **Then**: 现有功能应继续正常运行，无回归
- **Verification**: `programmatic`

## Open Questions
- [ ] 如何处理现有的全局对象，确保平滑过渡
- [ ] 如何设计 AppContext 的生命周期管理
- [ ] 如何处理组件树中的 AppContext 传递