/**
 * Root board game factions
 * Used for validation, OCR matching, and UI display
 */

export const FACTIONS = [
  // Base Game
  "Marquise de Cat",
  "Eyrie",
  "Woodland Alliance",

  // Vagabond Characters (Base Game)
  "Vagabond - Thief",
  "Vagabond - Ranger",
  "Vagabond - Tinker",

  // Riverfolk Expansion
  "Lizard Cult",
  "Riverfolk Company",
  "Vagabond - Vagrant",
  "Vagabond - Arbiter",

  // Vagabond Pack Expansion
  "Vagabond - Ronin",
  "Vagabond - Adventurer",
  "Vagabond - Harrier",
  "Vagabond - Scoundrel",

  // Underworld Expansion
  "Underground Duchy",
  "Corvid Conspiracy",

  // Marauder Expansion
  "Lord of the Hundreds",
  "Keepers in Iron",

  // Homeland Expansion
  "Knaves of Deepwood",
  "Lilypad Diaspora",
  "Twilight Council",
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

  // Vagabond generic aliases (default to Thief)
  "vagabond": "Vagabond - Thief",
  "vb": "Vagabond - Thief",

  // Vagabond character aliases
  "thief": "Vagabond - Thief",
  "ranger": "Vagabond - Ranger",
  "tinker": "Vagabond - Tinker",
  "tinkerer": "Vagabond - Tinker",
  "vagrant": "Vagabond - Vagrant",
  "arbiter": "Vagabond - Arbiter",
  "ronin": "Vagabond - Ronin",
  "adventurer": "Vagabond - Adventurer",
  "harrier": "Vagabond - Harrier",
  "scoundrel": "Vagabond - Scoundrel",

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

  // Homeland Expansion
  "knaves": "Knaves of Deepwood",
  "lilypad": "Lilypad Diaspora",
  "twilight": "Twilight Council",
};

/**
 * Get faction display color (for UI theming)
 */
export const FACTION_COLORS: Record<Faction, string> = {
  "Marquise de Cat": "#f59e0b", // orange
  "Eyrie": "#3b82f6", // blue
  "Woodland Alliance": "#22c55e", // green

  // Vagabond characters (purple variants)
  "Vagabond - Thief": "#8b5cf6", // purple
  "Vagabond - Ranger": "#a855f7", // purple variant
  "Vagabond - Tinker": "#9333ea", // purple variant
  "Vagabond - Vagrant": "#c026d3", // purple variant
  "Vagabond - Arbiter": "#7c3aed", // purple variant
  "Vagabond - Ronin": "#a78bfa", // purple variant
  "Vagabond - Adventurer": "#6d28d9", // purple variant
  "Vagabond - Harrier": "#8b5cf6", // purple variant
  "Vagabond - Scoundrel": "#a855f7", // purple variant

  "Lizard Cult": "#eab308", // yellow
  "Riverfolk Company": "#06b6d4", // cyan
  "Underground Duchy": "#78716c", // stone
  "Corvid Conspiracy": "#000000", // black
  "Lord of the Hundreds": "#dc2626", // red
  "Keepers in Iron": "#6b7280", // gray

  // Homeland Expansion
  "Knaves of Deepwood": "#059669", // emerald
  "Lilypad Diaspora": "#10b981", // green
  "Twilight Council": "#4f46e5", // indigo
};
