import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function checkDatabase() {
  let connection;
  try {
    console.log("Attempting to connect to MySQL...");
    console.log(`Host: ${process.env.MYSQL_HOST}`);
    console.log(`User: ${process.env.MYSQL_USER}`);
    console.log(`Database: ${process.env.MYSQL_DATABASE}`);

    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "beep_boop_chat",
    });

    console.log("Successfully connected to MySQL");

    // Check if tables exist
    const tables = ["USERS", "LLM_MODELS", "CHATS", "CHAT_MODELS", "BOOKMARKS"];

    console.log("\nChecking tables...");

    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
        console.log(
          `✓ Table ${table} exists with ${
            Array.isArray(rows) ? rows.length : 0
          } columns`
        );
      } catch (error: any) {
        console.error(
          `✗ Table ${table} not found or error:`,
          error?.message || error
        );
      }
    }

    // Check if models were inserted
    try {
      console.log("\nChecking LLM models...");
      const [models] = await connection.execute("SELECT * FROM LLM_MODELS");
      console.log("Initial models in database:");
      if (Array.isArray(models)) {
        models.forEach((model: any) => {
          console.log(`- ${model.name} (Cost: ${model.token_cost} credits)`);
        });
      } else {
        console.log("No models found in the database");
      }
    } catch (error: any) {
      console.error("Error checking models:", error?.message || error);
    }
  } catch (error: any) {
    console.error("Database check failed:", error?.message || error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\nDatabase connection closed");
    }
  }
}

// Run the check
checkDatabase();
