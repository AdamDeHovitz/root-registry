import { describe, it, expect } from 'vitest';
import { processImageWithGemini, type GeminiVisionResult } from '../gemini-vision';
import { generateVisionPrompt } from '../vision-prompt';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load expected results
const expectedResultsPath = path.join(__dirname, '../../../scores/expected-results.json');
const expectedResults = JSON.parse(fs.readFileSync(expectedResultsPath, 'utf-8'));

// Cache configuration
const PROMPT_HASH = crypto.createHash('sha256')
  .update(generateVisionPrompt())
  .digest('hex').substring(0, 12);

const TEST_VERSION = "1.0.0"; // Bump when test logic changes

/**
 * Convert image file to base64
 */
function imageToBase64(imagePath: string): string {
  const buffer = fs.readFileSync(imagePath);
  return buffer.toString('base64');
}

/**
 * Determine MIME type from file extension
 */
function getMimeType(filename: string): string {
  if (filename.endsWith('.png') || filename.endsWith('.PNG')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

/**
 * Get Gemini response with smart caching
 * Only calls API when prompt or test infrastructure changes
 */
async function getGeminiResponse(
  imageName: string,
  base64: string,
  mimeType: string
): Promise<GeminiVisionResult> {
  const cachePath = path.join(__dirname, 'fixtures/gemini-responses', `${imageName}.json`);

  // Try to use cache
  if (fs.existsSync(cachePath) && !process.env.REFRESH_VISION_CACHE) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

    if (cached._meta?.promptHash === PROMPT_HASH &&
        cached._meta?.testVersion === TEST_VERSION) {
      console.log(`✓ Using cached response for ${imageName}`);
      return cached;
    }
    console.log(`⚠ Cache invalidated for ${imageName} (prompt or test changed)`);
  }

  // Call real API
  console.log(`→ Calling Gemini API for ${imageName}...`);
  const result = await processImageWithGemini(base64, mimeType);

  // Save with metadata
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify({
    ...result,
    _meta: {
      promptHash: PROMPT_HASH,
      testVersion: TEST_VERSION,
      generatedAt: new Date().toISOString(),
      imageFile: imageName,
    }
  }, null, 2));

  return result;
}

describe('Gemini Vision Integration Tests', () => {
  const TEST_TIMEOUT = 30000; // 30s for API call

  it('should process dominance.webp correctly', async () => {
    const imageName = 'dominance.webp';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);

  it('should process french.webp correctly', async () => {
    const imageName = 'french.webp';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);

  it('should process BardInvades.PNG correctly', async () => {
    const imageName = 'BardInvades.PNG';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);

  it('should process canute.PNG correctly', async () => {
    const imageName = 'canute.PNG';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);

  it('should process keepers.PNG correctly', async () => {
    const imageName = 'keepers.PNG';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);

  it('should process lake.PNG correctly', async () => {
    const imageName = 'lake.PNG';
    const imagePath = path.join(__dirname, '../../../scores', imageName);
    const base64 = imageToBase64(imagePath);
    const mimeType = getMimeType(imageName);

    const result = await getGeminiResponse(imageName, base64, mimeType);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const expected = expectedResults[imageName];
    expect(result.data!.map).toBe(expected.map);
    expect(result.data!.players).toHaveLength(expected.players.length);

    result.data!.players.forEach((player, i) => {
      expect(player.playerName).toBe(expected.players[i].playerName);
      expect(player.faction).toBe(expected.players[i].faction);
      expect(player.score).toBe(expected.players[i].score);
      expect(player.isWinner).toBe(expected.players[i].isWinner);
      expect(player.isDominance).toBe(expected.players[i].isDominance);
      expect(player.order).toBe(expected.players[i].order);
    });
  }, TEST_TIMEOUT);
});
