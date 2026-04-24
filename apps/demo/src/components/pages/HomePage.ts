import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { navigateTo } from '../../state/navigationState';
import { Counter } from '../Counter';

export function HomePage() {
  const theme = useTheme();

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      alignItems: 'center',
      children: [
        TextComponent({
          text: '首页',
          fontSize: 24,
          fontWeight: 600,
          color: theme.colors.text,
          marginBottom: 20,
        }),
        TextComponent({
          text: '欢迎来到 Canvas Compose 演示应用',
          fontSize: 16,
          color: theme.colors.text,
          marginBottom: 30,
        }),
        Counter(),
        ButtonComponent({
          text: '前往详情页',
          onClick: () => navigateTo('details', { message: 'Hello from Home Page!' }),
          marginTop: 30,
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
      ],
    }),
  });
}
