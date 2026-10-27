import { describe, it, expect } from 'vitest';
import { TestRegistryClass, PUBLIC_INSTRUMENT_IDS } from '../core/registry/TestRegistry';

describe('Registry visibility', () => {
  it('public build exposes only the vetted free instruments', () => {
    const reg = new TestRegistryClass({ includeRestricted: false });
    const ids = reg.getAll().map((i) => i.metadata.id).sort();
    expect(ids).toEqual([...PUBLIC_INSTRUMENT_IDS].sort());
    expect(reg.has('mmpi_3')).toBe(false);
    expect(reg.get('wisc_v')).toBeUndefined();
  });

  it('restricted build exposes the full catalog', () => {
    const reg = new TestRegistryClass({ includeRestricted: true });
    expect(reg.getAll().length).toBe(35);
    expect(reg.has('mmpi_3')).toBe(true);
  });
});
