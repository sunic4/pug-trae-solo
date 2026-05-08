import { PrimaryColor, OnPrimaryColor, SurfaceColor, BackgroundColor, OnBackgroundColor, OnSurfaceColor, ErrorColor, SuccessColor, WarningColor, DividerColor, CardBackgroundColor, SectionBackgroundColor, TrackColor, CaptionColor } from '@pug-canvas-ui/theme'

const AppColors = {
  primary: PrimaryColor,
  onPrimary: OnPrimaryColor,
  surface: SurfaceColor,
  background: BackgroundColor,
  onBackground: OnBackgroundColor,
  onSurface: OnSurfaceColor,
  error: ErrorColor,
  success: SuccessColor,
  warning: WarningColor,
  divider: DividerColor,
  cardBg: CardBackgroundColor,
  sectionBg: SectionBackgroundColor,
  track: TrackColor,
  caption: CaptionColor,
} as const

export const TAB_LABELS = ['首页', '交互', '布局', '动画', '反馈', '列表', '组件', '手势', '导航', '高级'] as const

export type TabLabel = typeof TAB_LABELS[number]

export const TAB_COUNT = TAB_LABELS.length

export { AppColors }
