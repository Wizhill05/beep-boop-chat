import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, description, tokenCost, modelPath, parameters } =
      await request.json();

    // Validate required fields
    if (!name || !modelPath || tokenCost === undefined) {
      return NextResponse.json(
        { error: "Name, model path, and token cost are required" },
        { status: 400 }
      );
    }

    // Check if model already exists
    const existingModels = await query(
      "SELECT * FROM llm_models WHERE name = ?",
      [name]
    );

    if (existingModels.length > 0) {
      return NextResponse.json(
        { error: "Model with this name already exists" },
        { status: 409 }
      );
    }

    // Create new model
    const result = await query(
      "INSERT INTO llm_models (name, description, token_cost, model_path, parameters) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, tokenCost, modelPath, parameters || null]
    );

    // Fetch the newly created model
    const newModel = await query("SELECT * FROM llm_models WHERE id = ?", [
      (result as any).insertId,
    ]);

    return NextResponse.json(newModel[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating model:", error);

    return NextResponse.json(
      {
        error: "Failed to create model",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
