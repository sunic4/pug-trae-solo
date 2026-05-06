---
id: "testing-strategy-unit-integration-e2e"
type: architecture
status: accepted
title: "测试策略 — 测试金字塔 + 覆盖率标准 + 自动化流水线"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
  - "./component-model-pure-function-call-chain.md"
  - "./data-flow-management-unidirectional-pattern.md"
  - "./error-handling-global-catch-recovery.md"
  - "./performance-optimization-virtualization-caching.md"
created: "2026-04-30 18:30"
updated: "2026-04-30 18:35"
stale: false
---

# ADR: 测试策略 — 测试金字塔 + 覆盖率标准 + 自动化流水线

## 背景

Canvas UI 运行时作为一个复杂的 UI 框架，需要完善的测试体系来保证：

1. **代码质量**：核心逻辑的正确性和稳定性
2. **重构信心**：安全地进行架构演进和功能迭代
3. **回归防护**：防止引入已修复的 bug
4. **文档价值**：测试用例作为可执行的使用示例

> **如何设计一个分层、高效的测试体系，在保证质量的同时控制维护成本？**

### 核心挑战

- **Composable 函数的可测试性**：纯函数调用链天然适合单元测试，但需要正确的工具支持
- **Canvas/渲染层测试**：涉及浏览器 API 和图形渲染，难以在 Node.js 环境运行
- **状态管理测试**：Snapshot、Recomposition 等机制的异步特性增加测试复杂度
- **性能回归检测**：确保优化不会引入性能退化
- **测试维护成本**：UI 测试容易因实现细节变化而失败（脆弱性）

### 候选方案

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A) 测试金字塔 + 多层次覆盖** | 大量单元测试 + 适量集成测试 + 少量 E2E 测试 | 平衡质量与成本；符合业界最佳实践 | 需要设计清晰的测试边界 |
| B) 以 E2E 测试为主 | 主要依赖端到端测试验证用户场景 | 覆盖真实用户体验；无需 mock | 运行慢；维护成本高；反馈周期长 |
| C) 以集成测试为主 | 重点测试模块间交互 | 比单元测试更真实；比 E2E 更快 | 仍需大量 mock；定位问题困难 |
| D) TDD 强制模式 | 先写测试再写代码 | 高测试覆盖率；设计驱动 | 开发速度慢；团队接受度低 |

## 决策结果

选择 **方案 A：测试金字塔模型**，采用多层次测试策略：

```
                    ╱╲
                   ╱ E2E ╲                    ← 少量 (5-10%)
                  ╱─────────╲                  用户关键路径验证
                 ╱ Integration ╲               ← 适中 (15-25%)
                ╱────────────────╲             模块间交互验证
               ╱    Unit Tests     ╲            ← 大量 (65-80%)
              ╱──────────────────────╲          函数/组件级别验证
             ╱   Static Analysis      ╲         ← 基础设施
            ╱──────────────────────────╲        TypeScript/ESLint
```

### 分层测试策略详解

#### Layer 1: 单元测试（Unit Tests）— 65-80%

**目标**：验证单个函数、Hook、组件的独立行为

**适用范围**：
- ✅ 纯函数（工具函数、数据处理）
- ✅ Custom Hooks（useState/useEffect/useMemo 等）
- ✅ Composable 组件（无外部依赖的展示型组件）
- ✅ 状态管理逻辑（MutableState、Snapshot 操作）
- ✅ 布局算法（尺寸计算、位置计算）

```typescript
// ===== 示例 1: 纯函数单元测试 =====

// utils/format.ts
export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency
  }).format(amount);
}

// __tests__/utils/format.test.ts
describe('formatCurrency', () => {
  it('should format Chinese Yuan correctly', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
  });
  
  it('should format USD with $ symbol', () => {
    expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
  });
  
  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00');
  });
  
  it('should handle negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-¥100.00');
  });
});

// ===== 示例 2: Hook 单元测试 =====

// hooks/useCounter.ts
export function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}

// __tests__/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react-hooks';

describe('useCounter', () => {
  it('should initialize with default value (0)', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
  
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});

// ===== 示例 3: Composable 组件单元测试 =====

// components/Greeting.ts
const Greeting = composable<{ name: string }>(({ name }) => {
  return Column() {
    Text({ text: `Hello, ${name}!` });
  };
});

// __tests__/components/Greeting.test.ts
import { render, screen } from '@testing-library/canvas';

describe('Greeting component', () => {
  it('should render greeting with name', () => {
    render(<Greeting name="World" />);
    
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
  
  it('should handle empty name gracefully', () => {
    render(<Greeting name="" />);
    
    expect(screen.getByText('Hello, !')).toBeInTheDocument();
  });
});
```

#### Layer 2: 集成测试（Integration Tests）— 15-25%

**目标**：验证多个模块协作后的行为正确性

**适用范围**：
- ✅ 组件与 Context 的交互
- ✅ 状态管理与 UI 的联动
- ✅ 错误边界与错误处理的集成
- ✅ 布局引擎与渲染器的配合
- ✅ 路由导航流程
- ✅ 表单提交流程（验证 → 提交 → 成功/失败）

```typescript
// ===== 示例 1: Context 集成测试 =====

// __tests__/integration/theme-context.test.ts
import { render, screen, fireEvent } from '@testing-library/canvas';
import { ThemeContext, ThemeProvider, ThemedButton } from '../theme';

describe('ThemeContext integration', () => {
  it('should provide theme to nested components', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemedButton>Click me</ThemedButton>
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('dark-theme');  // 接收到了 dark 主题
  });
  
  it('should update all consumers when theme changes', () => {
    render(
      <ThemeProvider initialTheme="light">
        <ThemedButton>Button 1</ThemedButton>
        <ThemedButton>Button 2</ThemedButton>
        <ToggleThemeButton />
      </ThemeProvider>
    );
    
    // 初始状态
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toHaveClass('light-theme'));
    
    // 切换主题
    fireEvent.click(screen.getByText('Toggle Theme'));
    
    // 所有消费者都应更新
    buttons.forEach(btn => expect(btn).toHaveClass('dark-theme'));
  });
});

// ===== 示例 2: 表单提交集成测试 =====

// __tests__/integration/login-form.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/canvas';
import { LoginForm } from '../LoginForm';
import { authApi } from '../../api/auth';

// Mock API
jest.mock('../../api/auth');

describe('Login form integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should show success message on successful login', async () => {
    (authApi.login as jest.Mock).mockResolvedValueOnce({
      token: 'fake-jwt-token',
      user: { id: 1, name: 'John Doe' }
    });
    
    render(<LoginForm />);
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // 提交
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // 验证成功状态
    await waitFor(() => {
      expect(screen.getByText(/welcome, john doe/i)).toBeInTheDocument();
    });
    
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123'
    });
  });
  
  it('should display error message on API failure', async () => {
    (authApi.login as jest.Mock).mockRejectedValueOnce(
      new Error('Invalid credentials')
    );
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

#### Layer 3: 端到端测试（E2E Tests）— 5-10%

**目标**：验证完整的用户使用场景（从用户视角）

**适用范围**：
- ✅ 关键业务路径（登录、注册、支付）
- ✅ 跨页面流程（购物车 → 结算 → 支付）
- ✅ 离线/弱网场景
- ✅ 性能关键路径（首屏加载、列表滚动）

```typescript
// ===== 示例: Playwright E2E 测试 =====

// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User authentication flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });
  
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // 填写登录表单
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'correct-password');
    await page.click('[data-testid="login-button"]');
    
    // 验证重定向到仪表盘
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-greeting"]')).toContainText('Welcome');
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrong-password');
    await page.click('[data-testid="login-button"]');
    
    // 验证错误提示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      /invalid credentials/i
    );
    
    // 应该停留在登录页
    await expect(page).toHaveURL('/login');
  });
  
  test('should persist login state after refresh', async ({ page }) => {
    // 登录
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
    
    // 刷新页面
    await page.reload();
    
    // 应该仍然在仪表盘（Session 持久化）
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Shopping cart flow', () => {
  test('should complete purchase flow', async ({ page }) => {
    // 1. 浏览商品
    await page.goto('/products');
    await page.click('[data-testid="product-1"]');  // 添加商品 1 到购物车
    await page.click('[data-testid="product-2"]');  // 添加商品 2 到购物车
    
    // 验证购物车数量更新
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
    
    // 2. 进入购物车
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL('/cart');
    
    // 验证商品列表
    await expect(page.locator('[data-testid="cart-items"]')).toHaveCount(2);
    
    // 3. 结算
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL('/checkout');
    
    // 4. 填写收货信息
    await page.fill('[data-testid="shipping-name"]', 'John Doe');
    await page.fill('[data-testid="shipping-address"]', '123 Main St');
    await page.click('[data-testid="place-order-button"]');
    
    // 5. 支付成功
    await expect(page).toHaveURL('/order-success');
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
  });
});
```

### 测试工具链选型

| 层级 | 工具 | 用途 | 选择理由 |
|------|------|------|---------|
| **单元测试** | Vitest + @testing-library/react-hooks | 快速执行；ESM 原生支持；Jest 兼容 API | 比 Jest 快 2-10x；更好的 TypeScript 支持 |
| **组件测试** | @testing-library/canvas (自研) | 渲染 Composable 组件；查询 DOM 结构 | 与组件模型完美契合 |
| **集成测试** | Vitest + msw (Mock Service Worker) | 拦截网络请求；模拟 API 响应 | 无需修改代码即可 mock；支持开发调试 |
| **E2E 测试** | Playwright | 跨浏览器自动化；并行执行；内置等待机制 | 比 Cypress 更快更稳定；现代 API 设计 |
| **覆盖率** | c8 (V8 内置) | 零配置覆盖率报告；不影响源码 | 不需要编译；支持 ESModule |
| **快照测试** | @playwright/test (Visual Regression) | UI 视觉回归检测 | 自动对比截图差异 |

### 覆盖率标准与门禁

```yaml
# jest.config.js / vitest.config.ts
coverage:
  # 全局阈值
  global:
    branches: 80       # 分支覆盖率 ≥ 80%
    functions: 85      # 函数覆盖率 ≥ 85%
    lines: 90          # 行覆盖率 ≥ 90%
    statements: 90     # 语句覆盖率 ≥ 90%
  
  # 按模块差异化要求
  modules:
    # 核心模块（高要求）
    core/state:
      branches: 90
      functions: 95
      lines: 95
    
    core/snapshot:
      branches: 88
      functions: 92
      lines: 94
    
    core/renderer:
      branches: 85
      functions: 90
      lines: 92
    
    # 业务模块（标准要求)
    components:
      branches: 75
      functions: 80
      lines: 85
    
    # 工具函数（最高要求）
    utils:
      branches: 95
      functions: 98
      lines: 99
  
  # 排除文件
  exclude:
    - '**/*.d.ts'
    - '**/*.spec.ts'
    - '**/*.test.ts'
    - '**/__tests__/**'
    - '**/node_modules/**'
    - '**/coverage/**'
  
  # 报告格式
  reporter:
    - text
    - html          # 生成 HTML 报告
    - lcov          # CI/CD 集成
  
  # 门禁规则
  thresholds:
    # PR 必须通过
    pr:
      decrease_allowed: false  # 不允许覆盖率下降
      
    # 主分支保护
    main:
      min_coverage: 85         # 最低总覆盖率
```

### 测试命名规范

```typescript
// ===== 文件命名 =====
// __tests__/utils/format.test.ts           // 工具函数测试
// __tests__/hooks/useCounter.test.ts       // Hook 测试
// __tests__/components/Button.test.ts       // 组件测试
// __tests__/integration/auth-flow.test.ts   // 集成测试
// e2e/user-journey.spec.ts                 // E2E 测试

// ===== 测试用例命名（BDD 风格）=====
describe('ComponentName', () => {
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {});
    it('should [another behavior]', () => {});
  });
  
  describe('when [another condition]', () => {
    it('should handle edge case', () => {});
  });
});

// 示例
describe('LazyColumn', () => {
  describe('when items array is empty', () => {
    it('should render empty placeholder', () => {});
    it('should not call renderItem', () => {});
  });
  
  describe('when items exceed viewport', () => {
    it('should only render visible items (+ buffer)', () => {});
    it('should recycle offscreen items', () => {});
  });
  
  describe('when scrolling rapidly', () => {
    it('should maintain 60 FPS', () => {});
    it('should not show blank gaps', () => {});
  });
});
```

### Mock 策略

```typescript
// ===== 原则 1: 优先 mock 边界，而非实现 =====

// ❌ 错误：mock 内部实现细节
jest.mock('../api/fetchData', () => ({
  fetchData: jest.fn()
}));

// ✅ 正确：mock 网络层（MSW 拦截）
// msw/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: `Mock User ${id}`,
      email: `user${id}@example.com`
    });
  }),
  
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    
    if (body.email === 'admin@example.com' && body.password === 'admin') {
      return HttpResponse.json({ token: 'fake-token' });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  })
];

// ===== 原则 2: 使用工厂函数生成测试数据 =====

// factories/user.factory.ts
import { faker } from '@faker-js/faker';

export function createUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatarUrl: faker.image.avatar(),
    createdAt: faker.date.past(),
    ...overrides
  };
}

// 使用
const user = createUser({ name: 'Test User' });

// ===== 原则 3: Time Mock（用于测试超时、定时器等）=====

jest.useFakeTimers();

it('should debounce search input', () => {
  const onSearch = jest.fn();
  render(<SearchInput onSearch={onSearch} debounceMs={500} />);
  
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
  
  // 500ms 内不应调用
  expect(onSearch).not.toHaveBeenCalled();
  
  // 快进 500ms
  act(() => {
    jest.advanceTimersByTime(500);
  });
  
  expect(onSearch).toHaveBeenCalledWith('hello');
});
```

## 正面影响

1. **质量保障完善**：
   - 单元测试捕获 70-80% 的逻辑 bug
   - 集成测试验证模块协作正确性
   - E2E 测试保障关键用户路径

2. **重构信心充足**：
   - 修改核心算法后，测试套件快速反馈是否破坏现有功能
   - 新开发者可放心优化代码（有测试兜底）
   - 技术债务清理有安全保障

3. **文档价值显著**：
   - 测试用例作为"活文档"，展示组件的预期行为
   - 新成员通过阅读测试快速理解代码意图
   - API 变更时，失败的测试明确指出影响范围

4. **CI/CD 质量门禁**：
   - PR 必须通过所有测试才能合并
   - 覆盖率下降自动阻止合并
   - 主分支始终保持高质量

5. **调试效率提升**：
   - 单元测试精确定位 bug 所在函数
   - 集成测试缩小问题范围到特定模块
   - E2E 测试复现完整用户场景

## 负面影响与风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 编写测试耗时 | 初期开发速度降低 20-30% | 提供 CLI 脚手架自动生成测试模板 |
| 维护成本高 | UI 变更需要同步更新测试 | 使用 data-testid 选择器（不依赖实现细节）；抽象公共断言 |
| 测试脆弱性 | 小改动导致大量测试失败 | 遵循"测试行为而非实现"原则；定期审查和重构测试 |
| 假阳性/假阴性 | 测试通过但实际有 bug（或反之） | 结合多种测试类型交叉验证；关键路径必须有 E2E 覆盖 |
| 执行时间过长 | 全量测试套件 > 10 分钟 | 并行化执行；按变更文件智能选择测试子集 |

## 与其他方案的对比

| 维度 | **测试金字塔 ✅** | E2E 为主 | 集成测试为主 | TDD 强制 |
|------|------------------|---------|-------------|----------|
| 反馈速度 | ⭐⭐⭐⭐⭐ 最快（秒级） | ⭐ 最慢（分钟级） | ⭐⭐⭐ 中等 | ⭐⭐ 较慢 |
| 定位精度 | ⭐⭐⭐⭐⭐ 最高（函数级） | ⭐ 最低（系统级） | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较高 |
| 维护成本 | ⭐⭐⭐ 低 | ⭐⭐⭐⭐⭐ 最高 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 较高 |
| 覆盖广度 | ⭐⭐⭐⭐ 广（多层级） | ⭐⭐ 窄（仅主路径） | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 最广 |
| 团队接受度 | ⭐⭐⭐⭐ 高 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 高 | ⭐⭐ 低 |
| 适合项目规模 | ✅✅ 所有规模 | ⚠️ 仅小型项目 | ⚠️ 中型项目 | ❌ 特定文化 |

## 验证假设

### 前提条件
1. 单元测试执行速度 < 5 秒（1000 个测试用例）
2. 集成测试执行速度 < 30 秒（100 个测试用例）
3. E2E 测试执行速度 < 5 分钟（20 个关键场景）
4. 测试套件的假阳性率 < 2%（避免频繁误报干扰开发）

### 验证方式
- [ ] **Spike #1**: 为核心模块（state/snapshot）编写 50+ 单元测试，测量执行时间和覆盖率
- [ ] **Spike #2**: 实现一个完整的集成测试（如登录流程），评估 mock 复杂度
- [ ] **Spike #3**: 使用 Playwright 录制 5 个 E2E 场景，评估维护成本
- [ ] **Spike #4**: 在 CI 环境中运行全量测试套件，验证并行化和缓存效果

## 可逆性评估

**类别**: 🟢 **高度可逆**

| 指标 | 数值 |
|------|------|
| 影响文件数 | ~15 文件（vitest.config.ts, setup files, 示例测试） |
| 影响模块数 | 1 个新模块（testing/）+ 配置文件 |
| 数据迁移 | 无（新代码） |
| API 变更风险 | 极低（测试代码不影响生产代码） |

**回退方案**：
- 如果当前测试框架不满足需求 → 切换为 Jest/Cypress（工作量 ~2 天迁移）
- 如果测试维护成本过高 → 降低覆盖率要求或减少 E2E 数量（即时生效）
- 回退风险：几乎为零（测试代码和生产代码完全隔离）

## 实现约束（来自架构决策）

1. **禁止测试生产代码的实现细节**：只能测试公开 API 和可观察行为（不允许访问私有方法/属性）
2. **必须使用 data-testid**：DOM 查询必须使用 `data-testid` 属性（不能用 CSS 类名或文本内容，避免脆弱性）
3. **每个 PR 必须包含相关测试**：新增功能必须附带对应测试（CI 门禁强制检查）
4. **测试必须独立可重复**：不能依赖执行顺序、全局状态、固定时间戳（使用 faker 生成随机数据）
5. **Mock 必须有限范围**：仅在边界处 mock（如 HTTP、数据库），不要 mock 内部模块
6. **E2E 测试必须使用专用测试环境**：不能连接生产数据库或调用真实支付接口

## 测试最佳实践清单

### ✅ 推荐做法

```typescript
// 1. AAA 模式（Arrange-Act-Assert）
it('should add item to cart', () => {
  // Arrange (准备)
  const product = createProduct({ price: 100 });
  const { result } = renderHook(() => useCart());
  
  // Act (执行)
  act(() => {
    result.current.addItem(product);
  });
  
  // Assert (断言)
  expect(result.current.items).toHaveLength(1);
  expect(result.current.total).toBe(100);
});

// 2. 测试边界条件和异常情况
describe('Pagination', () => {
  it('should handle empty data', () => {
    expect(calculateTotalPages([], 10)).toBe(0);
  });
  
  it('should handle single page', () => {
    expect(calculateTotalPages([1, 2, 3], 10)).toBe(1);
  });
  
  it('should handle exact multiple', () => {
    expect(calculateTotalPages(Array(20), 10)).toBe(2);
  });
  
  it('should handle remainder', () => {
    expect(calculateTotalPages(Array(21), 10)).toBe(3);
  });
  
  it('should throw on invalid pageSize', () => {
    expect(() => calculateTotalPages([], 0)).toThrow('pageSize must be > 0');
  });
});

// 3. 使用描述性断言消息
expect(user.name).toEqual('John Doe');  // ❌ 失败时只显示 "Expected 'Jane'"
expect(user.name).toEqual('John Doe');   // ✅ 但结合 describe/context 已经足够清晰

// 4. 测试异步操作
it('should fetch user data', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useUser(1));
  
  // 初始加载状态
  expect(result.current.loading).toBe(true);
  expect(result.current.user).toBeNull();
  
  // 等待数据加载完成
  await waitForNextUpdate();
  
  expect(result.current.loading).toBe(false);
  expect(result.current.user).toEqual({ id: 1, name: 'John Doe' });
});
```

### ❌ 禁止做法

```typescript
// 1. 测试私有方法
class Calculator {
  private add(a: number, b: number): number { ... }
}

// ❌ 错误！不应该测试内部实现
const calc = new Calculator() as any;
expect(calc.add(1, 2)).toBe(3);

// ✅ 正确！应该测试公开 API
expect(calculator.sum(1, 2)).toBe(3);

// 2. 使用不稳定的查询选择器
// ❌ 错误！CSS 类名可能变化
expect(screen.getByClassName('btn-primary')).toBeInTheDocument();

// ❌ 错误！文本内容可能被国际化
expect(screen.getByText('Submit')).toBeInTheDocument();

// ✅ 正确！使用 data-testid
expect(screen.getByTestId('submit-button')).toBeInTheDocument();

// 3. 在测试中依赖 sleep
// ❌ 错误！不可靠且慢
await new Promise(resolve => setTimeout(resolve, 1000));

// ✅ 正确！使用等待机制
await screen.findByText('Success');  // 自动重试直到出现或超时

// 4. 共享可变状态（测试间污染）
let globalCounter = 0;

it('test 1', () => {
  globalCounter++;
  expect(globalCounter).toBe(1);  // 通过
});

it('test 2', () => {
  expect(globalCounter).toBe(0);  // ❌ 失败！受 test 1 影响
});
```

## CI/CD 集成流水线

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  # Job 1: 单元测试 + 覆盖率检查（快速反馈）
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Check coverage threshold
        uses: veryani/coverage-check-action@v1
        with:
          type: vitest
          threshold: 85
          
      - name: Upload coverage report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Job 2: 集成测试（中等速度）
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests  # 依赖单元测试通过
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js + MSW
        run: |
          npm ci
          npm run test:integration -- --run

  # Job 3: E2E 测试（慢但全面）
  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]  # 跨浏览器测试
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Run E2E tests
        run: npx playwright test --browser=${{ matrix.browser }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/

  # Job 4: 性能回归检测（可选）
  performance-test:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      
      - name: Run benchmarks
        run: npm run benchmark
      
      - name: Compare with baseline
        run: npx compare-benchmark --threshold 5%
```

## 分阶段实施路线图

| 阶段 | 实现内容 | 目标 | 预计工作量 |
|------|---------|------|-----------|
| **Phase 1 (基础设施)** | Vitest + Testing Library 配置 + CI 流水线搭建 + 核心工具函数测试 | 可运行基础测试 | 2-3 天 |
| **Phase 2 (核心覆盖)** | State/Snapshot/Layout 模块单元测试 + 自定义 Render 方法 | 核心模块覆盖率 > 90% | 4-5 天 |
| **Phase 3 (组件测试)** | 内置组件（Column/Row/Text/Button）测试 + Context 集成测试 | 组件库覆盖率 > 85% | 3-4 天 |
| **Phase 4 (E2E)** | Playwright 环境搭建 + 关键路径录制（登录/注册/购物车） | 20+ E2E 场景 | 3-4 天 |
| **Phase 5 (高级)** | Visual Regression 测试 + Performance Benchmark + Mutation Testing | 全面质量保障 | 4-5 天 |

## 相关文档

- 上游 ADR:
  - [`component-model-pure-function-call-chain.md`](./component-model-pure-function-call-chain.md)
  - [`data-flow-management-unidirectional-pattern.md`](./data-flow-management-unidirectional-pattern.md)
  - [`error-handling-global-catch-recovery.md`](./error-handling-global-catch-recovery.md)
  - [`performance-optimization-virtualization-caching.md`](./performance-optimization-virtualization-caching.md)
- 下游产出:
  - `vitest.config.ts` — 测试配置文件
  - `jest.setup.ts` — 测试环境初始化
  - `.github/workflows/test.yml` — CI 流水线
- 需求文档: [`canvas-ui-runtime.md`](../road-map/canvas-ui-runtime.md)

## 决策记录

| 时间 | 决策者 | 决策内容 |
|------|--------|---------|
| 2026-04-30 18:35 | 用户 + AI | 确认采用测试金字塔策略（单元 65-80% + 集成 15-25% + E2E 5-10%），使用 Vitest + Playwright + MSW 工具链 |
