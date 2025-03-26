import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: {
      MYSQL_HOST: process.env.MYSQL_HOST || "not set",
      MYSQL_USER: process.env.MYSQL_USER || "not set",
      MYSQL_DATABASE: process.env.MYSQL_DATABASE || "not set",
      hasPassword: !!process.env.MYSQL_PASSWORD,
    },
  });
}
