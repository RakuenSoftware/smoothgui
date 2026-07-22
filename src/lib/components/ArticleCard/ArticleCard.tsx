import Badge from '../Badge/Badge';
import type { LinkComponent } from '../linkTypes';

export interface ArticleCardProps {
  /** Post title. Rendered as an <h3>. */
  title: string;
  /** Destination for the title link. */
  href: string;
  /** Short summary / lede. */
  excerpt?: string;
  /** Human-readable date, e.g. "22 July 2026". */
  date?: string;
  /** Machine-readable date for the <time> element, e.g. "2026-07-22". */
  dateTime?: string;
  /** Optional byline. */
  author?: string;
  /** Topic tags, rendered as neutral badges. */
  tags?: string[];
  /** Router link to use instead of a plain <a>. See {@link LinkComponent}. */
  linkComponent?: LinkComponent;
}

/**
 * Summary entry for a content listing — a blog index, a changelog, a docs list.
 * Only the title is a link, so tags and meta stay selectable.
 */
export default function ArticleCard({
  title,
  href,
  excerpt,
  date,
  dateTime,
  author,
  tags,
  linkComponent: Link,
}: ArticleCardProps) {
  const titleLink =
    Link != null
      ? <Link href={href} className="sg-article__link">{title}</Link>
      : <a className="sg-article__link" href={href}>{title}</a>;

  return (
    <article className="sg-article">
      {(date != null || author != null) && (
        <p className="sg-article__meta">
          {date != null && <time dateTime={dateTime}>{date}</time>}
          {date != null && author != null && <span aria-hidden="true"> · </span>}
          {author != null && <span>{author}</span>}
        </p>
      )}
      <h3 className="sg-article__title">{titleLink}</h3>
      {excerpt != null && <p className="sg-article__excerpt">{excerpt}</p>}
      {tags != null && tags.length > 0 && (
        <div className="sg-article__tags">
          {tags.map((tag) => <Badge key={tag} label={tag} variant="neutral" />)}
        </div>
      )}
    </article>
  );
}
