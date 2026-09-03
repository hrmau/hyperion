'use client';

import { useCallback, useState } from 'react';
import { showToast } from './Toast';
import { trackShare } from '@/lib/analytics';

interface ShareButtonProps {
  disabled?: boolean;
  /** The pair being shared, e.g. "IRL_GBR" — the `item_id` on the share event. */
  itemId?: string;
}

export default function ShareButton({ disabled, itemId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    trackShare('comparison', 'copy_link', itemId ?? 'unknown');

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied! Anyone with this link can see your comparison.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      showToast('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [itemId]);

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
        disabled
          ? 'bg-inset border-border text-muted cursor-not-allowed'
          : copied
          ? 'bg-primary border-primary text-canvas'
          : 'bg-card border-border text-secondary hover:text-primary hover:border-primary/30'
      }`}
      title="Copy link to share this comparison"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  );
}
