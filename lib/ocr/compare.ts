interface Player {
  playerName: string;
  userId?: string;
  faction: string;
  score?: number;
  isWinner: boolean;
  isDominance: boolean;
  coalitionWith?: string;
  order: number;
}

interface OCRData {
  map?: string;
  players: Player[];
}

interface CorrectedData {
  map: string;
  players: Player[];
}

interface ComparisonResult {
  hasChanges: boolean;
  fieldsChanged: string[];
  originalData: OCRData;
  correctedData: CorrectedData;
}

/**
 * Compare original OCR data with user-corrected data to detect modifications
 */
export function compareOCRData(
  original: OCRData,
  corrected: CorrectedData
): ComparisonResult {
  const fieldsChanged: string[] = [];

  // Check if map changed
  if (original.map && original.map !== corrected.map) {
    fieldsChanged.push("map");
  }

  // Check for player count changes
  if (original.players.length !== corrected.players.length) {
    fieldsChanged.push("player_count");
  }

  // Compare each player (match by order)
  const maxLength = Math.max(original.players.length, corrected.players.length);
  for (let i = 0; i < maxLength; i++) {
    const origPlayer = original.players[i];
    const corrPlayer = corrected.players[i];

    // Player added or removed
    if (!origPlayer || !corrPlayer) {
      if (!fieldsChanged.includes("player_count")) {
        fieldsChanged.push("player_count");
      }
      continue;
    }

    // Compare player fields
    if (origPlayer.playerName !== corrPlayer.playerName) {
      fieldsChanged.push(`player_${i}_name`);
    }

    if (origPlayer.faction !== corrPlayer.faction) {
      fieldsChanged.push(`player_${i}_faction`);
    }

    if (origPlayer.score !== corrPlayer.score) {
      fieldsChanged.push(`player_${i}_score`);
    }

    if (origPlayer.isWinner !== corrPlayer.isWinner) {
      fieldsChanged.push(`player_${i}_winner`);
    }

    if (origPlayer.isDominance !== corrPlayer.isDominance) {
      fieldsChanged.push(`player_${i}_dominance`);
    }

    if (origPlayer.coalitionWith !== corrPlayer.coalitionWith) {
      fieldsChanged.push(`player_${i}_coalition`);
    }
  }

  return {
    hasChanges: fieldsChanged.length > 0,
    fieldsChanged,
    originalData: original,
    correctedData: corrected,
  };
}
