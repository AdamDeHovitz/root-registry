import { db } from "../client";
import { users, type NewUser } from "../schema";
import { eq } from "drizzle-orm";

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Create new user
 */
export async function createUser(userData: NewUser) {
  const result = await db.insert(users).values(userData).returning();
  return result[0];
}

/**
 * Update user
 */
export async function updateUser(id: string, data: Partial<NewUser>) {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}
