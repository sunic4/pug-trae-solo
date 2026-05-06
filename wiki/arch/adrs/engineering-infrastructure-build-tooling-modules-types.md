---
id: "engineering-infrastructure-build-tooling-modules-types"
type: architecture
status: accepted
title: "工程化基础设施 — Vite + 单 Package + Strict TypeScript"
depends_on:
  - "../road-map/canvas-ui-runtime.md"
created: "2026-04-30 17:32"
updated: "2026-04-30 17:33"
stale: false
---

# ADR: 工程化基础设施

## 决策结果汇总

### 决策点 9: 构建与打包 → **Vite (开发) + tsup (发布)**

```json
{
  "devDependencies": {
    "vite": "^5.x",
    "tsup": "^8.x",
    "typescript": "^5.x",
    "vitest": "^2.x"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsup",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

### 决策点 10: 模块化方案 → **单 Package + 内部模块边界**

```
pug-canvas-ui/
├── src/
│   ├── core/              # 响应式核心
│   │   ├── snapshot.ts
│   │   ├── state.ts
│   │   ├── recomposer.ts
│   │   └── composable.ts
│   ├── renderer/          # Canvas 渲染
│   │   ├── draw-command.ts
│   │   ├── layer.ts
│   │   └── hybrid-renderer.ts
│   ├── layout/            # 布局引擎
│   │   ├── column-row.ts
│   │   ├── measure.ts
│   │   └── modifier-layout.ts
│   ├── input/             # 手势系统
│   │   ├── pointer-events.ts
│   │   └── gesture-recognizers.ts
│   ├── animation/         # 动画系统
│   │   ├── animatable.ts
│   │   ├── animation-spec.ts
│   │   └── transition.ts
│   ├── components/        # 组件库
│   │   ├── basic/
│   │   ├── interaction/
│   │   └── layout/
│   ├── platform/          # 平台适配
│   └── index.ts           # 公共 API 导出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tsup.config.ts
```

### 决策点 11: 类型系统策略 → **Strict Mode + 泛型重度使用**

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 可逆性评估

🟢 **完全可逆**（配置文件级变更，无代码侵入）

## 决策记录

| 时间 | 决策内容 |
|------|---------|
| 2026-04-30 17:33 | Vite+tsup, 单Package, Strict TS |
