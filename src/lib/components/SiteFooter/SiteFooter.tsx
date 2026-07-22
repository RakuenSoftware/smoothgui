import type { ReactNode } from 'react';
import type { LinkComponent } from '../linkTypes';

export interface SiteFooterLink {
  label: string;
  href: string;
  /** Opens in a new tab with rel="noreferrer", and never uses `linkComponent`. */
  external?: boolean;
}

export interface SiteFooterGroup {
  /** Column heading, e.g. "Products". */
  title: string;
  links: SiteFooterLink[];
}

export interface SiteFooterProps {
  /** Link columns. */
  groups?: SiteFooterGroup[];
  /** Brand block rendered in the first column, above the groups on mobile. */
  brand?: ReactNode;
  /** Bottom bar content, e.g. a copyright line. */
  bottom?: ReactNode;
  /** Router link to use instead of a plain <a>. See {@link LinkComponent}. */
  linkComponent?: LinkComponent;
}

/** Site-wide footer: a brand blurb, columns of links, and a bottom bar. */
export default function SiteFooter({
  groups = [],
  brand,
  bottom,
  linkComponent: Link,
}: SiteFooterProps) {
  const renderLink = (link: SiteFooterLink) => {
    if (Link != null && !link.external) {
      return (
        <li key={link.href}>
          <Link href={link.href} className="sg-sitefooter__link">{link.label}</Link>
        </li>
      );
    }
    return (
      <li key={link.href}>
        <a
          className="sg-sitefooter__link"
          href={link.href}
          {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {link.label}
        </a>
      </li>
    );
  };

  return (
    <footer className="sg-sitefooter">
      <div className="sg-sitefooter__inner">
        {brand != null && <div className="sg-sitefooter__brand">{brand}</div>}
        {groups.length > 0 && (
          <div className="sg-sitefooter__groups">
            {groups.map((group) => (
              <nav key={group.title} className="sg-sitefooter__group" aria-label={group.title}>
                <h2 className="sg-sitefooter__group-title">{group.title}</h2>
                <ul className="sg-sitefooter__list">{group.links.map(renderLink)}</ul>
              </nav>
            ))}
          </div>
        )}
      </div>
      {bottom != null && (
        <div className="sg-sitefooter__bottom">
          <div className="sg-sitefooter__bottom-inner">{bottom}</div>
        </div>
      )}
    </footer>
  );
}
