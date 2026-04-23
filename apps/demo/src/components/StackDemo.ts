import { TextComponent, BoxComponent, StackComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 堆栈示例组件
export function StackDemo() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Stack Component',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      StackComponent({
        alignment: 'center',
        width: 200,
        height: 100,
        children: [
          BoxComponent({
            backgroundColor: theme.colors.primary,
            width: 100,
            height: 100,
            borderRadius: 8,
          }),
          BoxComponent({
            backgroundColor: theme.colors.secondary,
            width: 80,
            height: 80,
            borderRadius: 8,
          }),
          BoxComponent({
            backgroundColor: theme.colors.error,
            width: 60,
            height: 60,
            borderRadius: 8,
          }),
        ],
      }),
    ],
  });
}
