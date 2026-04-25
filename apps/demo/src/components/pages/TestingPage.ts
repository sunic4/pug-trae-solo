import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { testSignal, testEffect, testComponent, createTestAppContext } from '@pug/core';
import { ButtonComponent as Button } from '@pug/components';

export function TestingPage() {
  const theme = useTheme();
  
  // 测试结果
  const testResults = {
    signalTest: '未运行',
    effectTest: '未运行',
    componentTest: '未运行',
  };
  
  // 运行信号测试
  const runSignalTest = () => {
    try {
      const { signal, updates, assertUpdates, assertValue } = testSignal(0);
      
      // 测试基本更新
      signal.value = 1;
      signal.value = 2;
      
      // 验证更新
      assertUpdates([0, 1, 2]);
      assertValue(2);
      
      testResults.signalTest = '通过';
    } catch (error) {
      testResults.signalTest = `失败: ${error.message}`;
    }
  };
  
  // 运行效果测试
  const runEffectTest = () => {
    try {
      let runCount = 0;
      const { dispose, assertRunCount } = testEffect(() => {
        runCount++;
      });
      
      // 验证效果运行
      assertRunCount(1);
      
      dispose();
      testResults.effectTest = '通过';
    } catch (error) {
      testResults.effectTest = `失败: ${error.message}`;
    }
  };
  
  // 运行组件测试
  const runComponentTest = () => {
    try {
      const { component, assertExists, assertType } = testComponent(
        (appContext) => Button({ text: 'Test Button', onClick: () => {}, appContext })
      );
      
      // 验证组件
      assertExists();
      assertType('button');
      
      testResults.componentTest = '通过';
    } catch (error) {
      testResults.componentTest = `失败: ${error.message}`;
    }
  };
  
  // 运行所有测试
  const runAllTests = () => {
    runSignalTest();
    runEffectTest();
    runComponentTest();
  };

  return BoxComponent({
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    padding: 20,
    children: ColumnComponent({
      spacing: 20,
      children: [
        // 页面标题
        TextComponent({
          text: '测试工具展示',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 运行测试按钮
        ButtonComponent({
          text: '运行所有测试',
          onClick: runAllTests,
          padding: 15,
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
        }),
        
        // 测试结果
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '测试结果',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              RowComponent({
                justifyContent: 'space-between',
                alignItems: 'center',
                children: [
                  TextComponent({
                    text: '信号测试',
                    fontSize: 14,
                    color: theme.colors.text,
                  }),
                  TextComponent({
                    text: testResults.signalTest,
                    fontSize: 14,
                    fontWeight: 500,
                    color: testResults.signalTest === '通过' ? theme.colors.success : theme.colors.error,
                  }),
                ],
              }),
              RowComponent({
                justifyContent: 'space-between',
                alignItems: 'center',
                children: [
                  TextComponent({
                    text: '效果测试',
                    fontSize: 14,
                    color: theme.colors.text,
                  }),
                  TextComponent({
                    text: testResults.effectTest,
                    fontSize: 14,
                    fontWeight: 500,
                    color: testResults.effectTest === '通过' ? theme.colors.success : theme.colors.error,
                  }),
                ],
              }),
              RowComponent({
                justifyContent: 'space-between',
                alignItems: 'center',
                children: [
                  TextComponent({
                    text: '组件测试',
                    fontSize: 14,
                    color: theme.colors.text,
                  }),
                  TextComponent({
                    text: testResults.componentTest,
                    fontSize: 14,
                    fontWeight: 500,
                    color: testResults.componentTest === '通过' ? theme.colors.success : theme.colors.error,
                  }),
                ],
              }),
            ],
          }),
        }),
        
        // 测试工具示例
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            spacing: 12,
            children: [
              TextComponent({
                text: '测试工具使用示例',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              
              // 信号测试示例
              BoxComponent({
                padding: 12,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                children: ColumnComponent({
                  spacing: 8,
                  children: [
                    TextComponent({
                      text: '信号测试示例',
                      fontSize: 16,
                      fontWeight: 500,
                      color: theme.colors.text,
                    }),
                    TextComponent({
                      text: `const { signal, updates, assertUpdates } = testSignal(0);
      signal.value = 1;
      signal.value = 2;
      assertUpdates([0, 1, 2]);`,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      fontFamily: 'monospace',
                    }),
                  ],
                }),
              }),
              
              // 效果测试示例
              BoxComponent({
                padding: 12,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                children: ColumnComponent({
                  spacing: 8,
                  children: [
                    TextComponent({
                      text: '效果测试示例',
                      fontSize: 16,
                      fontWeight: 500,
                      color: theme.colors.text,
                    }),
                    TextComponent({
                      text: `const { dispose, assertRunCount } = testEffect(() => {
        console.log('Effect ran');
      });
      assertRunCount(1);
      dispose();`,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      fontFamily: 'monospace',
                    }),
                  ],
                }),
              }),
              
              // 组件测试示例
              BoxComponent({
                padding: 12,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                children: ColumnComponent({
                  spacing: 8,
                  children: [
                    TextComponent({
                      text: '组件测试示例',
                      fontSize: 16,
                      fontWeight: 500,
                      color: theme.colors.text,
                    }),
                    TextComponent({
                      text: `const { component, assertExists, assertType } = testComponent(
        (appContext) => new Button({ text: 'Click', appContext })
      );
      assertExists();
      assertType('button');`,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                      fontFamily: 'monospace',
                    }),
                  ],
                }),
              }),
            ],
          }),
        }),
      ],
    }),
  });
}
