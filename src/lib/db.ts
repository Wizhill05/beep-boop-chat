import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "beep_boop_chat",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

console.log("Database config (without password):", {
  ...dbConfig,
  password: dbConfig.password ? "[HIDDEN]" : "not set",
});

const pool = mysql.createPool(dbConfig);

// Test the connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

export const query = async (
  sql: string,
  values?: any[]
): Promise<mysql.RowDataPacket[]> => {
  try {
    const [results] = await pool.execute(sql, values);
    return results as mysql.RowDataPacket[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export default pool;
