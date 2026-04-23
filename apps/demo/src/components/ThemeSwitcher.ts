import { TextComponent, ButtonComponent, BoxComponent } from '@pug/components';
import { useTheme, useAppThemeSwitcher } from '../hooks/useTheme';
import { isDarkTheme } from '../state/appState';

// 主题切换组件
export function ThemeSwitcher() {
  const theme = useTheme();
  const toggleTheme = useAppThemeSwitcher();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Theme',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      ButtonComponent({
        text: isDarkTheme.value ? 'Switch to Light Theme' : 'Switch to Dark Theme',
        variant: 'outline',
        onClick: toggleTheme,
      }),
    ],
  });
}
