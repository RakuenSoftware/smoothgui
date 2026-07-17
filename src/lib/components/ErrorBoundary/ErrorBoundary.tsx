import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** What to render after a child throws. Defaults to `null` — i.e. silently
   * drop the subtree. Ideal for optional chrome mounted outside the main page
   * boundary, where dropping one overlay beats taking down the app. */
  fallback?: ReactNode;
  /** Notified when a child throws (for logging/telemetry). */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Label included in the default console.error line. */
  label?: string;
}

/** A fail-safe error boundary. Unlike a typical boundary that shows a fallback
 * UI, this defaults to rendering NOTHING on error, so a broken optional overlay
 * disappears instead of unmounting the shell. Provide `fallback` for a visible
 * recovery UI. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    console.error(this.props.label ?? 'ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
