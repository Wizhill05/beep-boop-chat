import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const userId = params_obj.id;
    const { credits } = await request.json();

    // Validate input
    if (
      credits === undefined ||
      isNaN(Number(credits)) ||
      Number(credits) < 0
    ) {
      return NextResponse.json(
        { error: "Invalid credits value" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user credits
    await query("UPDATE users SET credits = ? WHERE id = ?", [
      Number(credits),
      userId,
    ]);

    // Get updated user
    const updatedUser = await query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    return NextResponse.json(updatedUser[0]);
  } catch (error: any) {
    console.error("Error updating user credits:", error);

    return NextResponse.json(
      {
        error: "Failed to update user credits",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
