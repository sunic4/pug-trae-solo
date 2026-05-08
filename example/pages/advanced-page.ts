import { composable, useState, remember } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Button, Modifier } from 'pug-canvas-ui'
import type { ReadonlyModifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface AdvancedDemoItem {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly category: 'layout' | 'animation' | 'interaction' | 'data'
  readonly complexity: 'basic' | 'intermediate' | 'advanced'
}

const ADVANCED_DEMOS: readonly AdvancedDemoItem[] = [
  { id: 1, title: '动态布局切换', description: '根据状态动态改变布局结构', category: 'layout', complexity: 'intermediate' },
  { id: 2, title: '条件渲染', description: '根据条件显示/隐藏组件', category: 'interaction', complexity: 'basic' },
  { id: 3, title: '状态联动', description: '多个状态相互影响', category: 'data', complexity: 'intermediate' },
  { id: 4, title: '计算属性', description: '基于状态派生新值', category: 'data', complexity: 'basic' },
  { id: 5, title: '动画状态机', description: '状态驱动的动画切换', category: 'animation', complexity: 'advanced' },
  { id: 6, title: '列表过滤', description: '根据条件筛选列表项', category: 'data', complexity: 'intermediate' },
  { id: 7, title: '表单验证', description: '输入验证与错误提示', category: 'interaction', complexity: 'intermediate' },
  { id: 8, title: '计数器工厂', description: '动态创建多个计数器', category: 'data', complexity: 'advanced' },
  { id: 9, title: '布局嵌套深度', description: '展示布局嵌套能力', category: 'layout', complexity: 'basic' },
  { id: 10, title: '状态持久化', description: '状态在重组间保持', category: 'data', complexity: 'intermediate' },
]

interface CounterItem {
  readonly id: number
  readonly value: number
}

function AdvancedPage(ctx: CompositionContext, _props?: Record<string, never>): void {
  const demoIndex = useState(ctx, 0)
  const showCondition = useState(ctx, true)
  const counterA = useState(ctx, 0)
  const counterB = useState(ctx, 10)
  const derivedValue = remember(ctx, () => counterA.value * 2 + counterB.value)
  const filterText = useState(ctx, '')
  const formInput = useState(ctx, '')
  const formError = useState(ctx, '')
  const nestedDepth = useState(ctx, 1)
  const counters = useState<readonly CounterItem[]>(ctx, [
    { id: 1, value: 0 },
    { id: 2, value: 0 },
    { id: 3, value: 0 },
  ])
  const animationState = useState(ctx, 'idle')

  const filteredDemos = remember(ctx, () => {
    const text = filterText.value.toLowerCase()
    if (!text) return ADVANCED_DEMOS
    return ADVANCED_DEMOS.filter(
      d => d.title.toLowerCase().includes(text) || d.description.toLowerCase().includes(text)
    )
  })

  const currentDemo = filteredDemos[demoIndex.value]

  const renderDemo = () => {
    if (!currentDemo) return

    switch (currentDemo.id) {
      case 1:
        renderDynamicLayout()
        break
      case 2:
        renderConditionalDemo()
        break
      case 3:
        renderStateLinking()
        break
      case 4:
        renderDerivedState()
        break
      case 5:
        renderAnimationStateMachine()
        break
      case 6:
        renderListFiltering()
        break
      case 7:
        renderFormValidation()
        break
      case 8:
        renderCounterFactory()
        break
      case 9:
        renderNestedLayout()
        break
      case 10:
        renderStatePersistence()
        break
    }
  }

  function renderDynamicLayout() {
    const isExpanded = useState(ctx, false)
    M.stack(ctx, () => {
      M.body(ctx, '动态布局切换演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '点击按钮切换布局形态')
      M.vSpacer(ctx, 12)
      M.primaryButton(ctx, () => { isExpanded.value = !isExpanded.value }, isExpanded.value ? '收起' : '展开')
      M.vSpacer(ctx, 12)
      if (isExpanded.value) {
        Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
          for (let i = 0; i < 3; i++) {
            M.coloredBox(ctx, AppColors.primary, { width: 100, height: 30 }, 'center', () => {
              M.caption(ctx, `项目 ${i + 1}`, 11, { color: AppColors.onPrimary })
            })
            if (i < 2) M.vSpacer(ctx, 8)
          }
        })
      } else {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.coloredBox(ctx, AppColors.primary, { width: 60, height: 30 }, 'center', () => {
            M.caption(ctx, 'A', 11, { color: AppColors.onPrimary })
          })
          M.coloredBox(ctx, AppColors.success, { width: 60, height: 30 }, 'center', () => {
            M.caption(ctx, 'B', 11, { color: AppColors.onPrimary })
          })
          M.coloredBox(ctx, AppColors.warning, { width: 60, height: 30 }, 'center', () => {
            M.caption(ctx, 'C', 11, { color: AppColors.onPrimary })
          })
        })
      }
    })
  }

  function renderConditionalDemo() {
    M.stack(ctx, () => {
      M.body(ctx, '条件渲染演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '点击切换显示/隐藏状态')
      M.vSpacer(ctx, 12)
      M.primaryButton(ctx, () => { showCondition.value = !showCondition.value }, showCondition.value ? '隐藏内容' : '显示内容')
      M.vSpacer(ctx, 12)
      if (showCondition.value) {
        M.section(ctx, () => {
          M.body(ctx, '这段内容是条件渲染的')
          M.vSpacer(ctx, 4)
          M.caption(ctx, '当前状态: 显示')
        })
      } else {
        M.section(ctx, () => {
          M.caption(ctx, '内容已隐藏')
        })
      }
    })
  }

  function renderStateLinking() {
    M.stack(ctx, () => {
      M.body(ctx, '状态联动演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '计数器 A + B 的和会影响派生值')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.caption(ctx, '计数器 A')
          M.vSpacer(ctx, 4)
          M.coloredBox(ctx, AppColors.primary, { width: 60, height: 60 }, 'center', () => {
            M.body(ctx, `${counterA.value}`, 20, { color: AppColors.onPrimary })
          })
        })
        Column(ctx, Modifier.create().freeze(), 'center', 'center', () => {
          M.caption(ctx, '计数器 B')
          M.vSpacer(ctx, 4)
          M.coloredBox(ctx, AppColors.success, { width: 60, height: 60 }, 'center', () => {
            M.body(ctx, `${counterB.value}`, 20, { color: AppColors.onPrimary })
          })
        })
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { counterA.value += 1 }, 'A+')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { counterA.value -= 1 }, 'A-')
        M.gap(ctx, 12)
        M.successButton(ctx, () => { counterB.value += 1 }, 'B+')
        M.gap(ctx, 8)
        M.successButton(ctx, () => { counterB.value -= 1 }, 'B-')
      })
      M.vSpacer(ctx, 12)
      M.section(ctx, () => {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, 'A + B =')
          M.body(ctx, `${counterA.value + counterB.value}`, 18, { color: AppColors.primary })
        })
      })
    })
  }

  function renderDerivedState() {
    M.stack(ctx, () => {
      M.body(ctx, '计算属性演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '派生值: A * 2 + B')
      M.vSpacer(ctx, 12)
      M.section(ctx, () => {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, '计数器 A')
          M.body(ctx, `${counterA.value}`)
        })
        M.vSpacer(ctx, 4)
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, '计数器 B')
          M.body(ctx, `${counterB.value}`)
        })
        M.vSpacer(ctx, 4)
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.body(ctx, '派生值 (A*2+B)')
          M.body(ctx, `${derivedValue}`, 18, { color: AppColors.primary })
        })
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { counterA.value += 1 }, 'A+')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { counterB.value += 1 }, 'B+')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, '派生值会随着 A 或 B 的变化自动更新')
    })
  }

  function renderAnimationStateMachine() {
    const animationStates = ['idle', 'loading', 'success', 'error'] as const
    type AnimationState = typeof animationStates[number]
    const currentIndex = animationStates.indexOf(animationState.value as AnimationState)

    const stateColors: Record<AnimationState, typeof AppColors.primary> = {
      idle: AppColors.caption,
      loading: AppColors.primary,
      success: AppColors.success,
      error: AppColors.error,
    }

    const stateLabels: Record<AnimationState, string> = {
      idle: '空闲',
      loading: '加载中',
      success: '成功',
      error: '错误',
    }

    const currentState = animationState.value as AnimationState

    M.stack(ctx, () => {
      M.body(ctx, '动画状态机演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '状态: ' + stateLabels[currentState])
      M.vSpacer(ctx, 16)
      Box(
        ctx,
        Modifier.create()
          .layoutSize(100, 100)
          .background(stateColors[currentState], 12)
          .freeze(),
        'center',
        () => {},
      )
      M.vSpacer(ctx, 16)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        for (let i = 0; i < animationStates.length; i++) {
          const state = animationStates[i]!
          M.primaryButton(
            ctx,
            () => { animationState.value = state },
            stateLabels[state],
          )
          if (i < animationStates.length - 1) M.gap(ctx, 8)
        }
      })
      M.vSpacer(ctx, 12)
      M.caption(ctx, `当前状态索引: ${currentIndex}`)
    })
  }

  function renderListFiltering() {
    M.stack(ctx, () => {
      M.body(ctx, '列表过滤演示')
      M.vSpacer(ctx, 8)
      TextField(
        ctx,
        filterText.value,
        (v) => { filterText.value = v },
        Modifier.create().fillMaxWidth().freeze(),
        '搜索演示...',
      )
      M.vSpacer(ctx, 12)
      M.caption(ctx, `找到 ${filteredDemos.length} 个演示`)
      M.vSpacer(ctx, 8)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        for (let i = 0; i < filteredDemos.length; i++) {
          const demo = filteredDemos[i]!
          M.coloredBox(ctx, AppColors.sectionBg, { width: 0, height: 0 }, 'start', () => {
            M.body(ctx, demo.title, 14)
            M.caption(ctx, demo.description, 12)
          })
          if (i < filteredDemos.length - 1) M.vSpacer(ctx, 8)
        }
      })
    })
  }

  function renderFormValidation() {
    const validate = () => {
      if (formInput.value.length < 3) {
        formError.value = '输入至少需要 3 个字符'
      } else if (!/[a-zA-Z]/.test(formInput.value)) {
        formError.value = '输入必须包含字母'
      } else {
        formError.value = ''
      }
    }

    M.stack(ctx, () => {
      M.body(ctx, '表单验证演示')
      M.vSpacer(ctx, 8)
      TextField(
        ctx,
        formInput.value,
        (v) => { formInput.value = v },
        Modifier.create().fillMaxWidth().freeze(),
        '请输入内容...',
      )
      M.vSpacer(ctx, 8)
      if (formError.value) {
        M.caption(ctx, formError.value, 12, { color: AppColors.error })
      } else {
        M.caption(ctx, '输入验证通过', 12, { color: AppColors.success })
      }
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, validate, '验证')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { formInput.value = ''; formError.value = '' }, '重置')
      })
    })
  }

  function renderCounterFactory() {
    M.stack(ctx, () => {
      M.body(ctx, '计数器工厂演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '动态创建的多个独立计数器')
      M.vSpacer(ctx, 12)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        for (let i = 0; i < counters.value.length; i++) {
          const counter = counters.value[i]!
          Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
            M.body(ctx, `计数器 #${counter.id}`)
            Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
              M.primaryButton(ctx, () => {
                counters.value = counters.value.map(c =>
                  c.id === counter.id ? { ...c, value: c.value - 1 } : c
                )
              }, '-')
              M.gap(ctx, 8)
              M.coloredBox(ctx, AppColors.sectionBg, { width: 40, height: 32 }, 'center', () => {
                M.body(ctx, `${counter.value}`)
              })
              M.gap(ctx, 8)
              M.primaryButton(ctx, () => {
                counters.value = counters.value.map(c =>
                  c.id === counter.id ? { ...c, value: c.value + 1 } : c
                )
              }, '+')
            })
          })
          if (i < counters.value.length - 1) M.vSpacer(ctx, 8)
        }
      })
      M.vSpacer(ctx, 12)
      const totalValue = counters.value.reduce((sum, c) => sum + c.value, 0)
      M.section(ctx, () => {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.body(ctx, '总计')
          M.body(ctx, `${totalValue}`, 18, { color: AppColors.primary })
        })
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.successButton(ctx, () => {
          const newId = Math.max(...counters.value.map(c => c.id)) + 1
          counters.value = [...counters.value, { id: newId, value: 0 }]
        }, '添加计数器')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => {
          counters.value = counters.value.slice(0, -1)
        }, '移除')
      })
    })
  }

  function renderNestedLayout() {
    const maxDepth = 5

    M.stack(ctx, () => {
      M.body(ctx, '布局嵌套深度演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, `当前嵌套深度: ${nestedDepth.value}`)
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { nestedDepth.value = Math.max(1, nestedDepth.value - 1) }, '减少深度')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { nestedDepth.value = Math.min(maxDepth, nestedDepth.value + 1) }, '增加深度')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { nestedDepth.value = 1 }, '重置')
      })
      M.vSpacer(ctx, 16)

      const renderDepth = (current: number, color: { r: number; g: number; b: number; a: number }): void => {
        const size = Math.max(40, 100 - current * 10)
        M.coloredBox(ctx, color, { width: size, height: size }, 'center', () => {
          M.caption(ctx, `深度 ${current}`, 10)
          if (current < nestedDepth.value) {
            const nextColor = current % 2 === 0 ? AppColors.primary : AppColors.success
            renderDepth(current + 1, nextColor)
          }
        })
      }

      renderDepth(1, AppColors.primary)
    })
  }

  function renderStatePersistence() {
    const resetKey = useState(ctx, 0)

    M.stack(ctx, () => {
      M.body(ctx, '状态持久化演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '点击重置会触发重组，但 remember 的值会保持')
      M.vSpacer(ctx, 12)
      M.section(ctx, () => {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
          M.caption(ctx, '重置计数器')
          M.body(ctx, `${counterA.value}`, 18, { color: AppColors.primary })
        })
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { counterA.value += 1 }, '+1')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { counterA.value = 0 }, '清零')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { resetKey.value += 1 }, '触发重组')
      })
      M.vSpacer(ctx, 12)
      M.caption(ctx, `重组次数: ${resetKey.value}`)
      M.vSpacer(ctx, 8)
      M.caption(ctx, '计数器值在重组后保持不变')
    })
  }

  function TextField(
    ctx: CompositionContext,
    value: string,
    onChange: (v: string) => void,
    modifier: ReadonlyModifier,
    placeholder: string,
  ): void {
    Box(
      ctx,
      Modifier.extendFrom(modifier)
        .background(AppColors.sectionBg, 8)
        .padding(12, 8)
        .freeze(),
      'start',
      () => {
        if (value.length === 0) {
          M.caption(ctx, placeholder, 14, { color: AppColors.caption })
        } else {
          M.body(ctx, value, 14)
        }
      },
    )
  }

  M.stack(ctx, () => {
    M.title(ctx, '高级特性演示', 24)
    M.caption(ctx, '深入探索框架能力')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '选择演示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, `${filteredDemos.length} 个可用演示`)
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        for (let i = 0; i < Math.min(5, filteredDemos.length); i++) {
          const isSelected = i === demoIndex.value
          Box(
            ctx,
            Modifier.create()
              .layoutSize(40, 32)
              .background(isSelected ? AppColors.primary : AppColors.sectionBg, 4)
              .freeze(),
            'center',
            () => {
              M.caption(ctx, `${i + 1}`, 12, { color: isSelected ? AppColors.onPrimary : AppColors.onSurface })
            },
          )
          M.gap(ctx, 4)
        }
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.warningButton(ctx, () => { demoIndex.value = Math.max(0, demoIndex.value - 1) }, '上一个')
        M.gap(ctx, 8)
        M.primaryButton(ctx, () => { demoIndex.value = Math.min(filteredDemos.length - 1, demoIndex.value + 1) }, '下一个')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, currentDemo?.title ?? '无演示', 16)
      renderDemo()
    })

    M.vSpacer(ctx, 16)
    M.section(ctx, () => {
      M.body(ctx, '高级特性说明')
      M.vSpacer(ctx, 6)
      M.caption(ctx, '这些演示展示了 Pug Canvas UI 的高级用法，包括派生状态、状态联动、条件渲染等模式。')
    })
  })
}

export const AdvancedPageComposable = composable<Record<string, never>>(AdvancedPage)
