import { useCallback, useEffect, useRef, useState } from 'react';
import type { InstallerRequest, InstallerResponse, InstallerStatus } from './types';

export interface InstallerSessionConfig {
  requestUrl: string;
  responseUrl?: string;
  statusUrl?: string;
  pollMs?: number;
}

export interface InstallerSessionState {
  request: InstallerRequest | null;
  status: InstallerStatus | null;
  submitting: boolean;
  error: string | null;
}

const defaultResponsePath = (requestId: string, requestUrl: string) =>
  `${requestUrl.replace(/\/$/, '').replace(/\/request$/, '')}/respond?id=${encodeURIComponent(requestId)}`;

const defaultStatusPath = (requestUrl: string) =>
  `${requestUrl.replace(/\/$/, '').replace(/\/request$/, '')}/status`;

export function useInstallerSession({
  requestUrl,
  responseUrl,
  statusUrl,
  pollMs = 1000,
}: InstallerSessionConfig) {
  const [state, setState] = useState<InstallerSessionState>({
    request: null,
    status: null,
    submitting: false,
    error: null,
  });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);
  const resolvedStatusUrl = statusUrl ?? defaultStatusPath(requestUrl);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const response = await fetch(requestUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Request poll failed (${response.status})`);
      }

      const request: InstallerRequest | null = await response.json();
      // The installer backend returns null when no request is pending OR
      // when the current request has already been answered. Reflect either
      // case in state so the form unmounts and the status panel can take
      // over without a re-render race.
      setState((current) => {
        if (!request || !request.id) {
          if (current.request === null) {
            return current;
          }
          return { ...current, request: null, error: null };
        }
        if (current.request && current.request.id === request.id) {
          return current;
        }
        return { ...current, request, error: null };
      });
    } catch (err) {
      setState((current) => ({
        ...current,
        error: err instanceof Error ? err.message : 'Failed to load installer request',
      }));
    }
  }, [requestUrl]);

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(resolvedStatusUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        return;
      }
      const status: InstallerStatus | null = await response.json();
      setState((current) => ({ ...current, status: status ?? null }));
    } catch {
      // Status is best-effort; ignore transient errors so the request
      // poll surfaces real problems via state.error.
    }
  }, [resolvedStatusUrl]);

  const submit = useCallback(
    async (response: InstallerResponse) => {
      if (!response.id) {
        return;
      }

      setState((current) => ({ ...current, submitting: true }));

      const target =
        responseUrl ??
        defaultResponsePath(response.id, requestUrl);
      try {
        const posted = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });
        if (!posted.ok) {
          throw new Error(`Submit failed (${posted.status})`);
        }

        setState((current) => ({
          ...current,
          request: null,
          submitting: false,
          error: null,
        }));
      } catch (err) {
        setState((current) => ({
          ...current,
          submitting: false,
          error: err instanceof Error ? err.message : 'Failed to send installer answer',
        }));
      }
    },
    [responseUrl, requestUrl],
  );

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }

    void poll();
    void pollStatus();
    timer.current = setInterval(() => {
      void poll();
      void pollStatus();
    }, pollMs);

    return () => {
      isMounted.current = false;
      clearTimer();
    };
  }, [clearTimer, poll, pollStatus, pollMs]);

  return { ...state, submit };
}
