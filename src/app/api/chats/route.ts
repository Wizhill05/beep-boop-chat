import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { Chat } from "../../../types/database";

// GET /api/chats - Get all chats for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all chats for the user
    const chats = await query(
      `SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );

    return NextResponse.json(chats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch chats",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
  try {
    const { userId, title, messages } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create a new chat
    const result = await query(
      `INSERT INTO chats (user_id, title, chat_data) VALUES (?, ?, ?)`,
      [
        userId,
        title || "New Chat",
        JSON.stringify({ messages: messages || [] }),
      ]
    );

    // Get the newly created chat
    const chatId = (result as any).insertId;
    const newChat = await query(`SELECT * FROM chats WHERE id = ?`, [chatId]);

    return NextResponse.json(newChat[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating chat:", error);

    return NextResponse.json(
      {
        error: "Failed to create chat",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
