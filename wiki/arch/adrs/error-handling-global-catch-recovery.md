---
id: "error-handling-global-catch-recovery"
type: architecture
status: accepted
title: "错误处理 — 全局捕获 + Error Boundary + 分级恢复"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./data-flow-management-unidirectional-pattern.md"
  - "./component-model-pure-function-call-chain.md"
created: "2026-04-30 18:10"
updated: "2026-04-30 18:15"
stale: false
---

# ADR: 错误处理 — 全局捕获 + Error Boundary + 分级恢复

## 背景

在 Canvas UI 运行时中，错误可能发生在多个层面：

1. **Composable 函数执行阶段**：组件逻辑异常（空指针、类型错误等）
2. **副作用执行阶段**：网络请求失败、异步操作超时
3. **渲染阶段**：布局计算错误、Canvas 绑定异常
4. **事件处理阶段**：用户交互回调抛出异常

> **如何设计一个健壮的错误处理系统，既能防止应用崩溃，又能提供良好的用户体验和调试信息？**

### 核心挑战

- **单一故障不应导致整个应用崩溃**
- **需要区分可恢复错误和致命错误**
- **错误信息对开发者友好（堆栈、上下文）**
- **用户看到友好的降级 UI（而非白屏）**

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A) Error Boundary + 全局捕获** | 类似 React Error Boundary，组件树级别隔离错误 | 粒度可控；用户体验好；符合 Compose 模型 | 需要额外代码包装 |
| **B) 全局 try-catch** | 在 Recomposition Loop 顶层统一捕获 | 实现简单；覆盖全面 | 无法局部恢复；粒度过粗 |
| **C) Result 类型（函数式）** | 所有可能出错的操作返回 Result<T, E> | 类型安全；强制处理错误 | 代码冗长；与现有 API 不兼容 |

## 决策结果

选择 **方案 A：Error Boundary + 全局捕获 + 分级恢复策略**，实现分层防御体系：

```
┌─────────────────────────────────────────────────────┐
│              三层错误防御架构                         │
│                                                     │
│  Layer 3: 全局最后防线                               │
│  ┌─────────────────────────┐                        │
│  │ Global Error Handler     │ ← 捕获所有未处理的异常   │
│  │ • 记录完整堆栈           │                        │
│  │ • 显示全局错误页面       │                        │
│  │ • 上报到监控系统         │                        │
│  └──────────┬──────────────┘                        │
│             │ 未被下层捕获的异常                       │
│             ▼                                        │
│  Layer 2: Error Boundary（组件树级别）                │
│  ┌─────────────────────────┐                        │
│  │ ErrorBoundary {          │ ← 隔离子树错误          │
│  │   ┌────────┐            │                        │
│  │   │ ChildA  │ ✅ 正常    │                        │
│  │   ├────────┤            │                        │
│  │   │ ChildB  │ ❌ 异常    │ → 显示 Fallback UI      │
│  │   └────────┘            │                        │
│  │ }                        │                        │
│  └──────────┬──────────────┘                        │
│             │                                        │
│             ▼                                        │
│  Layer 1: 局部 try-catch（操作级别）                  │
│  ┌─────────────────────────┐                        │
│  │ try {                   │ ← 处理预期内的错误        │
│  │   riskyOperation();     │                        │
│  │ } catch (e) {           │                        │
│  │   showUserFriendlyError();│                      │
│  │ }                       │                        │
│  └─────────────────────────┘                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 核心架构设计

#### 1. ErrorBoundary 组件

```typescript
interface ErrorBoundaryProps {
  fallback?: (error: Error, retry: () => void) => ComposableNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: () => ComposableNode;
}

interface ErrorInfo {
  componentStack: string;  // 组件调用栈
  timestamp: number;
  context: Record<string, any>;  // 额外上下文信息
}

const ErrorBoundary = composable<ErrorBoundaryProps>(({
  fallback,
  onError,
  children
}) => {
  const error = remember<Error | null>(null);
  
  // 内部使用 try-catch 包裹子组件执行
  try {
    if (error.value === null) {
      return children();
    }
  } catch (caughtError) {
    error.value = caughtError as Error;
    
    // 调用错误回调（用于日志上报）
    onError?.(caughtError as Error, {
      componentStack: getComponentStack(),
      timestamp: Date.now(),
      context: {}
    });
  }
  
  // 显示降级 UI
  if (error.value !== null && fallback) {
    return fallback(error.value, () => {
      error.value = null;  // 重试：清除错误状态，重新渲染子组件
    });
  }
  
  // 默认 Fallback UI
  return DefaultErrorFallback({ 
    error: error.value!, 
    onRetry: () => error.value = null 
  });
});

// 使用示例
const UserProfile = composable<{ userId: string }>(({ userId }) => {
  return ErrorBoundary({
    fallback: (error, retry) => Column() {
      Text({ text: '加载用户资料失败', color: Color.Red });
      Button({ text: '重试', onClick: retry });
    },
    children: () => UserDetail({ userId })
  });
});
```

#### 2. 全局错误处理器

```typescript
// ===== 全局错误处理器配置 =====

interface GlobalErrorHandlerConfig {
  // 错误分类器
  classify: (error: Error) => ErrorClassification;
  
  // 各类错误的处理器
  handlers: {
    recoverable: (error: Error) => void;      // 可恢复错误
    fatal: (error: Error) => never;            // 致命错误
    network: (error: Error) => void;           // 网络错误
    validation: (error: Error) => void;        // 验证错误
  };
  
  // 日志上报
  reporter: (errorReport: ErrorReport) => void;
}

enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  stackTrace: string;
  componentStack?: string;
  userAgent: string;
  timestamp: number;
  context: {
    route?: string;
    userId?: string;
    action?: string;
  };
}

// 注册全局处理器
CanvasHost.setGlobalErrorHandler({
  classify: (error) => {
    if (error instanceof NetworkError) return { type: 'network', severity: ErrorSeverity.WARNING };
    if (error instanceof ValidationError) return { type: 'validation', severity: ErrorSeverity.INFO };
    if (error instanceof FatalError) return { type: 'fatal', severity: ErrorSeverity.FATAL };
    return { type: 'recoverable', severity: ErrorSeverity.ERROR };
  },
  
  handlers: {
    recoverable: (error) => {
      console.error('[Recoverable]', error.message);
      showToast({ message: '操作失败，请重试', type: 'error' });
    },
    
    fatal: (error) => {
      console.error('[Fatal]', error.message);
      showGlobalErrorPage({ error, onRestart: () => window.location.reload() });
      throw error;  // 重新抛出，终止应用
    },
    
    network: (error) => {
      console.warn('[Network]', error.message);
      showOfflineIndicator();
    },
    
    validation: (error) => {
      console.info('[Validation]', error.message);
      showFieldError({ message: error.message });
    }
  },
  
  reporter: (report) => {
    // 上报到监控系统（Sentry/自研）
    if (report.severity === ErrorSeverity.FATAL || report.severity === ErrorSeverity.ERROR) {
      sendToMonitoringService(report);
    }
  }
});
```

#### 3. 错误分级策略

```typescript
// ===== 错误分类体系 =====

class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly severity: ErrorSeverity,
    public readonly userMessage: string,  // 用户可见的友好提示
    public readonly recoverable: boolean,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

enum ErrorCode {
  // 网络相关 (1xxx)
  NETWORK_TIMEOUT = 'NETWORK_1001',
  NETWORK_OFFLINE = 'NETWORK_1002',
  API_SERVER_ERROR = 'NETWORK_1003',
  
  // 验证相关 (2xxx)
  VALIDATION_REQUIRED = 'VALIDATION_2001',
  VALIDATION_FORMAT = 'VALIDATION_2002',
  VALIDATION_CUSTOM = 'VALIDATION_2999',
  
  // 业务逻辑 (3xxx)
  BUSINESS_PERMISSION_DENIED = 'BUSINESS_3001',
  BUSINESS_RESOURCE_NOT_FOUND = 'BUSINESS_3002',
  BUSINESS_CONFLICT = 'BUSINESS_3003',
  
  // 系统内部 (5xxx)
  INTERNAL_UNKNOWN = 'INTERNAL_5001',
  INTERNAL_STATE_CORRUPTED = 'INTERNAL_5002',
  INTERNAL_RENDER_FAILED = 'INTERNAL_5003'
}

// 使用示例
const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await authApi.login(credentials);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new AppError(
        '用户名或密码错误',
        ErrorCode.BUSINESS_PERMISSION_DENIED,
        ErrorSeverity.WARNING,
        '登录失败，请检查用户名和密码',
        true,  // 可恢复
        { action: 'login' }
      );
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new AppError(
        '请求超时',
        ErrorCode.NETWORK_TIMEOUT,
        ErrorSeverity.WARNING,
        '网络连接超时，请检查网络后重试',
        true,
        { endpoint: '/api/auth/login' }
      );
    }
    
    throw new AppError(
      '未知错误',
      ErrorCode.INTERNAL_UNKNOWN,
      ErrorSeverity.ERROR,
      '系统繁忙，请稍后重试',
      true
    );
  }
};
```

#### 4. 副作用错误处理（useEffect 集成）

```typescript
const DataFetcher = composable<{ url: string }>(({ url }) => {
  const data = remember(() => mutableStateOf<any>(null));
  const error = remember<AppError | null>(null);
  const loading = remember(() => mutableStateOf(true));
  
  useEffect(() => {
    let cancelled = false;
    
    fetchData(url)
      .then(result => {
        if (!cancelled) {
          data.value = result;
          loading.value = false;
          error.value = null;
        }
      })
      .catch(err => {
        if (!cancelled) {
          // 将原生 Error 转换为 AppError
          error.value = err instanceof AppError 
            ? err 
            : new AppError(
                err.message,
                ErrorCode.INTERNAL_UNKNOWN,
                ErrorSeverity.ERROR,
                '加载失败，请重试',
                true
              );
          loading.value = false;
          data.value = null;
        }
      });
      
    return () => { cancelled = true; };
  }, [url]);
  
  // 加载状态
  if (loading.value) {
    return LoadingSpinner();
  }
  
  // 错误状态（带重试能力）
  if (error.value !== null) {
    return ErrorView({
      error: error.value,
      onRetry: () => {
        loading.value = true;
        error.value = null;
        // 触发重新 fetch（通过改变依赖或使用 ref）
      }
    });
  }
  
  // 正常状态
  return DataRenderer({ data: data.value! });
});
```

#### 5. 自定义 Hook 封装

```typescript
// ===== useErrorHandler Hook =====

function useErrorHandler(context: string = '') {
  const [error, setError] = useState<AppError | null>(null);
  
  const handleError = useCallback((err: unknown, userMessage?: string) => {
    const appError = err instanceof AppError 
      ? err 
      : new AppError(
          String(err),
          ErrorCode.INTERNAL_UNKNOWN,
          ErrorSeverity.ERROR,
          userMessage || '操作失败',
          true,
          { source: context }
        );
    
    setError(appError);
    
    // 调用全局处理器
    GlobalErrorHandler.handle(appError);
  }, [context]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return { error, handleError, clearError };
}

// 使用示例
const FormSubmitButton = composable(() => {
  const { error, handleError, clearError } = useErrorHandler('form-submit');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitForm();
      clearError();
      showToast({ message: '提交成功', type: 'success' });
    } catch (err) {
      handleError(err, '表单提交失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  return Column() {
    if (error) {
      Alert({ 
        message: error.userMessage, 
        type: 'error',
        onClose: clearError 
      });
    }
    
    Button({
      text: submitting ? '提交中...' : '提交',
      onClick: handleSubmit,
      enabled: !submitting
    });
  };
});
```

## 正面影响

1. **应用稳定性大幅提升**：
   - 单一组件错误不会导致白屏崩溃
   - 用户可继续使用其他功能模块
   - 提供重试机制，增强容错性

2. **用户体验友好**：
   - 用户看到有意义的错误提示（非技术术语）
   - 关键操作提供重试按钮
   - 区分警告/错误/致命等级别

3. **开发调试高效**：
   - 完整的错误堆栈和组件调用栈
   - 错误上下文信息丰富（路由、用户ID、操作类型）
   - 支持时间旅行调试（记录错误历史）

4. **监控运维完善**：
   - 自动上报致命错误到监控系统
   - 错误分类统计（按类型、频率、影响范围）
   - 支持告警规则配置

5. **与现有架构完美契合**：
   - ErrorBoundary 作为 Composable 组件 ✅
   - 与 Recomposition Loop 无缝集成 ✅
   - Context 注入错误处理器 ✅

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 性能开销 | try-catch 和 ErrorBoundary 带来 ~1-2% 性能损耗 | 仅在关键路径使用；V8 引擎优化 try-catch |
| 代码复杂度增加 | 需要编写额外的错误处理逻辑 | 提供 useErrorHandler 等 Hook 封装通用模式 |
| 过度使用 ErrorBoundary | 导致组件树嵌套过深 | 仅在模块边界使用（如页面级、功能块级） |
| 错误分类标准不统一 | 开发者随意定义错误码 | 提供 ErrorCode 枚举和规范文档 |
| 静默吞掉错误 | 错误被捕获但未正确处理 | 强制要求所有 catch 块必须处理或 rethrow |

## 与其他方案的对比

| 维度 | **Error Boundary + 全局捕获 ✅** | 全局 try-catch | Result 类型 |
|------|----------------------------------|---------------|-------------|
| 错误隔离粒度 | ⭐⭐⭐⭐⭐ 组件级 | ⭐ 应用级 | ⭐⭐⭐ 操作级 |
| 用户体验 | ⭐⭐⭐⭐⭐ 最佳（局部降级） | ⭐ 最差（全局崩溃） | ⭐⭐⭐ 中等 |
| 代码侵入性 | ⭐⭐⭐ 低（可选使用） | ⭐⭐⭐⭐⭐ 最低 | ⭐ 最高（需修改返回类型） |
| 类型安全 | ⭐⭐⭐ 中等 | ⭐ 最低 | ⭐⭐⭐⭐⭐ 最高 |
| 与 Compose 兼容性 | ✅✅ 完美 | ⚠️ 可用但不够优雅 | ❌ 不兼容 |
| 调试体验 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐ 良好 |

## 验证假设

### 前提条件
1. ErrorBoundary 的 try-catch 包装不会显著影响重组性能（< 2%）
2. 错误分类器在 99% 的场景下能准确判断错误严重程度
3. 全局错误处理器的注册和调用时机不影响应用启动速度

### 验证方式
- [ ] **Spike #1**: 在包含 100 个组件的应用中测试 ErrorBoundary 的性能影响
- [ ] **Spike #2**: 模拟各种异常场景（网络断开、API 500、空指针等），验证错误分类准确性
- [ ] **Spike #3**: 测试错误恢复流程（重试、降级 UI 切换）的可靠性

## 可逆性评估

**类别**: 🟡 **部分可移除**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~10 文件（core/error/, components/ErrorBoundary.ts, hooks/useErrorHandler.ts） |
| 影响模块数 | 2 个模块（error-handling, components） |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 中等（如果移除，需要移除所有 ErrorBoundary 使用处） |

**回退方案**：
- 如果 ErrorBoundary 性能问题严重 → 退化为仅保留全局 try-catch
- 回退策略：将 ErrorBoundary 标记为 @deprecated，引导开发者使用局部 try-catch
- 工作量：~2 天重构 + 文档更新

## 实现约束（来自架构决策）

1. **禁止静默吞错**：所有 catch 块必须要么处理错误（显示 UI），要么 rethrow，要么调用 `handleError`
2. **ErrorBoundary 嵌套限制**：最多 5 层嵌套（防止查找链过长）
3. **错误对象标准化**：所有抛出的错误必须是 `AppError` 或其子类实例
4. **全局处理器单例**：`GlobalErrorHandler` 必须在应用启动时注册且仅注册一次
5. **用户消息国际化**：`AppError.userMessage` 必须支持 i18n key 或直接文本
6. **生产环境脱敏**：生产环境的错误堆栈不能暴露内部实现细节（如文件路径、SQL 语句）

## 错误处理最佳实践清单

### ✅ 推荐做法

```typescript
// 1. 页面级 ErrorBoundary（必需）
const HomePage = composable(() => {
  return ErrorBoundary({
    fallback: (error, retry) => PageErrorFallback({ error, retry }),
    children: () => HomeContent()
  });
});

// 2. 操作级 try-catch（预期内错误）
const handleDelete = async (itemId: string) => {
  try {
    await deleteItem(itemId);
    showToast({ message: '删除成功' });
  } catch (error) {
    if (error instanceof NetworkError) {
      showToast({ message: '网络异常，请检查连接' });
    } else {
      throw error;  // 未知错误向上冒泡
    }
  }
};

// 3. useEffect 错误处理（副作用）
useEffect(() => {
  const subscription = dataSource.subscribe({
    next: (data) => updateState(data),
    error: (err) => showErrorToast('数据同步失败')
  });
  
  return () => subscription.unsubscribe();  // 清理
}, []);

// 4. 表单验证错误（用户输入）
const validateForm = (data: FormData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!data.email) {
    errors.push(new ValidationError('邮箱不能为空', 'email'));
  }
  
  return { valid: errors.length === 0, errors };
};
```

### ❌ 禁止做法

```typescript
// 1. 空catch块（静默吞错）
try {
  riskyOperation();
} catch (e) {
  // ❌ 错误！完全忽略错误
}

// 2. 抛出非Error对象
throw 'Something went wrong';  // ❌ 错误！应该 throw new Error(...)

// 3. 在渲染路径中产生副作用
const BadComponent = composable(() => {
  if (Math.random() > 0.5) {
    throw new Error('随机崩溃');  // ❌ 错误！应该使用条件渲染
  }
  return Text({ text: 'Hello' });
});

// 4. 全局变量存储错误状态
let globalError: Error | null = null;  // ❌ 错误！违反单向数据流原则
```

## 分阶段实施路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (MVP)** | ErrorBoundary 组件 + 基础 AppError 类 + 默认 Fallback UI | 页面级错误隔离 | 3 天 |
| **Phase 2** | GlobalErrorHandler + 错误分类器 + 日志上报接口 | 监控集成 | 2-3 天 |
| **Phase 3** | useErrorHandler/useAsyncError Hooks + 副作用错误封装 | 开发效率提升 | 2 天 |
| **Phase 4** | 错误恢复策略（重试/降级/离线缓存） | 用户体验优化 | 2-3 天 |
| **Phase 5** | DevTools 错误面板 + 时间旅行调试 | 调试体验完善 | 3-4 天 |

## 相关文档

- 上游 ADR:
  - [`data-flow-management-unidirectional-pattern.md`](./data-flow-management-unidirectional-pattern.md)
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
- 下游依赖:
  - [`testing-strategy-unit-integration-e2e.md`](./testing-strategy-unit-integration-e2e.md) （错误场景测试）
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:15 | 用户 + AI | 确认采用 Error Boundary + 全局捕获 + 分级恢复策略，禁止静默吞错 |
