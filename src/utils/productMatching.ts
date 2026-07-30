import { Product } from '../types';

/**
 * Normalizes string by trimming, lowercasing, and replacing multiple spaces
 */
export function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculates Levenshtein distance between two strings
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);

  if (normA === normB) return 0;
  if (!normA.length) return normB.length;
  if (!normB.length) return normA.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= normB.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= normA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= normB.length; i++) {
    for (let j = 1; j <= normA.length; j++) {
      if (normB.charAt(i - 1) === normA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[normB.length][normA.length];
}

/**
 * Computes similarity ratio between 0 and 1
 */
export function getSimilarityRatio(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  if (normA === normB) return 1;
  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen === 0) return 1;
  const dist = getLevenshteinDistance(normA, normB);
  return 1 - dist / maxLen;
}

/**
 * Finds exact or high-confidence fuzzy match product
 */
export function findBestMatchingProduct(query: string, products: Product[]): Product | null {
  if (!query.trim()) return null;
  const normQuery = normalizeString(query);

  // 1. Exact match (case & space insensitive)
  const exact = products.find((p) => normalizeString(p.name) === normQuery);
  if (exact) return exact;

  // 2. High confidence fuzzy match (e.g. "nivea crme" -> "Nivea Cream", similarity > 0.8)
  let bestMatch: Product | null = null;
  let highestRatio = 0;

  for (const p of products) {
    const ratio = getSimilarityRatio(query, p.name);
    if (ratio > highestRatio && ratio >= 0.8) {
      highestRatio = ratio;
      bestMatch = p;
    }
  }

  return bestMatch;
}

/**
 * Returns intelligent type-ahead auto-complete suggestions for the typed query
 */
export function getMatchingSuggestions(
  query: string,
  products: Product[],
  limit: number = 6
): Product[] {
  if (!query.trim()) return [];

  const normQuery = normalizeString(query);

  const exactPrefixes: Product[] = [];
  const substringMatches: Product[] = [];
  const fuzzyMatches: { product: Product; ratio: number }[] = [];

  const existingIds = new Set<string>();

  for (const p of products) {
    const normName = normalizeString(p.name);
    const normBrand = normalizeString(p.brand || '');
    const normSku = normalizeString(p.sku || '');

    if (normName.startsWith(normQuery) || normBrand.startsWith(normQuery)) {
      exactPrefixes.push(p);
      existingIds.add(p.id);
    } else if (normName.includes(normQuery) || normSku.includes(normQuery)) {
      substringMatches.push(p);
      existingIds.add(p.id);
    } else {
      const ratio = getSimilarityRatio(query, p.name);
      if (ratio >= 0.55) {
        fuzzyMatches.push({ product: p, ratio });
      }
    }
  }

  fuzzyMatches.sort((a, b) => b.ratio - a.ratio);

  const combined = [
    ...exactPrefixes,
    ...substringMatches,
    ...fuzzyMatches.filter((f) => !existingIds.has(f.product.id)).map((f) => f.product),
  ];

  return combined.slice(0, limit);
}
