import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface WizardStepControls {
  /** Move to the next visible step, or to the summary past the last. */
  advance: () => void;
  back: () => void;
  /** Skip an optional step (same as advance; semantic sugar). */
  skip: () => void;
  /** Close the whole wizard. */
  close: () => void;
  /** 0-based index within the currently-visible steps. */
  index: number;
  total: number;
}

export interface WizardStep<S = unknown> {
  id: string;
  title: string;
  optional?: boolean;
  /** Hide this step unless the predicate holds (evaluated live on `state`). */
  showWhen?: (state: S) => boolean;
  /** Considered "already done" — when `freezeCompletedAtOpen`, hidden this run. */
  isComplete?: (state: S) => boolean;
  /** The step body owns its primary action and calls `ctx.advance()` itself;
   * the harness then hides its own Next button. */
  ownsPrimaryAction?: boolean;
  /** Label for the harness Next button on this step (default "Next" / "Review"). */
  nextLabel?: string;
  render: (ctx: WizardStepControls, state: S) => ReactNode;
}

export interface WizardSummaryControls<S> {
  close: () => void;
  back: () => void;
  state: S;
}

export interface WizardProps<S = unknown> {
  open: boolean;
  onClose: () => void;
  title?: string;
  steps: WizardStep<S>[];
  /** Arbitrary app state passed to `showWhen` / `isComplete` / `render`. */
  state: S;
  /** Snapshot the completed steps at open and hide them for this run, so
   * finishing a step mid-flow doesn't reshuffle the remaining ones. */
  freezeCompletedAtOpen?: boolean;
  /** Optional recap screen shown after the final step (or immediately if every
   * step was already complete at open). */
  renderSummary?: (ctx: WizardSummaryControls<S>) => ReactNode;
}

/** A non-blocking, multi-step modal harness: ordered steps with conditional
 * visibility, skip-completed-on-reopen, a "Step N of M" indicator,
 * back/skip/later navigation, Escape/backdrop close, and an optional summary.
 * The step bodies and app state are injected, so the harness carries no
 * app-specific coupling. */
export default function Wizard<S = unknown>({
  open,
  onClose,
  title,
  steps,
  state,
  freezeCompletedAtOpen = false,
  renderSummary,
}: WizardProps<S>) {
  const [idx, setIdx] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [doneAtOpen, setDoneAtOpen] = useState<ReadonlySet<string>>(new Set());

  // On open: reset the cursor and snapshot the already-complete steps.
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setShowSummary(false);
    if (freezeCompletedAtOpen) {
      const done = new Set<string>();
      for (const s of steps) if (s.isComplete?.(state)) done.add(s.id);
      setDoneAtOpen(done);
    } else {
      setDoneAtOpen(new Set());
    }
    // Snapshot is intentional: taken once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const visible = useMemo(
    () => steps.filter((s) => (s.showWhen ? s.showWhen(state) : true) && !doneAtOpen.has(s.id)),
    [steps, state, doneAtOpen],
  );
  const total = visible.length;
  const safeIdx = Math.min(idx, Math.max(0, total - 1));
  const step = visible[safeIdx] as WizardStep<S> | undefined;

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const advance = () => {
    if (safeIdx < total - 1) setIdx(safeIdx + 1);
    else if (renderSummary) setShowSummary(true);
    else close();
  };
  const back = () => setIdx(Math.max(0, safeIdx - 1));
  const ctx: WizardStepControls = { advance, back, skip: advance, close, index: safeIdx, total };

  const backdrop: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(24, 22, 17, 0.62)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };
  const card: React.CSSProperties = {
    width: 'min(560px, 100%)',
    maxHeight: '86vh',
    overflow: 'auto',
    background: tokens.surface,
    color: tokens.text,
    borderRadius: tokens.radiusMd,
    border: `1px solid ${tokens.borderMedium}`,
    boxShadow: tokens.shadowFloat,
    padding: '20px 22px',
    fontFamily: tokens.fontSans,
  };
  const ghostBtn: React.CSSProperties = {
    padding: '7px 14px',
    borderRadius: tokens.radiusSm,
    border: `1px solid ${tokens.borderMedium}`,
    background: tokens.surfaceAlt,
    color: tokens.textMuted,
    cursor: 'pointer',
    fontSize: 13,
  };
  const primaryBtn: React.CSSProperties = {
    padding: '7px 16px',
    borderRadius: tokens.radiusSm,
    border: `1px solid ${tokens.primary}`,
    background: tokens.primary,
    color: tokens.surface,
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: 600,
  };

  const onSummary = showSummary || !step;

  return (
    <div style={backdrop} onClick={close}>
      <div style={card} role="dialog" aria-label={title ?? 'Wizard'} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <strong style={{ fontFamily: tokens.fontDisplay, fontSize: 20, fontWeight: 600 }}>{title ?? 'Setup'}</strong>
          <button
            aria-label="Close"
            title="Close"
            onClick={close}
            style={{ background: 'none', border: 'none', color: tokens.textHint, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {onSummary ? (
          <div>
            {renderSummary ? (
              renderSummary({ close, back: () => { setShowSummary(false); setIdx(Math.max(0, total - 1)); }, state })
            ) : (
              <p style={{ fontSize: 13, color: tokens.textSecondary }}>All done.</p>
            )}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: tokens.textFaint, marginBottom: 4 }}>
              Step {safeIdx + 1} of {total}
            </div>
            <div style={{ fontFamily: tokens.fontDisplay, fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
              {step.title}
              {step.optional ? (
                <span style={{ color: tokens.textHint, fontWeight: 400, fontSize: 12 }}> · optional</span>
              ) : null}
            </div>

            <div style={{ marginBottom: 16 }}>{step.render(ctx, state)}</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={ghostBtn} disabled={safeIdx === 0} onClick={back}>
                  Back
                </button>
                <button style={ghostBtn} onClick={close}>
                  Later
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {step.optional && (
                  <button style={ghostBtn} onClick={advance}>
                    Skip
                  </button>
                )}
                {!step.ownsPrimaryAction && (
                  <button style={primaryBtn} onClick={advance}>
                    {step.nextLabel ?? (safeIdx === total - 1 ? (renderSummary ? 'Review' : 'Finish') : 'Next')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
