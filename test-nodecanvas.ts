import { TextComponent, ButtonComponent, BoxComponent, ColumnComponent } from '@pug/components';
import { renderComponent, saveComponentScreenshot } from '@pug/renderer';
import { Composer } from '@pug/composer';
import { signal, effect } from '@pug/reactivity';
import { useTheme, defaultTheme, darkTheme, useThemeSwitcher } from '@pug/theme';

// 创建一个简单的测试组件
function TestComponent() {
  const theme = useTheme();
  
  return BoxComponent({
    backgroundColor: theme.colors.background,
    width: 400,
    height: 300,
    padding: 20,
    children: [
      TextComponent({
        text: 'NodeCanvas Test',
        fontSize: 24,
        fontWeight: 600,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 20,
      }),
      ColumnComponent({
        spacing: 15,
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
          TextComponent({
            text: 'This is a test of NodeCanvas rendering',
            fontSize: 16,
            color: theme.colors.text,
          }),
        ],
      }),
    ],
  });
}

// 测试函数
async function runTest() {
  console.log('Running NodeCanvas test...');
  
  // 创建 composer
  const composer = new Composer();
  
  // 渲染组件
  const rootNode = composer.startCompose(TestComponent);
  composer.endCompose();
  composer.recompose();
  
  console.log('Component created successfully');
  
  // 生成截图
  console.log('Generating screenshot...');
  const buffer = await renderComponent(rootNode, {
    width: 400,
    height: 300,
  });
  
  console.log(`Screenshot generated: ${buffer.length} bytes`);
  
  // 保存截图
  const filePath = './nodecanvas-test.png';
  console.log(`Saving screenshot to ${filePath}...`);
  await saveComponentScreenshot(rootNode, filePath, {
    width: 400,
    height: 300,
  });
  
  console.log('Test completed successfully!');
  console.log(`Screenshot saved to ${filePath}`);
  
  return filePath;
}

// 运行测试
runTest().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});