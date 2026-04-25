# feature-design 模板

## frontmatter

```yaml
---
doc_type: feature-design
feature: 2026-04-12-{slug}
requirement: {slug}          # 可选
roadmap: {slug}              # 可选，从 roadmap 起头时填
roadmap_item: {slug}         # 可选，对应 items.yaml 条目
status: draft
summary: 一句话
tags: [tag1, tag2]
---
```

## 正文节锚点

- `## 0. 术语约定` — 术语/定义/防冲突结论（必须 grep）
- `## 1. 决策与约束` — 需求摘要、挂载点清单、复杂度档位(只记偏离)、关键决策、前置依赖、主流程
- `## 2. 接口契约` — 示例优先，只写新增/变更，标来源文件路径
- `## 3. 实现提示` — 目标文件评估、改动计划、推进顺序、测试设计
- `## 4. 与架构文档的关系` — 名词/动词骨架/跨层纪律要提炼进哪份 architecture doc

## checklist.yaml 格式

```yaml
feature: {目录名}
created: YYYY-MM-DD

steps:
  - action: "{步骤名}：{改动描述}"
    exit_signal: "{退出信号}"
    status: pending

checks:
  - item: "{检查项}"
    source: 接口契约 | 范围守护 | 测试约束
    status: pending
```

steps 条目数与第 3 节推进顺序一致。checks 至少覆盖明确不做、关键接口、测试约束。
