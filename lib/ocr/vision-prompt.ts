/**
 * Vision Model Prompt for Root Score Screen OCR
 * Optimized for Google Gemini, Claude Vision, and GPT-4 Vision
 */

import { FACTIONS } from "@/lib/constants/factions";
import { MAPS } from "@/lib/constants/maps";

/**
 * Generate the system prompt for vision model OCR
 */
export function generateVisionPrompt(): string {
  const factionList = FACTIONS.map((f, i) => `${i + 1}. "${f}"`).join("\n");
  const mapList = MAPS.filter(m => ["Fall", "Winter", "Lake", "Mountain"].includes(m))
    .map((m, i) => `${i + 1}. "${m}"`).join("\n");

  return `You are analyzing an end-of-game score screen from the digital version of Root, a board game by Leder Games.

# YOUR TASK
Extract all game result data from this image and return it as valid JSON.

# IMAGE LAYOUT GUIDE
The score screen has these elements:
1. **Top Banner** (decorative text): Shows "[Faction Name] Wins" - the winner announcement
2. **Background**: Map artwork (forest/snow/water/mountain scenery)
3. **Bottom Scorebar**: Horizontal bar with 2-6 colored player sections
4. **Each Player Section Contains**:
   - Character avatar (3D model) showing the faction
   - Player name (text in colored box)
   - Score (number in decorative circular wreath badge, OR a dominance icon if they went for dominance)

# FIELD EXTRACTION INSTRUCTIONS

## 1. MAP (string, required)
The background scenery indicates which map was played.

**VALID VALUES (choose exactly one):**
${mapList}

**Visual Identification Guide:**
- "Fall": Autumn forest with orange/red leaves, warm colors
- "Winter": Snowy landscape with white/blue tones, frozen terrain
- "Lake": Large body of water in center/bottom, blue water feature
- "Mountain": Rocky peaks, mountainous terrain, gray/brown peaks

**Instructions:**
- Look at the background artwork behind all UI elements
- Match the scenery to one of the 4 map types above
- Return EXACTLY one of the values in quotes above

## 2. PLAYERS (array, 2-6 objects, required)
The bottom scorebar shows all players from left to right. The leftmost player is always the winner.

### For EACH player, extract:

### 2a. playerName (string, required)
The player's username shown in the colored box.

**Location:** Text label in the center of each player section
**Examples:** "BardInvades", "Canute", "jsafo", "GeneralSherman", "You"

**Instructions:**
- Read the text from the colored name box
- Return the exact name as shown
- If unclear, make your best guess
- Common usernames are alphanumeric with no spaces

### 2b. faction (string, required)
The faction is shown by the **character avatar** (3D model), NOT text.

**VALID VALUES (choose exactly one from this list):**
${factionList}

**Visual Identification Guide by Character:**

**Base Game:**
- "Marquise de Cat" → Orange/ginger cat in military uniform, aristocratic appearance
- "Eyrie" → Blue bird, eagle or hawk with regal bearing
- "Woodland Alliance" → Green mice or small woodland creatures, revolutionary appearance

**Vagabond Characters (examine animal species and gear):**
- "Vagabond - Thief" → RACCOON with thief/rogue clothing, sneaky appearance
- "Vagabond - Ranger" → WOLF with ranger gear, rugged explorer with scar over left eye
- "Vagabond - Tinker" → BEAVER with tools and craftsman gear, inventor appearance
- "Vagabond - Vagrant" → POSSUM with wanderer/traveler appearance, nomadic gear
- "Vagabond - Arbiter" → BADGER in heavy armor, judge/authority appearance, armored warrior
- "Vagabond - Ronin" → RACCOON in samurai clothing and gear, masterless warrior
- "Vagabond - Adventurer" → OWL (wise old owl) with explorer gear, quest-seeker appearance
- "Vagabond - Harrier" → SQUIRREL with flight gear or wing-like apparatus, aerial appearance
- "Vagabond - Scoundrel" → CAT wearing a distinctive PUMPKIN MASK, mischievous rogue

**Expansion Factions:**
- "Lizard Cult" → Yellow or green lizards, reptilian appearance
- "Riverfolk Company" → Cyan/teal colored OTTERS, merchant traders
- "Underground Duchy" → Brown or gray MOLES, subterranean creatures
- "Corvid Conspiracy" → Black CROWS or ravens, conspiratorial appearance
- "Lord of the Hundreds" → Red/brown RATS with banners and military gear
- "Keepers in Iron" → Gray BADGERS wearing heavy armor (different from Arbiter - these are a faction, not a Vagabond)
- "Knaves of Deepwood" → Emerald green themed characters
- "Lilypad Diaspora" → Green water-themed characters, aquatic
- "Twilight Council" → Indigo/purple themed characters

**Instructions:**
- Look carefully at the 3D character model/avatar for this player
- Identify the animal species first (raccoon, beaver, owl, cat, wolf, squirrel, possum, badger, etc.)
- Then look at clothing, gear, and accessories
- Match to the descriptions above
- Return EXACTLY one of the faction names in quotes above
- For Vagabonds: The animal species is the primary identifier
  - Raccoons can be Thief or Ronin (look at gear: rogue clothing vs samurai gear)
  - Badgers can be Arbiter (Vagabond with armor) or Keepers in Iron (faction with armor)
- The Scoundrel cat with pumpkin mask is unmistakable
- If unsure, make your best guess based on animal species and visual style

### 2c. score (number or null, required)
The score shown in the decorative circular wreath badge on the left side of each player section.

**Valid Range:** 0-100 (typically 0-40)
**Special Case:** If the player went for dominance victory, they may have an icon instead of a number - return null

**Instructions:**
- Look for a number inside a circular wreath/laurel badge
- Extract just the numeric value (ignore the decorative border)
- If you see a dominance card icon instead of a number, return null
- If the score is unclear but looks like a number, make your best guess
- Scores are typically between 0-40 in most games

### 2d. isWinner (boolean, required)
Whether this player won the game.

**IMPORTANT WIN CONDITIONS:**
- Usually ONE player wins (leftmost in scorebar)
- HOWEVER: **A Vagabond with a dominance card can win together with another faction**
- Multiple winners are ONLY possible when: one faction wins AND a Vagabond played dominance
- The top banner shows the primary winner's faction name

**Instructions:**
- The winner is usually the leftmost player in the scorebar
- The winner's faction typically matches the top banner "[Faction] Wins"
- **SPECIAL CASE**: If a non-leftmost player is a Vagabond with isDominance: true, they may ALSO be a winner
- Return true for 1-2 players maximum (only 2 if one is a Vagabond with dominance)
- When in doubt, mark only the leftmost player as winner

### 2e. isDominance (boolean, required)
Whether this player went for a dominance victory (regardless of whether they won).

**Instructions:**
- Check the score badge area
- If you see a dominance card ICON (clearing/suit symbol) instead of a number, return true
- If you see a numeric score, return false
- Players can attempt dominance and still lose - this just tracks if they tried
- When isDominance is true, score should be null
- A Vagabond with dominance can win alongside the main winner

### 2f. order (number, required)
The position of this player in the scorebar (left to right).

**Valid Range:** 0-5
**Instructions:**
- Leftmost player = 0
- Second from left = 1
- Third from left = 2
- And so on...

# VALIDATION RULES
Before returning your answer, verify:
- ✓ Map is exactly one of: "Fall", "Winter", "Lake", "Mountain"
- ✓ Players array has 2-6 entries
- ✓ Each faction is exactly one of the valid faction names from the list
- ✓ 1-2 players have isWinner: true (only 2 if one is a Vagabond with isDominance: true)
- ✓ All scores are numbers 0-100, or null if dominance
- ✓ order values are 0, 1, 2, 3, 4, 5 (sequential, left to right)
- ✓ If isDominance is true, score must be null

# OUTPUT FORMAT
Return ONLY valid JSON with this exact structure (no markdown, no explanation, just the JSON):

{
  "map": "Fall" | "Winter" | "Lake" | "Mountain",
  "players": [
    {
      "playerName": "ExamplePlayer",
      "faction": "Marquise de Cat",
      "score": 30,
      "isWinner": true,
      "isDominance": false,
      "order": 0
    },
    {
      "playerName": "Player2",
      "faction": "Eyrie",
      "score": null,
      "isWinner": false,
      "isDominance": true,
      "order": 1
    }
  ]
}

# EXAMPLE OUTPUT 1 (Normal Game - Single Winner)
{
  "map": "Mountain",
  "players": [
    {
      "playerName": "BardInvades",
      "faction": "Lord of the Hundreds",
      "score": 30,
      "isWinner": true,
      "isDominance": false,
      "order": 0
    },
    {
      "playerName": "jsafo",
      "faction": "Underground Duchy",
      "score": 24,
      "isWinner": false,
      "isDominance": false,
      "order": 1
    },
    {
      "playerName": "Canute",
      "faction": "Corvid Conspiracy",
      "score": 23,
      "isWinner": false,
      "isDominance": false,
      "order": 2
    },
    {
      "playerName": "GeneralSherman",
      "faction": "Lizard Cult",
      "score": 23,
      "isWinner": false,
      "isDominance": false,
      "order": 3
    }
  ]
}

# EXAMPLE OUTPUT 2 (Dominance Victory)
{
  "map": "Fall",
  "players": [
    {
      "playerName": "You",
      "faction": "Eyrie",
      "score": null,
      "isWinner": true,
      "isDominance": true,
      "order": 0
    },
    {
      "playerName": "Woodland Alliance",
      "faction": "Woodland Alliance",
      "score": 23,
      "isWinner": false,
      "isDominance": false,
      "order": 1
    },
    {
      "playerName": "Marquise de Cat",
      "faction": "Marquise de Cat",
      "score": 15,
      "isWinner": false,
      "isDominance": false,
      "order": 2
    },
    {
      "playerName": "Vagabond",
      "faction": "Vagabond - Thief",
      "score": 11,
      "isWinner": false,
      "isDominance": false,
      "order": 3
    }
  ]
}

# EXAMPLE OUTPUT 3 (Two Winners: Faction + Vagabond with Dominance)
{
  "map": "Winter",
  "players": [
    {
      "playerName": "Alice",
      "faction": "Marquise de Cat",
      "score": 30,
      "isWinner": true,
      "isDominance": false,
      "order": 0
    },
    {
      "playerName": "Bob",
      "faction": "Woodland Alliance",
      "score": 25,
      "isWinner": false,
      "isDominance": false,
      "order": 1
    },
    {
      "playerName": "Charlie",
      "faction": "Vagabond - Adventurer",
      "score": null,
      "isWinner": true,
      "isDominance": true,
      "order": 2
    },
    {
      "playerName": "Dana",
      "faction": "Eyrie",
      "score": 18,
      "isWinner": false,
      "isDominance": false,
      "order": 3
    }
  ]
}

# IMPORTANT REMINDERS
- Return ONLY the JSON object, no markdown code blocks, no explanations
- Use EXACTLY the faction names from the valid values list (exact spelling, capitalization, punctuation)
- Use EXACTLY the map names: "Fall", "Winter", "Lake", or "Mountain"
- The leftmost player (order 0) is usually the winner
- Look at animal species FIRST when identifying Vagabonds (raccoon, beaver, owl, cat, wolf, squirrel, possum, badger, etc.)
- For Vagabonds with same animal: look at gear (Thief raccoon = rogue clothes, Ronin raccoon = samurai gear)
- For Badgers: Arbiter Vagabond = single badger in armor, Keepers in Iron = faction with multiple armored badgers
- The Scoundrel is the only Vagabond wearing a pumpkin mask (easy identifier!)
- If a player has a dominance icon instead of a score: set score: null and isDominance: true
- A Vagabond with dominance can win alongside another faction (2 winners maximum)
- Scores are typically 0-40, but can go up to 100

Now analyze the provided image and return the JSON.`;
}

/**
 * Expected response schema for validation
 */
export interface VisionOCRResponse {
  map: "Fall" | "Winter" | "Lake" | "Mountain";
  players: Array<{
    playerName: string;
    faction: string; // Must match a value from FACTIONS
    score: number | null;
    isWinner: boolean;
    isDominance: boolean;
    order: number;
  }>;
}

/**
 * Validate the vision model response
 */
export function validateVisionResponse(response: unknown): {
  valid: boolean;
  errors: string[];
  data?: VisionOCRResponse;
} {
  const errors: string[] = [];

  // Check if response is an object
  if (typeof response !== "object" || response === null) {
    return { valid: false, errors: ["Response is not a valid object"] };
  }

  const data = response as Partial<VisionOCRResponse>;

  // Validate map
  const validMaps = ["Fall", "Winter", "Lake", "Mountain"];
  if (!data.map || !validMaps.includes(data.map)) {
    errors.push(`Invalid map: "${data.map}". Must be one of: ${validMaps.join(", ")}`);
  }

  // Validate players array
  if (!Array.isArray(data.players)) {
    errors.push("Players must be an array");
    return { valid: false, errors };
  }

  if (data.players.length < 2 || data.players.length > 6) {
    errors.push(`Players array must have 2-6 entries, got ${data.players.length}`);
  }

  // Validate each player
  let winnerCount = 0;
  let vagabondDominanceWinnerCount = 0;
  const ordersSeen = new Set<number>();

  data.players.forEach((player, index) => {
    const prefix = `Player ${index}`;

    // Validate playerName
    if (typeof player.playerName !== "string" || player.playerName.trim() === "") {
      errors.push(`${prefix}: playerName must be a non-empty string`);
    }

    // Validate faction
    if (!FACTIONS.includes(player.faction as any)) {
      errors.push(`${prefix}: invalid faction "${player.faction}". Must be one of the valid faction names.`);
    }

    // Validate score
    if (player.score !== null) {
      if (typeof player.score !== "number") {
        errors.push(`${prefix}: score must be a number or null`);
      } else if (player.score < 0 || player.score > 100) {
        errors.push(`${prefix}: score must be between 0-100, got ${player.score}`);
      }
    }

    // Validate isDominance consistency
    if (player.isDominance && player.score !== null) {
      errors.push(`${prefix}: if isDominance is true, score must be null`);
    }

    // Validate isWinner
    if (typeof player.isWinner !== "boolean") {
      errors.push(`${prefix}: isWinner must be a boolean`);
    } else if (player.isWinner) {
      winnerCount++;
      // Track Vagabond dominance winners
      if (player.faction.startsWith("Vagabond") && player.isDominance) {
        vagabondDominanceWinnerCount++;
      }
    }

    // Validate order
    if (typeof player.order !== "number" || player.order < 0 || player.order > 5) {
      errors.push(`${prefix}: order must be a number 0-5`);
    } else {
      if (ordersSeen.has(player.order)) {
        errors.push(`${prefix}: duplicate order value ${player.order}`);
      }
      ordersSeen.add(player.order);
    }
  });

  // Check winner count (1 or 2, where 2 is only allowed for faction + Vagabond dominance)
  if (winnerCount < 1 || winnerCount > 2) {
    errors.push(`Must have 1-2 winners, got ${winnerCount}`);
  } else if (winnerCount === 2 && vagabondDominanceWinnerCount !== 1) {
    errors.push(`Two winners only allowed when one is a Vagabond with dominance`);
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as VisionOCRResponse) : undefined,
  };
}
