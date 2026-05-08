import { composable, useState } from 'pug-canvas-ui'
import type { CompositionContext } from 'pug-canvas-ui'
import { Row, Column, Modifier } from 'pug-canvas-ui'
import { M, AppColors } from '../theme/app-theme'

interface ComponentsPageProps {
  readonly showSnackbar?: (message: string) => void
}

function ComponentsPage(ctx: CompositionContext, _props?: ComponentsPageProps): void {
  const selectedChip = useState<string | null>(ctx, null)
  const switchState = useState(ctx, false)

  M.stack(ctx, () => {
    M.title(ctx, '组件库扩展')
    M.caption(ctx, 'Divider / Chip / Avatar / ListTile / Badge')
    M.vSpacer(ctx, 16)

    M.card(ctx, () => {
      M.body(ctx, 'Divider 分隔线')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '用于分割内容区域')
      M.vSpacer(ctx, 8)
      M.divider(ctx, AppColors.divider, 1)
      M.vSpacer(ctx, 8)
      M.body(ctx, '分隔线下方的内容')
      M.vSpacer(ctx, 8)
      M.divider(ctx, AppColors.primary, 2)
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.divider(ctx, AppColors.success, 3)
        M.gap(ctx, 8)
        M.caption(ctx, '彩色分隔线')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Chip 标签')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '点击标签筛选内容')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.chip(ctx, '全部', AppColors.primary)
        M.gap(ctx, 8)
        M.chip(ctx, '已完成', AppColors.success)
        M.gap(ctx, 8)
        M.chip(ctx, '进行中', AppColors.warning)
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.chip(ctx, '待处理', AppColors.error)
        M.gap(ctx, 8)
        M.chip(ctx, '草稿', AppColors.caption)
      })
      M.vSpacer(ctx, 10)
      if (selectedChip.value) {
        Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
          M.caption(ctx, '已选择:')
          M.gap(ctx, 8)
          M.chip(ctx, selectedChip.value ?? '', AppColors.primary)
        })
      }
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'Avatar 头像')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '用户标识展示')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        M.avatar(ctx, 'A', AppColors.primary, 48)
        M.gap(ctx, 12)
        M.avatar(ctx, 'B', AppColors.success, 48)
        M.gap(ctx, 12)
        M.avatar(ctx, 'C', AppColors.warning, 48)
        M.gap(ctx, 12)
        M.avatar(ctx, 'D', AppColors.error, 48)
      })
      M.vSpacer(ctx, 12)
      M.caption(ctx, '不同尺寸')
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'center', 'center', () => {
        M.avatar(ctx, 'S', AppColors.primary, 24)
        M.gap(ctx, 8)
        M.avatar(ctx, 'M', AppColors.primary, 32)
        M.gap(ctx, 8)
        M.avatar(ctx, 'L', AppColors.primary, 48)
        M.gap(ctx, 8)
        M.avatar(ctx, 'XL', AppColors.primary, 64)
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'StatusBadge 状态徽章')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '用于显示状态信息')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.statusBadge(ctx, '在线', 'success')
        M.gap(ctx, 8)
        M.statusBadge(ctx, '离线', 'error')
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.statusBadge(ctx, '待处理', 'warning')
        M.gap(ctx, 8)
        M.statusBadge(ctx, '新消息', 'info')
      })
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'ListTile 列表项')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '用于列表/菜单展示')
      M.vSpacer(ctx, 10)
      M.listTile(
        ctx,
        '用户设置',
        '管理账户和偏好设置',
        () => M.avatar(ctx, 'U', AppColors.primary, 36),
        () => M.caption(ctx, '>'),
      )
      M.vSpacer(ctx, 6)
      M.divider(ctx, AppColors.divider)
      M.vSpacer(ctx, 6)
      M.listTile(
        ctx,
        '通知中心',
        '3 条新消息',
        () => M.avatar(ctx, 'N', AppColors.warning, 36),
        () => M.caption(ctx, '>'),
      )
      M.vSpacer(ctx, 6)
      M.divider(ctx, AppColors.divider)
      M.vSpacer(ctx, 6)
      M.listTile(
        ctx,
        '数据统计',
        '查看分析报告',
        () => M.avatar(ctx, 'D', AppColors.success, 36),
        () => M.caption(ctx, '>'),
      )
    })
    M.vSpacer(ctx, 12)

    M.card(ctx, () => {
      M.body(ctx, 'ProgressBar 进度条')
      M.vSpacer(ctx, 10)
      M.caption(ctx, '加载进度可视化')
      M.vSpacer(ctx, 12)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.caption(ctx, '上传中')
        M.gap(ctx, 8)
        M.progressBar(ctx, 0.75, AppColors.primary)
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.caption(ctx, '已完成')
        M.gap(ctx, 8)
        M.progressBar(ctx, 1.0, AppColors.success)
      })
      M.vSpacer(ctx, 8)
      Row(ctx, Modifier.create().fillMaxWidth().freeze(), 'start', 'center', () => {
        M.caption(ctx, '下载中')
        M.gap(ctx, 8)
        M.progressBar(ctx, 0.45, AppColors.warning)
      })
    })
    M.vSpacer(ctx, 16)

    M.section(ctx, () => {
      M.body(ctx, '组件使用提示')
      M.vSpacer(ctx, 8)
      M.caption(ctx, '这些组件基于底层布局系统构建，展示了组合式 UI 的灵活性。所有组件均支持响应式状态管理和交互响应。')
    })
  })
}

export const ComponentsPageComposable = composable<ComponentsPageProps>(ComponentsPage)
