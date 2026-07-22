import type { ComponentType, ReactNode } from 'react';

/** Props a custom link component receives from smoothgui's navigational components. */
export interface LinkRenderProps {
  href: string;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}

/**
 * A drop-in replacement for the plain `<a>` used by navigational components.
 *
 * smoothgui never imports a router. Client-side routing is opted into by the
 * consumer, which adapts its own link:
 *
 * ```tsx
 * const RouterLink: LinkComponent = ({ href, ...rest }) => <Link to={href} {...rest} />;
 * <SiteHeader linkComponent={RouterLink} ... />
 * ```
 */
export type LinkComponent = ComponentType<LinkRenderProps>;
