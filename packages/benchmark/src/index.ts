import { runRenderPerformanceTest } from './render-performance.ts';
import { runStatePerformanceTest } from './state-performance.ts';
import { runComponentPerformanceTest } from './component-performance.ts';
import { runMemoryPerformanceTest } from './memory-performance.ts';
import { runAnimationPerformanceTest } from './animation-performance.ts';

interface PerformanceResult {
  name: string;
  duration?: number;
  nodes?: number;
  fps?: number;
  updates?: number;
  computedSignals?: number;
  effects?: number;
  components?: number;
  initialMemory?: number;
  peakMemory?: number;
  finalMemory?: number;
  memoryUsage?: number;
  animations?: number;
}

async function runAllTests(): Promise<PerformanceResult[]> {
  console.log('Running performance benchmarks...\n');
  
  const results: PerformanceResult[] = [];
  
  try {
    // 运行渲染性能测试
    console.log('Running Render Performance Test...');
    const renderResult = runRenderPerformanceTest();
    results.push(renderResult);
    console.log(`✓ Render Performance: ${renderResult.duration}ms for ${renderResult.nodes} nodes (${renderResult.fps} FPS)\n`);
  } catch (error) {
    console.error('Error running render performance test:', error);
  }
  
  try {
    // 运行状态性能测试
    console.log('Running State Performance Test...');
    const stateResult = runStatePerformanceTest();
    results.push(stateResult);
    console.log(`✓ State Performance: ${stateResult.duration}ms for ${stateResult.updates} updates (${stateResult.computedSignals} computed signals, ${stateResult.effects} effects)\n`);
  } catch (error) {
    console.error('Error running state performance test:', error);
  }
  
  try {
    // 运行组件性能测试
    console.log('Running Component Performance Test...');
    const componentResult = runComponentPerformanceTest();
    results.push(componentResult);
    console.log(`✓ Component Performance: ${componentResult.duration}ms for ${componentResult.components} components\n`);
  } catch (error) {
    console.error('Error running component performance test:', error);
  }
  
  try {
    // 运行内存性能测试
    console.log('Running Memory Performance Test...');
    const memoryResult = runMemoryPerformanceTest();
    results.push(memoryResult);
    console.log(`✓ Memory Performance: ${memoryResult.memoryUsage}MB used (Initial: ${memoryResult.initialMemory}MB, Peak: ${memoryResult.peakMemory}MB, Final: ${memoryResult.finalMemory}MB)\n`);
  } catch (error) {
    console.error('Error running memory performance test:', error);
  }
  
  try {
    // 运行动画性能测试
    console.log('Running Animation Performance Test...');
    const animationResult = runAnimationPerformanceTest();
    results.push(animationResult);
    console.log(`✓ Animation Performance: ${animationResult.duration}ms for ${animationResult.animations} animations (${animationResult.fps} FPS)\n`);
  } catch (error) {
    console.error('Error running animation performance test:', error);
  }
  
  // 输出总结
  console.log('=== Performance Benchmark Summary ===');
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    if (result.duration) {
      console.log(`  Duration: ${result.duration}ms`);
    }
    if (result.nodes) {
      console.log(`  Nodes: ${result.nodes}`);
    }
    if (result.fps) {
      console.log(`  FPS: ${result.fps}`);
    }
    if (result.updates) {
      console.log(`  Updates: ${result.updates}`);
    }
    if (result.computedSignals) {
      console.log(`  Computed Signals: ${result.computedSignals}`);
    }
    if (result.effects) {
      console.log(`  Effects: ${result.effects}`);
    }
    if (result.components) {
      console.log(`  Components: ${result.components}`);
    }
    if (result.memoryUsage) {
      console.log(`  Memory Usage: ${result.memoryUsage}MB`);
    }
    if (result.animations) {
      console.log(`  Animations: ${result.animations}`);
    }
  });
  
  return results;
}

// 运行所有测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, runRenderPerformanceTest, runStatePerformanceTest, runComponentPerformanceTest, runMemoryPerformanceTest };
