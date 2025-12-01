import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { updateProfileSchema } from "@/lib/validations/auth";
import { updateUser, findUserByUsername } from "@/lib/db/queries/users";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, direwolfUsername } = result.data;

    // Check if username is being changed and if it's already taken
    if (username !== session.user.username) {
      const existingUsername = await findUserByUsername(username);
      if (existingUsername && existingUsername.id !== session.user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await updateUser(session.user.id, {
      username,
      direwolfUsername: direwolfUsername || null,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        direwolfUsername: updatedUser.direwolfUsername,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
