import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown database error";
}

export async function GET() {
  const start = Date.now();

  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json(
      {
        success: true,
        status: "ok",
        database: db.databaseName,
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: "Database connection failed",
        error: getErrorMessage(error),
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
