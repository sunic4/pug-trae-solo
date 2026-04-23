import { Composer } from '@canvas-compose/composer';
import { CanvasRenderer } from '@canvas-compose/renderer';
import { TextComponent, ButtonComponent, BoxComponent, ContainerComponent } from '@canvas-compose/components';
import { useTheme, useThemeSwitcher, defaultTheme, darkTheme } from '@canvas-compose/theme';
import { signal, effect } from '@canvas-compose/reactivity';

// 创建canvas元素
const canvas = document.getElementById('app') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Failed to get canvas context');
  throw new Error('Failed to get canvas context');
}

// 创建渲染器
const renderer = new CanvasRenderer(canvas);

// 创建信号用于状态管理
const count = signal(0);
const isDarkTheme = signal(false);

// 创建主题切换函数
const switchTheme = useThemeSwitcher();

// 监听主题变化
effect(() => {
  switchTheme(isDarkTheme.value ? darkTheme : defaultTheme);
});

// 创建根组件
function App() {
  const theme = useTheme();

  return BoxComponent({
    backgroundColor: theme.colors.background,
    width: 400,
    height: 600,
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
}

// 初始渲染
render();

// 监听状态变化，自动重新渲染
effect(render);
