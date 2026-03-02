export function parseEnabledPaymentChannels(
  raw: string | null | undefined
): string[] | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      const codes = parsed
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean);
      // Empty array means "configured but none enabled".
      return codes;
    }

    if (typeof parsed === "string") {
      const v = parsed.trim();
      return v ? [v] : null;
    }
  } catch {
    // fall through to CSV/whitespace parsing
  }

  const parts = trimmed
    .split(/[\s,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  // If we can't extract any tokens, treat it as unset/misconfigured.
  return parts.length ? parts : null;
}
