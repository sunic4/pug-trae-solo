import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Column, Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface QuickStartPageProps {
  readonly onShowSnackbar?: (message: string) => void
}

const QUICK_START_STEPS = [
  {
    title: '创建状态',
    code: 'const count = useState(ctx, 0)',
    desc: 'useState 创建响应式状态',
    color: AppColors.primary,
  },
  {
    title: '绑定到 UI',
    code: 'Text(ctx, `${count.value}`)',
    desc: '状态变化自动触发重绘',
    color: AppColors.success,
  },
  {
    title: '响应交互',
    code: 'Button(ctx, () => count.value++)',
    desc: '事件处理函数修改状态',
    color: AppColors.warning,
  },
  {
    title: '组合布局',
    code: 'Column/Room/Box',
    desc: '灵活的布局容器组合',
    color: AppColors.error,
  },
]

function QuickStartPage(ctx: CompositionContext, _props?: QuickStartPageProps): void {
  const exampleCount = useState(ctx, 0)
  const exampleBool = useState(ctx, false)
  const exampleText = useState(ctx, '')

  M.stack(ctx, () => {
    M.title(ctx, '快速入门', 24)
    M.caption(ctx, '5 分钟学会 Pug Canvas UI')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, '基础示例：计数器')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { exampleCount.value -= 1 }, '-')
        M.gap(ctx, 16)
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.primary)
            .padding(24, 12)
            .freeze(),
          'center',
          () => {
            M.body(ctx, `${exampleCount.value}`, 32, { color: AppColors.onPrimary })
          },
        )
        M.gap(ctx, 16)
        M.successButton(ctx, () => { exampleCount.value += 1 }, '+')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, `计数值: ${exampleCount.value} | 状态: ${exampleCount.value >= 0 ? '正数' : '负数'}`)
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '基础示例：开关')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        Row(ctx, Modifier.create().freeze(), 'start', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(48, 24)
              .background(exampleBool.value ? AppColors.success : AppColors.divider, 12)
              .freeze(),
            'center',
            () => {
              Box(
                ctx,
                Modifier.create()
                  .layoutSize(20, 20)
                  .background(AppColors.onPrimary)
                  .offset(exampleBool.value ? 24 : 4, 2)
                  .freeze(),
                'center',
              )
            },
          )
          M.gap(ctx, 12)
          M.body(ctx, exampleBool.value ? '已开启' : '已关闭')
        })
        M.primaryButton(ctx, () => { exampleBool.value = !exampleBool.value }, exampleBool.value ? '关闭' : '开启')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '基础示例：文本输入')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.body(ctx, '输入:')
        M.gap(ctx, 8)
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.sectionBg)
            .padding(12, 8)
            .freeze(),
          'start',
          () => {
            if (exampleText.value.length === 0) {
              M.caption(ctx, '在此输入...', 14, { color: AppColors.caption })
            } else {
              M.body(ctx, exampleText.value, 14)
            }
          },
        )
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => { exampleText.value = '你好，Pug!' }, '你好')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => { exampleText.value = 'Hello World!' }, '英文')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => { exampleText.value = '' }, '清空')
      })
      M.vSpacer(ctx, 8)
      M.caption(ctx, `字符数: ${exampleText.value.length}`)
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, '核心概念')
      M.vSpacer(ctx, 10)
      for (let i = 0; i < QUICK_START_STEPS.length; i++) {
        const step = QUICK_START_STEPS[i]!
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .layoutSize(24, 24)
              .background(step.color, 12)
              .freeze(),
            'center',
            () => {
              M.caption(ctx, `${i + 1}`, 12, { color: AppColors.onPrimary })
            },
          )
          M.gap(ctx, 12)
          Column(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'start', () => {
            M.body(ctx, step.title, 14)
            M.caption(ctx, step.code, 11, { color: AppColors.primary })
            M.caption(ctx, step.desc, 11)
          })
        })
        if (i < QUICK_START_STEPS.length - 1) {
          M.vSpacer(ctx, 8)
        }
      }
    })
    M.vSpacer(ctx, 12)

    M.section(ctx, () => {
      M.body(ctx, '下一步')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '探索更多组件和功能：布局系统、手势识别、动画效果、导航管理等。')
    })
  })
}

export const QuickStartPageComposable = composable<QuickStartPageProps>(QuickStartPage)
