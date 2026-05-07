import { composable } from '@/core/composable'
import type { ComposerContext, ComposableNode } from '@/core/types'
import { Column } from '@/components/layout/column'
import { Row } from '@/components/layout/row'
import { M } from '../theme/app-theme'

function HomePage(_props: {}, ctx: ComposerContext): ComposableNode | null {
  return Column(M.mod().padding(16).fillMaxSize(), 'start', 'start', [
    M.heading('Pug Canvas UI', 28),
    M.spacer(12),
    M.body('组件库演示应用', 16),
    M.spacer(32),
    M.heading('基础组件', 20),
    M.spacer(16),
    M.card([
      M.body('Surface 组件', 16),
      M.spacer(8),
      M.caption('用于展示内容卡片，支持圆角、阴影和自定义背景色'),
    ]),
    M.spacer(20),
    M.card([
      Row(M.mod().fillMaxWidth(), 'center', 'center', [
        M.body('Button →', 14),
        M.gap(16),
        M.primaryButton(() => {}, '点击'),
      ]),
    ]),
    M.spacer(20),
    M.section([
      M.heading('特性一览', 16),
      M.spacer(12),
      M.caption('✓ 纯函数声明式 UI'),
      M.spacer(8),
      M.caption('✓ 响应式状态驱动'),
      M.spacer(8),
      M.caption('✓ Canvas 2D 零 DOM 渲染'),
      M.spacer(8),
      M.caption('✓ 自研布局引擎'),
      M.spacer(8),
      M.caption('✓ 手势识别系统'),
    ]),
  ])
}

export const HomePageComposable = composable<{}>(HomePage)
