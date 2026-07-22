import type { ReactNode } from 'react';

export interface ProseProps {
  /** Rendered long-form content, when you already have React nodes. */
  children?: ReactNode;
  /**
   * Pre-rendered HTML string, injected with `dangerouslySetInnerHTML`.
   *
   * SECURITY: this bypasses React's escaping. Only pass HTML you produced from
   * trusted input (e.g. your own repository's markdown rendered at build time),
   * or HTML you have sanitised yourself. Never pass user-submitted content.
   *
   * Ignored when `children` is provided.
   */
  html?: string;
}

/**
 * Typographic wrapper for long-form content — articles, docs, rendered markdown.
 * Styles the raw HTML elements inside it so content authored as markdown reads
 * correctly without per-element class names.
 */
export default function Prose({ children, html }: ProseProps) {
  if (children == null && html != null) {
    return <div className="sg-prose" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <div className="sg-prose">{children}</div>;
}
