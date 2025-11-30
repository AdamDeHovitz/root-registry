import { describe, it, expect } from 'vitest';
import { validateVisionResponse } from '../vision-prompt';

describe('validateVisionResponse - Coalition Support', () => {
  describe('Valid Coalition Scenarios', () => {
    it('should accept Vagabond with dominance and coalition partner', () => {
      const response = {
        map: "Fall" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Marquise de Cat",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Vagabond - Harrier",
            score: null,
            isWinner: true,
            isDominance: true,
            coalitionWith: "Marquise de Cat",
            order: 1,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept Vagabond with dominance but no coalition (loses)', () => {
      const response = {
        map: "Winter" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Eyrie",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Vagabond - Adventurer",
            score: null,
            isWinner: false,
            isDominance: true,
            coalitionWith: "Underground Duchy",
            order: 1,
          },
          {
            playerName: "Charlie",
            faction: "Underground Duchy",
            score: 20,
            isWinner: false,
            isDominance: false,
            coalitionWith: null,
            order: 2,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Coalition Scenarios', () => {
    it('should reject non-Vagabond with coalitionWith set', () => {
      const response = {
        map: "Fall" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Marquise de Cat",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: "Eyrie",
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Eyrie",
            score: 25,
            isWinner: false,
            isDominance: false,
            coalitionWith: null,
            order: 1,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Player 0: coalitionWith can only be set for Vagabond factions"
      );
    });

    it('should reject Vagabond with coalition but no dominance', () => {
      const response = {
        map: "Fall" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Marquise de Cat",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Vagabond - Thief",
            score: 20,
            isWinner: false,
            isDominance: false,
            coalitionWith: "Eyrie",
            order: 1,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Player 1: coalitionWith can only be set when isDominance is true"
      );
    });

    it('should reject invalid faction name in coalitionWith', () => {
      const response = {
        map: "Fall" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Marquise de Cat",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Vagabond - Ranger",
            score: null,
            isWinner: true,
            isDominance: true,
            coalitionWith: "Invalid Faction",
            order: 1,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("coalitionWith must be a valid faction name"))).toBe(true);
    });
  });

  describe('Two Winners with Coalition', () => {
    it('should accept two winners when one is Vagabond with dominance', () => {
      const response = {
        map: "Mountain" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Underground Duchy",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Vagabond - Scoundrel",
            score: null,
            isWinner: true,
            isDominance: true,
            coalitionWith: "Underground Duchy",
            order: 1,
          },
          {
            playerName: "Charlie",
            faction: "Corvid Conspiracy",
            score: 20,
            isWinner: false,
            isDominance: false,
            coalitionWith: null,
            order: 2,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject two winners when neither is Vagabond with dominance', () => {
      const response = {
        map: "Fall" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Marquise de Cat",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Eyrie",
            score: 30,
            isWinner: true,
            isDominance: false,
            coalitionWith: null,
            order: 1,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Two winners only allowed when one is a Vagabond with dominance"
      );
    });
  });

  describe('Normal Game (No Coalition)', () => {
    it('should accept normal game without any coalitions', () => {
      const response = {
        map: "Lake" as const,
        players: [
          {
            playerName: "Alice",
            faction: "Eyrie",
            score: 30,
            isWinner: true,
            isDominance: false,
            order: 0,
          },
          {
            playerName: "Bob",
            faction: "Woodland Alliance",
            score: 25,
            isWinner: false,
            isDominance: false,
            order: 1,
          },
          {
            playerName: "Charlie",
            faction: "Marquise de Cat",
            score: 20,
            isWinner: false,
            isDominance: false,
            order: 2,
          },
        ],
      };

      const result = validateVisionResponse(response);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
