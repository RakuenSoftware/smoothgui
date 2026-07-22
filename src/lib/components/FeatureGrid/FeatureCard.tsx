import type { ReactNode } from 'react';
import type { LinkComponent } from '../linkTypes';

export interface FeatureCardProps {
  /** Glyph, emoji or small SVG shown above the title. */
  icon?: ReactNode;
  /** Feature name. Rendered as an <h3>. */
  title: ReactNode;
  /** One or two sentences describing the feature. */
  children?: ReactNode;
  /** When set, the card links onward (e.g. to the product page). */
  href?: string;
  /** Treat `href` as external: opens in a new tab with rel="noreferrer". */
  external?: boolean;
  /** Router link to use instead of a plain <a>. See {@link LinkComponent}. */
  linkComponent?: LinkComponent;
}

/** A single icon/title/body cell. Usable on its own or inside {@link FeatureGrid}. */
export default function FeatureCard({
  icon,
  title,
  children,
  href,
  external = false,
  linkComponent: Link,
}: FeatureCardProps) {
  const body = (
    <>
      {icon != null && <div className="sg-feature__icon" aria-hidden="true">{icon}</div>}
      <h3 className="sg-feature__title">{title}</h3>
      {children != null && <p className="sg-feature__body">{children}</p>}
    </>
  );

  if (href == null) {
    return <div className="sg-feature">{body}</div>;
  }
  if (Link != null && !external) {
    return <Link href={href} className="sg-feature sg-feature--link">{body}</Link>;
  }
  return (
    <a
      className="sg-feature sg-feature--link"
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {body}
    </a>
  );
}
