import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { NavItem } from '@/components/navItems';
import { primaryNavItems } from '@/components/navItems';
import { MARK } from '@/components/ds/core/tokens';

export interface TopNavProps {
  /** Which primary item is current. */
  active?: NavItem;
  /** Mono meta text on the right, e.g. a country count. Hidden below 1280px. */
  meta?: string;
  bordered?: boolean;
  style?: CSSProperties;
}

const itemStyle = (on: boolean): CSSProperties => ({
  padding: '7px 13px',
  borderRadius: 'var(--r-well)',
  fontSize: 'var(--fs-ui)',
  fontWeight: 'var(--fw-medium)' as CSSProperties['fontWeight'],
  background: on ? 'rgba(238,242,242,0.12)' : 'transparent',
  color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
  transition: 'all var(--dur-fast) var(--ease-out)',
  whiteSpace: 'nowrap',
});

/**
 * Site header.
 *
 * Ported from the design system's TopNav with two changes for the app: it
 * renders Next `Link`s rather than bare anchors, and it reads
 * `components/navItems.ts` instead of a hardcoded list — that file stays the
 * single source of nav truth.
 *
 * There is deliberately no hamburger. Below 768px `tokens/responsive.css`
 * converts `.gg-nav-items` into a fixed bottom bar with 44px targets, and the
 * demoted routes live in SiteFooter. That is the system's answer to small
 * screens, and it is a better one than the drawer it replaces: the four things
 * people actually navigate between stay one tap away instead of two.
 *
 * The system's `location` / LocationPill props are not ported. Geolocation is
 * deferred with the homepage, and a location affordance that cannot detect
 * anything would be a lie.
 */
export default function TopNav({ active, meta, bordered = true, style }: TopNavProps) {
  return (
    <nav
      className="gg-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: '18px var(--gutter)',
        borderBottom: bordered ? '1px solid var(--border-default)' : undefined,
        ...style,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          color: 'var(--text-primary)',
          flex: 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG mark, nothing to optimise */}
        <img src={MARK} alt="" style={{ width: 26 }} />
        <span
          style={{
            fontSize: 17,
            fontWeight: 'var(--fw-bold)' as CSSProperties['fontWeight'],
            letterSpacing: '-0.015em',
          }}
        >
          Grid Gorilla
        </span>
      </Link>

      <div
        className="gg-nav-items gg-scroll-row"
        style={{ display: 'flex', gap: 'var(--space-1)', marginLeft: 'var(--space-6)' }}
      >
        {primaryNavItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? 'page' : undefined}
            style={itemStyle(item.key === active)}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {meta && (
        <span
          className="gg-nav-meta"
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-mono)',
            color: 'var(--text-quiet)',
            whiteSpace: 'nowrap',
          }}
        >
          {meta}
        </span>
      )}
    </nav>
  );
}
