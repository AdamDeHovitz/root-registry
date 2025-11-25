import { db } from "../client";
import { leagues, leagueMemberships, users, type NewLeague } from "../schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Find league by ID
 */
export async function findLeagueById(id: string) {
  const result = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Create new league and add creator as admin
 */
export async function createLeague(leagueData: NewLeague) {
  return await db.transaction(async (tx) => {
    // Create league
    const [league] = await tx.insert(leagues).values(leagueData).returning();

    // Add creator as admin member
    await tx.insert(leagueMemberships).values({
      leagueId: league.id,
      userId: leagueData.createdBy,
      isAdmin: true,
    });

    return league;
  });
}

/**
 * Get all leagues for a user
 */
export async function getUserLeagues(userId: string) {
  return await db
    .select({
      league: leagues,
      membership: leagueMemberships,
    })
    .from(leagueMemberships)
    .innerJoin(leagues, eq(leagueMemberships.leagueId, leagues.id))
    .where(and(eq(leagueMemberships.userId, userId), isNull(leagueMemberships.leftAt)));
}

/**
 * Get league members
 */
export async function getLeagueMembers(leagueId: string) {
  return await db
    .select({
      membership: leagueMemberships,
      user: users,
    })
    .from(leagueMemberships)
    .innerJoin(users, eq(leagueMemberships.userId, users.id))
    .where(and(eq(leagueMemberships.leagueId, leagueId), isNull(leagueMemberships.leftAt)));
}

/**
 * Check if user is league admin
 */
export async function isLeagueAdmin(leagueId: string, userId: string) {
  const result = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, userId),
        eq(leagueMemberships.isAdmin, true),
        isNull(leagueMemberships.leftAt)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Check if user is league member
 */
export async function isLeagueMember(leagueId: string, userId: string) {
  const result = await db
    .select()
    .from(leagueMemberships)
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, userId),
        isNull(leagueMemberships.leftAt)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Add user to league
 */
export async function addUserToLeague(leagueId: string, userId: string) {
  const result = await db
    .insert(leagueMemberships)
    .values({
      leagueId,
      userId,
      isAdmin: false,
    })
    .returning();
  return result[0];
}

/**
 * Remove user from league (soft delete)
 */
export async function removeUserFromLeague(leagueId: string, userId: string) {
  const result = await db
    .update(leagueMemberships)
    .set({ leftAt: new Date() })
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, userId),
        isNull(leagueMemberships.leftAt)
      )
    )
    .returning();
  return result[0];
}

/**
 * Update member admin status
 */
export async function updateMemberAdminStatus(
  leagueId: string,
  userId: string,
  isAdmin: boolean
) {
  const result = await db
    .update(leagueMemberships)
    .set({ isAdmin })
    .where(
      and(
        eq(leagueMemberships.leagueId, leagueId),
        eq(leagueMemberships.userId, userId),
        isNull(leagueMemberships.leftAt)
      )
    )
    .returning();
  return result[0];
}

/**
 * Delete league (cascade delete will handle memberships and games)
 */
export async function deleteLeague(id: string) {
  await db.delete(leagues).where(eq(leagues.id, id));
}
