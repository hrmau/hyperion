'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ds/core/Button';
import { showToast } from './Toast';
import { trackShare } from '@/lib/analytics';

interface ShareButtonProps {
  /** The pair being shared, e.g. "IRL_GBR" - the `item_id` on the share event. */
  itemId?: string;
  label?: string;
}

/**
 * Copy a link to the comparison on screen.
 *
 * Rebuilt on the design system's Button. It used to be a hand-rolled Tailwind
 * chip with two inline SVGs, which made it the smallest control on a page whose
 * whole output is worth sending to someone - and the icons were a quiet
 * violation besides, since the system has no icon set and gets by on typography.
 * The label does the work instead, and says what will actually be copied.
 */
export default function ShareButton({ itemId, label = 'Share this comparison' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    trackShare('comparison', 'copy_link', itemId ?? 'unknown');

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers, and any context where the clipboard API is blocked.
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }

    setCopied(true);
    showToast('Link copied. Anyone who opens it lands on this comparison.');
    setTimeout(() => setCopied(false), 2000);
  }, [itemId]);

  return (
    <Button variant="secondary" size="lg" onClick={handleShare}>
      {copied ? 'Link copied' : label}
    </Button>
  );
}
