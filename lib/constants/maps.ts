/**
 * Root board game maps
 * Used for validation, OCR matching, and UI display
 */

export const MAPS = [
  // Base Game
  "Fall",
  "Winter",

  // Underworld Expansion
  "Lake",
  "Mountain",

  // Homeland Expansion (upcoming)
  "Gorge",
  "Swamp",

  // Custom/Community
  "Other",
] as const;

export type Map = typeof MAPS[number];

/**
 * Alternative names for OCR matching (including translations)
 */
export const MAP_ALIASES: Record<string, Map> = {
  // English variations
  "fall": "Fall",
  "autumn": "Fall",
  "winter": "Winter",
  "lake": "Lake",
  "mountain": "Mountain",
  "gorge": "Gorge",
  "swamp": "Swamp",
  "other": "Other",
  "custom": "Other",

  // French translations
  "automne": "Fall",
  "hiver": "Winter",
  "lac": "Lake",
  "montagne": "Mountain",
  "marais": "Swamp",
  "autre": "Other",
};

/**
 * Map descriptions for UI
 */
export const MAP_DESCRIPTIONS: Record<Map, string> = {
  "Fall": "Base game map - balanced terrain",
  "Winter": "Base game map - frozen river variation",
  "Lake": "Underworld expansion - lake centerpiece",
  "Mountain": "Underworld expansion - mountain terrain",
  "Gorge": "Homeland expansion - gorge terrain",
  "Swamp": "Homeland expansion - swamp terrain",
  "Other": "Custom or community map",
};
