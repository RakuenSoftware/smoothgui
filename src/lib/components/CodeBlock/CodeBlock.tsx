import { useCallback, useEffect, useRef, useState } from 'react';

export interface CodeBlockProps {
  /** The source text to display. Rendered verbatim, never interpreted. */
  code: string;
  /** Label shown in the header bar, e.g. a filename or language name. */
  label?: string;
  /** Show the copy-to-clipboard button (default true). */
  copyable?: boolean;
}

/**
 * Displays a block of source text with an optional label and a
 * copy-to-clipboard button. Deliberately has no syntax-highlighting
 * dependency — the text is rendered as-is.
 */
export default function CodeBlock({ code, label, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current != null) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(() => {
    // Older/insecure-context browsers have no clipboard API; leave the button
    // inert rather than throwing at the user.
    if (typeof navigator === 'undefined' || navigator.clipboard == null) return;
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timer.current != null) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    });
  }, [code]);

  return (
    <div className="sg-codeblock">
      {(label != null || copyable) && (
        <div className="sg-codeblock__bar">
          <span className="sg-codeblock__label">{label}</span>
          {copyable && (
            <button
              type="button"
              className="sg-codeblock__copy"
              onClick={copy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className="sg-codeblock__pre"><code>{code}</code></pre>
    </div>
  );
}
