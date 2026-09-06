import type { CSSProperties } from 'react';
import { Eyebrow } from '@/components/ds/core/Eyebrow';

export interface OnThisPageItem {
  id: string;
  label: string;
}

/**
 * A page's own contents, as furniture rather than as content.
 *
 * This was a filled card with a "Quick Navigation" heading and a row of
 * outlined pills - three layers of chrome around eight links, sitting between
 * the standfirst and the first thing the reader came for, and heavy enough to
 * read as a section of the article rather than a way past it.
 *
 * A mono label and a ruled strip does the same job and gets out of the way.
 *
 * The pills are styled inline, like every other component in components/ds/,
 * and deliberately not by a stylesheet rule any more. They were `.gg-prose nav
 * a`, which only reached them while they happened to sit inside a Prose block -
 * so the first page to place this outside one rendered a row of bare green
 * prose links, exactly the wall of accent that rule exists to prevent. Moving
 * it to a `.gg-toc a` hook fixed that and introduced a subtler version of the
 * same fragility: the appearance still depended on one selector in one
 * stylesheet reaching this markup.
 *
 * Inline, it cannot be defeated by layering, source order or a stale CSS
 * bundle, and it wins over `.gg-prose a` on the pages where this does sit
 * inside prose. The component looks the same everywhere because it carries its
 * own appearance.
 *
 * The 44px hit area is ours too; the original pills did not have one.
 */
const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '5px 11px',
  borderRadius: 'var(--r-pill)',
  border: '1px solid var(--line-strong)',
  color: 'var(--text-secondary)',
  fontSize: 'var(--fs-ui)',
  textDecoration: 'none',
};
export default function OnThisPage({ items }: { items: OnThisPageItem[] }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="On this page"
      style={{
        margin: 'var(--space-8) 0 var(--space-9)',
        paddingBlock: 'var(--space-5)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <Eyebrow style={{ marginBottom: 'var(--space-2)' }}>On this page</Eyebrow>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        {items.map(({ id, label }) => (
          <li key={id} style={{ padding: 0, margin: 0 }}>
            <a href={`#${id}`} style={pillStyle}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
