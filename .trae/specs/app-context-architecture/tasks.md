# AppContext 架构设计 - 实现计划

## [x] Task 1: 创建核心 AppContext 接口和实现
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 `packages/core/src/app-context.ts` 文件
  - 定义 AppContext 接口，包含主题、组件组合器、渲染器等核心服务
  - 实现 AppContext 类，提供依赖管理功能
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: AppContext 接口应包含所有必要的服务访问方法
  - `programmatic` TR-1.2: AppContext 实现应正确管理依赖
- **Notes**: 确保接口设计灵活，支持未来扩展

## [x] Task 2: 重构主题系统，支持 AppContext
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 `packages/theme/src/theme-context.ts`
  - 保持 `globalThemeContext` 全局对象以确保向后兼容
  - 使 ThemeContext 成为 AppContext 的一部分
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 主题系统应能通过 AppContext 访问
  - `programmatic` TR-2.2: 现有主题功能应保持不变
- **Notes**: 保持 `useTheme` 等钩子函数的向后兼容性

## [x] Task 3: 重构组件系统，支持 AppContext 注入
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 修改组件基类 `ComposeNode`
  - 添加 AppContext 支持
  - 重构 Button 和 Text 组件，使其使用 AppContext 而不是全局对象
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 组件应能通过 AppContext 访问主题等服务
  - `programmatic` TR-3.2: 现有组件功能应保持不变
- **Notes**: 确保组件 API 简化，支持测试

## [x] Task 4: 重构渲染系统，支持 AppContext
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 `packages/renderer/src/canvas-renderer.ts`
  - 使其支持 AppContext
  - 移除全局依赖
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 渲染器应能通过 AppContext 访问所需服务
  - `programmatic` TR-4.2: 渲染功能应保持不变
- **Notes**: 确保渲染性能不受影响

## [x] Task 5: 创建应用启动引导流程
- **Priority**: P0
- **Depends On**: Task 1, Task 2, Task 3, Task 4
- **Description**: 
  - 创建 `apps/demo/src/bootstrap.ts`
  - 实现应用启动流程，创建和配置 AppContext
  - 替换现有的 `renderUtils.ts` 逻辑
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 应用应能正常启动
  - `programmatic` TR-5.2: 所有组件应能正确访问 AppContext
- **Notes**: 确保启动流程清晰，易于理解

## [x] Task 6: 重构现有应用代码，使用 AppContext
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 修改 `apps/demo/src/App.ts`
  - 修改页面组件和导航栏
  - 使其使用 AppContext 而不是全局对象
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 现有功能应继续正常运行
  - `programmatic` TR-6.2: 导航和页面切换应正常工作
- **Notes**: 确保向后兼容性

## [x] Task 7: 编写测试工具和示例
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 创建测试用的 AppContext 工厂函数
  - 编写组件测试示例
  - 确保所有组件都能被测试
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-7.1: 应能轻松创建测试用的 AppContext
  - `programmatic` TR-7.2: 组件测试应能正常运行
- **Notes**: 提供清晰的测试指南

## [x] Task 8: 性能优化和最终验证
- **Priority**: P2
- **Depends On**: All previous tasks
- **Description**: 
  - 优化 AppContext 的性能
  - 运行完整的测试套件
  - 确保所有功能正常运行
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-8.1: 应用性能应与之前相当或更好
  - `programmatic` TR-8.2: 所有测试应通过
- **Notes**: 确保最终架构稳定可靠