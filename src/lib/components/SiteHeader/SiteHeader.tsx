import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { LinkComponent } from '../linkTypes';

export interface SiteNavItem {
  label: string;
  href: string;
  /** Opens in a new tab with rel="noreferrer", and never uses `linkComponent`. */
  external?: boolean;
}

export interface SiteHeaderProps {
  /** Logo / wordmark, usually wrapped in a link to the home page. */
  brand: ReactNode;
  /** Primary navigation links. */
  items?: SiteNavItem[];
  /** href of the currently active item, marked with aria-current="page". */
  activeHref?: string;
  /** Trailing content, e.g. a "Get started" button. */
  actions?: ReactNode;
  /** Router link to use instead of a plain <a>. See {@link LinkComponent}. */
  linkComponent?: LinkComponent;
}

/**
 * Top navigation bar for public, content-led pages — the counterpart to
 * `AppShell`, which owns the signed-in console layout. Collapses to a
 * disclosure menu on narrow viewports.
 */
export default function SiteHeader({
  brand,
  items = [],
  activeHref,
  actions,
  linkComponent: Link,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Escape closes the mobile menu, matching normal disclosure behaviour.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const renderItem = (item: SiteNavItem) => {
    const current = activeHref != null && item.href === activeHref;
    const className = `sg-siteheader__link${current ? ' sg-siteheader__link--active' : ''}`;
    const ariaCurrent = current ? ('page' as const) : undefined;

    if (Link != null && !item.external) {
      return (
        <Link key={item.href} href={item.href} className={className} aria-current={ariaCurrent}>
          {item.label}
        </Link>
      );
    }
    return (
      <a
        key={item.href}
        href={item.href}
        className={className}
        aria-current={ariaCurrent}
        {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {item.label}
      </a>
    );
  };

  return (
    <header className="sg-siteheader">
      <div className="sg-siteheader__inner">
        <div className="sg-siteheader__brand">{brand}</div>

        <nav className="sg-siteheader__nav" aria-label="Primary">
          {items.map(renderItem)}
        </nav>

        {actions != null && <div className="sg-siteheader__actions">{actions}</div>}

        {items.length > 0 && (
          <button
            type="button"
            className="sg-siteheader__toggle"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
        )}
      </div>

      <div
        id={menuId}
        className={`sg-siteheader__mobile${open ? ' sg-siteheader__mobile--open' : ''}`}
        hidden={!open}
      >
        <nav aria-label="Primary (mobile)" onClick={() => setOpen(false)}>
          {items.map(renderItem)}
        </nav>
        {actions != null && <div className="sg-siteheader__mobile-actions">{actions}</div>}
      </div>
    </header>
  );
}
