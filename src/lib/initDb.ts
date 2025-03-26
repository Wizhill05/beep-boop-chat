import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  let connection;
  try {
    console.log("Starting database initialization...");

    // Create connection without database first
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
    });

    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${
        process.env.MYSQL_DATABASE || "beep_boop_chat"
      }`
    );
    console.log("Database created or already exists");

    // Use the database
    await connection.query(
      `USE ${process.env.MYSQL_DATABASE || "beep_boop_chat"}`
    );
    console.log("Using database");

    // Read the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    console.log("Reading schema from:", schemaPath);
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .filter((statement: string) => statement.trim().length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log(
          "Successfully executed:",
          statement.substring(0, 50) + "..."
        );
      } catch (error: any) {
        console.error(
          "Error executing statement:",
          statement.substring(0, 50) + "..."
        );
        console.error("Error details:", error?.message || error);
      }
    }

    console.log("Database initialization completed successfully!");
  } catch (error: any) {
    console.error("Error initializing database:", error?.message || error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the initialization
initializeDatabase();
