import { TextComponent, ButtonComponent, BoxComponent, ContainerComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';

// 按钮变体组件
export function ButtonVariants() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'Button Variants',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      ContainerComponent({
        direction: 'column',
        align: 'center',
        children: [
          ButtonComponent({
            text: 'Primary Button',
            variant: 'primary',
            marginBottom: 10,
          }),
          ButtonComponent({
            text: 'Secondary Button',
            variant: 'secondary',
            marginBottom: 10,
          }),
          ButtonComponent({
            text: 'Outline Button',
            variant: 'outline',
            marginBottom: 10,
          }),
          ButtonComponent({
            text: 'Text Button',
            variant: 'text',
            marginBottom: 10,
          }),
          ButtonComponent({
            text: 'Disabled Button',
            disabled: true,
            marginBottom: 10,
          }),
        ],
      }),
    ],
  });
}
