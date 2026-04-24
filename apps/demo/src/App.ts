import { BoxComponent, ColumnComponent } from '@pug/components';
import { useTheme } from './hooks/useTheme';
import { navigationState } from './state/navigationState';
import { NavigationBar } from './components/NavigationBar';
import { HomePage } from './components/pages/HomePage';
import { DetailsPage } from './components/pages/DetailsPage';
import { SettingsPage } from './components/pages/SettingsPage';

// 根组件
export function App() {
  const theme = useTheme();
  const { currentPage, isAnimating, animationProgress } = navigationState.value;

  // 渲染当前页面
  function renderCurrentPage() {
    switch (currentPage) {
      case 'home':
        return HomePage();
      case 'details':
        return DetailsPage();
      case 'settings':
        return SettingsPage();
      default:
        return HomePage();
    }
  }

  // 计算动画变换
  const animationStyle = isAnimating ? {
    opacity: 1 - animationProgress,
    transform: `translateX(${(1 - animationProgress) * 50}px)`,
  } : {};

  return BoxComponent({
    backgroundColor: theme.colors.background,
    width: '100%',
    height: '100%',
    children: ColumnComponent({
      height: '100%',
      children: [
        // 导航栏
        NavigationBar(),
        // 页面内容
        BoxComponent({
          flex: 1,
          overflow: 'hidden',
          children: BoxComponent({
            ...animationStyle,
            width: '100%',
            height: '100%',
            children: renderCurrentPage(),
          }),
        }),
      ],
    }),
  });
}
