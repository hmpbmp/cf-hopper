/**
 * Cryptographically secure random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % range);
}

/**
 * Pick one random item from an array.
 */
export function randomPick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Pick N random items from an array (no duplicates).
 */
export function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = shuffle([...arr]);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Weighted random pick. Weights array must be same length as items.
 */
export function weightedPick<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return randomPick(items);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Weighted random sample of N items (no duplicates).
 */
export function weightedSample<T>(items: T[], n: number, weights: number[]): T[] {
  const result: T[] = [];
  const availableItems = [...items];
  const availableWeights = [...weights];

  const count = Math.min(n, availableItems.length);
  for (let i = 0; i < count; i++) {
    const picked = weightedPick(availableItems, availableWeights);
    result.push(picked);
    const idx = availableItems.indexOf(picked);
    availableItems.splice(idx, 1);
    availableWeights.splice(idx, 1);
  }

  return result;
}

/**
 * Shuffle array using Fisher-Yates algorithm.
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a UUID v4.
 */
export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;
  const hex = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Pick random element from a const array.
 */
export function randomFromConst<T extends readonly string[]>(arr: T): T[number] {
  return arr[randomInt(0, arr.length - 1)] as T[number];
}
