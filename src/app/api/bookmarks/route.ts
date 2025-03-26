import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

// GET /api/bookmarks - Get bookmarks for a chat
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Get all bookmarks for the chat
    const bookmarks = await query(
      `SELECT * FROM bookmarks WHERE chat_id = ? ORDER BY created_at DESC`,
      [chatId]
    );

    return NextResponse.json(bookmarks);
  } catch (error: any) {
    console.error("Error fetching bookmarks:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bookmarks",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const { chatId, name, description, messageIndex, context } =
      await request.json();

    if (!chatId || !name || messageIndex === undefined) {
      return NextResponse.json(
        { error: "Chat ID, name, and message index are required" },
        { status: 400 }
      );
    }

    // Check if chat exists
    const chats = await query(`SELECT * FROM chats WHERE id = ?`, [chatId]);

    if (chats.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check if we've reached the maximum number of bookmarks (10)
    const bookmarkCount = await query(
      `SELECT COUNT(*) as count FROM bookmarks WHERE chat_id = ?`,
      [chatId]
    );

    if (bookmarkCount[0].count >= 10) {
      return NextResponse.json(
        { error: "Maximum limit of 10 bookmarks per chat reached" },
        { status: 400 }
      );
    }

    // Create a new bookmark
    const positionData = JSON.stringify({
      message_index: messageIndex,
      context: context || "",
    });

    const result = await query(
      `INSERT INTO bookmarks (chat_id, name, description, position_data) VALUES (?, ?, ?, ?)`,
      [chatId, name, description || null, positionData]
    );

    // Get the newly created bookmark
    const bookmarkId = (result as any).insertId;
    const newBookmark = await query(`SELECT * FROM bookmarks WHERE id = ?`, [
      bookmarkId,
    ]);

    return NextResponse.json(newBookmark[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating bookmark:", error);

    return NextResponse.json(
      {
        error: "Failed to create bookmark",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
