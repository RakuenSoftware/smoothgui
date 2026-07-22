import type { ReactNode } from 'react';
import type { LinkComponent } from '../linkTypes';

export interface CardProps {
  /** Card heading. Rendered as an <h3> when present. */
  title?: ReactNode;
  /** Body copy or arbitrary content. */
  children?: ReactNode;
  /** Visual rendered above the title (image, icon, chart). */
  media?: ReactNode;
  /** Content pinned to the bottom of the card (meta, actions). */
  footer?: ReactNode;
  /** When set, the whole card becomes a link to this destination. */
  href?: string;
  /** Treat `href` as external: opens in a new tab with rel="noreferrer". */
  external?: boolean;
  /** Router link to use instead of a plain <a>. See {@link LinkComponent}. */
  linkComponent?: LinkComponent;
}

/**
 * A generic elevated surface. Optionally the entire card is a single click
 * target, which keeps hit areas large without nesting interactive elements.
 */
export default function Card({
  title,
  children,
  media,
  footer,
  href,
  external = false,
  linkComponent: Link,
}: CardProps) {
  const body = (
    <>
      {media != null && <div className="sg-card__media">{media}</div>}
      {title != null && <h3 className="sg-card__title">{title}</h3>}
      {children != null && <div className="sg-card__body">{children}</div>}
      {footer != null && <div className="sg-card__footer">{footer}</div>}
    </>
  );

  if (href == null) {
    return <div className="sg-card">{body}</div>;
  }
  if (Link != null && !external) {
    return <Link href={href} className="sg-card sg-card--link">{body}</Link>;
  }
  return (
    <a
      className="sg-card sg-card--link"
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {body}
    </a>
  );
}
