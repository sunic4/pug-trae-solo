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
  const { currentPage } = navigationState.value;

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
          width: '100%',
          height: '100%',
          children: renderCurrentPage(),
        }),
      ],
    }),
  });
}
