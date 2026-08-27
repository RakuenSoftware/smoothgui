/**
 * Real call sites for every v0.9.0 site primitive. This file exists so `tsc -b`
 * typechecks the props of each component — an export-only check does not.
 */
import {
  ArticleCard,
  CallToAction,
  Card,
  CodeBlock,
  FeatureCard,
  FeatureGrid,
  Hero,
  Prose,
  Section,
  SiteFooter,
  SiteHeader,
  ThemeToggle,
} from '../index';
import type { LinkComponent, SiteFooterGroup, SiteNavItem } from '../index';

// A consumer adapting its own router link, as the docs describe.
const DemoLink: LinkComponent = ({ href, className, children, ...rest }) => (
  <a href={href} className={className} {...rest}>{children}</a>
);

const NAV: SiteNavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'Source', href: 'https://example.invalid', external: true },
];

const FOOTER_GROUPS: SiteFooterGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '/products' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Elsewhere',
    links: [{ label: 'Repository', href: 'https://example.invalid', external: true }],
  },
];

export default function SitePrimitivesDemo() {
  return (
    <div>
      <SiteHeader
        brand={<a href="/">Example</a>}
        items={NAV}
        activeHref="/blog"
        actions={<><a href="/start">Get started</a><ThemeToggle defaultTheme="dark" storageKey="demo-theme" /></>}
        linkComponent={DemoLink}
      />

      <Hero
        eyebrow="Storage"
        title="One appliance, every tier"
        subtitle="A headline, some supporting copy, and two calls to action."
        actions={<><a href="/start">Get started</a><a href="/docs">Read the docs</a></>}
        media={<CodeBlock code="apt install example" label="install.sh" />}
        tone="dark"
      />

      <Section
        eyebrow="Why"
        title="Built on tools you already run"
        description="Section supports an optional header block and a tone."
        tone="default"
        centered
        id="why"
      >
        <FeatureGrid columns={3} variant="ruled">
          <FeatureCard icon="⚡" title="Fast" href="/fast" linkComponent={DemoLink}>
            Linked feature cell.
          </FeatureCard>
          <FeatureCard icon="🔒" title="Safe">Plain feature cell.</FeatureCard>
          <FeatureCard icon="🧩" title="External" href="https://example.invalid" external>
            External feature cell.
          </FeatureCard>
        </FeatureGrid>
      </Section>

      <Section title="Cards" tone="muted" width="wide">
        <FeatureGrid columns={2}>
          <Card title="Plain card" footer={<span>Updated today</span>}>
            A card with a footer and no link.
          </Card>
          <Card title="Linked card" href="/somewhere" linkComponent={DemoLink}>
            The whole surface is one click target.
          </Card>
        </FeatureGrid>
      </Section>

      <Section title="Writing" tone="default" width="narrow">
        <ArticleCard
          title="A post with everything"
          href="/blog/one"
          excerpt="Summary line for the listing."
          date="22 July 2026"
          dateTime="2026-07-22"
          author="Rakuen Software"
          tags={['release', 'storage']}
          linkComponent={DemoLink}
        />
        <ArticleCard title="A minimal post" href="/blog/two" />

        <Prose>
          <h2>Rendered children</h2>
          <p>Prose styles raw elements so markdown output reads correctly.</p>
          <pre><code>example --flag</code></pre>
        </Prose>

        <Prose html="<h2>Trusted HTML</h2><p>Build-time markdown output.</p>" />
      </Section>

      <CallToAction
        title="Ready to try it?"
        description="A closing band with a single next step."
        actions={<a href="/start">Get started</a>}
        tone="dark"
      />

      <SiteFooter
        brand={<><strong>Example</strong><p>One-line description.</p></>}
        groups={FOOTER_GROUPS}
        bottom={<span>© 2026 Example</span>}
        linkComponent={DemoLink}
      />
    </div>
  );
}
