import { FACTION_ALIASES } from '@/lib/constants/factions';

export interface OCRResult {
  map?: string | null;
  players: Array<{
    faction: string | null;
    score?: number | null;
  }>;
}

export interface ExpectedResult {
  map?: string | null;
  players: Array<{
    faction: string | null;
    score?: number | null;
    isWinner: boolean;
    isDominanceVictory: boolean;
    note?: string;
  }>;
}

/**
 * Check if two factions match (exact or via alias)
 */
export function factionMatches(actual: string | null, expected: string | null): boolean {
  if (actual === null || expected === null) {
    return actual === expected;
  }

  // Exact match
  if (actual === expected) {
    return true;
  }

  // Check if actual is an alias for expected
  const normalizedActual = actual.toLowerCase();
  for (const [alias, target] of Object.entries(FACTION_ALIASES)) {
    if (alias.toLowerCase() === normalizedActual && target === expected) {
      return true;
    }
  }

  return false;
}

/**
 * Check if scores match within tolerance (±1 for OCR errors)
 */
export function scoreMatches(
  actual: number | null | undefined,
  expected: number | null | undefined,
  tolerance: number = 1
): boolean {
  // Handle null/undefined
  if (actual == null && expected == null) {
    return true;
  }
  if (actual == null || expected == null) {
    return false;
  }

  // Check within tolerance
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Assert flexible match between OCR result and expected result
 * @param actual - The OCR parsed result
 * @param expected - The expected result
 * @param options - Matching options
 */
export function assertFlexibleMatch(
  actual: OCRResult,
  expected: ExpectedResult,
  options: {
    factionMatchThreshold?: number; // Percentage of factions that must match (0-1)
    scoreTolerance?: number; // Tolerance for score matching
    requirePlayerCount?: boolean; // Whether player counts must match exactly
  } = {}
): {
  passed: boolean;
  factionMatchRate: number;
  scoreMatchRate: number;
  playerCountMatches: boolean;
  details: string[];
} {
  const {
    factionMatchThreshold = 0.75,
    scoreTolerance = 1,
    requirePlayerCount = false,
  } = options;

  const details: string[] = [];

  // Check player count
  const playerCountMatches = actual.players.length === expected.players.length;
  if (!playerCountMatches) {
    details.push(
      `Player count mismatch: got ${actual.players.length}, expected ${expected.players.length}`
    );
    if (requirePlayerCount) {
      return {
        passed: false,
        factionMatchRate: 0,
        scoreMatchRate: 0,
        playerCountMatches: false,
        details,
      };
    }
  }

  // Count faction matches (only for non-null expected factions)
  let factionMatchCount = 0;
  let totalExpectedFactions = 0;

  for (let i = 0; i < Math.min(actual.players.length, expected.players.length); i++) {
    if (expected.players[i].faction !== null) {
      totalExpectedFactions++;
      if (factionMatches(actual.players[i].faction, expected.players[i].faction)) {
        factionMatchCount++;
      } else {
        details.push(
          `Faction mismatch at player ${i}: got "${actual.players[i].faction}", expected "${expected.players[i].faction}"`
        );
      }
    }
  }

  const factionMatchRate = totalExpectedFactions > 0 ? factionMatchCount / totalExpectedFactions : 1;

  // Count score matches (only for non-null expected scores)
  let scoreMatchCount = 0;
  let totalExpectedScores = 0;

  for (let i = 0; i < Math.min(actual.players.length, expected.players.length); i++) {
    if (expected.players[i].score != null) {
      totalExpectedScores++;
      if (scoreMatches(actual.players[i].score, expected.players[i].score, scoreTolerance)) {
        scoreMatchCount++;
      } else {
        details.push(
          `Score mismatch at player ${i}: got ${actual.players[i].score}, expected ${expected.players[i].score}`
        );
      }
    }
  }

  const scoreMatchRate = totalExpectedScores > 0 ? scoreMatchCount / totalExpectedScores : 1;

  // Determine if test passed
  const passed = factionMatchRate >= factionMatchThreshold &&
                 scoreMatchRate >= 0.75 &&
                 (!requirePlayerCount || playerCountMatches);

  if (passed) {
    details.push(
      `✓ Faction match rate: ${(factionMatchRate * 100).toFixed(1)}% (threshold: ${(factionMatchThreshold * 100).toFixed(1)}%)`
    );
    details.push(
      `✓ Score match rate: ${(scoreMatchRate * 100).toFixed(1)}%`
    );
  }

  return {
    passed,
    factionMatchRate,
    scoreMatchRate,
    playerCountMatches,
    details,
  };
}
