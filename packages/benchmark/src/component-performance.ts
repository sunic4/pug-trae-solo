import { createAppContext } from '@pug/core';
import { defaultTheme } from '@pug/theme';
import { ButtonComponent, TextComponent, ColumnComponent } from '@pug/components';

interface ComponentPerformanceResult {
  name: string;
  duration: number;
  components: number;
}

export function runComponentPerformanceTest(): ComponentPerformanceResult {
  // 创建AppContext
  const appContext = createAppContext({
    theme: defaultTheme
  });
  
  const componentCount = 1000;
  const startTime = performance.now();
  
  // 创建大量组件
  const components = Array.from({ length: componentCount }, (_, i) => {
    if (i % 2 === 0) {
      return ButtonComponent({
        text: `Button ${i + 1}`,
        onClick: () => {},
        appContext
      });
    } else {
      return TextComponent({
        text: `Text ${i + 1}`,
        fontSize: 14,
        appContext
      });
    }
  });
  
  // 创建根组件包含所有子组件
  ColumnComponent({
    children: components,
    appContext
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // 清理
  appContext.dispose();
  
  return {
    name: 'Component Creation Performance',
    duration: parseFloat(duration.toFixed(2)),
    components: componentCount
  };
}
