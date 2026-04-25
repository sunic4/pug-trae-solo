import { describe, it, expect } from 'vitest';
import { signal, computed } from '../src/index.js';

describe('computed', () => {
  it('should compute value based on signal', () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    expect(doubled.value).toBe(0);

    count.value = 1;
    expect(doubled.value).toBe(2);

    count.value = 5;
    expect(doubled.value).toBe(10);
  });

  it('should cache computed value', () => {
    const count = signal(0);
    let computeCount = 0;
    const doubled = computed(() => {
      computeCount++;
      return count.value * 2;
    });

    expect(doubled.value).toBe(0);
    expect(computeCount).toBe(1);

    // 再次访问应该使用缓存
    expect(doubled.value).toBe(0);
    expect(computeCount).toBe(1);

    // 依赖变化时重新计算
    count.value = 1;
    expect(doubled.value).toBe(2);
    expect(computeCount).toBe(2);
  });
});
