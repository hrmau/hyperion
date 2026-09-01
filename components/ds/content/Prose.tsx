import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Eyebrow } from '@/components/ds/core/Eyebrow';

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Reading measure and typographic rules for body copy.
 *
 * All the work happens in `app/ds/tokens/prose.css`, which styles bare
 * elements under `.gg-prose` — headings, paragraphs, lists, tables, quotes.
 * That is deliberate: content markup stays plain HTML and inherits, instead of
 * every page carrying its own typography utilities.
 */
export function Prose({ children, style, ...rest }: ProseProps) {
  return (
    <div className="gg-prose" style={style} {...rest}>
      {children}
    </div>
  );
}

export interface ArticleHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  kicker?: ReactNode;
  title: ReactNode;
  standfirst?: ReactNode;
  updated?: ReactNode;
  readingTime?: ReactNode;
  style?: CSSProperties;
}

/** Opens a content page: kicker, title, standfirst, then a mono meta strip. */
export function ArticleHeader({
  kicker,
  title,
  standfirst,
  updated,
  readingTime,
  style,
  ...rest
}: ArticleHeaderProps) {
  return (
    <header style={style} {...rest}>
      {kicker && (
        <div style={{ marginBottom: 'var(--space-7)' }}>
          <Eyebrow tone="accent">{kicker}</Eyebrow>
        </div>
      )}
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--fs-h1)',
          fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'],
          letterSpacing: 'var(--ls-h1)',
          lineHeight: 'var(--lh-h1)',
          maxWidth: '20ch',
          textWrap: 'pretty',
          color: 'var(--paper)',
        }}
      >
        {title}
      </h1>
      {standfirst && (
        <p
          style={{
            margin: 'var(--space-8) 0 0',
            maxWidth: '52ch',
            fontSize: 'var(--fs-lead)',
            lineHeight: 'var(--lh-lead)',
            color: 'var(--text-secondary)',
            textWrap: 'pretty',
          }}
        >
          {standfirst}
        </p>
      )}
      {(updated || readingTime) && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            flexWrap: 'wrap',
            marginTop: 'var(--space-9)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-default)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-quiet)',
          }}
        >
          {readingTime && <span>{readingTime}</span>}
          {updated && <span>Updated {updated}</span>}
        </div>
      )}
    </header>
  );
}

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  children?: ReactNode;
  tone?: 'default' | 'accent' | 'warn';
  style?: CSSProperties;
}

/** Aside inside prose. Hairline and a mono label, never a coloured fill. */
export function Callout({ label = 'Note', children, tone = 'default', style, ...rest }: CalloutProps) {
  const accent =
    tone === 'accent' ? 'var(--green)' : tone === 'warn' ? 'var(--clay)' : 'var(--text-label)';
  return (
    <div
      style={{
        margin: 'var(--space-9) 0',
        padding: 'var(--space-7) var(--space-8)',
        borderLeft: `2px solid ${accent}`,
        background: 'var(--bg-raised)',
        borderRadius: '0 var(--r-well) var(--r-well) 0',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono-xxs)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 'var(--space-4)',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body-sm)', color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  );
}

export interface ArticleShellProps {
  kicker?: ReactNode;
  title: ReactNode;
  standfirst?: ReactNode;
  updated?: ReactNode;
  children?: ReactNode;
}

/**
 * The layout every content page shares: a banded header, then prose at the
 * reading measure. Keeps Story, Why, Methodology, Updates, Credits, Privacy
 * and Terms structurally identical so they read as one publication.
 */
export function ArticleShell({ kicker, title, standfirst, updated, children }: ArticleShellProps) {
  // The column is centred, and the rules that separate the bands are not.
  //
  // .gg-prose caps the measure at 68ch and never centred it, so on a wide screen
  // a content page was a narrow ribbon pinned to the left with half the viewport
  // empty beside it. /methodology centred its own inner container and /why did
  // not, so the two pages did not even agree with each other.
  //
  // The band divs stay full width so their rules still span the page; only their
  // contents are centred, which keeps the furniture and the reading column doing
  // different jobs.
  const column: CSSProperties = {
    maxWidth: 'var(--maxw-article)',
    marginInline: 'auto',
  };

  return (
    <main className="gg-article" style={{ flex: 1 }}>
      <div style={{ padding: 'var(--band-y) var(--gutter) var(--space-9)' }}>
        <div style={column}>
          <ArticleHeader kicker={kicker} title={title} standfirst={standfirst} updated={updated} />
        </div>
      </div>
      <div
        style={{
          padding: 'var(--space-9) var(--gutter) var(--space-11)',
          borderTop: '1px solid var(--border-default)',
        }}
      >
        <div style={column}>
          <Prose>{children}</Prose>
        </div>
      </div>
    </main>
  );
}
