# 代码维度速查

## 核心四维

| 维度 | L1 | L2 | L3 |
|---|---|---|---|
| 健壮性 | happy path 跑通 | 捕获预期错误 | 所有输入验证+幂等可重试 |
| 结构 | inline | functions | modules / layers |
| 性能 | careless | reasonable | budgeted |
| 可读性 | self | team | public / teaching |

## 场景维度（相关时定）

| 维度 | 档位 |
|---|---|
| 可演进性 | frozen / stable / active / experimental |
| 可观测性 | opaque / logged / traced / instrumented |
| 可测试性 | untested / testable / tested / verified |
| 安全性 | trusted / validated / sandboxed / hardened |

## 常用默认

| 场景 | 组合 |
|---|---|
| 随手代码 | L1 + inline + careless + self + experimental |
| 内部工具 | L2 + functions + reasonable + team + active + logged + testable |
| 对外库/服务 | L3 + modules + budgeted + public + stable + traced + tested + validated |

只记偏离默认的维度，默认不抄。
