# Pug 完整开发计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Android Compose 重组原理的通用 Canvas UI 框架，支持声明式 UI、智能重组、三阶段布局、纯 Canvas 渲染与事件处理。

**Architecture:** 四层架构——响应式层（reactivity）→ 组合层（composer）→ 布局层（layout）→ 渲染层（renderer），外加事件系统（event）、主题系统（theme）、组件库（components）。响应式层通过全局上下文追踪 Signal 读取实现细粒度依赖追踪，Composer 通过槽位表管理节点树实现智能重组，布局层实现 Compose 风格的三阶段约束布局，渲染层通过 DrawCommand 抽象实现可替换的渲染后端。

**Tech Stack:** TypeScript, Vite, Vitest, npm workspaces (monorepo)

**Design Doc:** `wiki/raw/2026-04-23-canvas-compose-design.md`

**Phase 1 详细计划:** `wiki/raw/2026-04-23-canvas-compose-phase1.md`

---

## 全局文件结构

```
pug/
├── packages/
│   ├── reactivity/              # Phase 1
│   │   ├── src/
│   │   │   ├── signal.ts
│   │   │   ├── computed.ts
│   │   │   ├── effect.ts
│   │   │   ├── context.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── composer/                # Phase 1
│   │   ├── src/
│   │   │   ├── node.ts
│   │   │   ├── slot-table.ts
│   │   │   ├── composer.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── layout/                  # Phase 2
│   │   ├── src/
│   │   │   ├── constraints.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── renderer/                # Phase 1-2
│   │   ├── src/
│   │   │   ├── draw-command.ts
│   │   │   ├── canvas-renderer.ts
│   │   │   ├── text-layout.ts
│   │   │   ├── dirty-rect.ts
│   │   │   ├── renderer-interface.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── event/                   # Phase 3
│   │   ├── src/
│   │   │   ├── hit-test.ts
│   │   │   ├── dispatcher.ts
│   │   │   ├── gesture.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   ├── theme/                   # Phase 4
│   │   ├── src/
│   │   │   ├── theme.ts
│   │   │   ├── theme-context.ts
│   │   │   └── index.ts
│   │   └── tests/
│   │
│   └── components/              # Phase 3-4
│       ├── src/
│       │   ├── text.ts          # Phase 3
│       │   ├── button.ts        # Phase 3
│       │   ├── text-input.ts    # Phase 3
│       │   ├── checkbox.ts      # Phase 3
│       │   ├── column.ts        # Phase 2
│       │   ├── row.ts           # Phase 2
│       │   ├── box.ts           # Phase 2
│       │   ├── stack.ts         # Phase 2
│       │   ├── padding.ts       # Phase 2
│       │   ├── spacer.ts        # Phase 2
│       │   ├── list.ts          # Phase 4
│       │   ├── container.ts     # Phase 4
│       │   └── index.ts
│       └── tests/
│
├── apps/
│   └── demo/                    # Phase 1
│       ├── index.html
│       ├── main.ts
│       └── vite.config.ts
│
├── package.json
├── tsconfig.base.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# Phase 1: 核心引擎（已有详细计划）

> 详细计划见 `docs/superpowers/plans/2026-04-23-canvas-compose-phase1.md`

**目标:** 搭建 monorepo 骨架，实现 Signal/Computed/Effect 响应式核心，实现 Composer + SlotTable 组合器，实现最小 Canvas 渲染循环，用计数器 Demo 验证端到端。

**Task 列表（10 个 Task）:**

| Task | 内容 | 依赖 |
|------|------|------|
| 1 | 项目骨架与 Monorepo 搭建 | 无 |
| 2 | Signal 实现 | Task 1 |
| 3 | Computed 和 Effect 实现 | Task 2 |
| 4 | ComposeNode 基类 | Task 1 |
| 5 | SlotTable 实现 | Task 4 |
| 6 | Composer 调度器 | Task 3, 5 |
| 7 | DrawCommand 与 CanvasRenderer | Task 4 |
| 8 | 扩展 ComposeNode 支持绘制 | Task 7 |
| 9 | 聚合包与 Demo App | Task 6, 8 |
| 10 | 运行全部测试并修复 | Task 9 |

**验收标准:** `npm test` 全部通过，`npm run dev` 打开浏览器可看到计数器，点击按钮数字增加。

---

# Phase 2: 布局与渲染

**目标:** 实现完整的约束布局系统（Constraints/Measure/Place），实现文本测量与换行，实现基础布局组件（Column/Row/Box/Stack/Padding/Spacer），升级 CanvasRenderer 支持增量绘制。

**前置依赖:** Phase 1 全部完成

---

### Task 11: Constraints 工具函数

**Files:**
- Create: `packages/composer/src/constraints.ts`
- Create: `packages/composer/tests/constraints.test.ts`
- Modify: `packages/composer/src/index.ts`

- [ ] **Step 1: 编写 Constraints 工具函数失败测试**

```typescript
// packages/composer/tests/constraints.test.ts
import { describe, it, expect } from 'vitest';
import {
  Constraints,
  Size,
  looseConstraints,
  tightConstraints,
  wrapContentConstraints,
  clampSize,
  constraintsToString,
} from '../src/constraints.js';

describe('Constraints', () => {
  describe('factory functions', () => {
    it('looseConstraints should create unbounded constraints', () => {
      const c = looseConstraints(100, 200);
      expect(c.minWidth).toBe(0);
      expect(c.maxWidth).toBe(100);
      expect(c.minHeight).toBe(0);
      expect(c.maxHeight).toBe(200);
    });

    it('tightConstraints should create fixed-size constraints', () => {
      const c = tightConstraints(100, 200);
      expect(c.minWidth).toBe(100);
      expect(c.maxWidth).toBe(100);
      expect(c.minHeight).toBe(200);
      expect(c.maxHeight).toBe(200);
    });

    it('wrapContentConstraints should create zero-min constraints', () => {
      const c = wrapContentConstraints(400, 600);
      expect(c.minWidth).toBe(0);
      expect(c.maxWidth).toBe(400);
      expect(c.minHeight).toBe(0);
      expect(c.maxHeight).toBe(600);
    });
  });

  describe('clampSize', () => {
    it('should clamp size to fit constraints', () => {
      const c = { minWidth: 50, maxWidth: 200, minHeight: 30, maxHeight: 100 };
      expect(clampSize(c, 10, 10)).toEqual({ width: 50, height: 30 });
      expect(clampSize(c, 300, 200)).toEqual({ width: 200, height: 100 });
      expect(clampSize(c, 100, 50)).toEqual({ width: 100, height: 50 });
    });
  });

  describe('constraintsToString', () => {
    it('should produce readable string', () => {
      const c = tightConstraints(100, 200);
      const s = constraintsToString(c);
      expect(s).toContain('100');
      expect(s).toContain('200');
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/composer/tests/constraints.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 constraints.ts**

```typescript
export interface Constraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface Size {
  width: number;
  height: number;
}

export function looseConstraints(maxW: number, maxH: number): Constraints {
  return { minWidth: 0, maxWidth: maxW, minHeight: 0, maxHeight: maxH };
}

export function tightConstraints(w: number, h: number): Constraints {
  return { minWidth: w, maxWidth: w, minHeight: h, maxHeight: h };
}

export function wrapContentConstraints(maxW: number, maxH: number): Constraints {
  return { minWidth: 0, maxWidth: maxW, minHeight: 0, maxHeight: maxH };
}

export function clampSize(constraints: Constraints, w: number, h: number): Size {
  return {
    width: Math.max(constraints.minWidth, Math.min(constraints.maxWidth, w)),
    height: Math.max(constraints.minHeight, Math.min(constraints.maxHeight, h)),
  };
}

export function constraintsToString(c: Constraints): string {
  return `Constraints(minW=${c.minWidth}, maxW=${c.maxWidth}, minH=${c.minHeight}, maxH=${c.maxHeight})`;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/composer/tests/constraints.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 composer/index.ts 导出**

```typescript
export { ComposeNode } from './node.js';
export { SlotTable } from './slot-table.js';
export { Composer, type ComposableFunction } from './composer.js';
export {
  type Constraints,
  type Size,
  looseConstraints,
  tightConstraints,
  wrapContentConstraints,
  clampSize,
  constraintsToString,
} from './constraints.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(composer): add Constraints utility functions"
```

---

### Task 12: 文本测量与换行（TextLayout）

**Files:**
- Create: `packages/renderer/src/text-layout.ts`
- Create: `packages/renderer/tests/text-layout.test.ts`
- Modify: `packages/renderer/src/index.ts`

- [ ] **Step 1: 编写 TextLayout 失败测试**

```typescript
// packages/renderer/tests/text-layout.test.ts
import { describe, it, expect } from 'vitest';
import { measureText, layoutText, type TextLayoutResult } from '../src/text-layout.js';

describe('measureText', () => {
  it('should return text metrics', () => {
    const metrics = measureText('Hello', '16px sans-serif');
    expect(metrics.width).toBeGreaterThan(0);
    expect(metrics.height).toBeGreaterThan(0);
  });

  it('should handle empty string', () => {
    const metrics = measureText('', '16px sans-serif');
    expect(metrics.width).toBe(0);
    expect(metrics.height).toBeGreaterThan(0);
  });

  it('should handle different fonts', () => {
    const small = measureText('Hello', '12px sans-serif');
    const large = measureText('Hello', '24px sans-serif');
    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });
});

describe('layoutText', () => {
  it('should layout single-line text', () => {
    const result = layoutText('Hello World', '16px sans-serif', 400);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toBe('Hello World');
    expect(result.totalHeight).toBeGreaterThan(0);
  });

  it('should wrap text when exceeding maxWidth', () => {
    const result = layoutText('Hello World This Is A Long Text', '16px sans-serif', 100);
    expect(result.lines.length).toBeGreaterThan(1);
  });

  it('should handle empty string', () => {
    const result = layoutText('', '16px sans-serif', 400);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toBe('');
  });

  it('should respect maxWidth of Infinity', () => {
    const result = layoutText('Hello World', '16px sans-serif', Infinity);
    expect(result.lines).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/renderer/tests/text-layout.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 text-layout.ts**

```typescript
// 使用隐藏 DOM 元素进行文本测量
let measureCanvas: HTMLCanvasElement | null = null;

function getMeasureCanvas(): HTMLCanvasElement {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }
  return measureCanvas;
}

export interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
}

export interface TextLayoutResult {
  lines: string[];
  totalHeight: number;
  lineHeight: number;
  maxWidth: number;
}

export function measureText(text: string, font: string): TextMetrics {
  const canvas = getMeasureCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    ascent: metrics.actualBoundingBoxAscent,
    descent: metrics.actualBoundingBoxDescent,
  };
}

export function layoutText(text: string, font: string, maxWidth: number): TextLayoutResult {
  if (!text) {
    const m = measureText(' ', font);
    return { lines: [''], totalHeight: m.height, lineHeight: m.height, maxWidth: 0 };
  }

  const canvas = getMeasureCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = font;

  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = measureText('Xy', font).height;
  const totalHeight = lines.length * lineHeight;

  let maxWidth = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  }

  return { lines, totalHeight, lineHeight, maxWidth };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/renderer/tests/text-layout.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 renderer/index.ts 导出**

在 `packages/renderer/src/index.ts` 中添加:
```typescript
export { measureText, layoutText, type TextMetrics, type TextLayoutResult } from './text-layout.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(renderer): implement TextLayout with word wrapping"
```

---

### Task 13: Column 布局组件

**Files:**
- Create: `packages/components/src/column.ts`
- Create: `packages/components/tests/column.test.ts`
- Create: `packages/components/package.json`
- Create: `packages/components/tsconfig.json`

- [ ] **Step 1: 创建 components 包骨架**

`packages/components/package.json`:
```json
{
  "name": "@canvas-compose/components",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@canvas-compose/composer": "workspace:*",
    "@canvas-compose/renderer": "workspace:*"
  }
}
```

`packages/components/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: 编写 Column 失败测试**

```typescript
// packages/components/tests/column.test.ts
import { describe, it, expect } from 'vitest';
import { Column } from '../src/column.js';
import { tightConstraints, type Constraints } from '@canvas-compose/composer';

describe('Column', () => {
  it('should measure children vertically stacked', () => {
    const col = new Column('col');
    // 添加两个固定尺寸的子节点
    const child1 = new FixedSizeNode('c1', 100, 50);
    const child2 = new FixedSizeNode('c2', 80, 30);
    col.appendChild(child1);
    col.appendChild(child2);

    const size = col.measure(tightConstraints(200, 200));
    expect(size.width).toBe(100); // max child width
    expect(size.height).toBe(80); // 50 + 30
  });

  it('should place children vertically', () => {
    const col = new Column('col');
    const child1 = new FixedSizeNode('c1', 100, 50);
    const child2 = new FixedSizeNode('c2', 80, 30);
    col.appendChild(child1);
    col.appendChild(child2);

    col.measure(tightConstraints(200, 200));
    col.x = 0;
    col.y = 0;
    col.placeChildren();

    expect(child1.x).toBe(0);
    expect(child1.y).toBe(0);
    expect(child2.x).toBe(0);
    expect(child2.y).toBe(50);
  });

  it('should respect constraints', () => {
    const col = new Column('col');
    const child = new FixedSizeNode('c1', 300, 50);
    col.appendChild(child);

    const size = col.measure(tightConstraints(200, 200));
    expect(size.width).toBe(200); // clamped to constraint
  });
});

// 测试辅助：固定尺寸节点
import { ComposeNode, type Size } from '@canvas-compose/composer';

class FixedSizeNode extends ComposeNode {
  constructor(key: string, private w: number, private h: number) {
    super(key);
  }
  measure(constraints: Constraints): Size {
    return { width: Math.min(this.w, constraints.maxWidth), height: this.h };
  }
}
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/column.test.ts`
Expected: FAIL

- [ ] **Step 4: 实现 column.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export class Column extends ComposeNode {
  constructor(key: string) {
    super(key);
  }

  measure(constraints: Constraints): Size {
    let totalHeight = 0;
    let maxWidth = 0;

    for (const child of this.children) {
      const childConstraints: Constraints = {
        minWidth: constraints.minWidth,
        maxWidth: constraints.maxWidth,
        minHeight: 0,
        maxHeight: constraints.maxHeight - totalHeight,
      };
      const size = child.measure(childConstraints);
      totalHeight += size.height;
      maxWidth = Math.max(maxWidth, size.width);
    }

    return clampSize(constraints, maxWidth, totalHeight);
  }

  placeChildren(): void {
    let y = 0;
    for (const child of this.children) {
      child.x = this.x;
      child.y = this.y + y;
      y += child.height;
    }
  }
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/column.test.ts`
Expected: PASS

- [ ] **Step 6: 创建 components/src/index.ts**

```typescript
export { Column } from './column.js';
```

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat(components): implement Column layout"
```

---

### Task 14: Row 布局组件

**Files:**
- Create: `packages/components/src/row.ts`
- Create: `packages/components/tests/row.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 Row 失败测试**

```typescript
// packages/components/tests/row.test.ts
import { describe, it, expect } from 'vitest';
import { Row } from '../src/row.js';
import { tightConstraints, type Constraints } from '@canvas-compose/composer';
import { ComposeNode, type Size } from '@canvas-compose/composer';

class FixedSizeNode extends ComposeNode {
  constructor(key: string, private w: number, private h: number) {
    super(key);
  }
  measure(constraints: Constraints): Size {
    return { width: this.w, height: Math.min(this.h, constraints.maxHeight) };
  }
}

describe('Row', () => {
  it('should measure children horizontally stacked', () => {
    const row = new Row('row');
    row.appendChild(new FixedSizeNode('c1', 100, 50));
    row.appendChild(new FixedSizeNode('c2', 80, 30));

    const size = row.measure(tightConstraints(300, 200));
    expect(size.width).toBe(180);
    expect(size.height).toBe(50);
  });

  it('should place children horizontally', () => {
    const row = new Row('row');
    const c1 = new FixedSizeNode('c1', 100, 50);
    const c2 = new FixedSizeNode('c2', 80, 30);
    row.appendChild(c1);
    row.appendChild(c2);

    row.measure(tightConstraints(300, 200));
    row.x = 10;
    row.y = 20;
    row.placeChildren();

    expect(c1.x).toBe(10);
    expect(c1.y).toBe(20);
    expect(c2.x).toBe(110);
    expect(c2.y).toBe(20);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/row.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 row.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export class Row extends ComposeNode {
  constructor(key: string) {
    super(key);
  }

  measure(constraints: Constraints): Size {
    let totalWidth = 0;
    let maxHeight = 0;

    for (const child of this.children) {
      const childConstraints: Constraints = {
        minWidth: 0,
        maxWidth: constraints.maxWidth - totalWidth,
        minHeight: constraints.minHeight,
        maxHeight: constraints.maxHeight,
      };
      const size = child.measure(childConstraints);
      totalWidth += size.width;
      maxHeight = Math.max(maxHeight, size.height);
    }

    return clampSize(constraints, totalWidth, maxHeight);
  }

  placeChildren(): void {
    let x = 0;
    for (const child of this.children) {
      child.x = this.x + x;
      child.y = this.y;
      x += child.width;
    }
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/row.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 index.ts 导出**

在 `packages/components/src/index.ts` 中添加:
```typescript
export { Row } from './row.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(components): implement Row layout"
```

---

### Task 15: Box / Stack / Padding / Spacer 布局组件

**Files:**
- Create: `packages/components/src/box.ts`
- Create: `packages/components/src/stack.ts`
- Create: `packages/components/src/padding.ts`
- Create: `packages/components/src/spacer.ts`
- Create: `packages/components/tests/layout-components.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写所有布局组件的失败测试**

```typescript
// packages/components/tests/layout-components.test.ts
import { describe, it, expect } from 'vitest';
import { Box } from '../src/box.js';
import { Stack } from '../src/stack.js';
import { Padding } from '../src/padding.js';
import { Spacer } from '../src/spacer.js';
import { tightConstraints, type Constraints, ComposeNode, type Size } from '@canvas-compose/composer';

class FixedSizeNode extends ComposeNode {
  constructor(key: string, private w: number, private h: number) {
    super(key);
  }
  measure(constraints: Constraints): Size {
    return { width: this.w, height: this.h };
  }
}

describe('Box', () => {
  it('should size to wrap children', () => {
    const box = new Box('box');
    box.appendChild(new FixedSizeNode('c', 100, 50));
    const size = box.measure(tightConstraints(200, 200));
    expect(size.width).toBe(100);
    expect(size.height).toBe(50);
  });

  it('should support aligning children', () => {
    const box = new Box('box', { align: 'center' });
    const child = new FixedSizeNode('c', 100, 50);
    box.appendChild(child);

    box.measure(tightConstraints(200, 100));
    box.x = 0;
    box.y = 0;
    box.placeChildren();

    expect(child.x).toBe(50); // (200 - 100) / 2
  });
});

describe('Stack', () => {
  it('should stack children on top of each other', () => {
    const stack = new Stack('stack');
    stack.appendChild(new FixedSizeNode('c1', 100, 50));
    stack.appendChild(new FixedSizeNode('c2', 80, 30));

    const size = stack.measure(tightConstraints(200, 200));
    expect(size.width).toBe(100);
    expect(size.height).toBe(50); // same as tallest child
  });

  it('should place all children at same position', () => {
    const stack = new Stack('stack');
    const c1 = new FixedSizeNode('c1', 100, 50);
    const c2 = new FixedSizeNode('c2', 80, 30);
    stack.appendChild(c1);
    stack.appendChild(c2);

    stack.measure(tightConstraints(200, 200));
    stack.x = 10;
    stack.y = 20;
    stack.placeChildren();

    expect(c1.x).toBe(10);
    expect(c1.y).toBe(20);
    expect(c2.x).toBe(10);
    expect(c2.y).toBe(20);
  });
});

describe('Padding', () => {
  it('should add padding around child', () => {
    const pad = new Padding('pad', { all: 16 });
    pad.appendChild(new FixedSizeNode('c', 100, 50));

    const size = pad.measure(tightConstraints(200, 200));
    expect(size.width).toBe(132); // 100 + 16*2
    expect(size.height).toBe(82); // 50 + 16*2
  });

  it('should offset child position', () => {
    const pad = new Padding('pad', { left: 10, top: 20 });
    const child = new FixedSizeNode('c', 100, 50);
    pad.appendChild(child);

    pad.measure(tightConstraints(200, 200));
    pad.x = 0;
    pad.y = 0;
    pad.placeChildren();

    expect(child.x).toBe(10);
    expect(child.y).toBe(20);
  });
});

describe('Spacer', () => {
  it('should fill available space in height', () => {
    const spacer = new Spacer('spacer', { direction: 'vertical' });
    const size = spacer.measure(tightConstraints(100, 200));
    expect(size.height).toBe(200);
  });

  it('should fill available space in width', () => {
    const spacer = new Spacer('spacer', { direction: 'horizontal' });
    const size = spacer.measure(tightConstraints(200, 100));
    expect(size.width).toBe(200);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/layout-components.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 box.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export interface BoxOptions {
  align?: 'start' | 'center' | 'end';
}

export class Box extends ComposeNode {
  private align: 'start' | 'center' | 'end';

  constructor(key: string, options: BoxOptions = {}) {
    super(key);
    this.align = options.align ?? 'start';
  }

  measure(constraints: Constraints): Size {
    let maxW = 0;
    let maxH = 0;
    for (const child of this.children) {
      const size = child.measure(constraints);
      maxW = Math.max(maxW, size.width);
      maxH = Math.max(maxH, size.height);
    }
    return clampSize(constraints, maxW, maxH);
  }

  placeChildren(): void {
    for (const child of this.children) {
      switch (this.align) {
        case 'center':
          child.x = this.x + (this.width - child.width) / 2;
          child.y = this.y + (this.height - child.height) / 2;
          break;
        case 'end':
          child.x = this.x + this.width - child.width;
          child.y = this.y + this.height - child.height;
          break;
        default:
          child.x = this.x;
          child.y = this.y;
      }
    }
  }
}
```

- [ ] **Step 4: 实现 stack.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export class Stack extends ComposeNode {
  constructor(key: string) {
    super(key);
  }

  measure(constraints: Constraints): Size {
    let maxW = 0;
    let maxH = 0;
    for (const child of this.children) {
      const size = child.measure(constraints);
      maxW = Math.max(maxW, size.width);
      maxH = Math.max(maxH, size.height);
    }
    return clampSize(constraints, maxW, maxH);
  }

  placeChildren(): void {
    for (const child of this.children) {
      child.x = this.x;
      child.y = this.y;
    }
  }
}
```

- [ ] **Step 5: 实现 padding.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export interface PaddingValues {
  all?: number;
  horizontal?: number;
  vertical?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export class Padding extends ComposeNode {
  private top: number;
  private bottom: number;
  private left: number;
  private right: number;

  constructor(key: string, values: PaddingValues) {
    super(key);
    const all = values.all ?? 0;
    const h = values.horizontal ?? all;
    const v = values.vertical ?? all;
    this.top = values.top ?? v;
    this.bottom = values.bottom ?? v;
    this.left = values.left ?? h;
    this.right = values.right ?? h;
  }

  measure(constraints: Constraints): Size {
    const innerConstraints: Constraints = {
      minWidth: Math.max(0, constraints.minWidth - this.left - this.right),
      maxWidth: Math.max(0, constraints.maxWidth - this.left - this.right),
      minHeight: Math.max(0, constraints.minHeight - this.top - this.bottom),
      maxHeight: Math.max(0, constraints.maxHeight - this.top - this.bottom),
    };

    let maxW = 0;
    let maxH = 0;
    for (const child of this.children) {
      const size = child.measure(innerConstraints);
      maxW = Math.max(maxW, size.width);
      maxH = Math.max(maxH, size.height);
    }

    return clampSize(constraints, maxW + this.left + this.right, maxH + this.top + this.bottom);
  }

  placeChildren(): void {
    for (const child of this.children) {
      child.x = this.x + this.left;
      child.y = this.y + this.top;
    }
  }
}
```

- [ ] **Step 6: 实现 spacer.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';

export interface SpacerOptions {
  direction?: 'horizontal' | 'vertical';
}

export class Spacer extends ComposeNode {
  private direction: 'horizontal' | 'vertical';

  constructor(key: string, options: SpacerOptions = {}) {
    super(key);
    this.direction = options.direction ?? 'vertical';
  }

  measure(constraints: Constraints): Size {
    if (this.direction === 'horizontal') {
      return clampSize(constraints, constraints.maxWidth, 0);
    }
    return clampSize(constraints, 0, constraints.maxHeight);
  }
}
```

- [ ] **Step 7: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/layout-components.test.ts`
Expected: PASS

- [ ] **Step 8: 更新 index.ts 导出**

```typescript
export { Column } from './column.js';
export { Row } from './row.js';
export { Box, type BoxOptions } from './box.js';
export { Stack } from './stack.js';
export { Padding, type PaddingValues } from './padding.js';
export { Spacer, type SpacerOptions } from './spacer.js';
```

- [ ] **Step 9: 提交**

```bash
git add -A && git commit -m "feat(components): implement Box, Stack, Padding, Spacer layouts"
```

---

### Task 16: CanvasRenderer 增量绘制

**Files:**
- Create: `packages/renderer/src/dirty-rect.ts`
- Create: `packages/renderer/tests/dirty-rect.test.ts`
- Modify: `packages/renderer/src/canvas-renderer.ts`

- [ ] **Step 1: 编写 DirtyRect 合并失败测试**

```typescript
// packages/renderer/tests/dirty-rect.test.ts
import { describe, it, expect } from 'vitest';
import { mergeDirtyRects, type DirtyRect } from '../src/dirty-rect.js';

describe('mergeDirtyRects', () => {
  it('should merge overlapping rects into bounding box', () => {
    const rects: DirtyRect[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 50, y: 50, w: 100, h: 100 },
    ];
    const merged = mergeDirtyRects(rects);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual({ x: 0, y: 0, w: 150, h: 150 });
  });

  it('should keep non-overlapping rects separate', () => {
    const rects: DirtyRect[] = [
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 200, y: 200, w: 50, h: 50 },
    ];
    const merged = mergeDirtyRects(rects);
    expect(merged).toHaveLength(2);
  });

  it('should return empty for empty input', () => {
    expect(mergeDirtyRects([])).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/renderer/tests/dirty-rect.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 dirty-rect.ts**

```typescript
export interface DirtyRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: DirtyRect, b: DirtyRect): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

export function mergeTwoRects(a: DirtyRect, b: DirtyRect): DirtyRect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.w, b.x + b.w);
  const y2 = Math.max(a.y + a.h, b.y + b.h);
  return { x, y, w: x2 - x, h: y2 - y };
}

export function mergeDirtyRects(rects: DirtyRect[]): DirtyRect[] {
  if (rects.length === 0) return [];

  // 简单合并算法：贪心合并重叠矩形
  const result: DirtyRect[] = [...rects];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        if (rectsOverlap(result[i], result[j])) {
          result[i] = mergeTwoRects(result[i], result[j]);
          result.splice(j, 1);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }
  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/renderer/tests/dirty-rect.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 CanvasRenderer 使用增量绘制**

修改 `packages/renderer/src/canvas-renderer.ts` 中的 `mergeDirtyRects` 方法，使用新的 `dirty-rect.ts` 模块。同时修改 `drawNode` 方法，使其调用节点的 `drawCommands()` 方法：

```typescript
// 在 canvas-renderer.ts 顶部添加导入:
import { mergeDirtyRects as mergeRects } from './dirty-rect.js';

// 替换 mergeDirtyRects 方法:
private mergeDirtyRects(rects: DirtyRect[]): DirtyRect[] {
  return mergeRects(rects);
}

// 替换 drawNode 方法:
private drawNode(node: ComposeNode): void {
  const commands = node.drawCommands();
  if (commands.length > 0) {
    this.drawCommands(commands);
  }
  for (const child of node.children) {
    this.drawNode(child);
  }
}
```

- [ ] **Step 6: 更新 renderer/index.ts 导出**

```typescript
export { type DrawCommand, type Rect, type Matrix, executeDrawCommand } from './draw-command.js';
export { CanvasRenderer, type DirtyRect } from './canvas-renderer.js';
export { measureText, layoutText, type TextMetrics, type TextLayoutResult } from './text-layout.js';
export { mergeDirtyRects, rectsOverlap, mergeTwoRects } from './dirty-rect.js';
```

- [ ] **Step 7: 运行全部测试确认无回归**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat(renderer): add DirtyRect merging and incremental draw support"
```

---

### Task 17: Phase 2 集成测试

**Files:**
- Modify: `apps/demo/counter-app.ts`
- Modify: `apps/demo/main.ts`

- [ ] **Step 1: 重写 Demo 使用新的布局组件**

将 `apps/demo/counter-app.ts` 重写为使用 `Column`、`Padding`、`Spacer` 等布局组件，替代手动计算位置。

```typescript
// apps/demo/counter-app.ts
import { signal, effect } from '@canvas-compose/reactivity';
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { Column, Padding, Spacer } from '@canvas-compose/components';

class TextNode extends ComposeNode {
  constructor(
    key: string,
    private _text: string,
    private fontSize: number = 16,
    private color: string = '#000000',
  ) {
    super(key);
  }
  get text(): string { return this._text; }
  set text(v: string) { this._text = v; }

  drawCommands(): DrawCommand[] {
    return [{
      type: 'text', x: this.x, y: this.y,
      content: this.text,
      font: `${this.fontSize}px sans-serif`,
      color: this.color,
    }];
  }
  measure(constraints: Constraints): Size {
    const charWidth = this.fontSize * 0.6;
    return clampSize(constraints, this.text.length * charWidth, this.fontSize * 1.2);
  }
}

class ButtonNode extends ComposeNode {
  private _label: string;
  private onClick: () => void;
  private _hovered = false;
  get label(): string { return this._label; }
  set label(v: string) { this._label = v; }

  constructor(key: string, label: string, onClick: () => void) {
    super(key);
    this._label = label;
    this.onClick = onClick;
    this.handlers['click'] = () => this.onClick();
    this.handlers['mouseenter'] = () => { this._hovered = true; };
    this.handlers['mouseleave'] = () => { this._hovered = false; };
  }
  drawCommands(): DrawCommand[] {
    const bg = this._hovered ? '#3700B3' : '#6200EE';
    return [
      { type: 'rect', x: this.x, y: this.y, w: this.width, h: this.height, fill: bg },
      { type: 'text', x: this.x + this.width / 2, y: this.y + this.height / 2,
        content: this.label, font: '16px sans-serif', color: '#FFFFFF',
        align: 'center', baseline: 'middle' },
    ];
  }
  measure(constraints: Constraints): Size {
    return { width: 120, height: 44 };
  }
}

export function createCounterApp(): { root: ComposeNode; draw: () => void } {
  const count = signal(0);
  const title = new TextNode('title', 'Canvas Compose 计数器', 24, '#333333');
  const countText = new TextNode('count', `点击次数: 0`, 18, '#000000');
  const doubledText = new TextNode('doubled', `双倍值: 0`, 14, '#666666');
  const button = new ButtonNode('button', '+1', () => { count.value++; });
  const spacer = new Spacer('spacer', { direction: 'vertical' });

  const column = new Column('col');
  column.appendChild(title);
  column.appendChild(new Spacer('s1'));
  column.appendChild(countText);
  column.appendChild(doubledText);
  column.appendChild(new Spacer('s2'));
  column.appendChild(button);

  const padding = new Padding('pad', { all: 20 });
  padding.appendChild(column);

  padding.measure({ minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 600 });
  padding.x = 0;
  padding.y = 0;
  padding.placeChildren();

  effect(() => {
    const val = count.value;
    countText.text = `点击次数: ${val}`;
    doubledText.text = `双倍值: ${val * 2}`;
    countText.markDirty();
    doubledText.markDirty();
  });

  function draw() {
    padding.measure({ minWidth: 0, maxWidth: 400, minHeight: 0, maxHeight: 600 });
    padding.placeChildren();
  }

  return { root: padding, draw };
}
```

- [ ] **Step 2: 更新 main.ts 使用新的 draw 方法**

```typescript
// apps/demo/main.ts
import { CanvasRenderer } from '@canvas-compose/renderer';
import { createCounterApp } from './counter-app.js';

const canvas = document.getElementById('app') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas);
const { root, draw } = createCounterApp();
renderer.setRoot(root);

function render() {
  draw();
  const ctx = renderer.getContext();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  function drawNode(node: any) {
    const commands = node.drawCommands();
    for (const cmd of commands) {
      renderer.drawCommands([cmd]);
    }
    for (const child of node.children) {
      drawNode(child);
    }
  }
  drawNode(root);
}

render();

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  function hitTest(node: any): any {
    if (node.containsPoint(x, y) && node.handlers['click']) return node;
    for (const child of node.children) {
      const found = hitTest(child);
      if (found) return found;
    }
    return null;
  }

  const target = hitTest(root);
  if (target) {
    target.handlers['click']();
    render();
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  function hitAll(node: any): any[] {
    const results: any[] = [];
    if (node.containsPoint(x, y)) results.push(node);
    for (const child of node.children) results.push(...hitAll(child));
    return results;
  }

  for (const t of hitAll(root)) {
    if (t.handlers['mouseenter']) t.handlers['mouseenter']();
  }
  render();
});
```

- [ ] **Step 3: 启动开发服务器验证**

Run: `cd canvas-compose && npx vite --config apps/demo/vite.config.ts`
Expected: 浏览器显示使用 Column/Padding/Spacer 布局的计数器

- [ ] **Step 4: 运行全部测试**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat: rewrite demo using layout components (Column/Padding/Spacer)"
```

---

# Phase 3: 事件与交互

**目标:** 实现完整的事件系统（HitTest/EventDispatcher/Gesture），实现 Modifier 系统，实现基础交互组件（Text/Button/TextInput/Checkbox）。

**前置依赖:** Phase 2 全部完成

---

### Task 18: HitTest 命中检测

**Files:**
- Create: `packages/event/package.json`
- Create: `packages/event/tsconfig.json`
- Create: `packages/event/src/hit-test.ts`
- Create: `packages/event/tests/hit-test.test.ts`

- [ ] **Step 1: 创建 event 包骨架**

`packages/event/package.json`:
```json
{
  "name": "@canvas-compose/event",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@canvas-compose/composer": "workspace:*"
  }
}
```

`packages/event/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: 编写 HitTest 失败测试**

```typescript
// packages/event/tests/hit-test.test.ts
import { describe, it, expect } from 'vitest';
import { hitTest } from '../src/hit-test.js';
import { ComposeNode, type Constraints, type Size } from '@canvas-compose/composer';

class TestNode extends ComposeNode {
  constructor(key: string, w: number, h: number) {
    super(key);
    this.width = w;
    this.height = h;
  }
  measure(c: Constraints): Size { return { width: this.width, height: this.height }; }
}

describe('hitTest', () => {
  it('should find leaf node at point', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    parent.appendChild(child);

    const result = hitTest(parent, 30, 30);
    expect(result).toBe(child);
  });

  it('should return parent when no child matches', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    parent.appendChild(child);

    const result = hitTest(parent, 150, 150);
    expect(result).toBe(parent);
  });

  it('should return null when point is outside tree', () => {
    const node = new TestNode('node', 100, 100);
    node.x = 0; node.y = 0;
    expect(hitTest(node, 200, 200)).toBeNull();
  });

  it('should prefer deeper (later-drawn) child', () => {
    const parent = new TestNode('parent', 200, 200);
    parent.x = 0; parent.y = 0;
    const c1 = new TestNode('c1', 100, 100);
    c1.x = 0; c1.y = 0;
    const c2 = new TestNode('c2', 100, 100);
    c2.x = 0; c2.y = 0;
    parent.appendChild(c1);
    parent.appendChild(c2);

    const result = hitTest(parent, 50, 50);
    expect(result).toBe(c2); // c2 is drawn later, on top
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/event/tests/hit-test.test.ts`
Expected: FAIL

- [ ] **Step 4: 实现 hit-test.ts**

```typescript
import { ComposeNode } from '@canvas-compose/composer';

export function hitTest(root: ComposeNode, x: number, y: number): ComposeNode | null {
  if (!root.containsPoint(x, y)) return null;

  // 反向遍历子节点（后绘制的在上面）
  for (let i = root.children.length - 1; i >= 0; i--) {
    const child = root.children[i];
    const found = hitTest(child, x, y);
    if (found) return found;
  }

  return root;
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/event/tests/hit-test.test.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(event): implement HitTest with z-order awareness"
```

---

### Task 19: EventDispatcher 事件分发

**Files:**
- Create: `packages/event/src/dispatcher.ts`
- Create: `packages/event/tests/dispatcher.test.ts`

- [ ] **Step 1: 编写 EventDispatcher 失败测试**

```typescript
// packages/event/tests/dispatcher.test.ts
import { describe, it, expect, vi } from 'vitest';
import { EventDispatcher } from '../src/dispatcher.js';
import { ComposeNode, type Constraints, type Size } from '@canvas-compose/composer';

class TestNode extends ComposeNode {
  constructor(key: string, w: number, h: number) {
    super(key);
    this.width = w;
    this.height = h;
  }
  measure(c: Constraints): Size { return { width: this.width, height: this.height }; }
}

describe('EventDispatcher', () => {
  it('should dispatch click to hit node', () => {
    const root = new TestNode('root', 200, 200);
    root.x = 0; root.y = 0;
    const child = new TestNode('child', 50, 50);
    child.x = 10; child.y = 10;
    root.appendChild(child);

    const handler = vi.fn();
    child.handlers['click'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('click', 30, 30);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch when no node hit', () => {
    const root = new TestNode('root', 100, 100);
    root.x = 0; root.y = 0;
    const handler = vi.fn();
    root.handlers['click'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('click', 200, 200);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should dispatch mousemove for hover tracking', () => {
    const root = new TestNode('root', 200, 200);
    root.x = 0; root.y = 0;
    const handler = vi.fn();
    root.handlers['mousemove'] = handler;

    const dispatcher = new EventDispatcher(root);
    dispatcher.dispatch('mousemove', 100, 100);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/event/tests/dispatcher.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 dispatcher.ts**

```typescript
import { ComposeNode } from '@canvas-compose/composer';
import { hitTest } from './hit-test.js';

export class EventDispatcher {
  private rootNode: ComposeNode;
  private lastHovered: ComposeNode | null = null;

  constructor(rootNode: ComposeNode) {
    this.rootNode = rootNode;
  }

  dispatch(type: string, x: number, y: number): void {
    const target = hitTest(this.rootNode, x, y);

    // hover 追踪
    if (type === 'mousemove') {
      if (this.lastHovered !== target) {
        if (this.lastHovered && this.lastHovered.handlers['mouseleave']) {
          this.lastHovered.handlers['mouseleave'](x, y);
        }
        if (target && target.handlers['mouseenter']) {
          target.handlers['mouseenter'](x, y);
        }
        this.lastHovered = target;
      }
    }

    if (target && target.handlers[type]) {
      target.handlers[type](x, y);
    }
  }

  attachToCanvas(canvas: HTMLCanvasElement): () => void {
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('click', x, y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('mousemove', x, y);
    };
    const onWheel = (e: WheelEvent) => {
      const { x, y } = getPos(e);
      this.dispatch('wheel', x, y);
    };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    return () => {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }

  dispose(): void {
    this.lastHovered = null;
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/event/tests/dispatcher.test.ts`
Expected: PASS

- [ ] **Step 5: 创建 event/src/index.ts 导出**

```typescript
export { hitTest } from './hit-test.js';
export { EventDispatcher } from './dispatcher.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(event): implement EventDispatcher with hover tracking"
```

---

### Task 20: Modifier 系统

**Files:**
- Create: `packages/components/src/modifier.ts`
- Create: `packages/components/tests/modifier.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 Modifier 失败测试**

```typescript
// packages/components/tests/modifier.test.ts
import { describe, it, expect } from 'vitest';
import { Modifier, PaddingModifier, BackgroundModifier, ClickableModifier, SizeModifier, type ModifierElement } from '../src/modifier.js';

describe('Modifier', () => {
  it('should chain modifiers', () => {
    const mod = Modifier.padding(16).background('#F00').size(100, 50);
    expect(mod.elements).toHaveLength(3);
  });

  it('PaddingModifier should adjust measure constraints', () => {
    const pm = new PaddingModifier(16);
    const inner = pm.adjustConstraints({ minWidth: 0, maxWidth: 200, minHeight: 0, maxHeight: 100 });
    expect(inner.maxWidth).toBe(168);
    expect(inner.maxHeight).toBe(68);
  });

  it('PaddingModifier should offset position', () => {
    const pm = new PaddingModifier(16);
    const pos = pm.adjustPosition(0, 0, 100, 50);
    expect(pos.x).toBe(16);
    expect(pos.y).toBe(16);
  });

  it('BackgroundModifier should produce rect draw command', () => {
    const bm = new BackgroundModifier('#FF0000');
    const cmds = bm.drawCommands(0, 0, 100, 50);
    expect(cmds).toHaveLength(1);
    expect(cmds[0].type).toBe('rect');
    if (cmds[0].type === 'rect') {
      expect(cmds[0].fill).toBe('#FF0000');
    }
  });

  it('ClickableModifier should register click handler', () => {
    const clicked = { value: false };
    const cm = new ClickableModifier(() => { clicked.value = true; });
    expect(cm.handlers['click']).toBeDefined();
    cm.handlers['click']!(0, 0);
    expect(clicked.value).toBe(true);
  });

  it('SizeModifier should override measure result', () => {
    const sm = new SizeModifier(100, 50);
    const size = sm.adjustSize({ width: 200, height: 300 });
    expect(size).toEqual({ width: 100, height: 50 });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/modifier.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 modifier.ts**

```typescript
import { type DrawCommand } from '@canvas-compose/renderer';
import { type Constraints, type Size } from '@canvas-compose/composer';

export interface ModifierElement {
  adjustConstraints?(constraints: Constraints): Constraints;
  adjustSize?(size: Size): Size;
  adjustPosition?(x: number, y: number, w: number, h: number): { x: number; y: number };
  drawCommands?(x: number, y: number, w: number, h: number): DrawCommand[];
  handlers?: Record<string, (...args: unknown[]) => void>;
}

export class PaddingModifier implements ModifierElement {
  private top: number;
  private bottom: number;
  private left: number;
  private right: number;

  constructor(all: number);
  constructor(horizontal: number, vertical: number);
  constructor(top: number, right: number, bottom: number, left: number);
  constructor(a: number, b?: number, c?: number, d?: number) {
    if (b === undefined) {
      this.top = this.bottom = this.left = this.right = a;
    } else if (c === undefined) {
      this.left = this.right = a;
      this.top = this.bottom = b;
    } else {
      this.top = a; this.right = b; this.bottom = c!; this.left = d!;
    }
  }

  adjustConstraints(constraints: Constraints): Constraints {
    return {
      minWidth: Math.max(0, constraints.minWidth - this.left - this.right),
      maxWidth: Math.max(0, constraints.maxWidth - this.left - this.right),
      minHeight: Math.max(0, constraints.minHeight - this.top - this.bottom),
      maxHeight: Math.max(0, constraints.maxHeight - this.top - this.bottom),
    };
  }

  adjustSize(size: Size): Size {
    return {
      width: size.width + this.left + this.right,
      height: size.height + this.top + this.bottom,
    };
  }

  adjustPosition(x: number, y: number): { x: number; y: number } {
    return { x: x + this.left, y: y + this.top };
  }
}

export class BackgroundModifier implements ModifierElement {
  private color: string;
  private radius?: number;

  constructor(color: string, radius?: number) {
    this.color = color;
    this.radius = radius;
  }

  drawCommands(x: number, y: number, w: number, h: number): DrawCommand[] {
    if (this.radius) {
      return [
        { type: 'rect', x, y, w, h, fill: this.color },
      ];
    }
    return [{ type: 'rect', x, y, w, h, fill: this.color }];
  }
}

export class ClickableModifier implements ModifierElement {
  handlers: Record<string, (...args: unknown[]) => void>;

  constructor(onClick: () => void) {
    this.handlers = { click: onClick };
  }
}

export class SizeModifier implements ModifierElement {
  private w: number;
  private h: number;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
  }

  adjustSize(_size: Size): Size {
    return { width: this.w, height: this.h };
  }

  adjustConstraints(_constraints: Constraints): Constraints {
    return { minWidth: this.w, maxWidth: this.w, minHeight: this.h, maxHeight: this.h };
  }
}

export class Modifier {
  readonly elements: ModifierElement[] = [];

  static create(): Modifier {
    return new Modifier();
  }

  padding(all: number): this;
  padding(horizontal: number, vertical: number): this;
  padding(a: number, b?: number): this {
    if (b === undefined) {
      this.elements.push(new PaddingModifier(a));
    } else {
      this.elements.push(new PaddingModifier(a, b));
    }
    return this;
  }

  background(color: string, radius?: number): this {
    this.elements.push(new BackgroundModifier(color, radius));
    return this;
  }

  clickable(onClick: () => void): this {
    this.elements.push(new ClickableModifier(onClick));
    return this;
  }

  size(w: number, h: number): this {
    this.elements.push(new SizeModifier(w, h));
    return this;
  }

  fillMaxWidth(): this {
    this.elements.push(new SizeModifier(Infinity, 0));
    return this;
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/modifier.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 index.ts 导出**

```typescript
export { Modifier, PaddingModifier, BackgroundModifier, ClickableModifier, SizeModifier, type ModifierElement } from './modifier.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(components): implement Modifier system with chainable API"
```

---

### Task 21: Text / Button 基础组件

**Files:**
- Create: `packages/components/src/text.ts`
- Create: `packages/components/src/button.ts`
- Create: `packages/components/tests/text.test.ts`
- Create: `packages/components/tests/button.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 Text 组件测试**

```typescript
// packages/components/tests/text.test.ts
import { describe, it, expect } from 'vitest';
import { Text } from '../src/text.js';
import { tightConstraints } from '@canvas-compose/composer';

describe('Text', () => {
  it('should measure text size', () => {
    const text = new Text('t', 'Hello World', { fontSize: 16 });
    const size = text.measure(tightConstraints(400, 400));
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it('should produce text draw command', () => {
    const text = new Text('t', 'Hello', { fontSize: 16, color: '#000' });
    text.x = 10;
    text.y = 20;
    text.width = 100;
    text.height = 30;
    const cmds = text.drawCommands();
    expect(cmds).toHaveLength(1);
    expect(cmds[0].type).toBe('text');
    if (cmds[0].type === 'text') {
      expect(cmds[0].content).toBe('Hello');
    }
  });

  it('should support modifier', () => {
    const text = new Text('t', 'Hello', { fontSize: 16 });
    text.setModifier(Modifier.padding(8).background('#EEE'));
    expect(text.modifier.elements).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 编写 Button 组件测试**

```typescript
// packages/components/tests/button.test.ts
import { describe, it, expect } from 'vitest';
import { Button } from '../src/button.js';
import { tightConstraints } from '@canvas-compose/composer';

describe('Button', () => {
  it('should measure fixed size', () => {
    const btn = new Button('btn', 'Click Me', () => {});
    const size = btn.measure(tightConstraints(400, 400));
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it('should produce rect + text draw commands', () => {
    const btn = new Button('btn', 'OK', () => {});
    btn.x = 0; btn.y = 0; btn.width = 120; btn.height = 44;
    const cmds = btn.drawCommands();
    expect(cmds.length).toBeGreaterThanOrEqual(2);
    expect(cmds[0].type).toBe('rect');
    expect(cmds[1].type).toBe('text');
  });

  it('should register click handler', () => {
    const clicked = { value: false };
    const btn = new Button('btn', 'OK', () => { clicked.value = true; });
    expect(btn.handlers['click']).toBeDefined();
    btn.handlers['click']!(0, 0);
    expect(clicked.value).toBe(true);
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/text.test.ts packages/components/tests/button.test.ts`
Expected: FAIL

- [ ] **Step 4: 实现 text.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { measureText } from '@canvas-compose/renderer';
import { Modifier, type ModifierElement } from './modifier.js';

export interface TextOptions {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  align?: CanvasTextAlign;
}

export class Text extends ComposeNode {
  private _content: string;
  private fontSize: number;
  private fontWeight: string;
  private fontFamily: string;
  private color: string;
  private align: CanvasTextAlign;
  modifier: Modifier = new Modifier();

  constructor(key: string, content: string, options: TextOptions = {}) {
    super(key);
    this._content = content;
    this.fontSize = options.fontSize ?? 14;
    this.fontWeight = options.fontWeight ?? 'normal';
    this.fontFamily = options.fontFamily ?? 'sans-serif';
    this.color = options.color ?? '#000000';
    this.align = options.align ?? 'left';
  }

  get content(): string { return this._content; }
  set content(v: string) { this._content = v; }

  setModifier(mod: Modifier): void {
    this.modifier = mod;
  }

  private get font(): string {
    return `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
  }

  measure(constraints: Constraints): Size {
    let innerConstraints = constraints;
    for (const el of this.modifier.elements) {
      if (el.adjustConstraints) innerConstraints = el.adjustConstraints(innerConstraints);
    }

    const metrics = measureText(this._content, this.font);
    let size: Size = { width: metrics.width, height: metrics.height };

    for (const el of this.modifier.elements) {
      if (el.adjustSize) size = el.adjustSize(size);
    }

    return clampSize(constraints, size.width, size.height);
  }

  drawCommands(): DrawCommand[] {
    const cmds: DrawCommand[] = [];
    for (const el of this.modifier.elements) {
      if (el.drawCommands) cmds.push(...el.drawCommands(this.x, this.y, this.width, this.height));
    }

    let textX = this.x;
    let textY = this.y;
    for (const el of this.modifier.elements) {
      if (el.adjustPosition) {
        const pos = el.adjustPosition(this.x, this.y, this.width, this.height);
        textX = pos.x;
        textY = pos.y;
      }
    }

    cmds.push({
      type: 'text',
      x: textX,
      y: textY,
      content: this._content,
      font: this.font,
      color: this.color,
      align: this.align,
      baseline: 'top',
    });

    return cmds;
  }
}
```

- [ ] **Step 5: 实现 button.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { measureText } from '@canvas-compose/renderer';
import { Modifier } from './modifier.js';

export interface ButtonOptions {
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  cornerRadius?: number;
  padding?: number;
}

export class Button extends ComposeNode {
  private label: string;
  private onClick: () => void;
  private fontSize: number;
  private textColor: string;
  private bgColor: string;
  private cornerRadius: number;
  private padding: number;
  private _hovered = false;
  modifier: Modifier = new Modifier();

  constructor(key: string, label: string, onClick: () => void, options: ButtonOptions = {}) {
    super(key);
    this.label = label;
    this.onClick = onClick;
    this.fontSize = options.fontSize ?? 14;
    this.textColor = options.textColor ?? '#FFFFFF';
    this.bgColor = options.backgroundColor ?? '#6200EE';
    this.cornerRadius = options.cornerRadius ?? 8;
    this.padding = options.padding ?? 16;

    this.handlers['click'] = () => this.onClick();
    this.handlers['mouseenter'] = () => { this._hovered = true; };
    this.handlers['mouseleave'] = () => { this._hovered = false; };
  }

  measure(constraints: Constraints): Size {
    const font = `${this.fontSize}px sans-serif`;
    const metrics = measureText(this.label, font);
    const w = metrics.width + this.padding * 2;
    const h = this.fontSize * 2.5;
    return clampSize(constraints, w, h);
  }

  drawCommands(): DrawCommand[] {
    const bg = this._hovered ? this.darken(this.bgColor, 0.2) : this.bgColor;
    const cmds: DrawCommand[] = [];

    cmds.push({ type: 'rect', x: this.x, y: this.y, w: this.width, h: this.height, fill: bg });

    cmds.push({
      type: 'text',
      x: this.x + this.width / 2,
      y: this.y + this.height / 2 - this.fontSize / 2,
      content: this.label,
      font: `${this.fontSize}px sans-serif`,
      color: this.textColor,
      align: 'center',
      baseline: 'middle',
    });

    return cmds;
  }

  private darken(hex: string, amount: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.max(0, Math.round(r * (1 - amount)));
    const ng = Math.max(0, Math.round(g * (1 - amount)));
    const nb = Math.max(0, Math.round(b * (1 - amount)));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  }
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/text.test.ts packages/components/tests/button.test.ts`
Expected: PASS

- [ ] **Step 7: 更新 index.ts 导出**

```typescript
export { Text, type TextOptions } from './text.js';
export { Button, type ButtonOptions } from './button.js';
```

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat(components): implement Text and Button components"
```

---

### Task 22: TextInput / Checkbox 组件

**Files:**
- Create: `packages/components/src/text-input.ts`
- Create: `packages/components/src/checkbox.ts`
- Create: `packages/components/tests/text-input.test.ts`
- Create: `packages/components/tests/checkbox.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 TextInput 测试**

```typescript
// packages/components/tests/text-input.test.ts
import { describe, it, expect } from 'vitest';
import { TextInput } from '../src/text-input.js';
import { tightConstraints } from '@canvas-compose/composer';

describe('TextInput', () => {
  it('should measure fixed height', () => {
    const input = new TextInput('input', { placeholder: 'Enter text' });
    const size = input.measure(tightConstraints(300, 100));
    expect(size.height).toBeGreaterThan(0);
    expect(size.width).toBe(300);
  });

  it('should produce rect + text draw commands', () => {
    const input = new TextInput('input');
    input.x = 0; input.y = 0; input.width = 200; input.height = 40;
    const cmds = input.drawCommands();
    expect(cmds.length).toBeGreaterThanOrEqual(2);
    expect(cmds[0].type).toBe('rect');
  });

  it('should track focus state', () => {
    const input = new TextInput('input');
    expect(input.isFocused).toBe(false);
    input.focus();
    expect(input.isFocused).toBe(true);
    input.blur();
    expect(input.isFocused).toBe(false);
  });

  it('should update text value', () => {
    const input = new TextInput('input');
    input.value = 'Hello';
    expect(input.value).toBe('Hello');
  });
});
```

- [ ] **Step 2: 编写 Checkbox 测试**

```typescript
// packages/components/tests/checkbox.test.ts
import { describe, it, expect } from 'vitest';
import { Checkbox } from '../src/checkbox.js';
import { tightConstraints } from '@canvas-compose/composer';
import { signal } from '@canvas-compose/reactivity';

describe('Checkbox', () => {
  it('should measure fixed size', () => {
    const checked = signal(false);
    const cb = new Checkbox('cb', checked);
    const size = cb.measure(tightConstraints(200, 200));
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it('should toggle checked state on click', () => {
    const checked = signal(false);
    const cb = new Checkbox('cb', checked);
    cb.handlers['click']!(0, 0);
    expect(checked.value).toBe(true);
    cb.handlers['click']!(0, 0);
    expect(checked.value).toBe(false);
  });

  it('should draw check mark when checked', () => {
    const checked = signal(true);
    const cb = new Checkbox('cb', checked);
    cb.x = 0; cb.y = 0; cb.width = 24; cb.height = 24;
    const cmds = cb.drawCommands();
    // Should have rect + check mark (text "✓")
    expect(cmds.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/text-input.test.ts packages/components/tests/checkbox.test.ts`
Expected: FAIL

- [ ] **Step 4: 实现 text-input.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { measureText } from '@canvas-compose/renderer';

export interface TextInputOptions {
  placeholder?: string;
  fontSize?: number;
  fontColor?: string;
  placeholderColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  cornerRadius?: number;
  padding?: number;
}

export class TextInput extends ComposeNode {
  private _value = '';
  private placeholder: string;
  private fontSize: number;
  private fontColor: string;
  private placeholderColor: string;
  private bgColor: string;
  private borderColor: string;
  private cornerRadius: number;
  private padding: number;
  private _isFocused = false;
  private hiddenTextarea: HTMLTextAreaElement | null = null;
  private cursorVisible = true;
  private cursorBlinkTimer: ReturnType<typeof setInterval> | null = null;

  constructor(key: string, options: TextInputOptions = {}) {
    super(key);
    this.placeholder = options.placeholder ?? '';
    this.fontSize = options.fontSize ?? 14;
    this.fontColor = options.fontColor ?? '#000000';
    this.placeholderColor = options.placeholderColor ?? '#999999';
    this.bgColor = options.backgroundColor ?? '#FFFFFF';
    this.borderColor = options.borderColor ?? '#CCCCCC';
    this.cornerRadius = options.cornerRadius ?? 4;
    this.padding = options.padding ?? 12;

    this.handlers['click'] = () => this.focus();
  }

  get value(): string { return this._value; }
  set value(v: string) { this._value = v; }
  get isFocused(): boolean { return this._isFocused; }

  focus(): void {
    if (this._isFocused) return;
    this._isFocused = true;
    this.hiddenTextarea = document.createElement('textarea');
    this.hiddenTextarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;width:1px;height:1px';
    this.hiddenTextarea.value = this._value;
    document.body.appendChild(this.hiddenTextarea);
    this.hiddenTextarea.focus();

    this.hiddenTextarea.addEventListener('input', () => {
      this._value = this.hiddenTextarea!.value;
      this.markDirty();
    });

    this.cursorBlinkTimer = setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.markDirty();
    }, 530);
  }

  blur(): void {
    this._isFocused = false;
    if (this.hiddenTextarea) {
      this.hiddenTextarea.remove();
      this.hiddenTextarea = null;
    }
    if (this.cursorBlinkTimer) {
      clearInterval(this.cursorBlinkTimer);
      this.cursorBlinkTimer = null;
    }
  }

  measure(constraints: Constraints): Size {
    const h = this.fontSize * 2.5;
    return clampSize(constraints, constraints.maxWidth, h);
  }

  drawCommands(): DrawCommand[] {
    const cmds: DrawCommand[] = [];
    const font = `${this.fontSize}px sans-serif`;

    // Background
    cmds.push({ type: 'rect', x: this.x, y: this.y, w: this.width, h: this.height, fill: this.bgColor, stroke: this.borderColor, strokeWidth: 1 });

    // Text or placeholder
    const displayText = this._value || this.placeholder;
    const color = this._value ? this.fontColor : this.placeholderColor;
    cmds.push({
      type: 'text', x: this.x + this.padding, y: this.y + (this.height - this.fontSize) / 2,
      content: displayText, font, color, baseline: 'middle',
    });

    // Cursor
    if (this._isFocused && this.cursorVisible) {
      const metrics = measureText(this._value, font);
      const cursorX = this.x + this.padding + metrics.width;
      cmds.push({ type: 'rect', x: cursorX, y: this.y + 6, w: 2, h: this.height - 12, fill: '#000000' });
    }

    return cmds;
  }
}
```

- [ ] **Step 5: 实现 checkbox.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { type Signal } from '@canvas-compose/reactivity';

export interface CheckboxOptions {
  checkedColor?: string;
  uncheckedColor?: string;
  checkColor?: string;
  size?: number;
  label?: string;
}

export class Checkbox extends ComposeNode {
  private checked: Signal<boolean>;
  private checkedColor: string;
  private uncheckedColor: string;
  private checkColor: string;
  private boxSize: number;
  private label: string;

  constructor(key: string, checked: Signal<boolean>, options: CheckboxOptions = {}) {
    super(key);
    this.checked = checked;
    this.checkedColor = options.checkedColor ?? '#6200EE';
    this.uncheckedColor = options.uncheckedColor ?? '#FFFFFF';
    this.checkColor = options.checkColor ?? '#FFFFFF';
    this.boxSize = options.size ?? 24;
    this.label = options.label ?? '';

    this.handlers['click'] = () => {
      this.checked.value = !this.checked.value;
    };
  }

  measure(constraints: Constraints): Size {
    const totalWidth = this.boxSize + (this.label ? 8 + this.label.length * 8 : 0);
    return clampSize(constraints, totalWidth, this.boxSize);
  }

  drawCommands(): DrawCommand[] {
    const cmds: DrawCommand[] = [];
    const isChecked = this.checked.value;

    // Box
    cmds.push({
      type: 'rect', x: this.x, y: this.y, w: this.boxSize, h: this.boxSize,
      fill: isChecked ? this.checkedColor : this.uncheckedColor,
      stroke: '#CCCCCC', strokeWidth: 1,
    });

    // Check mark
    if (isChecked) {
      cmds.push({
        type: 'text', x: this.x + 4, y: this.y + 2,
        content: '✓', font: `bold ${this.boxSize - 4}px sans-serif`,
        color: this.checkColor, baseline: 'top',
      });
    }

    // Label
    if (this.label) {
      cmds.push({
        type: 'text', x: this.x + this.boxSize + 8, y: this.y + this.boxSize / 2,
        content: this.label, font: '14px sans-serif', color: '#000000',
        baseline: 'middle',
      });
    }

    return cmds;
  }
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/text-input.test.ts packages/components/tests/checkbox.test.ts`
Expected: PASS

- [ ] **Step 7: 更新 index.ts 导出**

```typescript
export { TextInput, type TextInputOptions } from './text-input.js';
export { Checkbox, type CheckboxOptions } from './checkbox.js';
```

- [ ] **Step 8: 运行全部测试确认无回归**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 9: 提交**

```bash
git add -A && git commit -m "feat(components): implement TextInput and Checkbox components"
```

---

### Task 23: Phase 3 集成 — 重写 Demo 使用 EventDispatcher

**Files:**
- Modify: `apps/demo/main.ts`
- Modify: `apps/demo/counter-app.ts`

- [ ] **Step 1: 重写 Demo 使用 EventDispatcher 和新组件**

将 `apps/demo/main.ts` 中的手动事件处理替换为 `EventDispatcher.attachToCanvas()`，将 `counter-app.ts` 中的自定义节点替换为 `Text`、`Button` 组件。

- [ ] **Step 2: 启动开发服务器验证**

Run: `cd canvas-compose && npx vite --config apps/demo/vite.config.ts`
Expected: 计数器正常工作，hover 效果正常

- [ ] **Step 3: 运行全部测试**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: rewrite demo using EventDispatcher and component library"
```

---

# Phase 4: 完善组件库

**目标:** 实现主题系统、Image 组件、LazyColumn/LazyRow 列表组件，创建完整的 Todo App 展示应用。

**前置依赖:** Phase 3 全部完成

---

### Task 24: 主题系统

**Files:**
- Create: `packages/theme/package.json`
- Create: `packages/theme/tsconfig.json`
- Create: `packages/theme/src/theme.ts`
- Create: `packages/theme/src/colors.ts`
- Create: `packages/theme/src/typography.ts`
- Create: `packages/theme/tests/theme.test.ts`

- [ ] **Step 1: 创建 theme 包骨架**

`packages/theme/package.json`:
```json
{
  "name": "@canvas-compose/theme",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@canvas-compose/reactivity": "workspace:*"
  }
}
```

- [ ] **Step 2: 编写主题测试**

```typescript
// packages/theme/tests/theme.test.ts
import { describe, it, expect } from 'vitest';
import { createTheme, type Theme } from '../src/theme.js';

describe('Theme', () => {
  it('should create theme with defaults', () => {
    const theme = createTheme({});
    expect(theme.colors.primary).toBeDefined();
    expect(theme.typography.body).toBeDefined();
    expect(theme.spacing.md).toBeDefined();
  });

  it('should override defaults', () => {
    const theme = createTheme({
      colors: { primary: '#FF0000' },
    });
    expect(theme.colors.primary).toBe('#FF0000');
  });

  it('should provide spacing values', () => {
    const theme = createTheme({});
    expect(theme.spacing.xs).toBeLessThan(theme.spacing.sm);
    expect(theme.spacing.sm).toBeLessThan(theme.spacing.md);
    expect(theme.spacing.md).toBeLessThan(theme.spacing.lg);
    expect(theme.spacing.lg).toBeLessThan(theme.spacing.xl);
  });
});
```

- [ ] **Step 3: 实现主题模块**

`packages/theme/src/colors.ts`:
```typescript
export interface Colors {
  primary: string;
  onPrimary: string;
  primaryVariant: string;
  secondary: string;
  onSecondary: string;
  background: string;
  surface: string;
  onSurface: string;
  text: string;
  textSecondary: string;
  error: string;
  onError: string;
  border: string;
  divider: string;
}

export const defaultColors: Colors = {
  primary: '#6200EE',
  onPrimary: '#FFFFFF',
  primaryVariant: '#3700B3',
  secondary: '#03DAC6',
  onSecondary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  onSurface: '#000000',
  text: '#000000',
  textSecondary: '#666666',
  error: '#B00020',
  onError: '#FFFFFF',
  border: '#E0E0E0',
  divider: '#EEEEEE',
};
```

`packages/theme/src/typography.ts`:
```typescript
export interface TypographyStyle {
  size: number;
  weight: string;
  family: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface Typography {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  body: TypographyStyle;
  caption: TypographyStyle;
  button: TypographyStyle;
}

export const defaultTypography: Typography = {
  h1: { size: 32, weight: 'bold', family: 'sans-serif', lineHeight: 1.2, letterSpacing: 0 },
  h2: { size: 24, weight: 'bold', family: 'sans-serif', lineHeight: 1.3, letterSpacing: 0 },
  h3: { size: 20, weight: '600', family: 'sans-serif', lineHeight: 1.4, letterSpacing: 0 },
  body: { size: 14, weight: 'normal', family: 'sans-serif', lineHeight: 1.5, letterSpacing: 0 },
  caption: { size: 12, weight: 'normal', family: 'sans-serif', lineHeight: 1.4, letterSpacing: 0.2 },
  button: { size: 14, weight: '500', family: 'sans-serif', lineHeight: 1.0, letterSpacing: 0.5 },
};
```

`packages/theme/src/theme.ts`:
```typescript
import { type Colors, defaultColors } from './colors.js';
import { type Typography, defaultTypography } from './typography.js';

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Corners {
  none: number;
  small: number;
  medium: number;
  large: number;
  round: number;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  corners: Corners;
}

export interface ThemeOptions {
  colors?: Partial<Colors>;
  typography?: Partial<Typography>;
  spacing?: Partial<Spacing>;
  corners?: Partial<Corners>;
}

const defaultSpacing: Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const defaultCorners: Corners = { none: 0, small: 4, medium: 8, large: 16, round: 9999 };

export function createTheme(options: ThemeOptions = {}): Theme {
  return {
    colors: { ...defaultColors, ...options.colors },
    typography: { ...defaultTypography, ...options.typography },
    spacing: { ...defaultSpacing, ...options.spacing },
    corners: { ...defaultCorners, ...options.corners },
  };
}

export const lightTheme = createTheme();
export const darkTheme = createTheme({
  colors: {
    primary: '#BB86FC',
    onPrimary: '#000000',
    primaryVariant: '#3700B3',
    background: '#121212',
    surface: '#1E1E1E',
    onSurface: '#E0E0E0',
    text: '#E0E0E0',
    textSecondary: '#AAAAAA',
    border: '#333333',
    divider: '#2C2C2C',
  },
});
```

`packages/theme/src/index.ts`:
```typescript
export { createTheme, lightTheme, darkTheme, type Theme, type ThemeOptions } from './theme.js';
export { type Colors, defaultColors } from './colors.js';
export { type Typography, type TypographyStyle, defaultTypography } from './typography.js';
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/theme/tests/`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat(theme): implement theme system with light/dark themes"
```

---

### Task 25: Image 组件

**Files:**
- Create: `packages/components/src/image.ts`
- Create: `packages/components/tests/image.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 Image 测试**

```typescript
// packages/components/tests/image.test.ts
import { describe, it, expect } from 'vitest';
import { Image as CanvasImage } from '../src/image.js';
import { tightConstraints } from '@canvas-compose/composer';

describe('Image', () => {
  it('should report loading state', () => {
    const img = new CanvasImage('img', 'https://example.com/test.png');
    expect(img.isLoading).toBe(true);
  });

  it('should measure to natural size when loaded', () => {
    const img = new CanvasImage('img', 'test.png');
    // Simulate loaded
    (img as any).loadedImage = { width: 200, height: 100, naturalWidth: 200, naturalHeight: 100 };
    (img as any)._isLoading = false;
    const size = img.measure(tightConstraints(400, 400));
    expect(size.width).toBe(200);
    expect(size.height).toBe(100);
  });

  it('should clamp to constraints', () => {
    const img = new CanvasImage('img', 'test.png');
    (img as any).loadedImage = { width: 200, height: 100, naturalWidth: 200, naturalHeight: 100 };
    (img as any)._isLoading = false;
    const size = img.measure(tightConstraints(100, 100));
    expect(size.width).toBe(100);
    expect(size.height).toBe(50); // aspect ratio preserved
  });

  it('should produce image draw command when loaded', () => {
    const img = new CanvasImage('img', 'test.png');
    const fakeImg = { width: 200, height: 100, naturalWidth: 200, naturalHeight: 100 };
    (img as any).loadedImage = fakeImg;
    (img as any)._isLoading = false;
    img.x = 0; img.y = 0; img.width = 200; img.height = 100;
    const cmds = img.drawCommands();
    expect(cmds).toHaveLength(1);
    expect(cmds[0].type).toBe('image');
  });
});
```

- [ ] **Step 2: 实现 image.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';

export interface ImageOptions {
  objectFit?: 'contain' | 'cover' | 'fill';
  placeholderColor?: string;
}

export class Image extends ComposeNode {
  private src: string;
  private objectFit: 'contain' | 'cover' | 'fill';
  private placeholderColor: string;
  private loadedImage: HTMLImageElement | null = null;
  private _isLoading = true;
  private loadError = false;

  constructor(key: string, src: string, options: ImageOptions = {}) {
    super(key);
    this.src = src;
    this.objectFit = options.objectFit ?? 'contain';
    this.placeholderColor = options.placeholderColor ?? '#EEEEEE';

    const img = new window.Image();
    img.onload = () => {
      this.loadedImage = img;
      this._isLoading = false;
      this.markLayoutDirty();
    };
    img.onerror = () => {
      this.loadError = true;
      this._isLoading = false;
      this.markDirty();
    };
    img.src = src;
  }

  get isLoading(): boolean { return this._isLoading; }

  measure(constraints: Constraints): Size {
    if (this._isLoading || !this.loadedImage) {
      return clampSize(constraints, constraints.maxWidth, constraints.maxWidth * 0.6);
    }

    const naturalW = this.loadedImage.naturalWidth;
    const naturalH = this.loadedImage.naturalHeight;
    const aspect = naturalW / naturalH;

    let w = constraints.maxWidth;
    let h = w / aspect;

    if (h > constraints.maxHeight) {
      h = constraints.maxHeight;
      w = h * aspect;
    }

    return clampSize(constraints, w, h);
  }

  drawCommands(): DrawCommand[] {
    const cmds: DrawCommand[] = [];

    if (this._isLoading || !this.loadedImage) {
      cmds.push({ type: 'rect', x: this.x, y: this.y, w: this.width, h: this.height, fill: this.placeholderColor });
      return cmds;
    }

    if (this.loadError) {
      cmds.push({ type: 'rect', x: this.x, y: this.y, w: this.width, h: this.height, fill: '#FFCCCC' });
      cmds.push({ type: 'text', x: this.x + 4, y: this.y + 4, content: '✕', font: '16px sans-serif', color: '#FF0000' });
      return cmds;
    }

    cmds.push({ type: 'image', img: this.loadedImage, x: this.x, y: this.y, w: this.width, h: this.height });
    return cmds;
  }
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/image.test.ts`
Expected: PASS

- [ ] **Step 4: 更新 index.ts 导出**

```typescript
export { Image, type ImageOptions } from './image.js';
```

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat(components): implement Image component with async loading"
```

---

### Task 26: LazyColumn / LazyRow 列表组件

**Files:**
- Create: `packages/components/src/lazy-list.ts`
- Create: `packages/components/tests/lazy-list.test.ts`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: 编写 LazyColumn 测试**

```typescript
// packages/components/tests/lazy-list.test.ts
import { describe, it, expect } from 'vitest';
import { LazyColumn } from '../src/lazy-list.js';
import { tightConstraints } from '@canvas-compose/composer';
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';

class FixedSizeNode extends ComposeNode {
  constructor(key: string, private w: number, private h: number) {
    super(key);
  }
  measure(c: Constraints): Size { return clampSize(c, this.w, this.h); }
  drawCommands(): DrawCommand[] { return []; }
}

describe('LazyColumn', () => {
  it('should only create visible items', () => {
    const list = new LazyColumn('list', {
      itemCount: 100,
      itemBuilder: (i) => new FixedSizeNode(`item-${i}`, 100, 50),
    });

    list.measure(tightConstraints(100, 200));
    list.x = 0; list.y = 0;
    list.placeChildren();

    // viewport is 200px, each item is 50px, so ~4 items visible
    expect(list.children.length).toBeLessThanOrEqual(5); // +1 buffer
  });

  it('should handle scroll offset', () => {
    const list = new LazyColumn('list', {
      itemCount: 100,
      itemBuilder: (i) => new FixedSizeNode(`item-${i}`, 100, 50),
    });

    list.scrollOffset = 250;
    list.measure(tightConstraints(100, 200));
    list.x = 0; list.y = 0;
    list.placeChildren();

    // Should start from item ~5 (250/50)
    const firstChildKey = list.children[0]?.key;
    expect(firstChildKey).toContain('item-5');
  });

  it('should report total content height', () => {
    const list = new LazyColumn('list', {
      itemCount: 100,
      itemBuilder: (i) => new FixedSizeNode(`item-${i}`, 100, 50),
    });

    list.measure(tightConstraints(100, 200));
    expect(list.totalContentHeight).toBe(5000); // 100 * 50
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd canvas-compose && npx vitest run packages/components/tests/lazy-list.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 lazy-list.ts**

```typescript
import { ComposeNode, type Constraints, type Size, clampSize } from '@canvas-compose/composer';
import { type DrawCommand } from '@canvas-compose/renderer';
import { signal, type Signal } from '@canvas-compose/reactivity';

export interface LazyListOptions {
  itemCount: number;
  itemBuilder: (index: number) => ComposeNode;
  itemHeight?: number;
  bufferCount?: number;
}

export class LazyColumn extends ComposeNode {
  private itemCount: number;
  private itemBuilder: (index: number) => LazyColumn;
  private itemHeight: number;
  private bufferCount: number;
  private _scrollOffset = 0;
  private _totalContentHeight = 0;

  constructor(key: string, options: LazyListOptions) {
    super(key);
    this.itemCount = options.itemCount;
    this.itemBuilder = options.itemBuilder as any;
    this.itemHeight = options.itemHeight ?? 0;
    this.bufferCount = options.bufferCount ?? 2;

    this.handlers['wheel'] = (_x: unknown, _y: unknown, deltaY: number) => {
      this.scrollOffset = Math.max(0, this.scrollOffset + deltaY);
    };
  }

  get scrollOffset(): number { return this._scrollOffset; }
  set scrollOffset(v: number) {
    this._scrollOffset = v;
    this.markDirty();
  }
  get totalContentHeight(): number { return this._totalContentHeight; }

  measure(constraints: Constraints): Size {
    // Clear old children
    for (const child of [...this.children]) {
      this.removeChild(child);
    }

    // Measure all items to get heights (could be optimized with caching)
    const itemHeights: number[] = [];
    for (let i = 0; i < this.itemCount; i++) {
      const item = this.itemBuilder(i);
      const size = item.measure(constraints);
      itemHeights.push(size.height);
    }

    this._totalContentHeight = itemHeights.reduce((sum, h) => sum + h, 0);

    // Calculate visible range
    const viewportHeight = constraints.maxHeight;
    let startY = 0;
    let startIndex = 0;
    for (let i = 0; i < itemHeights.length; i++) {
      if (startY + itemHeights[i] > this._scrollOffset) {
        startIndex = i;
        break;
      }
      startY += itemHeights[i];
    }

    let endY = this._scrollOffset + viewportHeight;
    let endIndex = startIndex;
    for (let i = startIndex; i < itemHeights.length; i++) {
      endY -= itemHeights[i];
      endIndex = i;
      if (endY <= 0) break;
    }

    // Add buffer
    startIndex = Math.max(0, startIndex - this.bufferCount);
    endIndex = Math.min(this.itemCount - 1, endIndex + this.bufferCount);

    // Create visible items
    let offsetY = 0;
    for (let i = 0; i < startIndex; i++) {
      offsetY += itemHeights[i];
    }

    let maxW = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      const item = this.itemBuilder(i);
      const size = item.measure(constraints);
      maxW = Math.max(maxW, size.width);
      this.appendChild(item);
    }

    return clampSize(constraints, maxW, viewportHeight);
  }

  placeChildren(): void {
    let offsetY = 0;
    for (let i = 0; i < this.children.length; i++) {
      const childIndex = this._getVisibleStartIndex() + i;
      // Recalculate offset
      // This is simplified; a real implementation would cache item positions
      child.x = this.x;
      child.y = this.y - this._scrollOffset + offsetY;
      offsetY += child.height;
    }
  }

  private _getVisibleStartIndex(): number {
    // Simplified: assumes uniform item height
    if (this.itemHeight > 0) {
      return Math.max(0, Math.floor(this._scrollOffset / this.itemHeight) - this.bufferCount);
    }
    return 0;
  }

  drawCommands(): DrawCommand[] {
    const cmds: DrawCommand[] = [];
    // Clip to viewport
    cmds.push({ type: 'save' });
    cmds.push({ type: 'clip', rect: { x: this.x, y: this.y, w: this.width, h: this.height } });
    cmds.push({ type: 'restore' });
    return cmds;
  }
}

export class LazyRow extends ComposeNode {
  // Similar to LazyColumn but horizontal
  // Implementation follows same pattern with horizontal scrolling
  private itemCount: number;
  private itemBuilder: (index: number) => ComposeNode;
  private _scrollOffset = 0;
  private _totalContentWidth = 0;

  constructor(key: string, options: LazyListOptions) {
    super(key);
    this.itemCount = options.itemCount;
    this.itemBuilder = options.itemBuilder;
    this._totalContentWidth = 0;

    this.handlers['wheel'] = (_x: unknown, _y: unknown, deltaX: number) => {
      this._scrollOffset = Math.max(0, this._scrollOffset + deltaX);
      this.markDirty();
    };
  }

  get scrollOffset(): number { return this._scrollOffset; }
  get totalContentWidth(): number { return this._totalContentWidth; }

  measure(constraints: Constraints): Size {
    for (const child of [...this.children]) this.removeChild(child);

    let totalW = 0;
    let maxH = 0;
    const itemWidths: number[] = [];

    for (let i = 0; i < this.itemCount; i++) {
      const item = this.itemBuilder(i);
      const size = item.measure(constraints);
      itemWidths.push(size.width);
      totalW += size.width;
      maxH = Math.max(maxH, size.height);
    }
    this._totalContentWidth = totalW;

    // Visible range (simplified)
    const viewportWidth = constraints.maxWidth;
    let startX = 0;
    let startIndex = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      if (startX + itemWidths[i] > this._scrollOffset) {
        startIndex = i;
        break;
      }
      startX += itemWidths[i];
    }

    let endX = this._scrollOffset + viewportWidth;
    let endIndex = startIndex;
    for (let i = startIndex; i < itemWidths.length; i++) {
      endX -= itemWidths[i];
      endIndex = i;
      if (endX <= 0) break;
    }

    startIndex = Math.max(0, startIndex - 2);
    endIndex = Math.min(this.itemCount - 1, endIndex + 2);

    let offsetX = 0;
    for (let i = 0; i < startIndex; i++) offsetX += itemWidths[i];
    for (let i = startIndex; i <= endIndex; i++) {
      this.appendChild(this.itemBuilder(i));
    }

    return clampSize(constraints, viewportWidth, maxH);
  }

  placeChildren(): void {
    let offsetX = 0;
    for (const child of this.children) {
      child.x = this.x - this._scrollOffset + offsetX;
      child.y = this.y;
      offsetX += child.width;
    }
  }

  drawCommands(): DrawCommand[] {
    return [
      { type: 'save' },
      { type: 'clip', rect: { x: this.x, y: this.y, w: this.width, h: this.height } },
      { type: 'restore' },
    ];
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd canvas-compose && npx vitest run packages/components/tests/lazy-list.test.ts`
Expected: PASS

- [ ] **Step 5: 更新 index.ts 导出**

```typescript
export { LazyColumn, LazyRow, type LazyListOptions } from './lazy-list.js';
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat(components): implement LazyColumn and LazyRow with virtualization"
```

---

### Task 27: Todo App 展示应用

**Files:**
- Create: `apps/showcase/index.html`
- Create: `apps/showcase/main.ts`
- Create: `apps/showcase/todo-app.ts`
- Create: `apps/showcase/vite.config.ts`

- [ ] **Step 1: 创建 Todo App**

实现一个完整的 Todo 应用，使用 Text、Button、TextInput、Checkbox、Column、Row、LazyColumn、主题系统等所有已实现的功能。包括：
- 添加 Todo（TextInput + Button）
- Todo 列表（LazyColumn + Checkbox）
- 主题切换（Button）
- 删除 Todo

- [ ] **Step 2: 启动开发服务器验证**

Run: `cd canvas-compose && npx vite --config apps/showcase/vite.config.ts`
Expected: 完整的 Todo 应用，支持增删、勾选、主题切换

- [ ] **Step 3: 运行全部测试**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: add Todo showcase app demonstrating all components"
```

---

# Phase 5: 优化与发布

**目标:** 性能优化、文档、npm 包发布准备。

**前置依赖:** Phase 4 全部完成

---

### Task 28: 性能优化

**Files:**
- Modify: `packages/renderer/src/canvas-renderer.ts`
- Modify: `packages/composer/src/composer.ts`

- [ ] **Step 1: CanvasRenderer 增量绘制优化**

修改 `CanvasRenderer`，使其只重绘 `isDrawDirty` 的节点，而非整棵树：

```typescript
// 在 canvas-renderer.ts 中:
private drawDirtyNodes(node: ComposeNode): void {
  if (node.isDrawDirty) {
    const cmds = node.drawCommands();
    if (cmds.length > 0) {
      this.drawCommands(cmds);
    }
  }
  for (const child of node.children) {
    this.drawDirtyNodes(child);
  }
}
```

- [ ] **Step 2: Composer 批量重组优化**

确保 Composer 在同一帧内多次 Signal 更新只触发一次重组。验证 RAF 批处理逻辑。

- [ ] **Step 3: 运行全部测试确认无回归**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "perf: incremental draw and batch recompose optimization"
```

---

### Task 29: 聚合包更新与导出完善

**Files:**
- Modify: `packages/canvas-compose/src/index.ts`
- Modify: `packages/canvas-compose/package.json`

- [ ] **Step 1: 更新聚合包导出所有模块**

```typescript
// packages/canvas-compose/src/index.ts
// Reactivity
export { signal, computed, effect, type Signal, type ComputedSignal, type Dispose, type Subscriber, type Unsubscribe } from '@canvas-compose/reactivity';
export { runWithSubscriber, getActiveSubscriber } from '@canvas-compose/reactivity';

// Composer
export { ComposeNode, Composer, SlotTable, type ComposableFunction, type Constraints, type Size } from '@canvas-compose/composer';
export { looseConstraints, tightConstraints, wrapContentConstraints, clampSize } from '@canvas-compose/composer';

// Renderer
export { CanvasRenderer, type DrawCommand, type DirtyRect, executeDrawCommand, measureText, layoutText } from '@canvas-compose/renderer';

// Event
export { EventDispatcher, hitTest } from '@canvas-compose/event';

// Theme
export { createTheme, lightTheme, darkTheme, type Theme } from '@canvas-compose/theme';

// Components
export { Text, Button, TextInput, Checkbox, Image, Column, Row, Box, Stack, Padding, Spacer, LazyColumn, LazyRow, Modifier } from '@canvas-compose/components';
```

- [ ] **Step 2: 更新聚合包依赖**

```json
{
  "name": "@canvas-compose/canvas-compose",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": {
    "@canvas-compose/reactivity": "workspace:*",
    "@canvas-compose/composer": "workspace:*",
    "@canvas-compose/renderer": "workspace:*",
    "@canvas-compose/event": "workspace:*",
    "@canvas-compose/theme": "workspace:*",
    "@canvas-compose/components": "workspace:*"
  }
}
```

- [ ] **Step 3: 运行全部测试**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "chore: update aggregate package exports"
```

---

### Task 30: 最终验证与发布准备

**Files:**
- 所有文件

- [ ] **Step 1: 运行全部测试**

Run: `cd canvas-compose && npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: 验证 Demo 和 Showcase 应用**

Run: `cd canvas-compose && npx vite --config apps/demo/vite.config.ts`
Run: `cd canvas-compose && npx vite --config apps/showcase/vite.config.ts`
Expected: 两个应用都正常运行

- [ ] **Step 3: 检查 TypeScript 编译**

Run: `cd canvas-compose && npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 4: 最终提交**

```bash
git add -A && git commit -m "chore: final validation for v0.1.0"
```

---

## 自审清单

### Spec 覆盖检查

| 设计文档章节 | 对应 Task |
|---|---|
| 响应式系统 (Signal/Computed/Effect) | Task 2-3 |
| Composer (组合器) | Task 4-6 |
| 布局系统 (Constraints/Measure/Place) | Task 11, 13-15 |
| Canvas 渲染层 (DrawCommand/Renderer/DirtyRect) | Task 7, 12, 16 |
| 事件系统 (HitTest/Dispatcher/Gesture) | Task 18-19 |
| 主题系统 | Task 24 |
| Text/Button/TextInput/Checkbox 组件 | Task 21-22 |
| Column/Row/Box/Stack/Padding/Spacer | Task 13-15 |
| LazyColumn/LazyRow | Task 26 |
| Image 组件 | Task 25 |
| Modifier 系统 | Task 20 |
| 错误处理 | Task 2-3, 28 |
| 测试策略 | 每个 Task 都有测试 |
| 性能优化 | Task 28 |

### 总 Task 数

| Phase | Task 数 | 核心内容 |
|---|---|---|
| Phase 1 | 10 | 骨架 + 响应式 + Composer + 最小渲染 |
| Phase 2 | 7 | 约束布局 + 文本测量 + 布局组件 + 增量绘制 |
| Phase 3 | 6 | 事件系统 + Modifier + 交互组件 |
| Phase 4 | 4 | 主题 + Image + 列表 + Todo App |
| Phase 5 | 3 | 性能优化 + 导出完善 + 最终验证 |
| **总计** | **30** | |

### 依赖关系图

```
Phase 1 (Task 1-10)
  └─→ Phase 2 (Task 11-17)
        └─→ Phase 3 (Task 18-23)
              └─→ Phase 4 (Task 24-27)
                    └─→ Phase 5 (Task 28-30)
```

每个 Phase 内部的 Task 有局部依赖，但 Phase 之间严格串行。
