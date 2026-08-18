export function normalizedTokens(value: string) {
  return new Set(value.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
}

export function headlineSimilarity(left: string, right: string) {
  const a = normalizedTokens(left);
  const b = normalizedTokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function canAutoJoinStory(left: string, right: string) {
  const a = normalizedTokens(left);
  const overlap = [...a].filter((token) => normalizedTokens(right).has(token)).length;
  return overlap >= 3 && headlineSimilarity(left, right) >= 0.55;
}
