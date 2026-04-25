import { BoxComponent, TextComponent, ButtonComponent, ColumnComponent, RowComponent } from '@pug/components';
import { useTheme } from '../../hooks/useTheme';
import { signal, effect, computed } from '@pug/reactivity';

interface PerformanceTest {
  name: string;
  description: string;
  runTest: () => Promise<number>;
  result: string;
}

export function PerformancePage() {
  const theme = useTheme();
  
  // 测试状态
  const isRunning = signal(false);
  const testResults = signal<Record<string, string>>({});
  
  // 性能测试函数
  const runRenderTest = async (): Promise<number> => {
    const startTime = performance.now();
    
    // 模拟渲染1000个节点
    const nodes = [];
    for (let i = 0; i < 1000; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 50,
        height: 50,
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`
      });
    }
    
    // 模拟渲染过程
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    return endTime - startTime;
  };
  
  const runStateTest = async (): Promise<number> => {
    const startTime = performance.now();
    
    // 模拟1000次状态更新
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    
    // 订阅计算信号
    effect(() => {
      const value = doubled.value;
    });
    
    // 批量更新
    for (let i = 0; i < 1000; i++) {
      count.value = i;
    }
    
    const endTime = performance.now();
    return endTime - startTime;
  };
  
  const runComponentTest = async (): Promise<number> => {
    const startTime = performance.now();
    
    // 模拟创建100个组件
    class MockComponent {
      constructor(private props: any) {
        // 模拟组件初始化
      }
      
      render() {
        // 模拟渲染
        return `Component ${this.props.id}`;
      }
    }
    
    const components = [];
    for (let i = 0; i < 100; i++) {
      components.push(new MockComponent({ id: i }));
    }
    
    // 模拟渲染所有组件
    components.forEach(component => component.render());
    
    const endTime = performance.now();
    return endTime - startTime;
  };
  
  // 运行所有测试
  const runAllTests = async () => {
    isRunning.value = true;
    testResults.value = {};
    
    try {
      // 运行渲染测试
      const renderTime = await runRenderTest();
      testResults.value = {
        ...testResults.value,
        render: `${renderTime.toFixed(2)}ms`
      };
      
      // 运行状态更新测试
      const stateTime = await runStateTest();
      testResults.value = {
        ...testResults.value,
        state: `${stateTime.toFixed(2)}ms`
      };
      
      // 运行组件创建测试
      const componentTime = await runComponentTest();
      testResults.value = {
        ...testResults.value,
        component: `${componentTime.toFixed(2)}ms`
      };
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      isRunning.value = false;
    }
  };

  const tests = [
    {
      name: '渲染性能测试',
      description: '测试渲染1000个节点的性能',
      result: testResults.value.render || '未运行'
    },
    {
      name: '状态更新测试',
      description: '测试1000次状态更新的性能',
      result: testResults.value.state || '未运行'
    },
    {
      name: '组件创建测试',
      description: '测试创建100个组件的性能',
      result: testResults.value.component || '未运行'
    }
  ];

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
          text: '性能测试',
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
        }),
        
        // 运行测试按钮
        ButtonComponent({
          text: isRunning.value ? '测试中...' : '运行性能测试',
          onClick: runAllTests,
          disabled: isRunning.value,
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
              ...tests.map((test) => {
                return RowComponent({
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  children: [
                    ColumnComponent({
                      spacing: 4,
                      children: [
                        TextComponent({
                          text: test.name,
                          fontSize: 14,
                          color: theme.colors.text,
                        }),
                        TextComponent({
                          text: test.description,
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }),
                      ],
                    }),
                    TextComponent({
                      text: test.result,
                      fontSize: 14,
                      fontWeight: 500,
                      color: theme.colors.primary,
                    }),
                  ],
                });
              }),
            ],
          }),
        }),
        
        // 性能优化提示
        BoxComponent({
          padding: 16,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          children: ColumnComponent({
            spacing: 8,
            children: [
              TextComponent({
                text: '性能优化建议',
                fontSize: 18,
                fontWeight: 500,
                color: theme.colors.text,
              }),
              TextComponent({
                text: '1. 使用批量更新减少渲染次数',
                fontSize: 14,
                color: theme.colors.text,
              }),
              TextComponent({
                text: '2. 只在必要时标记节点为脏',
                fontSize: 14,
                color: theme.colors.text,
              }),
              TextComponent({
                text: '3. 使用计算信号避免重复计算',
                fontSize: 14,
                color: theme.colors.text,
              }),
              TextComponent({
                text: '4. 合理使用缓存减少重复渲染',
                fontSize: 14,
                color: theme.colors.text,
              }),
            ],
          }),
        }),
      ],
    }),
  });
}
