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
 * A mono label and a ruled strip does the same job and gets out of the way. The
 * pill treatment itself comes from the design system - `.gg-prose nav a` already
 * styles in-article navigation that way - so this component supplies structure
 * and spacing only, and does not restate colour, border or radius. The old
 * markup declared all three again on top of it.
 *
 * The one thing added is a 44px hit area, which the pills did not have.
 */
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
            <a
              href={`#${id}`}
              // Appearance is the design system's; only the hit area is ours.
              style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
