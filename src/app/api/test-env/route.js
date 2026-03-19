import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) || "NOT SET",
    nodeEnv: process.env.NODE_ENV,
  });
}
