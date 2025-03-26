import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const userId = params_obj.id;
    const { amount } = await request.json();

    // Validate input
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid positive amount is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await query("SELECT * FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = users[0].credits;
    const newCredits = currentCredits + Number(amount);

    // Update user credits
    await query("UPDATE users SET credits = ? WHERE id = ?", [
      newCredits,
      userId,
    ]);

    // Get updated user
    const updatedUser = await query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    return NextResponse.json({
      success: true,
      previousCredits: currentCredits,
      addedCredits: Number(amount),
      newCredits: newCredits,
      user: updatedUser[0],
    });
  } catch (error: any) {
    console.error("Error adding credits:", error);

    return NextResponse.json(
      {
        error: "Failed to add credits",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
