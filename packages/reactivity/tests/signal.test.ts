import { describe, it, expect, vi } from 'vitest';
import { signal } from '../src/signal.js';

describe('signal', () => {
  it('should initialize with initial value', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
  });

  it('should update value', () => {
    const count = signal(0);
    count.value = 1;
    expect(count.value).toBe(1);
  });

  it('should notify subscribers when value changes', () => {
    const count = signal(0);
    const callback = vi.fn();
    count.subscribe(callback);

    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);

    count.value = 1; // no change, should not notify
    expect(callback).toHaveBeenCalledTimes(1);

    count.value = 2;
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should allow unsubscribing', () => {
    const count = signal(0);
    const callback = vi.fn();
    const unsubscribe = count.subscribe(callback);

    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    count.value = 2;
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
