import { BoxComponent, ColumnComponent } from '@pug/components';
import { useTheme } from './hooks/useTheme';
import { navigationState } from './state/navigationState';
import { NavigationBar } from './components/NavigationBar';
import { HomePage } from './components/pages/HomePage';
import { DetailsPage } from './components/pages/DetailsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { AppContext } from '@pug/core';

// 根组件
export function App(appContext: AppContext) {
  const theme = useTheme(appContext);
  
  // 渲染当前页面 - 直接在函数中访问 navigationState.value，确保依赖追踪正常工作
  function renderCurrentPage() {
    const { currentPage } = navigationState.value;
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
