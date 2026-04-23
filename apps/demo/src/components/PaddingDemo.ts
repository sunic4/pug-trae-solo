import { TextComponent, BoxComponent, PaddingComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 内边距示例组件
export function PaddingDemo() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Padding Component',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      PaddingComponent({
        padding: 20,
        child: BoxComponent({
          backgroundColor: theme.colors.primary,
          width: 100,
          height: 100,
          borderRadius: 8,
        }),
      }),
    ],
  });
}
