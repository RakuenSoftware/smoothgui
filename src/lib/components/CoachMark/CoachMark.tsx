import { useEffect, useState } from 'react';
import { tokens } from '../../tokens';
import { useSeenState } from './useSeenState';

export interface CoachContent {
  title: string;
  /** One paragraph per array entry. */
  body: string[];
  /** Optional cross-link target passed to `onNavigate`. */
  seeAlso?: string;
}

export interface CoachMarkProps {
  /** Stable id for this coach-mark; drives auto-open + persistence. Changing it
   * (e.g. the active route) re-evaluates whether to auto-open. */
  id: string;
  /** Content to show; `undefined` renders nothing. */
  content?: CoachContent;
  /** localStorage namespace for the "seen" set. */
  storageKey?: string;
  /** Follow a `seeAlso` link. Omit to hide the link. */
  onNavigate?: (to: string) => void;
  /** Resolve a friendly title for a `seeAlso` target. */
  resolveSeeAlsoTitle?: (to: string) => string;
}

/** A per-view coach-mark: on first visit to an `id` with content it auto-opens
 * a dismissible, NON-MODAL corner card; after dismissal it collapses to a "?"
 * re-opener. Dismissal is remembered under `storageKey`. Content lookup and
 * navigation are injected, so the component is fully app-agnostic. The caller
 * mounts it inside a `position: relative` container. */
export default function CoachMark({
  id,
  content,
  storageKey = 'smoothgui_coachmark_seen',
  onNavigate,
  resolveSeeAlsoTitle,
}: CoachMarkProps) {
  const { hasSeen, markSeen } = useSeenState(storageKey);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (content && !hasSeen(id)) setOpen(true);
    else setOpen(false);
  }, [id, content, hasSeen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markSeen(id);
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, id, markSeen]);

  if (!content) return null;

  const dismiss = () => {
    markSeen(id);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        aria-label="Show help"
        title="What is this?"
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          zIndex: 20,
          width: 26,
          height: 26,
          borderRadius: '50%',
          cursor: 'pointer',
          border: `1px solid ${tokens.borderMedium}`,
          background: tokens.surface,
          color: tokens.info,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ?
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={`${content.title} help`}
      style={{
        position: 'absolute',
        top: 10,
        right: 12,
        zIndex: 25,
        width: 'min(380px, calc(100% - 24px))',
        background: tokens.surface,
        borderRadius: tokens.radiusMd,
        border: `1px solid ${tokens.borderMedium}`,
        boxShadow: tokens.shadowFloat,
        padding: '16px 18px',
        fontFamily: tokens.fontSans,
        color: tokens.textMuted,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: tokens.fontDisplay, fontSize: 18, fontWeight: 600, color: tokens.text }}>{content.title}</span>
        <button
          aria-label="Close help"
          title="Close"
          onClick={dismiss}
          style={{ background: 'none', border: 'none', color: tokens.textHint, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>
      {content.body.map((line, i) => (
        <p key={i} style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 7px' }}>
          {line}
        </p>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        {content.seeAlso && onNavigate ? (
          <button
            onClick={() => {
              const to = content.seeAlso!;
              dismiss();
              onNavigate(to);
            }}
            style={{ background: 'none', border: 'none', color: tokens.info, cursor: 'pointer', fontSize: 12.5, padding: 0 }}
          >
            See also: {resolveSeeAlsoTitle?.(content.seeAlso) ?? content.seeAlso} →
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={dismiss}
          style={{
            padding: '5px 14px',
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.borderMedium}`,
            background: tokens.surfaceAlt,
            color: tokens.textMuted,
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
