import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET /api/bookmarks/[id] - Get a specific bookmark
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const bookmarkId = params_obj.id;

    // Get the bookmark
    const bookmarks = await query(`SELECT * FROM bookmarks WHERE id = ?`, [
      bookmarkId,
    ]);

    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bookmarks[0]);
  } catch (error: any) {
    console.error("Error fetching bookmark:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bookmark",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// PUT /api/bookmarks/[id] - Update a bookmark
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const bookmarkId = params_obj.id;
    const { name, description, messageIndex, context } = await request.json();

    // Check if bookmark exists
    const bookmarks = await query(`SELECT * FROM bookmarks WHERE id = ?`, [
      bookmarkId,
    ]);

    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Update the bookmark
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (messageIndex !== undefined || context !== undefined) {
      // Get current position_data
      const currentPositionData = JSON.parse(bookmarks[0].position_data);

      const newPositionData = {
        message_index:
          messageIndex !== undefined
            ? messageIndex
            : currentPositionData.message_index,
        context: context !== undefined ? context : currentPositionData.context,
      };

      updateFields.push("position_data = ?");
      updateValues.push(JSON.stringify(newPositionData));
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add bookmarkId to update values
    updateValues.push(bookmarkId);

    await query(
      `UPDATE bookmarks SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Get the updated bookmark
    const updatedBookmark = await query(
      `SELECT * FROM bookmarks WHERE id = ?`,
      [bookmarkId]
    );

    return NextResponse.json(updatedBookmark[0]);
  } catch (error: any) {
    console.error("Error updating bookmark:", error);

    return NextResponse.json(
      {
        error: "Failed to update bookmark",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks/[id] - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const params_obj = await params;
    const bookmarkId = params_obj.id;

    // Check if bookmark exists
    const bookmarks = await query(`SELECT * FROM bookmarks WHERE id = ?`, [
      bookmarkId,
    ]);

    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Delete the bookmark
    await query(`DELETE FROM bookmarks WHERE id = ?`, [bookmarkId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bookmark:", error);

    return NextResponse.json(
      {
        error: "Failed to delete bookmark",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
