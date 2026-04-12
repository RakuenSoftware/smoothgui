export function extractError(e: unknown, fallback = 'An unexpected error occurred'): string {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}
