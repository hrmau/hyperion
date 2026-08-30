import { Fragment } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export interface DataTableColumn<Row> {
  key: string;
  label: ReactNode;
  /** Mono + tabular numerals. Every number that is data belongs in the mono stack. */
  mono?: boolean;
  align?: 'left' | 'right';
  width?: number;
  /** Dropped below 768px rather than side-scrolling the table. */
  mobileOptional?: boolean;
  sortable?: boolean;
  render?: (row: Row, index: number) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  onRowClick?: (row: Row) => void;
  onHeaderClick?: (key: string) => void;
  /** Row to tint — the visitor's own country, or the current selection. */
  highlightKey?: string;
  isExpanded?: (row: Row) => boolean;
  renderExpanded?: (row: Row) => ReactNode;
  style?: CSSProperties;
}

/**
 * Rankings table. Mono numerals, hairline rows, no zebra striping, no vertical
 * rules — the structure comes from the hairlines and the alignment, not from
 * fills.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  onHeaderClick,
  highlightKey,
  isExpanded,
  renderExpanded,
  style,
}: DataTableProps<Row>) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', ...style }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className={c.mobileOptional ? 'gg-col-optional' : undefined}
              onClick={c.sortable && onHeaderClick ? () => onHeaderClick(c.key) : undefined}
              aria-sort={c.sortable ? 'none' : undefined}
              style={{
                textAlign: c.align ?? 'left',
                padding: '0 var(--space-5) var(--space-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-mono-xxs)',
                fontWeight: 'var(--fw-medium)' as CSSProperties['fontWeight'],
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--text-label)',
                borderBottom: '1px solid var(--border-emphasis)',
                whiteSpace: 'nowrap',
                width: c.width,
                cursor: c.sortable && onHeaderClick ? 'pointer' : undefined,
                userSelect: 'none',
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const key = rowKey(row, i);
          const on = highlightKey != null && key === highlightKey;
          const expanded = isExpanded?.(row) ?? false;
          return (
            <Fragment key={key}>
              <tr
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{
                  background: on ? 'var(--green-wash)' : 'transparent',
                  cursor: onRowClick ? 'pointer' : undefined,
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={c.mobileOptional ? 'gg-col-optional' : undefined}
                    style={{
                      textAlign: c.align ?? 'left',
                      padding: 'var(--space-5)',
                      borderBottom: expanded ? 'none' : '1px solid var(--border-default)',
                      fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                      fontVariantNumeric: c.mono ? 'tabular-nums' : undefined,
                      fontSize: c.mono ? 'var(--fs-mono-sm)' : 'var(--fs-body-sm)',
                      color: on && c.key === columns[0].key ? 'var(--green)' : 'var(--text-primary)',
                    }}
                  >
                    {c.render ? c.render(row, i) : null}
                  </td>
                ))}
              </tr>
              {expanded && renderExpanded && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      padding: '0 var(--space-5) var(--space-8)',
                      borderBottom: '1px solid var(--border-default)',
                      background: 'var(--bg-raised)',
                    }}
                  >
                    {renderExpanded(row)}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
