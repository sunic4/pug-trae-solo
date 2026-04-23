import { describe, it, expect, vi } from 'vitest';
import { signal, effect } from '../src/index.js';

describe('effect', () => {
  it('should run immediately', () => {
    const callback = vi.fn();
    effect(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should return a disposable', () => {
    const callback = vi.fn();
    const disposable = effect(callback);
    expect(typeof disposable.dispose).toBe('function');
  });
});
