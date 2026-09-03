export type ProfileLocation = {
  /** Страна — свободный текст. */
  country: string;
  /** Город — свободный текст. */
  city: string;
};

export function emptyLocation(): ProfileLocation {
  return { country: '', city: '' };
}

export function isLocationComplete(loc: ProfileLocation | undefined): boolean {
  return Boolean(loc?.country.trim() && loc?.city.trim());
}

/** «Страна, Город» или null, если не заполнено. */
export function formatLocationLabel(
  loc: ProfileLocation | undefined,
): string | null {
  if (!loc || !isLocationComplete(loc)) {
    return null;
  }
  return `${loc.country.trim()}, ${loc.city.trim()}`;
}

export function normalizeLocation(loc: ProfileLocation): ProfileLocation {
  return {
    country: loc.country.trim(),
    city: loc.city.trim(),
  };
}
