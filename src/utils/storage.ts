// Per-viewer preferences. Browsers can refuse storage (private windows, blocked site data),
// so a failed read falls back to the default and a failed write only lasts for this visit.
export const readChoice = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return allowed.find((item) => item === value) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeChoice = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the choice still applies until the page is reloaded.
  }
};
