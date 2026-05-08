interface Color {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly a: number
}

const PrimaryColor: Color = { r: 33, g: 150, b: 243, a: 1 }
const OnPrimaryColor: Color = { r: 255, g: 255, b: 255, a: 1 }
const SurfaceColor: Color = { r: 255, g: 255, b: 255, a: 1 }
const BackgroundColor: Color = { r: 245, g: 245, b: 245, a: 1 }
const OnBackgroundColor: Color = { r: 33, g: 33, b: 33, a: 1 }
const OnSurfaceColor: Color = { r: 33, g: 33, b: 33, a: 1 }
const ErrorColor: Color = { r: 244, g: 67, b: 54, a: 1 }
const SuccessColor: Color = { r: 76, g: 175, b: 80, a: 1 }
const WarningColor: Color = { r: 255, g: 152, b: 0, a: 1 }
const DividerColor: Color = { r: 224, g: 224, b: 224, a: 1 }
const CardBackgroundColor: Color = { r: 255, g: 255, b: 255, a: 1 }
const SectionBackgroundColor: Color = { r: 250, g: 250, b: 250, a: 1 }
const TrackColor: Color = { r: 224, g: 224, b: 224, a: 1 }
const CaptionColor: Color = { r: 117, g: 117, b: 117, a: 1 }

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

export {
  PrimaryColor,
  OnPrimaryColor,
  SurfaceColor,
  BackgroundColor,
  OnBackgroundColor,
  OnSurfaceColor,
  ErrorColor,
  SuccessColor,
  WarningColor,
  DividerColor,
  CardBackgroundColor,
  SectionBackgroundColor,
  TrackColor,
  CaptionColor,
  AppColors,
}
