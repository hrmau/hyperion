import * as React from "react";

/** Rankings table. Hairline rows, no zebra stripes, no vertical rules.
 *  Numeric columns get `mono: true` (tabular numerals, right-aligned).
 *  `highlightRow` tints the visitor's own country with the green wash.
 *
 * @startingPoint section="Charts" subtitle="Rankings table with mix bars" viewport="700x300"
 */
export interface DataTableProps extends React.HTMLAttributes<HTMLTableElement> {
  columns: Array<{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    /** Mono + tabular numerals — use for every numeric column. */
    mono?: boolean;
    width?: string | number;
    render?: (row: any) => React.ReactNode;
    /** Dropped entirely below 768px. Mark everything except the first two
     *  columns and one headline metric — this product never side-scrolls a
     *  table on a phone. */
    mobileOptional?: boolean;
  }>;
  rows: any[];
  /** Row id to tint (the geolocated country). */
  highlightRow?: string | number;
  onRowClick?: (row: any) => void;
}
export function DataTable(props: DataTableProps): JSX.Element;
