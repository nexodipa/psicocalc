import { describe, it, expect } from 'vitest';
import {
  calculateWiscV,
  calculateWaisIV,
} from '../../core';

describe('Tier 3 - Subtest Substitution Rules & Combinatorics', () => {
  describe('WISC-V Substitution Invariants', () => {
    it('allows valid single substitution of LN for D in CIT', () => {
      // D is missing, LN is supplied
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, CL: 10, // D missing
        LN: 10, // Valid substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(70);
      expect(res.cit?.compositeScore).toBe(100);
    });

    it('allows valid single substitution of CA for CL in CIT', () => {
      // CL is missing, CA is supplied
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, D: 10, // CL missing
        CA: 12, // Valid substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(72);
      expect(res.cit?.compositeScore).toBe(102);
    });

    it('allows valid single substitution of I for S or V in CIT', () => {
      // S is missing, I is supplied
      const res = calculateWiscV({
        V: 10, C: 10, M: 10, B: 10, D: 10, CL: 10, // S missing
        I: 10, // Substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(70);
    });

    it('allows valid single substitution of A for M or B in CIT', () => {
      // M is missing, A is supplied
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, B: 10, D: 10, CL: 10, // M missing
        A: 10, // Substitute
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit?.sumScaled).toBe(70);
    });

    it('FORBIDS substitution for Cubos (C) in WISC-V CIT', () => {
      // Cubos is non-substitutable in WISC-V Full Scale IQ
      const res = calculateWiscV({
        S: 10, V: 10, M: 10, B: 10, D: 10, CL: 10, // C missing
        PV: 10, // Even if PV is supplied
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });

    it('FORBIDS multiple simultaneous substitutions in WISC-V CIT (strictly <= 1)', () => {
      // Both D and CL missing, both LN and CA supplied
      const res = calculateWiscV({
        S: 10, V: 10, C: 10, M: 10, B: 10, // D and CL missing
        LN: 10,
        CA: 10,
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });

    it('does not substitute secondary subtests into Primary Indices (e.g. S missing, I supplied does not compute ICV)', () => {
      const res = calculateWiscV({
        V: 10,
        I: 10,
      });
      // ICV strictly requires S and V
      expect(res.primaryIndices.ICV).toBeNull();
    });
  });

  describe('WAIS-IV Substitution Invariants', () => {
    it('allows valid single substitution of CO for S, V, or I in WAIS-IV', () => {
      // I is missing, CO is supplied
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_CN: 10, // WAIS_I missing
        WAIS_CO: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.cit).not.toBeNull();
      expect(res.cit?.sumScaled).toBe(100);
      expect(res.primaryIndices.ICV).not.toBeNull();
      expect(res.primaryIndices.ICV?.sumScaled).toBe(30);
    });

    it('allows valid single substitution of B for C, M, or PV in WAIS-IV IRP and CIT', () => {
      // PV missing, B supplied
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_I: 10, WAIS_CN: 10, // WAIS_PV missing
        WAIS_B: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.primaryIndices.IRP).not.toBeNull();
      expect(res.primaryIndices.IRP?.sumScaled).toBe(30);
      expect(res.cit?.sumScaled).toBe(100);
    });

    it('allows valid single substitution of LN for D or A in WAIS-IV IMT and CIT', () => {
      // D missing, LN supplied
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, WAIS_CN: 10, // WAIS_D missing
        WAIS_LN: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.primaryIndices.IMT).not.toBeNull();
      expect(res.primaryIndices.IMT?.sumScaled).toBe(20);
      expect(res.cit?.sumScaled).toBe(100);
    });

    it('allows valid single substitution of CA for BS or CN in WAIS-IV IVP and CIT', () => {
      // CN missing, CA supplied
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, // WAIS_CN missing
        WAIS_CA: 10,
      });
      expect(res.isCompleteCit).toBe(true);
      expect(res.primaryIndices.IVP).not.toBeNull();
      expect(res.primaryIndices.IVP?.sumScaled).toBe(20);
      expect(res.cit?.sumScaled).toBe(100);
    });

    it('FORBIDS multiple simultaneous substitutions in WAIS-IV CIT', () => {
      // Both I and CN missing, both CO and CA supplied
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, // WAIS_I & WAIS_CN missing
        WAIS_CO: 10,
        WAIS_CA: 10,
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });

    it('does not allow substitution when no supplemental subtest is provided', () => {
      const res = calculateWaisIV({
        WAIS_C: 10, WAIS_S: 10, WAIS_D: 10, WAIS_M: 10, WAIS_V: 10,
        WAIS_A: 10, WAIS_BS: 10, WAIS_PV: 10, WAIS_I: 10, // WAIS_CN missing, no substitute
      });
      expect(res.isCompleteCit).toBe(false);
      expect(res.cit).toBeNull();
    });
  });
});
