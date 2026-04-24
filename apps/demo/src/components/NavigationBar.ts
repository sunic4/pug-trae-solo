import { BoxComponent, RowComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { navigateTo } from '../state/navigationState';

export function NavigationBar() {
  const theme = useTheme();

  // 导航按钮组件
  function NavButton({ text, onClick }: { text: string; onClick: () => void }) {
    return BoxComponent({
      width: 80,
      height: 40,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: 10,
      onClick,
      children: BoxComponent({
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        children: text,
      }),
    });
  }

  return BoxComponent({
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: 10,
    children: RowComponent({
      justifyContent: 'space-around',
      alignItems: 'center',
      children: [
        NavButton({ text: '首页', onClick: () => navigateTo('home') }),
        NavButton({ text: '详情', onClick: () => navigateTo('details') }),
        NavButton({ text: '设置', onClick: () => navigateTo('settings') }),
      ],
    }),
  });
}
