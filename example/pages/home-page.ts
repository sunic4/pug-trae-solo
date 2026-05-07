import { composable } from './index'
import type { CompositionContext } from './index'
import { Column, Row, Box, Modifier, M, AppColors } from './index'

function HomePage(ctx: CompositionContext, _props?: Record<string, never>): void {
  Column(ctx, Modifier.create().padding(16).fillMaxSize().freeze(), 'start', 'start', () => {
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
    M.spacer(ctx, 4)
    M.body(ctx, '移动端优先的 TypeScript Canvas UI 运行时', 13, { color: { r: 117, g: 117, b: 117, a: 1 } })
    M.spacer(ctx, 24)

    M.heading(ctx, '文本组件', 18)
    M.spacer(ctx, 12)
    M.card(ctx, () => {
      M.heading(ctx, 'Heading 标题', 20)
      M.spacer(ctx, 8)
      M.body(ctx, 'Body 正文 — 用于常规内容展示，支持多行文本渲染', 14)
      M.spacer(ctx, 6)
      M.caption(ctx, 'Caption 说明文字 — 辅助性描述信息，字号较小颜色较浅', 12)
    }, { elevation: 2, padding: 16 })
    M.spacer(ctx, 16)

    M.heading(ctx, '按钮变体', 18)
    M.spacer(ctx, 12)
    M.card(ctx, () => {
      M.body(ctx, 'Button 按钮样式', 14)
      M.spacer(ctx, 12)
      Row(ctx, Modifier.create().freeze(), 'center', 'center', () => {
        M.primaryButton(ctx, () => {}, 'Primary')
        M.gap(ctx, 8)
        M.successButton(ctx, () => {}, 'Success')
        M.gap(ctx, 8)
        M.warningButton(ctx, () => {}, 'Warning')
        M.gap(ctx, 8)
        M.errorButton(ctx, () => {}, 'Error')
      })
    }, { elevation: 2, padding: 16 })
    M.spacer(ctx, 16)

    M.heading(ctx, 'Surface 容器', 18)
    M.spacer(ctx, 12)
    Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'start', () => {
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.card(ctx, () => {
          M.body(ctx, 'Card 卡片', 13)
          M.spacer(ctx, 4)
          M.caption(ctx, 'elevation=2')
        }, { elevation: 2, padding: 12 })
      })
      M.gap(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.card(ctx, () => {
          M.body(ctx, 'Card 卡片', 13)
          M.spacer(ctx, 4)
          M.caption(ctx, 'elevation=4')
        }, { elevation: 4, padding: 12 })
      })
      M.gap(ctx, 10)
      Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
        M.section(ctx, () => {
          M.body(ctx, 'Section 区域', 13)
          M.spacer(ctx, 4)
          M.caption(ctx, 'elevation=0')
        })
      })
    })
    M.spacer(ctx, 16)

    M.heading(ctx, 'Box 对齐与修饰符', 18)
    M.spacer(ctx, 12)
    M.card(ctx, () => {
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.primary, 8)
            .layoutSize(80, 40)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'padding+bg', 11, { color: AppColors.onPrimary })
          },
        )
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.success, 8)
            .layoutSize(80, 40)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'size(80,40)', 11, { color: AppColors.onPrimary })
          },
        )
        Box(
          ctx,
          Modifier.create()
            .background(AppColors.warning, 8)
            .layoutSize(80, 40)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'borderRadius', 11)
          },
        )
      })
      M.spacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'spaceBetween', 'center', () => {
        Box(
          ctx,
          Modifier.create()
            .background({ r: 156, g: 39, b: 176, a: 1 }, 6)
            .layoutSize(72, 36)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'start', 11, { color: AppColors.onPrimary })
          },
        )
        Box(
          ctx,
          Modifier.create()
            .background({ r: 0, g: 150, b: 136, a: 1 }, 6)
            .layoutSize(72, 36)
            .freeze(),
          'center',
          () => {
            M.caption(ctx, 'center', 11, { color: AppColors.onPrimary })
          },
        )
        Box(
          ctx,
          Modifier.create()
            .background({ r: 255, g: 112, b: 67, a: 1 }, 6)
            .layoutSize(72, 36)
            .freeze(),
          'end',
          () => {
            M.caption(ctx, 'end', 11, { color: AppColors.onPrimary })
          },
        )
      })
    }, { elevation: 2, padding: 16 })
    M.spacer(ctx, 16)

    M.heading(ctx, '核心特性', 18)
    M.spacer(ctx, 12)
    M.section(ctx, () => {
      const features = [
        ['声明式 UI', '纯函数调用链，尾随 lambda，零 JSX'],
        ['响应式驱动', 'Snapshot + Context 细粒度状态更新'],
        ['Canvas 渲染', 'Hybrid 混合模式，增量脏区域绘制'],
        ['自研布局', 'Column / Row 线性布局引擎'],
        ['手势系统', 'Tap / LongPress / Drag / Pinch 竞技'],
        ['Modifier 链', 'Builder + Freeze 不可变修饰符'],
      ]
      for (let i = 0; i < features.length; i++) {
        const [title, desc] = features[i] as [string, string]
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
          Box(
            ctx,
            Modifier.create()
              .background(AppColors.primary, 10)
              .layoutSize(6, 6)
              .freeze(),
            'center',
          )
          M.gap(ctx, 10)
          Column(ctx, Modifier.create().freeze(), 'start', 'start', () => {
            M.body(ctx, title, 13)
            M.caption(ctx, desc)
          })
        })
        if (i < features.length - 1) {
          M.spacer(ctx, 10)
        }
      }
    })
  })
}

export const HomePageComposable = composable<Record<string, never>>(HomePage)
