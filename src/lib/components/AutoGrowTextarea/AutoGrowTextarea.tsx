import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react';
import { tokens } from '../../tokens';

export interface AutoGrowTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  /** Grow up to this height (px) then scroll (default 200). */
  maxHeight?: number;
  /** Called on Enter (without Shift). Enables the send-on-Enter behaviour and
   * prevents the newline; omit to keep plain multiline. */
  onSubmit?: () => void;
}

/** A textarea that grows with its content up to `maxHeight`, then scrolls.
 * Optionally submits on Enter (Shift+Enter always inserts a newline). Generic
 * replacement for the hand-rolled auto-grow inputs. Forwards a ref to the
 * underlying <textarea> so callers can focus/measure it (the internal
 * auto-grow ref is shared with the forwarded one). */
const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  function AutoGrowTextarea(
    { value, onChange, maxHeight = 200, onSubmit, onKeyDown, style, ...rest },
    forwardedRef,
  ) {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Expose the real <textarea> element through the forwarded ref, so callers
    // can call .focus()/read scrollHeight while auto-grow keeps working locally.
    useImperativeHandle(forwardedRef, () => ref.current as HTMLTextAreaElement, []);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    return (
      <textarea
        {...rest}
        ref={ref}
        value={value}
        rows={1}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (onSubmit && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }}
        style={{
          resize: 'none',
          maxHeight,
          fontFamily: 'system-ui',
          fontSize: 14,
          padding: 10,
          borderRadius: 6,
          border: `1px solid ${tokens.borderMedium}`,
          background: tokens.surface,
          color: tokens.text,
          outline: 'none',
          ...style,
        }}
      />
    );
  },
);

export default AutoGrowTextarea;
