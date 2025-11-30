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
2. **Background**: Map artwork (autumn forest/snowy landscape/green forest/rocky mountains)
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
- "Fall": Autumn forest with orange/red leaves, warm golden/amber colors, deciduous trees
- "Winter": Snowy landscape with white/blue tones, frozen terrain, snow-covered ground
- "Lake": Dense green forest with coniferous trees, darker greens, woodland scenery (NOTE: despite the name, this map does NOT have visible water features)
- "Mountain": Rocky peaks, mountainous terrain, gray/brown stone peaks and cliffs

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
The faction is shown by the **character avatar** (3D model) and the **colored banner/background** behind the player name.

**VALID VALUES (choose exactly one from this list):**
${factionList}

**CRITICAL: Banner Color Identification**
Each player section has a colored banner/background. This is the PRIMARY identifier:
- **GREY/GRAY BANNER** → Always a Vagabond (one of the 9 Vagabond types)
- **ORANGE BANNER** → Marquise de Cat
- **BLUE BANNER** → Eyrie
- **GREEN BANNER** → Woodland Alliance or Knaves of Deepwood
- **YELLOW BANNER** → Lizard Cult
- **CYAN/TEAL BANNER** → Riverfolk Company
- **BROWN/TAN BANNER** → Underground Duchy or Lord of the Hundreds
- **BLACK BANNER** → Corvid Conspiracy
- **GRAY/STEEL BANNER** → Keepers in Iron
- **PURPLE/INDIGO BANNER** → Twilight Council
- **LIGHT GREEN/AQUA BANNER** → Lilypad Diaspora

**Visual Identification Guide by Character:**

**Base Game:**
- "Marquise de Cat" → Orange cat in military uniform (bright orange banner)
- "Eyrie" → Blue bird, eagle or hawk (blue banner)
- "Woodland Alliance" → Green mice or small woodland creatures (green banner)

**Vagabond Characters (light gray/silver banner):**
Note: All Vagabonds have a light gray/silver banner. Identify the specific type by animal species and gear:
- "Vagabond - Thief" → RACCOON with thief/rogue clothing
- "Vagabond - Ranger" → WOLF with ranger gear, scar over left eye
- "Vagabond - Tinker" → BEAVER with tools and craftsman gear
- "Vagabond - Vagrant" → POSSUM with wanderer/traveler gear
- "Vagabond - Arbiter" → BADGER in heavy armor
- "Vagabond - Ronin" → RACCOON in samurai gear
- "Vagabond - Adventurer" → OWL with explorer gear
- "Vagabond - Harrier" → SQUIRREL with flight gear
- "Vagabond - Scoundrel" → CAT wearing PUMPKIN MASK

**Expansion Factions:**
- "Lizard Cult" → Yellow/green lizards (yellow banner)
- "Riverfolk Company" → Cyan/teal OTTERS (cyan banner)
- "Underground Duchy" → Brown/tan MOLES (tan/beige banner)
- "Corvid Conspiracy" → Black CROWS/ravens (purple banner)
- "Lord of the Hundreds" → RATS with military gear (red banner)
- "Keepers in Iron" → BADGER in armor, faction not Vagabond (dark steel-gray banner)
- "Knaves of Deepwood" → Emerald green themed characters (green banner)
- "Lilypad Diaspora" → Green water-themed characters (light green/aqua banner)
- "Twilight Council" → Purple themed characters (purple banner)

**Instructions (FOLLOW THIS TWO-STEP PROCESS):**

**STEP 1: Check the banner color first**
- Look at the colored banner/background behind the player name
- GREY BANNER = Vagabond (proceed to Step 2 to identify which Vagabond)
- BLACK BANNER = Corvid Conspiracy (black crows/ravens)
- Other colors = use the banner color guide above to narrow down possibilities

**STEP 2: Identify the specific character**
- Look carefully at the 3D character model/avatar
- For Vagabonds (grey banner): Identify the animal species
  - SQUIRREL → Vagabond - Harrier
  - RACCOON with thief clothing → Vagabond - Thief
  - RACCOON with samurai gear → Vagabond - Ronin
  - WOLF with ranger gear → Vagabond - Ranger
  - BEAVER with tools → Vagabond - Tinker
  - POSSUM with wanderer gear → Vagabond - Vagrant
  - BADGER in armor → Vagabond - Arbiter
  - OWL with explorer gear → Vagabond - Adventurer
  - CAT with PUMPKIN MASK → Vagabond - Scoundrel
- For non-Vagabonds: Match the character to faction descriptions
- Return EXACTLY one of the faction names in quotes above
- If unsure, prioritize banner color over character appearance

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

### 2f. coalitionWith (string, optional)
**ONLY FOR VAGABONDS WITH DOMINANCE**: The faction this Vagabond is allied with.

**CRITICAL RULE:**
- This field should ONLY be set when:
  1. The player's faction is a Vagabond (any Vagabond type)
  2. AND isDominance is true
- For all other players, this field should be omitted or null

**How to Detect Coalition:**
When a Vagabond plays dominance, they form a coalition with another faction. Look for a **small faction icon** next to the Vagabond's avatar or in the Vagabond's player section.

**Coalition Icon Identification Guide:**
- **Orange banner icon** → coalitionWith: "Marquise de Cat"
- **Blue banner icon** → coalitionWith: "Eyrie"
- **Green banner icon** → coalitionWith: "Woodland Alliance"
- **Yellow banner icon** → coalitionWith: "Lizard Cult"
- **Cyan/Teal banner icon** → coalitionWith: "Riverfolk Company"
- **Brown/Tan banner icon** → coalitionWith: "Underground Duchy"
- **Black banner icon** → coalitionWith: "Corvid Conspiracy"
- **Red banner icon** → coalitionWith: "Lord of the Hundreds"
- **Dark gray/steel banner icon** → coalitionWith: "Keepers in Iron"
- **Emerald green banner icon** → coalitionWith: "Knaves of Deepwood"
- **Light green/aqua banner icon** → coalitionWith: "Lilypad Diaspora"
- **Purple/indigo banner icon** → coalitionWith: "Twilight Council"

**Important:**
- The coalition icon will be a small colored banner/symbol showing which faction the Vagabond is allied with
- Match the faction name EXACTLY from the valid faction list above
- If you cannot detect a coalition icon for a Vagabond with dominance, omit this field or set to null
- Only Vagabonds can have coalitions (when they play dominance)
- When a Vagabond has a coalition, they win if their coalition partner wins

### 2g. order (number, required)
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
      "coalitionWith": null,
      "order": 0
    },
    {
      "playerName": "Player2",
      "faction": "Eyrie",
      "score": null,
      "isWinner": false,
      "isDominance": true,
      "coalitionWith": null,
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

# EXAMPLE OUTPUT 3 (Two Winners: Faction + Vagabond with Dominance Coalition)
{
  "map": "Winter",
  "players": [
    {
      "playerName": "Alice",
      "faction": "Marquise de Cat",
      "score": 30,
      "isWinner": true,
      "isDominance": false,
      "coalitionWith": null,
      "order": 0
    },
    {
      "playerName": "Bob",
      "faction": "Woodland Alliance",
      "score": 25,
      "isWinner": false,
      "isDominance": false,
      "coalitionWith": null,
      "order": 1
    },
    {
      "playerName": "Charlie",
      "faction": "Vagabond - Adventurer",
      "score": null,
      "isWinner": true,
      "isDominance": true,
      "coalitionWith": "Marquise de Cat",
      "order": 2
    },
    {
      "playerName": "Dana",
      "faction": "Eyrie",
      "score": 18,
      "isWinner": false,
      "isDominance": false,
      "coalitionWith": null,
      "order": 3
    }
  ]
}

# IMPORTANT REMINDERS
- Return ONLY the JSON object, no markdown code blocks, no explanations
- Use EXACTLY the faction names from the valid values list (exact spelling, capitalization, punctuation)
- Use EXACTLY the map names: "Fall", "Winter", "Lake", or "Mountain"
- The leftmost player (order 0) is usually the winner
- **CRITICAL**: Check banner color FIRST - GREY banner = Vagabond, BLACK banner = Corvid Conspiracy
- For Vagabonds (grey banner): Identify animal species (SQUIRREL = Harrier, RACCOON = Thief or Ronin, OWL = Adventurer, etc.)
- For Vagabonds with same animal: look at gear (Thief raccoon = rogue clothes, Ronin raccoon = samurai gear)
- For Badgers: Arbiter Vagabond = single badger in armor, Keepers in Iron = faction with multiple armored badgers
- The Scoundrel is the only Vagabond wearing a pumpkin mask (easy identifier!)
- If a player has a dominance icon instead of a score: set score: null and isDominance: true
- **COALITION DETECTION**: If a Vagabond has isDominance: true, look for a small faction icon showing their coalition partner
- A Vagabond with dominance can win alongside another faction (2 winners maximum)
- coalitionWith should ONLY be set for Vagabonds with isDominance: true
- Scores are typically 0-40, but can go up to 100
- When in doubt between factions, prioritize banner color over character appearance

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
    coalitionWith?: string | null;
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

    // Validate coalitionWith
    if (player.coalitionWith !== undefined && player.coalitionWith !== null) {
      // coalitionWith should only be set for Vagabonds with dominance
      if (!player.faction.startsWith("Vagabond")) {
        errors.push(`${prefix}: coalitionWith can only be set for Vagabond factions`);
      } else if (!player.isDominance) {
        errors.push(`${prefix}: coalitionWith can only be set when isDominance is true`);
      } else if (!FACTIONS.includes(player.coalitionWith as any)) {
        errors.push(`${prefix}: coalitionWith must be a valid faction name, got "${player.coalitionWith}"`);
      }
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
