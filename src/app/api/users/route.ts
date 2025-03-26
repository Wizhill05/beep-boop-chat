import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { User } from "../../../types/database";

export async function GET() {
  try {
    console.log("Fetching users from database...");
    const users = await query("SELECT * FROM users");
    console.log("Users fetched successfully:", users);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Database error details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { username, name, email } = await request.json();

    // Validate required fields
    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Create new user with default credits (10)
    const result = await query(
      "INSERT INTO users (username, name, email, credits) VALUES (?, ?, ?, 10)",
      [username, name || null, email]
    );

    // Fetch the newly created user
    const newUser = await query("SELECT * FROM users WHERE id = ?", [
      (result as any).insertId,
    ]);

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
