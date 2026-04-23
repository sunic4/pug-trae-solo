import { TextComponent, BoxComponent, TextInputComponent } from '@pug/components';
import { useTheme } from '../hooks/useTheme';
import { inputValue } from '../state/appState';

// 输入框示例组件
export function TextInputDemo() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    children: [
      TextComponent({
        text: 'TextInput Component',
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 10,
      }),
      TextInputComponent({
        value: inputValue.value,
        onValueChange: (value) => inputValue.value = value,
        placeholder: 'Enter text here',
        width: 200,
      }),
      BoxComponent({
        height: 10,
      }),
      TextComponent({
        text: `Input value: ${inputValue.value}`,
        fontSize: 14,
        color: theme.colors.textSecondary,
      }),
    ],
  });
}
