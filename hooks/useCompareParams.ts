'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

type SelectionType = 'country' | 'bloc';

interface CompareSelection {
  type: SelectionType;
  id: string;
}

interface CompareParams {
  a: CompareSelection;
  b: CompareSelection;
  year: number;
}

interface UseCompareParamsReturn {
  params: CompareParams;
  setSelectionA: (type: SelectionType, id: string) => void;
  setSelectionB: (type: SelectionType, id: string) => void;
  setYear: (year: number) => void;
  isFromUrl: boolean;
  yearIsExplicit: boolean;
}

/**
 * Parse a URL param value into a selection
 * Format: "DEU" for country, "bloc:EU" for bloc, "bloc:" for bloc mode with no selection
 */
function parseSelection(value: string | null): CompareSelection {
  if (!value) return { type: 'country', id: '' };

  if (value.startsWith('bloc:')) {
    return { type: 'bloc', id: value.slice(5) };
  }
  return { type: 'country', id: value };
}

/**
 * Encode a selection for URL
 * Returns empty string only if type is country AND id is empty
 */
function encodeSelection(selection: CompareSelection): string {
  if (selection.type === 'bloc') {
    // Always encode bloc type, even with empty id (e.g., "bloc:" means bloc mode, no selection)
    return `bloc:${selection.id}`;
  }
  // For country type, only encode if there's an id
  return selection.id;
}

export function useCompareParams(defaultYear: number): UseCompareParamsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<CompareParams>>({});

  // Parse current URL params
  const aParam = searchParams.get('a');
  const bParam = searchParams.get('b');
  const yearParam = searchParams.get('year');

  const a = parseSelection(aParam);
  const b = parseSelection(bParam);

  // A year param that doesn't parse must not count as "explicit": the compare
  // page skips its common-year resolution when the year is explicit, so treating
  // ?year=abc as a deliberate choice would silently let the two selections fall
  // back to their own nearest years — the mismatch that logic exists to prevent.
  const parsedYear = yearParam !== null ? parseInt(yearParam, 10) : NaN;
  const yearIsValid = Number.isFinite(parsedYear);
  const year = yearIsValid ? parsedYear : defaultYear;

  // Check if we loaded from URL (has any params)
  const isFromUrl = !!(aParam || bParam || yearParam);

  // Check if year was explicitly set in URL (not just defaulted)
  const yearIsExplicit = yearIsValid;

  // Debounced URL update that accumulates changes
  const updateUrl = useCallback((newParams: Partial<CompareParams>) => {
    // Accumulate changes
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...newParams };

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};

      const current = new URLSearchParams(searchParams.toString());

      if ('a' in updates) {
        const encoded = encodeSelection(updates.a!);
        if (encoded) {
          current.set('a', encoded);
        } else {
          current.delete('a');
        }
      }

      if ('b' in updates) {
        const encoded = encodeSelection(updates.b!);
        if (encoded) {
          current.set('b', encoded);
        } else {
          current.delete('b');
        }
      }

      if ('year' in updates) {
        current.set('year', updates.year!.toString());
      }

      const newUrl = current.toString() ? `${pathname}?${current.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 100); // Reduced debounce time
  }, [searchParams, pathname, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const setSelectionA = useCallback((type: SelectionType, id: string) => {
    updateUrl({ a: { type, id } });
  }, [updateUrl]);

  const setSelectionB = useCallback((type: SelectionType, id: string) => {
    updateUrl({ b: { type, id } });
  }, [updateUrl]);

  const setYear = useCallback((newYear: number) => {
    updateUrl({ year: newYear });
  }, [updateUrl]);

  return {
    params: { a, b, year },
    setSelectionA,
    setSelectionB,
    setYear,
    isFromUrl,
    yearIsExplicit,
  };
}
