# Root Score Screen OCR Specification

## Overview
This document specifies all data elements that an OCR/vision parser should extract from Root board game end-of-game score screens from the digital game.

## Screen Layout
Root displays game results on a single screen with:
- **Top Banner**: Winner announcement with decorative text
- **Background**: Map artwork (visual identification)
- **Bottom Scorebar**: Horizontal list of player results with colored boxes
- **Character Avatars**: 3D character models representing each faction

## Required Data Fields

### 1. Map Name
**Location**: Background artwork
**Type**: Visual identification (not text-based)
**Digital Game Maps** (4 total):
- **Fall** - Autumn forest with orange/red leaves (Base Game)
- **Winter** - Snowy landscape (Base Game)
- **Lake** - Water-dominated landscape with lake centerpiece (Underworld Expansion)
- **Mountain** - Rocky peaks and mountain terrain (Underworld Expansion)

**Note**: Spring and Summer are community maps for physical game only, will never appear in digital screenshots.

**Extraction Strategy**:
- Analyze background color palette
- Identify seasonal markers (snow, autumn colors, water features, mountains)
- Match against known map visual patterns

**Difficulty**: Medium - Maps have distinct visual signatures but require color/texture analysis

---

### 2. Winner Faction
**Location**: Top banner text
**Format**: "[Faction] Wins"
**Font**: Decorative serif font with ornate styling
**Text Color**: White/cream on dark banner background

**Examples**:
- "Hundreds Wins" → Lord of the Hundreds
- "Keepers Wins" → Keepers in Iron
- "Eyrie Wins" → Eyrie Dynasty
- "Marquise Wins" → Marquise de Cat

**Extraction Strategy**:
- OCR the top banner text
- Parse "[Faction] Wins" pattern
- Fuzzy match against faction names/aliases

**Difficulty**: Medium - Decorative font causes OCR errors ("Hundreds" → "Pundreds", "Keepers" → "Reepers")

---

### 3. Player Results (Bottom Scorebar)
For each player (2-6 players), extract:

#### 3.1. Player Name
**Location**: Inside colored rectangle (faction color)
**Format**: Text label
**Font**: Sans-serif, medium size
**Background**: Colored box (varies by faction, often low contrast)
**Position**: Center of player section, overlapping the score badge

**Examples**: "BardInvades", "Canute", "jsafo", "GeneralSherman", "You"

**Extraction Strategy**:
- Detect colored rectangles in scorebar
- Segment each player section
- OCR text in each section
- Handle low contrast (text color vs background color)
- Preprocessing: increase contrast, isolate text regions

**Difficulty**: High - Small text, colored backgrounds, poor contrast

---

#### 3.2. Score
**Location**: Circular badge with decorative wreath border
**Format**: 1-2 digit number
**Font**: Bold serif/decorative font
**Background**: Beige/cream circle with ornate wreath design
**Position**: Left side of each player section

**Examples**: "30", "24", "23", "19", "11", "9"

**Special Cases**:
- Dominance victories may show icon instead of score
- Score can be null for players attempting dominance

**Extraction Strategy**:
- Detect circular/wreath-shaped regions using shape detection
- Crop to badge area only
- Enhance contrast (decorative border → clean number)
- OCR with numeric-only mode (0-9 characters)
- Validate range (0-100, typically 0-40)

**Difficulty**: Very High - Decorative wreath border interferes with OCR, small numbers embedded in complex design

---

#### 3.3. Faction Name
**Location**: Visual only - 3D character avatar
**Format**: NO TEXT - Icon/avatar recognition required
**Position**: Center of each player section, above colored name box

**Identification Requirements**:
Must identify faction from character avatar appearance (3D model):

**Base Game:**
- **Marquise de Cat**: Orange cat in military uniform
- **Eyrie Dynasty**: Blue bird (eagle/hawk)
- **Woodland Alliance**: Green mice/woodland creatures
- **Vagabond - Thief**: Raccoon with thief/rogue appearance
- **Vagabond - Ranger**: Character with ranger/explorer gear
- **Vagabond - Tinker**: Character with tools/craftsman appearance

**Riverfolk Expansion:**
- **Lizard Cult**: Yellow/green lizards
- **Riverfolk Company**: Cyan/teal otters
- **Vagabond - Vagrant**: Wanderer appearance
- **Vagabond - Arbiter**: Armored/judge appearance

**Vagabond Pack:**
- **Vagabond - Ronin**: Samurai-styled character (raccoon)
- **Vagabond - Adventurer**: Explorer-styled character
- **Vagabond - Harrier**: Swift bird character (squirrel with wings)
- **Vagabond - Scoundrel**: Cat with pumpkin mask

**Underworld Expansion:**
- **Underground Duchy**: Brown/gray moles
- **Corvid Conspiracy**: Black crows

**Marauder Expansion:**
- **Lord of the Hundreds**: Red/brown rats with banners
- **Keepers in Iron**: Gray badgers with armor

**Homeland Expansion:**
- **Knaves of Deepwood**: Emerald green faction
- **Lilypad Diaspora**: Green water-themed faction
- **Twilight Council**: Indigo/purple faction

**Total**: 20+ distinct faction avatars

**Extraction Strategy**:
- Crop avatar region for each player (center-top of section)
- Use visual classification/image embedding
- Match against known faction avatar database
- For Vagabonds: perform secondary fine-grained classification

**Difficulty**: Very High - Requires image classification model, not OCR

---

#### 3.4. Vagabond Character Type (if applicable)
**Location**: Character avatar visual details
**Format**: Visual identification from avatar appearance
**Only Applies To**: Vagabond factions (9 variants)

**Character Variants**:
- **Thief** (raccoon, thief gear)
- **Ranger** (ranger outfit)
- **Tinker** (tools/craftsman)
- **Vagrant** (wanderer)
- **Arbiter** (armored)
- **Ronin** (samurai, raccoon)
- **Adventurer** (explorer)
- **Harrier** (squirrel with flight gear)
- **Scoundrel** (cat with pumpkin mask)

**Extraction Strategy**:
- After identifying faction as Vagabond, perform secondary classification
- Match avatar details against character-specific visual features
- Look for distinctive clothing, accessories, species, props

**Difficulty**: Extreme - Requires fine-grained visual classification, subtle differences between variants

---

#### 3.5. Winner Status
**Location**: Visual indicator (position, banner match)
**Derivation**: Can be inferred from:
- Leftmost position in scorebar (winner is always first)
- Matching faction from top banner "[Faction] Wins"
- Highest score (if not dominance victory)

**Extraction Strategy**:
- Primary: Match faction from top banner to player faction
- Fallback: Leftmost player is winner
- Validation: Cross-reference with highest score

**Difficulty**: Low - Multiple reliable indicators

---

#### 3.6. Dominance Status
**Location**: Score badge area
**Format**: Icon (dominance card symbol) instead of numeric score
**Appearance**: Clearing/suit icon or dominance card graphic replacing score number

**Important**: A player can attempt dominance and still lose. This field tracks whether they went for dominance, NOT whether they won.

**Extraction Strategy**:
- Check for absence of numeric score in badge
- Detect dominance card icon visual pattern (suit symbols)
- Pattern match against known dominance card graphics
- Note: Field is `isDominance` (went for dominance), not `isDominanceVictory` (won via dominance)

**Difficulty**: Medium - Visual pattern recognition, distinguishing icon vs number

---

## Data Ordering
Players appear in the scorebar from left to right:
1. **Winner** (leftmost, position 0)
2. **2nd place** (position 1)
3. **3rd place** (position 2)
4. **4th place** (position 3, if applicable)
5. **5th place** (position 4, if applicable)
6. **6th place** (position 5, if applicable)

**Order field**: Index in array (0-5), left to right

---

## Technical Challenges Summary

| Element | Method | Difficulty | Primary Challenge |
|---------|--------|------------|-------------------|
| Map Name | Visual classification | Medium | Color/texture analysis of background |
| Winner Text | OCR | Medium | Decorative font misreads |
| Player Names | OCR | High | Low contrast on colored backgrounds |
| Scores | OCR | Very High | Decorative wreath badges interfere |
| Faction Icons | Image classification | Very High | 20+ distinct 3D character models |
| Vagabond Type | Fine-grained classification | Extreme | Subtle visual differences between 9 variants |
| Dominance Status | Pattern recognition | Medium | Icon vs number detection |

---

## Image Preprocessing Requirements

For optimal accuracy:

### Resolution:
- **Minimum**: 720p (1280×720)
- **Recommended**: 1080p+ (1920×1080)

### Region Segmentation:
1. **Top Banner**: Crop for winner text OCR
2. **Background**: Full image for map classification
3. **Scorebar**: Bottom ~25% of screen
4. **Per-Player Sections**: Divide scorebar into 2-6 equal segments

### Enhancement Pipeline:
1. **For Text OCR (names, scores)**:
   - Increase contrast
   - Normalize brightness
   - Sharpen text regions
   - Remove colored backgrounds (convert to grayscale)

2. **For Avatar Classification**:
   - Crop to character model only
   - Maintain color information
   - Resize to standard dimensions (e.g., 224×224)

3. **For Score Badges**:
   - Detect circular regions
   - Crop tightly around number
   - Increase contrast dramatically
   - Apply edge detection to isolate number from wreath

---

## Validation Rules

After extraction, validate:

| Rule | Validation |
|------|------------|
| Player count | 2-6 players |
| Scores | 0-100 range (typically 0-40), allow null |
| Winner | Exactly one `isWinner: true` |
| Factions | No duplicates except Vagabond variants |
| Map | Must be Fall, Winter, Lake, or Mountain |
| Completeness | All players have: name, faction, winner status, dominance status |

---

## Output Format

```typescript
{
  "map": "Fall" | "Winter" | "Lake" | "Mountain",
  "players": [
    {
      "playerName": string,           // OCR from colored box
      "faction": FactionName,          // Visual classification from avatar
      "score": number | null,          // OCR from wreath badge, null if dominance
      "isWinner": boolean,             // Derived from position/banner
      "isDominance": boolean,          // Pattern recognition (icon vs score)
      "order": number                  // 0-5, left to right position
    }
  ]
}
```

---

## Custom Model Training Approach

### Option: Train a Custom Vision Model

**Pros:**
- Optimized specifically for Root score screens
- No ongoing API costs after training
- Faster inference (can run locally)
- Works offline
- Can achieve 85-90% accuracy

**Cons:**
- Requires 500-1000 labeled images
- Training cost: ~$50-200 (GPU compute)
- Development time: 40-80 hours
- Maintenance burden (updates for new expansions)

### Training Data Requirements:

**Minimum Dataset**: 500-1000 labeled score screens

**Coverage Needed**:
- All maps: Fall, Winter, Lake, Mountain
- All factions: 20+ faction avatars
- All Vagabond types: 9 character variants
- Player counts: 2-6 player games
- Resolutions: 720p, 1080p, 1440p
- Quality variations: different lighting, compression

**Annotation Requirements**:
1. **Bounding boxes**: Map background, banner, scorebar, each player section
2. **Avatar labels**: Faction classification for each character model
3. **OCR labels**: Ground truth for player names and scores
4. **Map labels**: Background classification

### Recommended Training Pipeline:

**1. Object Detection Model** (YOLOv8/v9)
- Detect player sections in scorebar
- Locate score badges (wreath circles)
- Find avatar regions
- Segment banner and background

**2. Classification Model** (ResNet50/EfficientNet)
- Map background → Fall/Winter/Lake/Mountain
- Avatar → Faction (20+ classes)
- Fine-grained Vagabond classification (9 sub-classes)

**3. OCR Model** (PaddleOCR or TrOCR fine-tuned)
- Player names (colored backgrounds)
- Scores (decorative badges)
- Winner banner text

**4. Pattern Recognition**
- Dominance icon vs numeric score

### Estimated Costs:

| Phase | Time | Cost |
|-------|------|------|
| Data collection (500 images) | 10-15 hours | $0 (if you have game access) |
| Annotation/labeling | 15-25 hours | $0 (manual) or $100-300 (service) |
| Model training | 10-20 hours | $50-200 (GPU compute) |
| Integration & testing | 15-25 hours | $0 |
| **Total** | **50-85 hours** | **$50-500** |

---

## Alternative Approaches (Ranked)

### 1. 🥇 User API Keys (Recommended)
**Use Claude/GPT-4 Vision/Gemini with user's own API key**

**Pros:**
- 90-95% accuracy
- $0 cost to you (users pay ~$0.01-0.05/image)
- Fast development (4-8 hours)
- No training data needed
- Updates automatically with new expansions

**Cons:**
- Requires users to have API access
- Privacy consideration (images sent to third party)
- Requires API key management UI

**Implementation:**
```typescript
// User provides API key in settings
// Send image + prompt to their Claude/GPT/Gemini account
// Parse JSON response
```

---

### 2. 🥈 Custom Trained Model
**Train YOLOv8 + ResNet + PaddleOCR pipeline**

**Pros:**
- 85-90% accuracy
- Free inference after training
- Works offline
- Full data privacy

**Cons:**
- 50-85 hours development
- $50-500 training cost
- Requires 500-1000 labeled images
- Maintenance for new content

---

### 3. 🥉 Multimodal AI (Your API Key)
**Use Claude/GPT-4 Vision with your API key**

**Pros:**
- 90-95% accuracy
- Fast development (2-4 hours)
- No training needed

**Cons:**
- Ongoing cost ($0.01-0.05 per game entry)
- Adds up with many users
- Privacy consideration

---

### 4. Improved Tesseract + Heuristics
**Current approach with better preprocessing**

**Pros:**
- $0 cost
- No external dependencies
- Full privacy

**Cons:**
- 50-60% accuracy (still poor)
- 10-20 hours improvement work
- Cannot read faction avatars (fundamental limitation)
- Will always struggle with decorative elements

---

## Recommendation

Based on your requirements, I recommend:

**Primary**: User API Keys (Option 1)
- Best accuracy without your cost
- Users who care about OCR will pay ~$0.02/game
- Provide Tesseract as free fallback option

**Implementation Priority**:
1. Keep current Tesseract as "Free (Lower Accuracy)" option
2. Add "AI Vision (High Accuracy)" option with API key field
3. Let users choose in settings
4. Show cost estimate: "~$0.02 per game upload"

**Future**: Custom model training if you get high volume and can collect training data from your users' uploads.
