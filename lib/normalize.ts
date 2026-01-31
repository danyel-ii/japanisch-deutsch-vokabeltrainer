export function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeGerman(value: string) {
  return normalizeWhitespace(value).toLowerCase();
}

export function normalizeJapanese(value: string) {
  return normalizeWhitespace(value);
}
