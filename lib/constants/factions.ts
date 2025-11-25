/**
 * Root board game factions
 * Used for validation, OCR matching, and UI display
 */

export const FACTIONS = [
  // Base Game
  "Marquise de Cat",
  "Eyrie",
  "Woodland Alliance",
  "Vagabond",

  // Riverfolk Expansion
  "Lizard Cult",
  "Riverfolk Company",
  "Vagabond (2nd)",

  // Underworld Expansion
  "Underground Duchy",
  "Corvid Conspiracy",

  // Marauder Expansion
  "Lord of the Hundreds",
  "Keepers in Iron",

  // Other Vagabonds (max 4 in a game)
  "Vagabond (3rd)",
  "Vagabond (4th)",
] as const;

export type Faction = typeof FACTIONS[number];

/**
 * Alternative names for OCR matching (including translations)
 */
export const FACTION_ALIASES: Record<string, Faction> = {
  // English variations
  "marquise": "Marquise de Cat",
  "cat": "Marquise de Cat",
  "cats": "Marquise de Cat",
  "eyrie": "Eyrie",
  "birds": "Eyrie",
  "dynasty": "Eyrie",
  "woodland": "Woodland Alliance",
  "alliance": "Woodland Alliance",
  "wa": "Woodland Alliance",
  "vagabond": "Vagabond",
  "vb": "Vagabond",

  // French translations
  "canopée": "Eyrie",
  "marquis": "Marquise de Cat",

  // Expansions
  "lizard": "Lizard Cult",
  "cult": "Lizard Cult",
  "riverfolk": "Riverfolk Company",
  "otters": "Riverfolk Company",
  "duchy": "Underground Duchy",
  "moles": "Underground Duchy",
  "corvid": "Corvid Conspiracy",
  "crows": "Corvid Conspiracy",
  "lord": "Lord of the Hundreds",
  "rats": "Lord of the Hundreds",
  "keepers": "Keepers in Iron",
  "badgers": "Keepers in Iron",
};

/**
 * Get faction display color (for UI theming)
 */
export const FACTION_COLORS: Record<Faction, string> = {
  "Marquise de Cat": "#f59e0b", // orange
  "Eyrie": "#3b82f6", // blue
  "Woodland Alliance": "#22c55e", // green
  "Vagabond": "#8b5cf6", // purple
  "Lizard Cult": "#eab308", // yellow
  "Riverfolk Company": "#06b6d4", // cyan
  "Vagabond (2nd)": "#a855f7", // purple variant
  "Underground Duchy": "#78716c", // stone
  "Corvid Conspiracy": "#000000", // black
  "Lord of the Hundreds": "#dc2626", // red
  "Keepers in Iron": "#6b7280", // gray
  "Vagabond (3rd)": "#9333ea", // purple variant
  "Vagabond (4th)": "#c026d3", // purple variant
};
