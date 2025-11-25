import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { createUser, findUserByEmail, findUserByUsername } from "@/lib/db/queries/users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, username, password, direwolfUsername } = result.data;

    // Check if email already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Check if username already exists
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await createUser({
      email,
      username,
      passwordHash,
      direwolfUsername: direwolfUsername || null,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
