import { useCallback, useRef } from 'react';

export interface UseKeyboardNavigationOptions {
  totalInputs: number;
}

export function useKeyboardNavigation({ totalInputs }: UseKeyboardNavigationOptions) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const registerInput = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );

  const focusInput = useCallback(
    (index: number) => {
      if (totalInputs <= 0) return;
      const targetIndex = (index + totalInputs) % totalInputs;
      const el = inputRefs.current[targetIndex];
      if (el) {
        el.focus();
        el.select();
      }
    },
    [totalInputs]
  );

  const handleScoreKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      currentIndex: number,
      currentValue: number | null,
      setScore: (score: number | null) => void
    ) => {
      // Enter: Advance to next input
      if (e.key === 'Enter') {
        e.preventDefault();
        focusInput(currentIndex + 1);
        return;
      }

      // Tab with Shift: Handled by browser or custom backward jump
      if (e.key === 'Tab' && e.shiftKey) {
        // Allow natural tab or explicit backward
        // Do not prevent default so browser accessibility works, but can guide
        return;
      }

      // Arrow Up: Increment by 1 clamped to 19
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextVal = currentValue === null ? 10 : Math.min(19, currentValue + 1);
        setScore(nextVal);
        return;
      }

      // Arrow Down: Decrement by 1 clamped to 1
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextVal = currentValue === null ? 10 : Math.max(1, currentValue - 1);
        setScore(nextVal);
        return;
      }

      // Escape: Clear current value
      if (e.key === 'Escape') {
        e.preventDefault();
        setScore(null);
        return;
      }
    },
    [focusInput]
  );

  /**
   * Smart numpad auto-advance logic:
   * - 2..9: immediately commits and advances.
   * - 10..19: immediately commits and advances.
   * - 1: sets 1, waits for potential second digit.
   * - > 19 or < 1: commits numeric value to trigger reactive validation.
   */
  const handleScoreChange = useCallback(
    (
      val: string,
      currentIndex: number,
      setScore: (score: number | null) => void
    ) => {
      const clean = val.trim();
      if (!clean) {
        setScore(null);
        return;
      }

      const num = parseInt(clean, 10);
      if (isNaN(num)) {
        return;
      }

      // Single-digit shortcut: 2..9 instantly commits and auto-advances
      if (clean.length === 1 && num >= 2 && num <= 9) {
        setScore(num);
        focusInput(currentIndex + 1);
        return;
      }

      // Single digit '1': Keep 1, wait for potential second digit
      if (clean === '1') {
        setScore(1);
        return;
      }

      // Two-digit entry: 10..19 commits and auto-advances
      if (clean.length === 2) {
        setScore(num);
        if (num >= 10 && num <= 19) {
          focusInput(currentIndex + 1);
        }
        return;
      }

      // Multi-digit out of range: commit to show validation error
      setScore(num);
    },
    [focusInput]
  );

  return {
    registerInput,
    focusInput,
    handleScoreKeyDown,
    handleScoreChange,
  };
}
