import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("Attempting to fetch models from database...");

    // Get the model name from the query parameters if provided
    const searchParams = request.nextUrl.searchParams;
    const modelName = searchParams.get("name");

    let sql = "SELECT id, name, description, token_cost FROM llm_models";
    let params: string[] = [];

    // If model name is provided, filter by it
    if (modelName) {
      sql += " WHERE name = ?";
      params.push(modelName);
    }

    const models = await query(sql, params);
    console.log("Models fetched successfully:", models);
    return NextResponse.json(models);
  } catch (error: any) {
    console.error("Database error details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch models",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
