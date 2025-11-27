import { FACTIONS, FACTION_ALIASES } from "@/lib/constants/factions";
import { MAPS, MAP_ALIASES } from "@/lib/constants/maps";

interface OCRResult {
  map?: string;
  players: Array<{
    faction: string;
    score?: number;
  }>;
}

// Fuzzy match a string against a list of options
function fuzzyMatch(text: string, options: readonly string[], aliases?: Record<string, string>): string | null {
  const normalized = text.toLowerCase().trim();

  // Exact match
  for (const option of options) {
    if (option.toLowerCase() === normalized) {
      return option;
    }
  }

  // Alias match
  if (aliases) {
    for (const [alias, target] of Object.entries(aliases)) {
      if (normalized.includes(alias.toLowerCase()) || alias.toLowerCase().includes(normalized)) {
        return target;
      }
    }
  }

  // Partial match
  for (const option of options) {
    if (normalized.includes(option.toLowerCase()) || option.toLowerCase().includes(normalized)) {
      return option;
    }
  }

  return null;
}

export function parseOCRText(text: string): OCRResult {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  const result: OCRResult = {
    players: [],
  };

  // Try to find the map
  for (const line of lines) {
    const map = fuzzyMatch(line, MAPS, MAP_ALIASES);
    if (map) {
      result.map = map;
      break;
    }
  }

  // Try to find factions and scores
  // Look for patterns like "Faction Name 15" or "Faction: 15"
  for (const line of lines) {
    // Try to extract faction and score
    const scoreMatch = line.match(/(\d+)\s*$/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined;

    // Remove the score from the line to get the faction text
    const factionText = scoreMatch ? line.replace(scoreMatch[0], "").trim() : line;

    const faction = fuzzyMatch(factionText, FACTIONS, FACTION_ALIASES);

    if (faction) {
      result.players.push({
        faction,
        score,
      });
    }
  }

  return result;
}
