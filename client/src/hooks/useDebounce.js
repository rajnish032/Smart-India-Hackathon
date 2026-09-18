import { useState, useEffect } from 'react';

/**
 * Debounce a value — useful for search inputs and API calls.
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 400ms)
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
