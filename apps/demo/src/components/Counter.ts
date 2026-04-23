import { TextComponent, ButtonComponent, BoxComponent, ContainerComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { count } from '../state/appState';

// 计数器组件
export function Counter() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: `Count: ${count.value}`,
        fontSize: 18,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 10,
      }),
      ContainerComponent({
        direction: 'row',
        justify: 'space-between',
        children: [
          ButtonComponent({
            text: 'Increment',
            variant: 'primary',
            onClick: () => count.value++,
          }),
          ButtonComponent({
            text: 'Decrement',
            variant: 'secondary',
            onClick: () => count.value--,
          }),
        ],
      }),
    ],
  });
}
