import { describe, it, expect } from 'vitest';
import {
  Constraints,
  Size,
  looseConstraints,
  tightConstraints,
  wrapContentConstraints,
  clampSize,
  constraintsToString,
} from '../src/constraints.js';

describe('Constraints', () => {
  describe('factory functions', () => {
    it('looseConstraints should create unbounded constraints', () => {
      const c = looseConstraints(100, 200);
      expect(c.minWidth).toBe(0);
      expect(c.maxWidth).toBe(100);
      expect(c.minHeight).toBe(0);
      expect(c.maxHeight).toBe(200);
    });

    it('tightConstraints should create fixed-size constraints', () => {
      const c = tightConstraints(100, 200);
      expect(c.minWidth).toBe(100);
      expect(c.maxWidth).toBe(100);
      expect(c.minHeight).toBe(200);
      expect(c.maxHeight).toBe(200);
    });

    it('wrapContentConstraints should create zero-min constraints', () => {
      const c = wrapContentConstraints(400, 600);
      expect(c.minWidth).toBe(0);
      expect(c.maxWidth).toBe(400);
      expect(c.minHeight).toBe(0);
      expect(c.maxHeight).toBe(600);
    });
  });

  describe('clampSize', () => {
    it('should clamp size to fit constraints', () => {
      const c = { minWidth: 50, maxWidth: 200, minHeight: 30, maxHeight: 100 };
      expect(clampSize(c, 10, 10)).toEqual({ width: 50, height: 30 });
      expect(clampSize(c, 300, 200)).toEqual({ width: 200, height: 100 });
      expect(clampSize(c, 100, 50)).toEqual({ width: 100, height: 50 });
    });
  });

  describe('constraintsToString', () => {
    it('should produce readable string', () => {
      const c = tightConstraints(100, 200);
      const s = constraintsToString(c);
      expect(s).toContain('100');
      expect(s).toContain('200');
    });
  });
});
