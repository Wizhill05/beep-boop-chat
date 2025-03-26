import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET /api/chats/[id] - Get a specific chat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const chatId = params_obj.id;

    // Get the chat
    const chats = await query(`SELECT * FROM chats WHERE id = ?`, [chatId]);

    if (chats.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chats[0]);
  } catch (error: any) {
    console.error("Error fetching chat:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch chat",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// PUT /api/chats/[id] - Update a chat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const chatId = params_obj.id;
    const { title, messages } = await request.json();

    // Check if chat exists
    const chats = await query(`SELECT * FROM chats WHERE id = ?`, [chatId]);

    if (chats.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Update the chat
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }

    if (messages !== undefined) {
      updateFields.push("chat_data = ?");
      updateValues.push(JSON.stringify({ messages }));
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add updated_at to update fields
    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // Add chatId to update values
    updateValues.push(chatId);

    await query(
      `UPDATE chats SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Get the updated chat
    const updatedChat = await query(`SELECT * FROM chats WHERE id = ?`, [
      chatId,
    ]);

    return NextResponse.json(updatedChat[0]);
  } catch (error: any) {
    console.error("Error updating chat:", error);

    return NextResponse.json(
      {
        error: "Failed to update chat",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[id] - Delete a chat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const chatId = params_obj.id;

    // Check if chat exists
    const chats = await query(`SELECT * FROM chats WHERE id = ?`, [chatId]);

    if (chats.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Delete the chat
    await query(`DELETE FROM chats WHERE id = ?`, [chatId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting chat:", error);

    return NextResponse.json(
      {
        error: "Failed to delete chat",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
