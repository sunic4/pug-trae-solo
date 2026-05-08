import { composable } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Row, Box, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface HomePageProps {
  readonly items?: ReadonlyArray<readonly [string, string]>
}

function HomePage(ctx: CompositionContext, props: HomePageProps): void {
  const features = props.items ?? [
    ['声明式 UI', '纯函数调用链，尾随 lambda，零 JSX'],
    ['响应式驱动', 'Snapshot + Context 细粒度状态更新'],
    ['Canvas 渲染', 'Hybrid 混合模式，增量脏区域绘制'],
    ['自研布局', 'Column / Row 线性布局引擎'],
    ['手势系统', 'Tap / LongPress / Drag / Pinch 竞技'],
    ['Modifier 链', 'Builder + Freeze 不可变修饰符'],
  ]

  M.stack(ctx, () => {
    Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
      M.heading(ctx, 'Pug Canvas UI', 26)
      Box(
        ctx,
        Modifier.create()
          .background(AppColors.primary, 16)
          .padding(10, 6)
          .freeze(),
        'center',
        () => {
          M.caption(ctx, 'v1.0', 11, { color: AppColors.onPrimary })
        },
      )
    })
    M.vSpacer(ctx, 4)
    M.body(ctx, '移动端优先的 TypeScript Canvas UI 运行时', 13, { color: AppColors.caption })
    M.vSpacer(ctx, 24)

    M.title(ctx, '文本组件')
    M.vSpacer(ctx, 12)
    M.card(ctx, () => {
      M.title(ctx, 'Heading 标题', 20)
      M.vSpacer(ctx, 8)
      M.body(ctx, 'Body 正文 — 用于常规内容展示，支持多行文本渲染')
      M.vSpacer(ctx, 6)
      M.caption(ctx, 'Caption 说明文字 — 辅助性描述信息，字号较小颜色较浅')
    })
    M.vSpacer(ctx, 16)

    M.title(ctx, '按钮变体')
    M.vSpacer(ctx, 12)
    M.card(ctx, () => {
      M.body(ctx, 'Button 按钮样式')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => {}, 'Primary')
        M.gap(ctx, 8)
        M.successButton(ctx, () => {}, 'Success')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => {}, 'Warning')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => {}, 'Error')
      })
      M.vSpacer(ctx, 10)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.outlinedButton(ctx, () => {}, 'Outlined')
        M.gap(ctx, 8)
        M.textButton(ctx, () => {}, 'Text')
      })
    })
    M.vSpacer(ctx, 16)

    M.title(ctx, 'Surface 容器')
    M.vSpacer(ctx, 12)
    Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'start', () => {
      M.card(ctx, () => {
        M.body(ctx, 'Card 卡片')
        M.vSpacer(ctx, 4)
        M.caption(ctx, 'elevation=2')
      }, { elevation: 2, padding: 12 })
      M.gap(ctx, 10)
      M.card(ctx, () => {
        M.body(ctx, 'Card 卡片')
        M.vSpacer(ctx, 4)
        M.caption(ctx, 'elevation=4')
      }, { elevation: 4, padding: 12 })
      M.gap(ctx, 10)
      M.section(ctx, () => {
        M.body(ctx, 'Section 区域')
        M.vSpacer(ctx, 4)
        M.caption(ctx, 'elevation=0')
      })
    })
    M.vSpacer(ctx, 16)

    M.title(ctx, 'Box 对齐与修饰符')
    M.vSpacer(ctx, 12)
    M.card(ctx, () => {
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.coloredBox(ctx, AppColors.primary, { width: 80, height: 40 }, 'center', () => {
          M.caption(ctx, 'padding+bg', 11, { color: AppColors.onPrimary })
        })
        M.coloredBox(ctx, AppColors.success, { width: 80, height: 40 }, 'center', () => {
          M.caption(ctx, 'size(80,40)', 11, { color: AppColors.onPrimary })
        })
        M.coloredBox(ctx, AppColors.warning, { width: 80, height: 40 }, 'center', () => {
          M.caption(ctx, 'borderRadius', 11)
        })
      })
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        M.coloredBox(ctx, { r: 156, g: 39, b: 176, a: 1 }, { width: 72, height: 36 }, 'start', () => {
          M.caption(ctx, 'start', 11, { color: AppColors.onPrimary })
        })
        M.coloredBox(ctx, { r: 0, g: 150, b: 136, a: 1 }, { width: 72, height: 36 }, 'center', () => {
          M.caption(ctx, 'center', 11, { color: AppColors.onPrimary })
        })
        M.coloredBox(ctx, { r: 255, g: 112, b: 67, a: 1 }, { width: 72, height: 36 }, 'end', () => {
          M.caption(ctx, 'end', 11, { color: AppColors.onPrimary })
        })
      })
    })
    M.vSpacer(ctx, 16)

    M.title(ctx, '核心特性')
    M.vSpacer(ctx, 12)
    M.section(ctx, () => {
      for (let i = 0; i < features.length; i++) {
        const [title, desc] = features[i]!
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
          M.coloredBox(ctx, AppColors.primary, { width: 6, height: 6 }, 'center')
          M.gap(ctx, 10)
          Row(ctx, Modifier.create().freeze(), 'start', 'start', () => {
            M.body(ctx, title)
            M.caption(ctx, desc)
          })
        })
        if (i < features.length - 1) {
          M.vSpacer(ctx, 10)
        }
      }
    })
  })
}

export const HomePageComposable = composable<HomePageProps>(HomePage)
