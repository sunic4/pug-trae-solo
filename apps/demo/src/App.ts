import { BoxComponent, TextComponent } from '@pug/components';
import { useTheme } from './hooks/useTheme';
import {
  Counter,
  ThemeSwitcher,
  ButtonVariants,
  TextVariants,
  ListDemo,
  StackDemo,
  PaddingDemo,
  LayoutDemo,
  TextInputDemo,
  CheckboxDemo
} from './components';

// 根组件
export function App() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.background,
    width: 400,
    height: 1000,
    padding: 20,
    children: [
      // 标题
      TextComponent({
        text: 'Canvas Compose Demo',
        fontSize: 24,
        fontWeight: 600,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 20,
      }),

      // 计数器部分
      Counter(),

      // 主题切换部分
      ThemeSwitcher(),

      // 按钮示例
      ButtonVariants(),

      // 文本示例
      TextVariants(),

      // 列表示例
      ListDemo(),

      // 堆栈示例
      StackDemo(),

      // 内边距示例
      PaddingDemo(),

      // 布局组件示例
      LayoutDemo(),

      // 输入框示例
      TextInputDemo(),

      // 复选框示例
      CheckboxDemo(),
    ],
  });
}
