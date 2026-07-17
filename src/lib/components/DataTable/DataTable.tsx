import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface Column<Row> {
  /** Stable key; also used to read `row[key]` when no `render` is given. */
  key: string;
  label: ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** Custom cell renderer; falls back to `String(row[key])`. */
  render?: (row: Row, index: number) => ReactNode;
}

export interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  /** Stable React key per row (value or accessor). */
  rowKey: (row: Row, index: number) => string | number;
  onRowClick?: (row: Row, index: number) => void;
  /** Rendered in place of the body when `rows` is empty. */
  empty?: ReactNode;
}

/** A compact table with a sticky uppercase header, tabular-aligned cells, and
 * column-driven rendering. Generic replacement for the loose
 * tableStyle/thStyle/tdStyle objects re-declared across data pages; the column
 * definitions (app-specific) stay in the caller. Provide a column `render` for
 * any non-string value — the fallback stringifies `row[key]` and shows '' for
 * null/undefined. */
export default function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
}: DataTableProps<Row>) {
  const thStyle = (c: Column<Row>): React.CSSProperties => ({
    textAlign: c.align ?? 'left',
    padding: '6px 10px',
    borderBottom: `1px solid ${tokens.borderLight}`,
    color: tokens.textFaint,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    position: 'sticky',
    top: 0,
    background: tokens.surfaceAlt,
    width: c.width,
  });
  const tdStyle = (c: Column<Row>): React.CSSProperties => ({
    padding: '5px 10px',
    borderBottom: `1px solid ${tokens.borderSubtle}`,
    textAlign: c.align ?? 'left',
    fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : undefined,
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: tokens.text }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={thStyle(c)}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && empty !== undefined ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: 0 }}>
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} style={tdStyle(c)}>
                  {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
