import type { ReactNode } from 'react';

export interface DataFigureProps {
  /**
   * Unique within the page. Used for the radio group name and the label
   * targets, so two figures on one page do not drive each other.
   */
  id: string;
  /** The graphic. Usually an <svg>, given the sg-chart classes. */
  chart?: ReactNode;
  /** The same rows as numbers. Usually a <table>. */
  table?: ReactNode;
  /**
   * Pre-rendered HTML for either pane, for content that arrives as a string
   * rather than as nodes.
   *
   * SECURITY: injected with `dangerouslySetInnerHTML`, so it bypasses React's
   * escaping. Only pass HTML you produced from trusted input — your own
   * repository's content, rendered at build time. Never user-submitted.
   * Ignored when the matching node prop is provided.
   */
  chartHtml?: string;
  tableHtml?: string;
  /** Sits under both panes and describes what the reader is looking at. */
  caption?: ReactNode;
  /** Optional key beneath the chart, e.g. what each colour means. */
  legend?: ReactNode;
  /** Defaults to "Chart" and "Numbers". */
  chartLabel?: string;
  tableLabel?: string;
  /** Which pane opens first. Defaults to the chart. */
  initial?: 'chart' | 'table';
}

/**
 * A figure that shows a chart by default and switches to the numbers behind it.
 *
 * The switch is CSS only — two radio inputs and sibling selectors — so the same
 * markup works when React renders it and when the identical HTML is injected by
 * `Prose`, where script never runs. That is why this does not use `Tabs`, which
 * is controlled and needs state.
 *
 * Give the chart the `sg-chart` classes so it inherits the system's ink, rules
 * and series colours rather than hard-coding them.
 */
export default function DataFigure({
  id,
  chart,
  table,
  chartHtml,
  tableHtml,
  caption,
  legend,
  chartLabel = 'Chart',
  tableLabel = 'Numbers',
  initial = 'chart',
}: DataFigureProps) {
  const chartId = `${id}-chart`;
  const tableId = `${id}-table`;

  return (
    <figure className="sg-figure">
      <input
        className="sg-figure__radio sg-figure__radio--chart"
        type="radio"
        name={id}
        id={chartId}
        defaultChecked={initial === 'chart'}
      />
      <input
        className="sg-figure__radio sg-figure__radio--table"
        type="radio"
        name={id}
        id={tableId}
        defaultChecked={initial === 'table'}
      />

      <div className="sg-figure__tabs">
        <label className="sg-figure__tab sg-figure__tab--chart" htmlFor={chartId}>
          {chartLabel}
        </label>
        <label className="sg-figure__tab sg-figure__tab--table" htmlFor={tableId}>
          {tableLabel}
        </label>
      </div>

      <div className="sg-figure__panes">
        <div className="sg-figure__pane sg-figure__pane--chart">
          {chart == null && chartHtml != null
            ? <div dangerouslySetInnerHTML={{ __html: chartHtml }} />
            : chart}
          {legend != null && <div className="sg-figure__legend">{legend}</div>}
        </div>
        <div className="sg-figure__pane sg-figure__pane--table">
          {table == null && tableHtml != null
            ? <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
            : table}
        </div>
      </div>

      {caption != null && <figcaption className="sg-figure__caption">{caption}</figcaption>}
    </figure>
  );
}
