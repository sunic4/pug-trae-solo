import { Composer } from '@pug/composer';
import { CanvasRenderer } from '@pug/renderer';
import { EventDispatcher } from '@pug/event';
import { TextComponent, ButtonComponent, BoxComponent, ContainerComponent, ListComponent, StackComponent, PaddingComponent, TextInputComponent, CheckboxComponent, ColumnComponent, RowComponent } from '@pug/components';
import { useTheme, useThemeSwitcher, defaultTheme, darkTheme } from '@pug/theme';
import { signal, effect } from '@pug/reactivity';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Failed to get canvas context');
  throw new Error('Failed to get canvas context');
}

// 创建渲染器
const renderer = new CanvasRenderer(canvas);

// 事件分发器
let dispatcher: EventDispatcher | null = null;
let detachEvents: (() => void) | null = null;

// 创建信号用于状态管理
const count = signal(0);
const isDarkTheme = signal(false);
const inputValue = signal('');
const isChecked = signal(false);

// 创建主题切换函数
const switchTheme = useThemeSwitcher();

// 监听主题变化
effect(() => {
  switchTheme(isDarkTheme.value ? darkTheme : defaultTheme);
});

// 创建根组件
function App() {
  const theme = useTheme();

  // 列表项数据
  const listItems = [
    { key: '1', content: TextComponent({ text: 'Item 1' }) },
    { key: '2', content: TextComponent({ text: 'Item 2' }) },
    { key: '3', content: TextComponent({ text: 'Item 3' }) },
    { key: '4', content: TextComponent({ text: 'Item 4' }) },
    { key: '5', content: TextComponent({ text: 'Item 5' }) },
  ];

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
      BoxComponent({
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
      }),

      // 主题切换部分
      BoxComponent({
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
            onClick: () => isDarkTheme.value = !isDarkTheme.value,
          }),
        ],
      }),

      // 按钮示例
      BoxComponent({
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
      }),

      // 文本示例
      BoxComponent({
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        children: [
          TextComponent({
            text: 'Text Variants',
            fontSize: 18,
            color: theme.colors.text,
            marginBottom: 10,
          }),
          TextComponent({
            text: 'Regular text',
            fontSize: 16,
            color: theme.colors.text,
            marginBottom: 5,
          }),
          TextComponent({
            text: 'Bold text',
            fontSize: 16,
            fontWeight: 600,
            color: theme.colors.text,
            marginBottom: 5,
          }),
          TextComponent({
            text: 'Secondary text',
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 5,
          }),
          TextComponent({
            text: 'Small text',
            fontSize: 14,
            color: theme.colors.text,
          }),
        ],
      }),

      // 列表示例
      BoxComponent({
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        children: [
          TextComponent({
            text: 'List Component',
            fontSize: 18,
            color: theme.colors.text,
            marginBottom: 10,
          }),
          ListComponent({
            items: listItems,
            direction: 'vertical',
            spacing: 10,
            padding: 10,
            height: 150,
          }),
        ],
      }),

      // 堆栈示例
      BoxComponent({
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
      }),

      // 内边距示例
      BoxComponent({
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
      }),

      // 布局组件示例
      BoxComponent({
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        children: [
          TextComponent({
            text: 'Layout Components',
            fontSize: 18,
            color: theme.colors.text,
            marginBottom: 10,
          }),
          TextComponent({
            text: 'Column Component',
            fontSize: 16,
            fontWeight: 600,
            color: theme.colors.text,
            marginBottom: 5,
          }),
          ColumnComponent({
            padding: 10,
            spacing: 10,
            width: 200,
            children: [
              BoxComponent({
                backgroundColor: theme.colors.primary,
                width: 180,
                height: 40,
                borderRadius: 4,
              }),
              BoxComponent({
                backgroundColor: theme.colors.secondary,
                width: 180,
                height: 40,
                borderRadius: 4,
              }),
              BoxComponent({
                backgroundColor: theme.colors.error,
                width: 180,
                height: 40,
                borderRadius: 4,
              }),
            ],
          }),
          BoxComponent({
            height: 15,
          }),
          TextComponent({
            text: 'Row Component',
            fontSize: 16,
            fontWeight: 600,
            color: theme.colors.text,
            marginBottom: 5,
          }),
          RowComponent({
            padding: 10,
            spacing: 10,
            height: 40,
            children: [
              BoxComponent({
                backgroundColor: theme.colors.primary,
                width: 40,
                height: 40,
                borderRadius: 4,
              }),
              BoxComponent({
                backgroundColor: theme.colors.secondary,
                width: 40,
                height: 40,
                borderRadius: 4,
              }),
              BoxComponent({
                backgroundColor: theme.colors.error,
                width: 40,
                height: 40,
                borderRadius: 4,
              }),
            ],
          }),
        ],
      }),

      // 输入框示例
      BoxComponent({
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
      }),

      // 复选框示例
      BoxComponent({
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 20,
        children: [
          TextComponent({
            text: 'Checkbox Component',
            fontSize: 18,
            color: theme.colors.text,
            marginBottom: 10,
          }),
          CheckboxComponent({
            checked: isChecked.value,
            onCheckedChange: (checked) => isChecked.value = checked,
            label: 'Check me',
          }),
          BoxComponent({
            height: 10,
          }),
          TextComponent({
            text: `Checked: ${isChecked.value}`,
            fontSize: 14,
            color: theme.colors.textSecondary,
          }),
        ],
      }),
    ],
  });
}

// 创建composer
const composer = new Composer();

// 启动应用
function render() {
  const rootNode = composer.startCompose(App);
  renderer.setRoot(rootNode);
  composer.endCompose();
  composer.recompose();

  // 更新事件分发器
  if (detachEvents) {
    detachEvents();
  }
  dispatcher = new EventDispatcher(rootNode);
  detachEvents = dispatcher.attachToCanvas(canvas);
}

// 初始渲染
render();

// 监听状态变化，自动重新渲染
effect(render);
